-- Add table to store processed stripe webhooks for deduplication
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
    id TEXT PRIMARY KEY, -- This will be the Stripe Event ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_id TEXT NOT NULL,
    status TEXT NOT NULL
);

-- Turn on row level security, but allow the service key to do whatever it wants
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Index session_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_session_id ON public.stripe_webhooks(session_id);
