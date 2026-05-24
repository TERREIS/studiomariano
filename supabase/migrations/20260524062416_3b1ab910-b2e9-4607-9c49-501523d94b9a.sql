-- Enum para papéis
create type public.app_role as enum ('admin', 'trabalhador');

-- Tabela de profissionais
create table public.profissionais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text not null,
  faz_corte boolean not null default false,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.profissionais (nome, slug, descricao, faz_corte, ordem) values
  ('Sandra Mariano', 'sandra-mariano', 'Cabeleireira completa: corte, progressiva, coloração, hidratação e tudo que envolve cabelo.', true, 1),
  ('Fernanda Rezende', 'fernanda-rezende', 'Massagem relaxante, manicure, pedicure e serviços de cabeleireira (exceto corte).', false, 2),
  ('Paula Gonçalves', 'paula-goncalves', 'Especialista em pés e mãos: manicure e pedicure.', false, 3);

-- Tabela de agendamentos
create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references public.profissionais(id) on delete cascade,
  cliente_nome text not null,
  cliente_telefone text not null,
  servico text not null,
  data date not null,
  hora time not null,
  observacoes text,
  status text not null default 'confirmado',
  created_at timestamptz not null default now(),
  unique (profissional_id, data, hora)
);

create index agendamentos_data_idx on public.agendamentos(data, hora);

-- Tabela de papéis
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

-- Function security definer para checar papel sem recursão
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Enable RLS
alter table public.profissionais enable row level security;
alter table public.agendamentos enable row level security;
alter table public.user_roles enable row level security;

-- Profissionais: leitura pública
create policy "Profissionais visíveis para todos"
  on public.profissionais for select
  using (true);

create policy "Apenas admins gerenciam profissionais"
  on public.profissionais for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Agendamentos: qualquer um cria; público vê apenas data/hora/profissional para checar disponibilidade
create policy "Qualquer um pode criar agendamento"
  on public.agendamentos for insert
  to anon, authenticated
  with check (true);

create policy "Todos podem ver horários ocupados"
  on public.agendamentos for select
  using (true);

create policy "Trabalhadores podem atualizar agendamentos"
  on public.agendamentos for update
  to authenticated
  using (public.has_role(auth.uid(), 'trabalhador') or public.has_role(auth.uid(), 'admin'));

create policy "Trabalhadores podem deletar agendamentos"
  on public.agendamentos for delete
  to authenticated
  using (public.has_role(auth.uid(), 'trabalhador') or public.has_role(auth.uid(), 'admin'));

-- User roles: usuário vê seus próprios papéis; admin gerencia
create policy "Usuário vê seus papéis"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins gerenciam papéis"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));