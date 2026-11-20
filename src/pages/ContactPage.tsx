import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';

export function ContactPage() {
  const { data, buildWhatsAppUrl, navigate } = useClinic();
  const contact = data?.settings.contact;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, subject, message, lgpdConsent }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erro ao enviar sua mensagem.');
        return;
      }
      setSuccess(json.message);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
      setLgpdConsent(false);
    } catch {
      setError('Falha de conexão ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[var(--color-beige)]">
      <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-22">
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-4">
            {data?.settings.content.contactPageKicker || 'Atendimento e suporte'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] mb-5">
            {data?.settings.content.contactPageTitle || 'Fale com a adaptaTO'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {data?.settings.content.contactPageSubtitle ||
              'Estamos à disposição para tirar dúvidas sobre especialidades, horários ou funcionamento da clínica.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-8 space-y-6">
              <h2 className="font-display text-2xl font-normal text-[var(--color-forest)]">
                Canais de atendimento
              </h2>

              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-[var(--color-taupe)]">Endereço</div>
                  <div className="text-sm text-[var(--color-ink)] mt-0.5 leading-relaxed">
                    {contact?.address}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-[var(--color-taupe)]">Telefone</div>
                  <div className="text-sm text-[var(--color-ink)] mt-0.5 tabular-nums">
                    {contact?.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-[var(--color-taupe)]">E-mail</div>
                  <div className="text-sm text-[var(--color-ink)] mt-0.5">{contact?.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-medium text-[var(--color-taupe)]">
                    Horário de funcionamento
                  </div>
                  <div className="text-sm text-[var(--color-ink)] mt-0.5 leading-relaxed">
                    {contact?.hours}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[var(--color-gray-soft)] flex flex-col gap-3">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-92"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Atendimento rápido no WhatsApp</span>
                </a>
                <a
                  href={buildWhatsAppUrl(
                    'Olá! Gostaria de tirar uma dúvida sobre os atendimentos da clínica adaptaTO.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)]"
                >
                  <span>Tirar dúvidas pelo WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-8 sm:p-10 space-y-5"
            >
              <h2 className="font-display text-2xl font-normal text-[var(--color-forest)]">
                Envie uma mensagem
              </h2>

              {error && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="p-4 rounded-xl bg-[var(--color-sage)]/25 border border-[var(--color-sage)] text-[var(--color-forest)] text-sm flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                  >
                    Seu nome *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                  >
                    Telefone / WhatsApp *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                  >
                    E-mail (opcional)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                  >
                    Assunto
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex.: Informações sobre atendimento"
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                >
                  Mensagem *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva como podemos ajudar..."
                  className="w-full p-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[var(--color-forest)]"
                />
                <span className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  Concordo com o envio destes dados para retorno de contato, conforme a{' '}
                  <a
                    href="/privacidade"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/privacidade');
                    }}
                    className="underline text-[var(--color-forest)] font-medium"
                  >
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-92 cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{sending ? 'Enviando...' : 'Enviar mensagem'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
