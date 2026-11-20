import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Calendar,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  showActions?: boolean;
}

const QUICK_PROMPTS = [
  'Quais especialidades infantis vocês atendem?',
  'Como funciona a primeira avaliação da criança?',
  'Qual o horário de atendimento?',
];

export function FloatingWidgets() {
  const { data, currentPath, navigate, buildWhatsAppUrl, assistantOpen, setAssistantOpen } =
    useClinic();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const assistantName = data?.settings.ai.assistantName || 'Assistente adaptaTO';
  const welcomeMessage =
    data?.settings.ai.welcomeMessage ||
    'Olá! Sou o assistente virtual da adaptaTO, clínica de fonoaudiologia exclusiva para crianças. Como posso ajudar você e sua família hoje?';

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: welcomeMessage,
        },
      ]);
    }
  }, [welcomeMessage, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, assistantOpen]);

  if (currentPath.startsWith('/admin')) {
    return null;
  }

  const sendPrompt = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const historyPayload = nextMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload.slice(0, -1),
        }),
      });

      const payload = await res.json();
      const replyText =
        payload.reply ||
        payload.error ||
        'Não tenho essa informação confirmada no momento. Recomendo conversar diretamente com nossa equipe pelo WhatsApp.';

      const mentionsAction =
        /agendar|agendamento|whatsapp|hor[aá]rio|consulta/i.test(replyText) || !res.ok;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          showActions: mentionsAction,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'O atendimento virtual está temporariamente indisponível. Recomendamos conversar diretamente com nossa equipe pelo WhatsApp.',
          showActions: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
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

  return (
    <div className="no-print">
      {/* Floating WhatsApp Button (Bottom Left) */}
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar pelo WhatsApp da clínica adaptaTO"
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 inline-flex items-center gap-2.5 h-12 px-4 sm:px-5 rounded-full bg-[var(--color-forest)] text-white shadow-[0_14px_34px_-12px_rgba(36,48,40,0.55)] hover:opacity-95 transition-all duration-200 hover:-translate-y-0.5"
      >
        <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">WhatsApp</span>
      </a>

      {/* AI Chat Window anchored cleanly under the top-right header assistant button */}
      {assistantOpen && (
        <section
          aria-label={assistantName}
          className="fixed top-[84px] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[500px] max-h-[calc(100vh-110px)] bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl shadow-[0_28px_70px_-20px_rgba(36,48,40,0.34)] flex flex-col overflow-hidden"
        >
          <header className="px-4 py-3.5 bg-[var(--color-forest)] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-body text-sm font-semibold truncate">{assistantName}</h2>
                <p className="text-[11px] text-white/80 truncate">
                  Fonoaudiologia infantil adaptaTO
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={resetChat}
                  title="Reiniciar conversa"
                  aria-label="Reiniciar conversa"
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                aria-label="Minimizar assistente"
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
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
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-beige)]/45"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-forest)] text-white rounded-br-sm'
                      : 'bg-[var(--color-white)] text-[var(--color-ink)] border border-[var(--color-gray-soft)] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.showActions && (
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
                  Sugestões rápidas
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

            {sending && (
              <div className="flex items-start">
                <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs text-[var(--color-ink-muted)]">
                  Elaborando resposta...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[var(--color-white)] border-t border-[var(--color-gray-soft)] flex items-center gap-2"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Digite sua mensagem para o {assistantName}
            </label>
            <input
              id="assistant-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Como podemos ajudar?"
              maxLength={600}
              className="flex-1 h-10 px-3 text-sm rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/35 text-[var(--color-ink)] focus:border-[var(--color-forest)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Enviar mensagem"
              className="w-10 h-10 rounded-xl bg-[var(--color-forest)] text-white flex items-center justify-center disabled:opacity-45 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
