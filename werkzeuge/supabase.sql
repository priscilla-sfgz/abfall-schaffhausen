-- =========================================================
-- Supabase einrichten für die Push-Erinnerungen
-- Im Supabase-Dashboard unter «SQL Editor» einfügen und «Run» klicken.
-- =========================================================

-- 1) Tabelle: pro Gerät eine Zeile
create table if not exists public.erinnerungen (
  endpoint     text primary key,               -- Adresse des Geräts beim Push-Dienst
  abo          jsonb not null,                 -- Push-Abo des Browsers
  lesezeichen  jsonb not null default '[]',    -- gespeicherte Termine mit Erinnerungszeit
  aktualisiert timestamptz not null default now()
);

-- Niemand von aussen darf die Tabelle lesen oder ändern.
-- Nur die Vercel-Funktionen (mit dem geheimen Schlüssel) haben Zugriff.
alter table public.erinnerungen enable row level security;
grant select, insert, update, delete on public.erinnerungen to service_role;

-- 2) Erweiterungen für den stündlichen «Wecker»
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- 3) Jede Stunde /api/senden aufrufen
select cron.schedule(
  'erinnerungen-senden',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://abfall-schaffhausen.vercel.app/api/senden',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET – steht in geheim/schluessel.txt>'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000   -- bis 30 Sekunden warten (Standard wäre nur 5)
  );
  $$
);
