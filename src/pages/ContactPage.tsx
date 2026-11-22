import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';

export function ContactPage() {
  const { data, buildWhatsAppUrl, navigate } = useClinic();
  const contact = data?.settings.contact;

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastWhatsappText, setLastWhatsappText] = useState<string | null>(null);
  const [mapUnit, setMapUnit] = useState<'matriz' | 'filial'>('matriz');
  const [showMap, setShowMap] = useState(false);

  const mapQuery =
    mapUnit === 'matriz'
      ? 'Rua Major Gama, 950, Centro Sul, Cuiabá, MT'
      : 'Rua Barão de Melgaço, 2350, Centro Sul, Cuiabá, MT';
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const digits = trimmedPhone.replace(/\D/g, '');
    const trimmedMessage = message.trim();
    const trimmedSubject = subject.trim();

    if (trimmedName.length < 2) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (digits.length < 10) {
      setError('Por favor, informe um telefone ou WhatsApp válido com DDD.');
      return;
    }
    if (trimmedMessage.length < 5) {
      setError('Escreva uma breve mensagem para que possamos ajudar.');
      return;
    }
    if (!lgpdConsent) {
      setError('Por favor, concorde com a Política de Privacidade.');
      return;
    }

    const subjectPart = trimmedSubject ? `Assunto: ${trimmedSubject}\n` : '';
    const whatsappText = `Olá, Espaço Adapta T.O! Meu nome é ${trimmedName} (${trimmedPhone}).\n${subjectPart}\nMensagem: ${trimmedMessage}`;
    const whatsappUrl = buildWhatsAppUrl(whatsappText);

    setSending(true);
    setLastWhatsappText(whatsappText);

    // Trigger WhatsApp redirect synchronously while user gesture is active (no window.open)
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          email: email.trim(),
          subject: trimmedSubject || 'Contato via página /contato (WhatsApp)',
          message: trimmedMessage,
          lgpdConsent: true,
        }),
      });
    } catch {
      // Redirect to WhatsApp already proceeded; keep non-blocking
    } finally {
      setSending(false);
    }

    setSuccess('Redirecionando para o WhatsApp da clínica com a sua mensagem!');
    setName('');
    setPhone('');
    setEmail('');
    setSubject('');
    setMessage('');
    setLgpdConsent(false);
  };

  return (
    <div className="bg-[var(--color-beige)]">
      <section className="adaptato-hero-bg border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <p className="text-sm font-medium text-[var(--color-forest)] mb-3">
            {data?.settings.content.contactPageKicker || 'Atendimento e unidades em Cuiabá/MT'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-ink)] tracking-tight leading-[1.12] mb-5">
            {data?.settings.content.contactPageTitle || 'Entre em Contato'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {data?.settings.content.contactPageSubtitle ||
              'Estamos prontos para ajudar sua família. Entre em contato conosco para agendar uma avaliação ou esclarecer suas dúvidas.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Info Column */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-8 space-y-6">
              <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
                Canais de atendimento
              </h2>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--color-ink)]">Endereço</div>
                  <div className="text-sm text-[var(--color-ink-muted)] mt-1 leading-relaxed space-y-1">
                    {(contact?.address || '').split('|').map((line, idx) => (
                      <p key={idx}>{line.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--color-ink)]">Telefone</div>
                  <div className="text-sm text-[var(--color-ink-muted)] mt-1 tabular-nums space-y-0.5">
                    {(contact?.phone || '').split('·').map((ph, idx) => (
                      <div key={idx}>{ph.trim()}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--color-ink)]">E-mail</div>
                  <div className="text-sm text-[var(--color-ink-muted)] mt-1 break-all">{contact?.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--color-ink)]">
                    Horário de funcionamento
                  </div>
                  <div className="text-sm text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                    {contact?.hours}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[var(--color-gray-soft)]">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#1FA855] text-white text-sm font-semibold hover:opacity-92"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Atendimento rápido no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Embedded Google Maps with Unit Toggle Column */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[var(--color-ink)]">
                  Localização em Cuiabá/MT
                </h2>
                <div className="inline-flex p-1 rounded-lg bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                  <button
                    type="button"
                    onClick={() => setMapUnit('matriz')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      mapUnit === 'matriz'
                        ? 'bg-[var(--color-white)] text-[var(--color-forest)] shadow-xs'
                        : 'text-[var(--color-ink-muted)]'
                    }`}
                  >
                    Matriz
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapUnit('filial')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      mapUnit === 'filial'
                        ? 'bg-[var(--color-white)] text-[var(--color-forest)] shadow-xs'
                        : 'text-[var(--color-ink-muted)]'
                    }`}
                  >
                    Filial
                  </button>
                </div>
              </div>

              {showMap ? (
                <div className="rounded-2xl overflow-hidden border border-[var(--color-gray-soft)] h-[280px] bg-[var(--color-beige)]">
                  <iframe
                    title={`Mapa ${mapUnit === 'matriz' ? 'Unidade Matriz' : 'Unidade Filial'} - Espaço Adapta T.O`}
                    src={mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)] p-6 sm:p-8 text-center space-y-3.5">
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    <strong className="text-[var(--color-ink)]">
                      {mapUnit === 'matriz' ? 'Matriz:' : 'Filial:'}
                    </strong>{' '}
                    {mapQuery}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-white)] border border-[var(--color-forest)]/50 text-[var(--color-forest)] text-xs font-semibold hover:bg-[var(--color-beige)] transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Carregar mapa na página</span>
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href={mapExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-forest)] hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Abrir rota no Google Maps</span>
                </a>
                {showMap && (
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className="text-xs text-[var(--color-taupe)] hover:text-[var(--color-ink)] cursor-pointer"
                  >
                    Ocultar mapa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Discreet collapsible message form (collapsed by default, redirects to WhatsApp) */}
        <div className="mt-10 pt-6 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
              Prefere escrever uma mensagem detalhada antes de iniciar a conversa?
            </p>
            <button
              type="button"
              onClick={() => setFormOpen((prev) => !prev)}
              aria-expanded={formOpen}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>{formOpen ? 'Ocultar formulário' : 'Enviar mensagem'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${formOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {formOpen && (
            <form
              onSubmit={handleSubmit}
              className="mt-5 max-w-2xl bg-white border border-slate-200/85 rounded-2xl p-6 sm:p-8 space-y-5 shadow-[0_20px_50px_-32px_rgba(24,34,53,0.12)]"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
                  Enviar mensagem pelo WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
                  Ao enviar, você será redirecionado ao WhatsApp da clínica com os dados preenchidos.
                </p>
              </div>

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
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-700" aria-hidden="true" />
                    <span>{success}</span>
                  </div>
                  {lastWhatsappText && (
                    <a
                      href={buildWhatsAppUrl(lastWhatsappText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1FA855] text-white text-xs font-semibold hover:opacity-92"
                    >
                      <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Abrir conversa no WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-[var(--color-ink)] mb-1.5"
                  >
                    Seu nome *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-[var(--color-ink)] mb-1.5"
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
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-[var(--color-ink)] mb-1.5"
                  >
                    E-mail (opcional)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-[var(--color-ink)] mb-1.5"
                  >
                    Assunto
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex.: Informações sobre atendimento"
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-sm focus:border-[var(--color-forest)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-[var(--color-ink)] mb-1.5"
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
                  className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-sm focus:border-[var(--color-forest)] focus:outline-none"
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
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1FA855] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-92 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>{sending ? 'Redirecionando...' : 'Enviar para o WhatsApp'}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
