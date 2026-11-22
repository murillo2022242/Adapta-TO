import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Maximize2,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';

interface GroundingSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: GroundingSource[];
  showActions?: boolean;
  streaming?: boolean;
}

const QUICK_PROMPTS = [
  'Quais especialidades e abordagens vocês atendem?',
  'Como funciona a terapia ABA e a Integração Sensorial?',
  'Como agendar uma avaliação e quais os endereços em Cuiabá?',
  'Dicas práticas para estimular a comunicação infantil em casa',
];

function renderInlineSegments(line: string): React.ReactNode[] {
  const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[var(--color-ink)]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-[var(--color-forest)] text-[12px] font-mono"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function RichMessageText({ text }: { text: string }) {
  const blocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 break-words">
      {blocks.map((block, bIdx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const inner = block.slice(3, -3).replace(/^[a-zA-Z0-9_-]+\n/, '');
          return (
            <pre
              key={bIdx}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed"
            >
              <code>{inner.trim()}</code>
            </pre>
          );
        }

        const lines = block.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: { ordered: boolean; items: string[] } | null = null;

        const flushList = (keyPrefix: string) => {
          if (!listItems) return;
          const ListTag = listItems.ordered ? 'ol' : 'ul';
          elements.push(
            <ListTag
              key={`${keyPrefix}-list`}
              className={`${
                listItems.ordered ? 'list-decimal' : 'list-disc'
              } pl-5 space-y-1 text-sm leading-relaxed`}
            >
              {listItems.items.map((item, i) => (
                <li key={i}>{renderInlineSegments(item)}</li>
              ))}
            </ListTag>
          );
          listItems = null;
        };

        lines.forEach((rawLine, lIdx) => {
          const line = rawLine.trimEnd();
          const trimmed = line.trim();

          if (!trimmed) {
            flushList(`${bIdx}-${lIdx}`);
            return;
          }

          const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
          if (headingMatch) {
            flushList(`${bIdx}-${lIdx}`);
            elements.push(
              <div
                key={`${bIdx}-${lIdx}`}
                className="font-semibold text-[var(--color-forest)] pt-1 text-[14.5px]"
              >
                {renderInlineSegments(headingMatch[2])}
              </div>
            );
            return;
          }

          const ulMatch = /^[-*•]\s+(.+)$/.exec(trimmed);
          if (ulMatch) {
            if (!listItems || listItems.ordered) {
              flushList(`${bIdx}-${lIdx}`);
              listItems = { ordered: false, items: [] };
            }
            listItems.items.push(ulMatch[1]);
            return;
          }

          const olMatch = /^\d+[.)]\s+(.+)$/.exec(trimmed);
          if (olMatch) {
            if (!listItems || !listItems.ordered) {
              flushList(`${bIdx}-${lIdx}`);
              listItems = { ordered: true, items: [] };
            }
            listItems.items.push(olMatch[1]);
            return;
          }

          flushList(`${bIdx}-${lIdx}`);
          elements.push(
            <p key={`${bIdx}-${lIdx}`} className="text-sm leading-relaxed">
              {renderInlineSegments(trimmed)}
            </p>
          );
        });

        flushList(`${bIdx}-end`);
        return <React.Fragment key={bIdx}>{elements}</React.Fragment>;
      })}
    </div>
  );
}

