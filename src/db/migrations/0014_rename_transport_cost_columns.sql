-- Rename transport cost columns from cost_euros to cost (currency-agnostic)
-- Add transport_currency column

ALTER TABLE destination_research RENAME COLUMN drive_cost_euros TO drive_cost;
ALTER TABLE destination_research RENAME COLUMN train_cost_euros TO train_cost;
ALTER TABLE destination_research RENAME COLUMN bus_cost_euros TO bus_cost;
ALTER TABLE destination_research RENAME COLUMN taxi_cost_euros TO taxi_cost;

ALTER TABLE destination_research ADD COLUMN transport_currency text DEFAULT 'EUR';

-- Backfill: default all existing rows to EUR (the original assumed currency)
UPDATE destination_research SET transport_currency = 'EUR' WHERE transport_currency IS NULL;
