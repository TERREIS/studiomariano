import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addAppointment, ensurePermission } from "@/lib/notifications";
import { useClienteAuth } from "@/lib/cliente-auth";
import { toast } from "sonner";
import profPaula from "@/assets/prof-paula.jpg";
import profSandra from "@/assets/prof-sandra.jpg";
import profFernanda from "@/assets/prof-fernanda.jpg";

const PROF_FOTOS: Record<string, { foto: string; area: string }> = {
  "sandra-mariano": { foto: profSandra, area: "Cabeleireira — cortes, coloração, progressiva e tratamentos capilares" },
  "fernanda-rezende": { foto: profFernanda, area: "Cabeleireira & terapeuta — massagem relaxante, manicure, pedicure e serviços capilares (exceto corte)" },
  "paula-goncalves": { foto: profPaula, area: "Manicure & pedicure — cuidado completo para mãos e pés" },
};

export const Route = createFileRoute("/agendar/cliente")({
  head: () => ({
    meta: [
      { title: "Agendar como cliente — Studio Mariano" },
      { name: "description", content: "Escolha sua profissional e o horário ideal." },
    ],
  }),
  component: ClienteWizard,
});

type Profissional = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  faz_corte: boolean;
};

// Serviços por profissional
const SERVICOS_CABELEIREIRA = [
  "Corte de cabelo",
  "Progressiva",
  "Coloração",
  "Mechas / Luzes",
  "Hidratação",
  "Escova",
  "Manicure",
  "Pedicure",
  "Massagem relaxante",
  "Maquiagem",
  "Design de sobrancelha",
  "Depilação",
];

function servicosDe(p: Profissional): string[] {
  if (p.slug === "sandra-mariano") {
    return SERVICOS_CABELEIREIRA.filter(
      (s) => !["Manicure", "Pedicure", "Massagem relaxante"].includes(s),
    );
  }
  if (p.slug === "fernanda-rezende") {
    return SERVICOS_CABELEIREIRA.filter((s) => s !== "Corte de cabelo");
  }
  // Paula
  return ["Manicure", "Pedicure", "Spa dos pés", "Esmaltação em gel"];
}

// Horários: 9h às 21h, slot de 1h. Segunda a sábado.
const HORAS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildDays(): { iso: string; label: string; weekday: number }[] {
  const out: { iso: string; label: string; weekday: number }[] = [];
  const today = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const wd = d.getDay(); // 0=dom
    if (wd === 0) continue;
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
    out.push({ iso, label, weekday: wd });
  }
  return out;
}

