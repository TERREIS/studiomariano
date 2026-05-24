import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/trabalhadores")({
  head: () => ({
    meta: [
      { title: "Painel da equipe — Studio Mariano" },
      { name: "description", content: "Painel restrito da equipe." },
    ],
  }),
  component: Painel,
});

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
  observacoes: string | null;
  profissional_id: string;
  profissionais?: { nome: string };
};

function Painel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate({ to: "/login" });
        return;
      }
      const uid = session.session.user.id;
      // Tem role trabalhador ou admin?
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const ok = (roles ?? []).some((r: any) => r.role === "trabalhador" || r.role === "admin");
      if (!ok) {
        toast.error("Sua conta não tem permissão. Peça à administradora para liberar.");
        await supabase.auth.signOut();
        navigate({ to: "/login" });
        return;
      }
      setAutorizado(true);
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*, profissionais(nome)")
        .gte("data", new Date().toISOString().slice(0, 10))
        .order("data")
        .order("hora");
      if (error) toast.error("Erro ao carregar agenda");
      setAgendamentos((data ?? []) as Agendamento[]);
      setLoading(false);
    })();
  }, [navigate]);

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <p className="font-serif text-2xl">Carregando…</p>
      </div>
    );
  }

  if (!autorizado) return null;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <nav className="flex items-center justify-between border-b border-brand-charcoal/5 px-6 py-5 md:px-8">
        <Link to="/" className="font-serif text-xl uppercase">Studio Mariano</Link>
        <button onClick={sair} className="text-xs uppercase tracking-[0.2em] hover:text-brand-gold">
          Sair
        </button>
      </nav>

      <section className="container mx-auto max-w-5xl px-6 py-12 md:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">Painel</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Próximos agendamentos</h1>
        <p className="mt-3 text-sm font-light text-stone-600">
          Em breve mais funções nesta área.
        </p>

        <div className="mt-10 space-y-3">
          {agendamentos.length === 0 && (
            <p className="text-sm text-stone-500">Nenhum agendamento futuro.</p>
          )}
          {agendamentos.map((a) => {
            const dt = new Date(`${a.data}T${a.hora}`);
            return (
              <div
                key={a.id}
                className="grid items-center gap-4 border border-brand-charcoal/10 bg-white p-5 md:grid-cols-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-gold">
                    {dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{a.hora.slice(0, 5)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400">Cliente</p>
                  <p className="font-medium">{a.cliente_nome}</p>
                  <a href={`tel:${a.cliente_telefone}`} className="text-xs text-stone-500 hover:text-brand-gold">
                    {a.cliente_telefone}
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400">Profissional</p>
                  <p className="font-medium">{a.profissionais?.nome ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400">Serviço</p>
                  <p className="font-medium">{a.servico}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400">Status</p>
                  <p className="font-medium capitalize">{a.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
