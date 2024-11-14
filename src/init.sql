
CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(50) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  item_id INTEGER NOT NULL REFERENCES purchase_items(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_accounts (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  coins INTEGER DEFAULT 0,
  boosts INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boost_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  effect TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_boosts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  boost_id INTEGER NOT NULL REFERENCES boost_items(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, boost_id)
);

CREATE TABLE IF NOT EXISTS active_boosts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  boost_id INTEGER NOT NULL REFERENCES boost_items(id),
  activation_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(50) NOT NULL,
  coin_cost INTEGER NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  voucher_id INTEGER NOT NULL REFERENCES vouchers(id),
  voucher_code VARCHAR(255) NOT NULL UNIQUE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  coins_added INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  transaction_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  prize_type VARCHAR(20) NOT NULL,
  prize_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample purchase items data
INSERT INTO purchase_items (item_name, item_type, price, description) VALUES
  ('100 Coins', 'coins', 1.99, 'Get 100 coins to use in-game for boosts and other features'),
  ('Boost Pack', 'boosts', 4.99, 'Unlock a special boost pack to enhance gameplay'),
  ('Premium Bundle', 'bundle', 9.99, 'Get coins and boosts in one premium package')
ON CONFLICT DO NOTHING;

-- Sample boost items data
INSERT INTO boost_items (name, description, effect) VALUES
  ('Extra Wicket', 'Adds an extra wicket to your game', 'Increases wickets by 1'),
  ('Extra Ball', 'Adds an extra ball to your over', 'Increases balls by 1'),
  ('Power Hit', 'Doubles your next hit score', 'Multiplies next hit score by 2')
ON CONFLICT DO NOTHING;

-- Sample vouchers data
INSERT INTO vouchers (name, value, coin_cost, description, status) VALUES
  ('10% Discount', '$5', 100, 'Get 10% off on your next purchase', 'active'),
  ('Free Spin', '1 Free Spin', 50, 'Get one free spin in the game', 'active'),
  ('Premium Boost', 'Premium Boost Pack', 200, 'Get a premium boost pack', 'active')
ON CONFLICT DO NOTHING;