function ClienteWizard() {
  const { user, loading: authLoading, nome: nomeAuth } = useClienteAuth();
  const navigate = useNavigate();
  const [profs, setProfs] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [prof, setProf] = useState<Profissional | null>(null);
  const [servico, setServico] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");

  const nome = (nomeAuth || "").slice(0, 31);
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [ocupados, setOcupados] = useState<Set<string>>(new Set());
  const [conflitosCliente, setConflitosCliente] = useState<Set<string>>(new Set());

  const dias = useMemo(buildDays, []);

  useEffect(() => {
    supabase
      .from("profissionais")
      .select("*")
      .order("ordem")
      .then(({ data, error }) => {
        if (error) toast.error("Erro ao carregar profissionais");
        else setProfs((data ?? []) as Profissional[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!prof || !data) return;
    supabase
      .from("agendamentos")
      .select("hora")
      .eq("profissional_id", prof.id)
      .eq("data", data)
      .then(({ data: rows }) => {
        const set = new Set<string>();
        (rows ?? []).forEach((r: any) => {
          set.add(String(r.hora).slice(0, 5));
        });
        setOcupados(set);
      });
  }, [prof, data]);

  // Conflito do próprio cliente em outra profissional, mesma data/hora
  useEffect(() => {
    if (!data || !nome.trim()) {
      setConflitosCliente(new Set());
      return;
    }
    supabase
      .from("agendamentos")
      .select("hora")
      .eq("data", data)
      .ilike("cliente_nome", nome.trim())
      .then(({ data: rows }) => {
        const set = new Set<string>();
        (rows ?? []).forEach((r: any) => set.add(String(r.hora).slice(0, 5)));
        setConflitosCliente(set);
      });
  }, [data, nome]);

  async function confirmar() {
    if (!prof || !servico || !data || !hora || !nome) {
      toast.error("Preencha todos os campos");
      return;
    }
    setEnviando(true);
    const { data: row, error } = await supabase
      .from("agendamentos")
      .insert({
        profissional_id: prof.id,
        servico,
        data,
        hora,
        cliente_nome: nome,
        cliente_telefone: user?.email ?? "",
        observacoes: observacoes || null,
      })
      .select()
      .single();
    setEnviando(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("Esse horário acabou de ser preenchido. Escolha outro.");
        setOcupados((s) => new Set(s).add(hora));
        setHora("");
        setStep(3);
      } else {
        toast.error("Erro ao agendar: " + error.message);
      }
      return;
    }

    const granted = await ensurePermission();
    addAppointment({
      id: row!.id as string,
      cliente: nome,
      profissional: prof.nome,
      servico,
      quando: `${data}T${hora}:00`,
    });

    toast.success(
      granted
        ? "Agendado! Você receberá um lembrete 30 min antes."
        : "Agendado com sucesso!",
    );
    setStep(4);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <p className="font-serif text-2xl">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <nav className="flex items-center justify-between border-b border-brand-charcoal/5 bg-brand-cream/80 px-6 py-5 backdrop-blur-md md:px-8">
        <Link to="/" className="font-serif text-xl tracking-tight uppercase md:text-2xl">
          Studio Mariano
        </Link>
        <Link to="/agendar" className="text-xs uppercase tracking-[0.2em] hover:text-brand-gold">
          ← Voltar
        </Link>
      </nav>

      <section className="container mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-20">
        {!nome.trim() ? (
          <div className="mx-auto max-w-lg">
            <h2 className="mb-3 font-serif text-3xl md:text-4xl">Bem-vinda(o)</h2>
            <p className="mb-8 text-sm font-light text-stone-600">
              Antes de começar, nos diga seu nome completo. Usamos para confirmar seu agendamento.
            </p>
            <input
              autoFocus
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
            />
            <button
              disabled={nome.trim().split(/\s+/).length < 2}
              onClick={() => setStep(1)}
              className="mt-6 w-full bg-brand-charcoal px-6 py-4 text-xs font-semibold uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              Continuar →
            </button>
            <p className="mt-3 text-[11px] text-stone-500">Informe nome e sobrenome.</p>
          </div>
        ) : (
        <>
        {/* Stepper */}
        <div className="mb-12 flex items-center justify-between">
          {["Profissional", "Serviço", "Horário", "Dados"].map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3 | 4;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex flex-1 items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    active
                      ? "border-brand-gold bg-brand-gold text-white"
                      : done
                      ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
                      : "border-brand-charcoal/20 text-brand-charcoal/40"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`ml-2 hidden text-xs uppercase tracking-widest md:inline ${
                    active ? "text-brand-charcoal" : "text-brand-charcoal/40"
                  }`}
                >
                  {label}
                </span>
                {i < 3 && <div className="mx-3 h-px flex-1 bg-brand-charcoal/10" />}
              </div>
            );
          })}
        </div>
        <p className="mb-6 text-xs uppercase tracking-widest text-stone-500">
          Cliente: <span className="text-brand-charcoal">{nome}</span>
        </p>


        {step === 1 && (
          <div>
            <h2 className="mb-2 font-serif text-3xl md:text-4xl">Escolha sua profissional</h2>
            <p className="mb-8 text-sm font-light text-stone-600">
              Cada uma com sua especialidade.
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {profs.map((p) => {
                const meta = PROF_FOTOS[p.slug];
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProf(p);
                      setStep(2);
                    }}
                    className="group overflow-hidden border border-brand-charcoal/10 bg-white text-left transition-all hover:border-brand-gold hover:shadow-lg"
                  >
                    {meta?.foto && (
                      <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                        <img
                          src={meta.foto}
                          alt={p.nome}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-serif text-xl">{p.nome}</h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-brand-gold">
                        {meta?.area.split(" — ")[0] ?? "Profissional"}
                      </p>
                      <p className="mt-3 text-sm font-light text-stone-600">
                        {meta?.area.split(" — ")[1] ?? p.descricao}
                      </p>
                      <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-widest text-brand-charcoal group-hover:text-brand-gold">
                        Escolher →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && prof && (
          <div>
            <h2 className="mb-2 font-serif text-3xl md:text-4xl">Qual serviço?</h2>
            <p className="mb-8 text-sm font-light text-stone-600">
              Profissional selecionada: <strong>{prof.nome}</strong>
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {servicosDe(prof).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setServico(s);
                    setStep(3);
                  }}
                  className="border border-brand-charcoal/10 bg-white p-4 text-left text-sm font-medium transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-8 text-xs uppercase tracking-widest text-stone-500 hover:text-brand-gold"
            >
              ← Trocar profissional
            </button>
          </div>
        )}

        {step === 3 && prof && (
          <div>
            <h2 className="mb-2 font-serif text-3xl md:text-4xl">Data e horário</h2>
            <p className="mb-8 text-sm font-light text-stone-600">
              <strong>{prof.nome}</strong> · {servico} · Atendimento de segunda a sábado, 9h às 21h.
            </p>

            <div className="mb-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-500">Dia</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dias.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setData(d.iso);
                      setHora("");
                    }}
                    className={`shrink-0 border px-4 py-3 text-xs uppercase tracking-wider transition-colors ${
                      data === d.iso
                        ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
                        : "border-brand-charcoal/10 bg-white hover:border-brand-gold"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {data && (
              <div className="mb-8">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-500">Horário</h3>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                  {HORAS.map((h) => {
                    const taken = ocupados.has(h);
                    const conflito = conflitosCliente.has(h);
                    const indisponivel = taken || conflito;
                    return (
                      <button
                        key={h}
                        disabled={indisponivel}
                        onClick={() => setHora(h)}
                        className={`border px-3 py-3 text-sm font-medium transition-colors ${
                          indisponivel
                            ? "cursor-not-allowed border-brand-charcoal/5 bg-stone-100 text-stone-400 line-through"
                            : hora === h
                            ? "border-brand-gold bg-brand-gold text-white"
                            : "border-brand-charcoal/10 bg-white hover:border-brand-gold"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                {(ocupados.size > 0 || conflitosCliente.size > 0) && (
                  <p className="mt-3 text-xs italic text-stone-500">
                    O horário dessa integrante da equipe não está disponível.
                  </p>
                )}
              </div>
            )}


            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-xs uppercase tracking-widest text-stone-500 hover:text-brand-gold"
              >
                ← Voltar
              </button>
              <button
                disabled={!data || !hora}
                onClick={() => setStep(4)}
                className="bg-brand-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-gold disabled:cursor-not-allowed disabled:opacity-30"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {step === 4 && prof && (
          <div>
            <h2 className="mb-2 font-serif text-3xl md:text-4xl">Seus dados</h2>
            <p className="mb-8 text-sm font-light text-stone-600">
              <strong>{prof.nome}</strong> · {servico} ·{" "}
              {new Date(`${data}T${hora}:00`).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}{" "}
              às {hora}
            </p>

            <div className="grid max-w-xl gap-4">
              <div className="border border-brand-charcoal/15 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                Nome: <strong className="text-brand-charcoal">{nome}</strong>
              </div>
              <input
                placeholder="Telefone / WhatsApp"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
              />
              <textarea
                placeholder="Observações (opcional)"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
              />
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="text-xs uppercase tracking-widest text-stone-500 hover:text-brand-gold"
              >
                ← Voltar
              </button>
              <button
                disabled={enviando}
                onClick={confirmar}
                className="bg-brand-gold px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-charcoal disabled:opacity-50"
              >
                {enviando ? "Confirmando…" : "Confirmar agendamento"}
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </section>

    </div>
  );
}
