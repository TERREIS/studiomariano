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
};

type Sessao = { nome: string; slug: string };

function Painel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("studio-mariano-equipe");
    if (!raw) {
      navigate({ to: "/login" });
      return;
    }
    const ses = JSON.parse(raw) as Sessao;
    setSessao(ses);

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: prof, error: pErr } = await supabase
        .from("profissionais")
        .select("id")
        .eq("slug", ses.slug)
        .maybeSingle();
      if (pErr || !prof) {
        toast.error("Profissional não encontrada.");
        setLoading(false);
        return;
      }
      const profissionalId = prof.id;
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("profissional_id", profissionalId)
        .gte("data", new Date().toISOString().slice(0, 10))
        .order("data")
        .order("hora");
      if (error) toast.error("Erro ao carregar agenda");
      setAgendamentos((data ?? []) as Agendamento[]);
      setLoading(false);

      // Permissão de notificação do navegador
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      // Realtime: novos agendamentos para esta profissional
      channel = supabase
        .channel(`agenda-${profissionalId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "agendamentos",
            filter: `profissional_id=eq.${profissionalId}`,
          },
          (payload) => {
            const novo = payload.new as Agendamento;
            setAgendamentos((prev) => {
              const lista = [...prev, novo];
              lista.sort((a, b) =>
                a.data === b.data ? a.hora.localeCompare(b.hora) : a.data.localeCompare(b.data),
              );
              return lista;
            });
            const dt = new Date(`${novo.data}T${novo.hora}`);
            const quando = dt.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            });
            const msg = `${novo.cliente_nome} agendou ${novo.servico} • ${quando} às ${novo.hora.slice(0, 5)}`;
            toast.success("Novo agendamento!", { description: msg });
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Novo agendamento — Studio Mariano", {
                body: msg,
                icon: "/favicon.ico",
              });
            }
          },
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate]);

  function sair() {
    sessionStorage.removeItem("studio-mariano-equipe");
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <p className="font-serif text-2xl">Carregando…</p>
      </div>
    );
  }

  if (!sessao) return null;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <nav className="flex items-center justify-between border-b border-brand-charcoal/5 px-6 py-5 md:px-8">
        <Link to="/" className="font-serif text-xl uppercase">Studio Mariano</Link>
        <button onClick={sair} className="text-xs uppercase tracking-[0.2em] hover:text-brand-gold">
          Sair
        </button>
      </nav>

      <section className="container mx-auto max-w-5xl px-6 py-12 md:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
          Olá, {sessao.nome.split(" ")[0]}
        </span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Sua agenda</h1>
        <p className="mt-3 text-sm font-light text-stone-600">
          Próximos agendamentos confirmados pelos clientes.
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
                className="grid items-center gap-4 border border-brand-charcoal/10 bg-white p-5 md:grid-cols-4"
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
                  <p className="text-xs uppercase tracking-widest text-stone-400">Serviço</p>
                  <p className="font-medium">{a.servico}</p>
                  {a.observacoes && (
                    <p className="mt-1 text-xs text-stone-500">{a.observacoes}</p>
                  )}
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