export function FloatingWidgets() {
  const { data, currentPath, navigate, buildWhatsAppUrl, assistantOpen, setAssistantOpen } =
    useClinic();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const assistantName = data?.settings.ai.assistantName || 'Assistente Adapta T.O';
  const welcomeMessage =
    data?.settings.ai.welcomeMessage ||
    'Olá! Sou o assistente virtual inteligente do Espaço Adapta T.O. Pode perguntar qualquer coisa — sobre nossa clínica em Cuiabá, TEA, terapias ou qualquer outro assunto que precisar!';

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ id: 'welcome', role: 'assistant', text: welcomeMessage }];
      }
      if (prev.length === 1 && prev[0].id === 'welcome' && prev[0].text !== welcomeMessage) {
        return [{ ...prev[0], text: welcomeMessage }];
      }
      return prev;
    });
  }, [welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, assistantOpen, expanded]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`;
  }, [input]);

  if (currentPath.startsWith('/admin')) {
    return null;
  }

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const shouldOfferClinicActions = (question: string, answer: string, isError: boolean) => {
    if (isError) return true;
    const combined = `${question}\n${answer}`;
    return /\/agendamento|agendar|agendamento|marcar avalia|whatsapp|recep[cç][aã]o|conv[eê]nio|valor(es)? da consulta|pre[cç]o da sess|hor[aá]rio de atendimento/i.test(
      combined
    );
  };

  const sendPrompt = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const streamMsgId = `a-${Date.now() + 1}`;
    const nextMessages = [...messages, userMsg];
    const historyPayload = nextMessages
      .filter((m) => m.id !== 'welcome')
      .slice(-20)
      .slice(0, -1)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages([
      ...nextMessages,
      {
        id: streamMsgId,
        role: 'assistant',
        text: '',
        streaming: true,
      },
    ]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !res.body || !contentType.includes('text/event-stream')) {
        // Fallback to standard JSON endpoint
        const fallbackRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: historyPayload,
          }),
        });
        const payload = await fallbackRes.json();
        const replyText =
          payload.reply ||
          payload.error ||
          'Ocorreu uma instabilidade temporária ao responder. Tente novamente em instantes.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamMsgId
              ? {
                  ...m,
                  text: replyText,
                  sources: Array.isArray(payload.sources) ? payload.sources : undefined,
                  showActions: shouldOfferClinicActions(trimmed, replyText, !fallbackRes.ok),
                  streaming: false,
                }
              : m
          )
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let finalSources: GroundingSource[] = [];
      let hadError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evt of events) {
          const dataLine = evt
            .split('\n')
            .find((line) => line.startsWith('data: '));
          if (!dataLine) continue;

          try {
            const parsed = JSON.parse(dataLine.slice(6));
            if (parsed.type === 'chunk' && typeof parsed.text === 'string') {
              accumulated += parsed.text;
              const snapshot = accumulated;
              setMessages((prev) =>
                prev.map((m) => (m.id === streamMsgId ? { ...m, text: snapshot } : m))
              );
            } else if (parsed.type === 'done') {
              if (typeof parsed.reply === 'string' && parsed.reply.trim()) {
                accumulated = parsed.reply;
              }
              if (Array.isArray(parsed.sources)) {
                finalSources = parsed.sources;
              }
            } else if (parsed.type === 'error') {
              hadError = true;
              accumulated =
                parsed.error ||
                'Ocorreu uma instabilidade temporária ao gerar a resposta. Tente novamente.';
            }
          } catch {
            // ignore malformed partial SSE packet
          }
        }
      }

      const finalReply =
        accumulated.trim() ||
        'Não foi possível gerar uma resposta agora. Por favor, tente novamente.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamMsgId
            ? {
                ...m,
                text: finalReply,
                sources: finalSources.length > 0 ? finalSources : undefined,
                showActions: shouldOfferClinicActions(trimmed, finalReply, hadError),
                streaming: false,
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamMsgId
            ? {
                ...m,
                text: 'O atendimento virtual está temporariamente indisponível. Tente novamente em instantes ou fale com nossa equipe pelo WhatsApp.',
                showActions: true,
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt(input);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: welcomeMessage,
      },
    ]);
  };

  if (!assistantOpen) {
    return null;
  }

  return (
    <div className="no-print">
      {/* AI Chat Window anchored cleanly under the top-right header assistant button */}
      <section
          aria-label={assistantName}
          className={`fixed top-[80px] right-3 sm:right-6 z-50 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl shadow-[0_28px_70px_-20px_rgba(36,48,40,0.34)] flex flex-col overflow-hidden transition-all duration-200 ${
            expanded
              ? 'w-[calc(100vw-1.5rem)] sm:w-[560px] h-[calc(100vh-100px)] max-h-[760px]'
              : 'w-[calc(100vw-1.5rem)] sm:w-[410px] h-[540px] max-h-[calc(100vh-105px)]'
          }`}
        >
          <header className="px-4 py-3.5 bg-[var(--color-forest)] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-body text-sm font-semibold truncate flex items-center gap-1.5">
                  <span className="truncate">{assistantName}</span>
                  <Sparkles className="w-3.5 h-3.5 text-white/90 shrink-0" aria-hidden="true" />
                </h2>
                <p className="text-[11px] text-white/85 truncate">
                  Pergunte sobre a clínica, TEA ou qualquer assunto
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={resetChat}
                  title="Nova conversa"
                  aria-label="Reiniciar conversa"
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                title={expanded ? 'Tamanho padrão' : 'Expandir janela'}
                aria-label={expanded ? 'Reduzir tamanho da janela' : 'Expandir janela do assistente'}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                aria-label="Fechar assistente"
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--color-beige)]/45"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-forest)] text-white rounded-br-sm whitespace-pre-wrap'
                      : 'bg-[var(--color-white)] text-[var(--color-ink)] border border-[var(--color-gray-soft)] rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : msg.streaming && !msg.text ? (
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      Pensando na melhor resposta...
                    </span>
                  ) : (
                    <>
                      <RichMessageText text={msg.text} />
                      {msg.streaming && (
                        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-[var(--color-forest)] animate-pulse rounded-xs" />
                      )}
                    </>
                  )}
                </div>

                {msg.role === 'assistant' && !msg.streaming && msg.id !== 'welcome' && (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => void copyMessage(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md text-[var(--color-taupe)] hover:text-[var(--color-forest)] hover:bg-[var(--color-white)] transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                          <span className="text-emerald-700">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" aria-hidden="true" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && !msg.streaming && (
                  <div className="mt-1.5 max-w-[90%] flex flex-wrap gap-1.5">
                    {msg.sources
                      .filter((src) => /^https?:\/\//i.test(src.uri))
                      .slice(0, 4)
                      .map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:border-[var(--color-forest)] transition-colors max-w-[240px]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                  </div>
                )}

                {msg.showActions && !msg.streaming && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAssistantOpen(false);
                        navigate('/agendamento');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-white)] border border-[var(--color-sage)] text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Ir para Agendamento</span>
                    </button>
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-forest)] text-white hover:opacity-90"
                    >
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Falar no WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            ))}

            {messages.length <= 1 && !sending && (
              <div className="pt-1 space-y-1.5">
                <div className="text-[11px] font-medium text-[var(--color-taupe)]">
                  Exemplos do que você pode perguntar
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendPrompt(q)}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:border-[var(--color-sage)] hover:bg-[var(--color-beige)]/70 transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[var(--color-white)] border-t border-[var(--color-gray-soft)] flex items-end gap-2"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Digite sua pergunta para o {assistantName}
            </label>
            <textarea
              ref={textareaRef}
              id="assistant-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte qualquer coisa..."
              maxLength={4000}
              className="flex-1 min-h-[40px] max-h-[112px] py-2 px-3 text-sm rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/35 text-[var(--color-ink)] focus:border-[var(--color-forest)] focus:outline-none resize-none leading-snug"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Enviar pergunta"
              className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-forest)] text-white flex items-center justify-center disabled:opacity-45 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
    </div>
  );
}
