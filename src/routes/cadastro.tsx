import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Studio Mariano" },
      { name: "description", content: "Crie sua conta para agendar no Studio Mariano." },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = nome.trim();
    if (n.split(/\s+/).length < 2) {
      toast.error("Digite seu nome completo (nome e sobrenome).");
      return;
    }
    if (n.length > 31) {
      toast.error("O nome deve ter no máximo 31 caracteres.");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome_completo: n },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conta criada! Você já está logado.");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-charcoal">
      <nav className="flex items-center justify-between border-b border-brand-charcoal/5 px-6 py-5 md:px-8">
        <Link to="/" className="font-serif text-xl uppercase">Studio Mariano</Link>
        <Link to="/" className="text-xs uppercase tracking-[0.2em] hover:text-brand-gold">← Voltar</Link>
      </nav>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Novo por aqui?
          </span>
          <h1 className="mt-4 font-serif text-4xl">Criar conta</h1>
          <p className="mt-3 text-sm font-light text-stone-600">
            Cadastre-se para agendar e acompanhar seus horários.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <div>
              <input
                required
                maxLength={31}
                placeholder="Nome completo (até 31 caracteres)"
                value={nome}
                onChange={(e) => setNome(e.target.value.slice(0, 31))}
                className="w-full border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-stone-500">{nome.length}/31</p>
            </div>
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
              minLength={6}
              placeholder="Senha (mín. 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-brand-charcoal/15 bg-white px-4 py-3 text-sm focus:border-brand-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-charcoal px-6 py-4 text-xs font-semibold uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-gold disabled:opacity-50"
            >
              {loading ? "Criando…" : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            Já tem cadastro?{" "}
            <Link to="/" className="font-semibold text-brand-gold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
