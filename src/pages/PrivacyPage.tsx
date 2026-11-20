import React from 'react';
import { useClinic } from '../context/ClinicContext.tsx';

export function PrivacyPage() {
  const { data } = useClinic();
  const clinicName = data?.settings.content.clinicName || 'adaptaTO';
  const contactEmail = data?.settings.contact.email || 'contato@adaptato.com.br';

  return (
    <div className="bg-[var(--color-beige)]">
      <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-16 sm:py-22">
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-4">
            {data?.settings.content.privacyPageKicker || 'Transparência e segurança · LGPD'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] mb-5">
            {data?.settings.content.privacyPageTitle || 'Política de Privacidade'}
          </h1>
          <p className="text-base text-[var(--color-ink-muted)] leading-relaxed">
            {data?.settings.content.privacyPageSubtitle ||
              `Tratamento de dados pessoais da clínica de fonoaudiologia ${clinicName} em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`}
          </p>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <article className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-8 sm:p-12 space-y-8 text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-medium text-[var(--color-forest)] mb-2.5">
              1. Coleta mínima de dados
            </h2>
            <p>
              Coletamos exclusivamente os dados necessários para processar solicitações de
              agendamento ou responder mensagens de contato: nome completo, telefone/WhatsApp,
              e-mail opcional e nome do responsável quando aplicável. Não solicitamos nem
              armazenamos prontuários ou informações clínicas sensíveis nos formulários públicos do
              site.
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--color-gray-soft)]">
            <h2 className="font-display text-xl font-medium text-[var(--color-forest)] mb-2.5">
              2. Finalidade do uso das informações
            </h2>
            <p>
              As informações fornecidas são utilizadas unicamente para organizar a agenda da clínica,
              confirmar solicitações de horários e responder dúvidas enviadas pelo paciente ou
              responsável. Não comercializamos nem compartilhamos dados com terceiros para fins
              publicitários.
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--color-gray-soft)]">
            <h2 className="font-display text-xl font-medium text-[var(--color-forest)] mb-2.5">
              3. Assistente Virtual (IA) e WhatsApp
            </h2>
            <p>
              As conversas com o assistente virtual têm caráter informativo e ocorrem durante a
              sessão de navegação sem armazenar histórico médico. Ao optar pelo redirecionamento
              para o WhatsApp oficial da clínica, são compartilhados apenas os dados básicos de
              identificação da solicitação (nome, atendimento, profissional, data e horário).
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--color-gray-soft)]">
            <h2 className="font-display text-xl font-medium text-[var(--color-forest)] mb-2.5">
              4. Segurança e controle de acesso
            </h2>
            <p>
              O acesso aos dados cadastrados é restrito aos profissionais e administradores
              devidamente autenticados no painel administrativo da clínica, com controle de
              permissões por função. Nenhuma informação de pacientes é disponibilizada
              publicamente.
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--color-gray-soft)]">
            <h2 className="font-display text-xl font-medium text-[var(--color-forest)] mb-2.5">
              5. Direitos do titular
            </h2>
            <p>
              Você pode solicitar a confirmação de existência de tratamento, atualização, correção
              ou exclusão dos seus dados de solicitação entrando em contato pelo e-mail{' '}
              <strong className="text-[var(--color-forest)]">{contactEmail}</strong> ou pelos
              canais oficiais da clínica.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
