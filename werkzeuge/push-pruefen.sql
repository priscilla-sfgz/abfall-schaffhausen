-- =========================================================
-- Push-Erinnerungen prüfen (liest nur, ändert nichts)
-- Im Supabase-Dashboard unter «SQL Editor» einfügen und «Run» klicken.
-- Enthält keine Geheimnisse.
-- =========================================================

-- 1) Die letzten Antworten von /api/senden (der stündliche Wecker)
--    content zeigt z.B. {"gesendet": 1, "geraete": 1} oder {"grund": "keine Sendezeit (14:00)"}
--    Steht bei status_code NULL, hat /api/senden nicht rechtzeitig geantwortet (siehe error_msg).
select created, status_code, content, error_msg
from net._http_response
order by created desc
limit 6;

-- 2) Welche Geräte angemeldet sind und welche Termine sie in den nächsten Tagen haben
--    (endpoint gekürzt, damit nichts Persönliches angezeigt wird)
select
  left(endpoint, 30) || '…'                                        as geraet,
  aktualisiert,
  e ->> 'titel'                                                    as abfall,
  e ->> 'zeitpunkt'                                                as erinnerung,
  (select string_agg(d ->> 'datum', ', ')
     from jsonb_array_elements(e -> 'daten') d
    where (d ->> 'datum')::date between current_date and current_date + 7) as naechste_termine
from public.erinnerungen,
     jsonb_array_elements(lesezeichen) e
order by aktualisiert desc;
