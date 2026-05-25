
ALTER TABLE public.agendamentos ALTER COLUMN cliente_telefone DROP NOT NULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;
