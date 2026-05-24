import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar — Studio Mariano" },
      { name: "description", content: "Faça seu agendamento online no Studio Mariano em Guaratinguetá." },
      { property: "og:title", content: "Agendar — Studio Mariano" },
      { property: "og:description", content: "Reserve seu horário online com nossas profissionais." },
    ],
  }),
  component: AgendarHome,
});

function AgendarHome() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <nav className="flex items-center justify-between border-b border-brand-charcoal/5 bg-brand-cream/80 px-6 py-5 backdrop-blur-md md:px-8">
        <Link to="/" className="font-serif text-xl tracking-tight uppercase md:text-2xl">
          Studio Mariano
        </Link>
        <Link to="/" className="text-xs uppercase tracking-[0.2em] transition-colors hover:text-brand-gold">
          ← Voltar
        </Link>
      </nav>

      <section className="container mx-auto px-6 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Agendamento
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            Como deseja <i className="font-normal italic">continuar?</i>
          </h1>
          <p className="mt-6 text-base font-light text-stone-600 md:text-lg">
            Selecione abaixo se você é cliente ou parte da nossa equipe.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8">
          <Link
            to="/agendar/cliente"
            className="group relative flex flex-col justify-between overflow-hidden border border-brand-charcoal/10 bg-white p-10 transition-all hover:border-brand-gold hover:shadow-xl md:p-12"
          >
            <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gold transition-transform duration-500 group-hover:scale-x-100" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
                01
              </span>
              <h2 className="mt-6 font-serif text-3xl md:text-4xl">Sou Cliente</h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-stone-600">
                Escolha uma profissional, o serviço e o melhor horário para você. Receba um lembrete antes do atendimento.
              </p>
            </div>
            <span className="mt-10 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-brand-charcoal transition-colors group-hover:text-brand-gold">
              Agendar agora
              <span className="text-base transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>

          <Link
            to="/login"
            className="group relative flex flex-col justify-between overflow-hidden border border-brand-charcoal/10 bg-brand-charcoal p-10 text-brand-cream transition-all hover:shadow-xl md:p-12"
          >
            <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gold transition-transform duration-500 group-hover:scale-x-100" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
                02
              </span>
              <h2 className="mt-6 font-serif text-3xl md:text-4xl">Sou da Equipe</h2>
              <p className="mt-4 text-sm font-light leading-relaxed opacity-80">
                Acesso restrito às profissionais e administradoras do Studio Mariano. Faça login para ver sua agenda.
              </p>
            </div>
            <span className="mt-10 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-widest transition-colors group-hover:text-brand-gold">
              <span>🔒</span> Acessar painel
              <span className="text-base transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
