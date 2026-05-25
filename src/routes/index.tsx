import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClienteAuth } from "@/lib/cliente-auth";
import { toast } from "sonner";
import heroImage from "@/assets/gallery-7.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import gallery8 from "@/assets/gallery-8.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Mariano — Estética & Beleza em Guaratinguetá" },
      {
        name: "description",
        content:
          "Studio Mariano: cabelo, maquiagem, massagem relaxante, unhas, sobrancelha e depilação em Guaratinguetá. Jardim Rony. Agende pelo WhatsApp (12) 3197-0064.",
      },
      { property: "og:title", content: "Studio Mariano — Estética & Beleza em Guaratinguetá" },
      {
        property: "og:description",
        content:
          "Experiências personalizadas de estética, beleza e bem-estar no coração de Guaratinguetá.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const WHATSAPP_URL = "https://wa.me/551231970064";
const INSTAGRAM_URL = "https://instagram.com/studio.mariano";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Rua+Marieta+Rodrigues+Alves+354+Jardim+Rony+Guaratinguet%C3%A1";

const services = [
  {
    title: "Cabelo & Cor",
    description: "Cortes, coloração, mechas e tratamentos capilares sob medida.",
    image: gallery5,
  },
  {
    title: "Maquiagem",
    description: "Produções para noivas, eventos e ocasiões especiais.",
    image: gallery2,
  },
  {
    title: "Massagem Relaxante",
    description: "Uma pausa de bem-estar para relaxar corpo e mente com toque terapêutico.",
    image: gallery3,
  },
];

const otherServices = [
  { title: "Estética Facial", description: "Limpeza de pele, hidratação e cuidados personalizados." },
  { title: "Manicure & Pedicure", description: "Design de unhas e spa para mãos e pés." },
  { title: "Depilação", description: "Métodos suaves para uma pele sedosa." },
  { title: "Sobrancelha", description: "Design estratégico para harmonizar seu olhar." },
];

const galleryImages = [
  { src: gallery1, alt: "Cabelo loiro com mechas iluminadas" },
  { src: gallery6, alt: "Coloração com reflexos dourados" },
  { src: gallery8, alt: "Corte bob alinhado e brilhoso" },
  { src: gallery4, alt: "Corte masculino moderno" },
];

function Index() {
  const { user, loading: authLoading, nome } = useClienteAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setEntrando(false);
    if (error) {
      toast.error("E-mail ou senha incorretos. Se ainda não tem conta, cadastre-se.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/agendar/cliente" });
  }

  async function sair() {
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta.");
  }

  return (
    <div className="bg-brand-cream text-brand-charcoal">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-brand-charcoal/5 bg-brand-cream/80 px-6 py-5 backdrop-blur-md md:px-8">
        <span className="font-serif text-xl tracking-tight uppercase md:text-2xl">
          Studio Mariano
        </span>
        <div className="hidden gap-8 text-xs font-medium uppercase tracking-[0.2em] md:flex">
          <a href="#sobre" className="transition-colors hover:text-brand-gold">Sobre</a>
          <a href="#servicos" className="transition-colors hover:text-brand-gold">Serviços</a>
          <a href="#galeria" className="transition-colors hover:text-brand-gold">Galeria</a>
          <a href="#contato" className="transition-colors hover:text-brand-gold">Contato</a>
        </div>
        <Link
          to="/agendar"
          className="bg-brand-charcoal px-5 py-3 text-[10px] uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-gold md:text-xs"
        >
          Agendar
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex h-[90vh] min-h-[560px] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Cliente do Studio Mariano com maquiagem e penteado de noiva"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-charcoal/40" />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-8">
          <div className="max-w-2xl text-white">
            <h1 className="mb-6 font-serif text-5xl leading-tight md:text-7xl lg:text-8xl">
              Realce sua <br />
              <i className="font-normal italic">beleza essencial</i>
            </h1>
            <p className="mb-10 max-w-md text-base font-light leading-relaxed opacity-90 md:text-lg">
              Experiências personalizadas de estética, beleza e bem-estar no coração de Guaratinguetá.
            </p>
            <Link
              to="/agendar"
              className="group inline-flex items-center gap-4 bg-brand-gold px-8 py-5 text-white transition-all hover:bg-white hover:text-brand-charcoal md:px-10"
            >
              <span className="text-xs font-semibold uppercase tracking-widest md:text-sm">
                Agendar online
              </span>
              <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="container mx-auto px-6 py-24 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
              O Estúdio
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              Um refúgio de cuidado em Guaratinguetá
            </h2>
            <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-stone-600">
              No Studio Mariano cada atendimento é pensado para realçar sua identidade
              com técnica, carinho e produtos de alta performance. Um espaço sereno,
              acolhedor e dedicado ao seu bem-estar — incluindo uma deliciosa massagem
              relaxante para desacelerar a rotina.
            </p>
            <p className="mt-4 max-w-lg text-base font-light leading-relaxed text-stone-600">
              Aberto de segunda a sábado, das 8h às 21h, com horários flexíveis para se
              adaptar à sua rotina.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={gallery1}
              alt="Cabelo finalizado no Studio Mariano"
              width={800}
              height={1000}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
            <img
              src={gallery6}
              alt="Coloração com mechas iluminadas"
              width={800}
              height={1000}
              loading="lazy"
              className="mt-12 aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="container mx-auto px-6 py-24 md:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
              Nossa Expertise
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Serviços de Beleza</h2>
          </div>
          <p className="max-w-xs text-sm italic leading-relaxed text-stone-500">
            Cuidado integral da cabeça aos pés, com as técnicas mais refinadas do mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="group">
              <div className="mb-6 aspect-[4/5] w-full overflow-hidden bg-stone-100">
                <img
                  src={s.image}
                  alt={s.title}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mb-2 font-serif text-2xl">{s.title}</h3>
              <p className="text-sm font-light text-stone-600">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-brand-charcoal/10 pt-16 md:grid-cols-4">
          {otherServices.map((s) => (
            <div key={s.title}>
              <h4 className="mb-3 font-serif text-xl">{s.title}</h4>
              <p className="text-sm font-light text-stone-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="container mx-auto px-6 py-24 md:px-8">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Portfólio
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Trabalhos do estúdio</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {galleryImages.map((g) => (
            <div key={g.src} className="aspect-[4/5] overflow-hidden bg-stone-100">
              <img
                src={g.src}
                alt={g.alt}
                width={800}
                height={1000}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Contato / Localização */}
      <section id="contato" className="bg-brand-charcoal py-24 text-white">
        <div className="container mx-auto grid grid-cols-1 items-center gap-16 px-6 md:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="mb-12 font-serif text-4xl md:text-5xl">Venha nos Visitar</h2>
            <div className="space-y-8">
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Localização
                </span>
                <p className="text-lg font-light opacity-80">
                  Rua Marieta Rodrigues Alves, 354
                  <br />
                  Jardim Rony — Guaratinguetá, SP
                </p>
              </div>
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Horário de Atendimento
                </span>
                <p className="text-lg font-light opacity-80">
                  Segunda a Sábado
                  <br />
                  08h às 21h
                </p>
              </div>
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Telefone
                </span>
                <a
                  href="tel:+551231970064"
                  className="text-lg font-light opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  (12) 3197-0064
                </a>
              </div>
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Instagram
                </span>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-2xl italic transition-colors hover:text-brand-gold"
                >
                  @studio.mariano
                </a>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-gold px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand-charcoal"
              >
                WhatsApp
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/30 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                Como chegar
              </a>
            </div>
          </div>

          <div className="aspect-square w-full overflow-hidden border border-white/10 lg:aspect-video">
            <iframe
              title="Mapa Studio Mariano"
              src="https://www.google.com/maps?q=Rua+Marieta+Rodrigues+Alves+354+Jardim+Rony+Guaratinguet%C3%A1&output=embed"
              className="h-full w-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-charcoal/5 px-6 py-12 md:px-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
            © {new Date().getFullYear()} Studio Mariano. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-charcoal">
            <a href="tel:+551231970064" className="transition-colors hover:text-brand-gold">
              (12) 3197-0064
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brand-gold"
            >
              @studio.mariano
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
