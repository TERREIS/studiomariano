import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso da equipe — Studio Mariano" },
      { name: "description", content: "Área restrita às profissionais do Studio Mariano." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      toast.error("Credenciais inválidas");
      return;
    }
    navigate({ to: "/trabalhadores" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-charcoal">
      <nav className="flex items-center justify-between border-b border-brand-charcoal/5 px-6 py-5 md:px-8">
        <Link to="/" className="font-serif text-xl uppercase">Studio Mariano</Link>
        <Link to="/agendar" className="text-xs uppercase tracking-[0.2em] hover:text-brand-gold">← Voltar</Link>
      </nav>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Área restrita
          </span>
          <h1 className="mt-4 font-serif text-4xl">Acesso da equipe</h1>
          <p className="mt-3 text-sm font-light text-stone-600">
            Entre com suas credenciais cadastradas para ver sua agenda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
            />
            <input
              type="password"
              required
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-charcoal px-6 py-4 text-xs font-semibold uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-gold disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-xs text-stone-500">
            Não tem acesso? Fale com a administradora do estúdio.
          </p>
        </div>
      </section>
    </div>
  );
}
