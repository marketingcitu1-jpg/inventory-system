-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 10,
  total_in INTEGER NOT NULL DEFAULT 0,
  total_out INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'IN STOCK',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL,
  request_code TEXT,
  remarks TEXT,
  person_responsible TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all authenticated users to read and write)
CREATE POLICY "Allow all access to items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
