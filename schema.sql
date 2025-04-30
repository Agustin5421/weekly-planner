-- Ejecuta este script en el SQL Editor de Supabase para crear la tabla de eventos

-- Tabla principal de eventos
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  color TEXT NOT NULL,
  isRecurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_recurring ON events(isRecurring);

-- Políticas de seguridad (RLS) - Opcional, para cuando implementes autenticación
-- Por ahora, permitimos acceso público a los eventos
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público a eventos" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);
