-- Payment Integration Database Setup
-- This script creates all necessary tables for payment integration

-- 1. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  song_request_id INTEGER REFERENCES song_requests(id) ON DELETE CASCADE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_order_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_method VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT valid_currency CHECK (currency IN ('INR', 'USD', 'EUR'))
);

-- 2. Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_plan_currency CHECK (currency IN ('INR', 'USD', 'EUR')),
  CONSTRAINT positive_price CHECK (price > 0)
);

-- 3. Create payment_webhooks table for tracking Razorpay webhooks
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id SERIAL PRIMARY KEY,
  razorpay_event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  webhook_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- 4. Add payment tracking to song_requests table
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT true;

-- Add constraint for payment_status
ALTER TABLE song_requests 
ADD CONSTRAINT IF NOT EXISTS valid_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- 5. Add payment tracking to songs table
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_song_request_id ON payments(song_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_currency ON pricing_plans(currency);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON payment_webhooks(razorpay_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_type ON payment_webhooks(event_type);

CREATE INDEX IF NOT EXISTS idx_song_requests_payment_id ON song_requests(payment_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_payment_status ON song_requests(payment_status);

CREATE INDEX IF NOT EXISTS idx_songs_payment_id ON songs(payment_id);

-- 7. Insert default pricing plans
INSERT INTO pricing_plans (name, description, price, currency, features, is_active) VALUES
(
  'Basic Plan',
  'Create one personalized song with AI-generated lyrics and music',
  99.00,
  'INR',
  '{"songs": 1, "lyrics_generation": true, "music_generation": true, "download": true, "sharing": true}',
  true
),
(
  'Premium Plan',
  'Create up to 5 personalized songs with AI-generated lyrics and music',
  299.00,
  'INR',
  '{"songs": 5, "lyrics_generation": true, "music_generation": true, "download": true, "sharing": true, "priority_support": true}',
  true
),
(
  'Pro Plan',
  'Create unlimited personalized songs with AI-generated lyrics and music',
  999.00,
  'INR',
  '{"songs": -1, "lyrics_generation": true, "music_generation": true, "download": true, "sharing": true, "priority_support": true, "custom_styles": true}',
  true
)
ON CONFLICT DO NOTHING;

-- 8. Add comments for documentation
COMMENT ON TABLE payments IS 'Stores all payment transactions and their status';
COMMENT ON TABLE pricing_plans IS 'Available pricing plans for the service';
COMMENT ON TABLE payment_webhooks IS 'Tracks Razorpay webhook events for payment processing';

COMMENT ON COLUMN payments.razorpay_payment_id IS 'Unique payment ID from Razorpay';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Order ID from Razorpay';
COMMENT ON COLUMN payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN payments.currency IS 'Payment currency (INR, USD, EUR)';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN payments.payment_method IS 'Payment method used (card, upi, netbanking, etc.)';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata from Razorpay';

COMMENT ON COLUMN pricing_plans.features IS 'JSON object containing plan features and limits';
COMMENT ON COLUMN pricing_plans.is_active IS 'Whether the plan is currently available for purchase';

COMMENT ON COLUMN payment_webhooks.razorpay_event_id IS 'Unique event ID from Razorpay webhook';
COMMENT ON COLUMN payment_webhooks.event_type IS 'Type of webhook event (payment.captured, payment.failed, etc.)';
COMMENT ON COLUMN payment_webhooks.webhook_data IS 'Complete webhook payload from Razorpay';
COMMENT ON COLUMN payment_webhooks.processed IS 'Whether the webhook has been processed';

COMMENT ON COLUMN song_requests.payment_id IS 'Reference to the payment that covers this request';
COMMENT ON COLUMN song_requests.payment_status IS 'Payment status for this specific request';

COMMENT ON COLUMN songs.payment_id IS 'Reference to the payment that covers this song generation';

-- 9. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON pricing_plans TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_webhooks TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE payments_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE pricing_plans_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE payment_webhooks_id_seq TO your_app_user;

-- 12. Verify the setup
SELECT 'Payment integration database setup completed successfully!' as status;

-- Show created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'pricing_plans', 'payment_webhooks')
ORDER BY table_name;

-- Show pricing plans
SELECT id, name, price, currency, is_active 
FROM pricing_plans 
ORDER BY price;
