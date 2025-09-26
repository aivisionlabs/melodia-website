-- Migration script to remove payment fields from song_requests table
-- Run this script to update existing databases

-- Remove payment fields from song_requests table
ALTER TABLE song_requests
DROP COLUMN IF EXISTS payment_id,
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS payment_required;

-- Verify the columns were removed
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'song_requests'
AND column_name IN ('payment_id', 'payment_status', 'payment_required');

-- Should return no rows if successful

-- Note: Payment information is now tracked in the separate payments table
-- Use the following query to get payment status for a song request:
-- SELECT p.status as payment_status, p.razorpay_payment_id, p.amount
-- FROM payments p
-- WHERE p.song_request_id = [song_request_id];
