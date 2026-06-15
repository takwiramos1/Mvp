import * as SQLite from 'expo-sqlite';

let db;

export const getDB = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('tuckbook.db');
  }
  return db;
};

export const initDB = async () => {
  const database = getDB();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('credit', 'payment')),
      description TEXT DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
  `);
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const addCustomer = async (name, phone = '', notes = '') => {
  const database = getDB();
  const result = await database.runAsync(
    'INSERT INTO customers (name, phone, notes) VALUES (?, ?, ?)',
    [name.trim(), phone.trim(), notes.trim()]
  );
  return result.lastInsertRowId;
};

export const getAllCustomers = async () => {
  const database = getDB();
  const rows = await database.getAllAsync(`
    SELECT
      c.id,
      c.name,
      c.phone,
      c.notes,
      c.created_at,
      COALESCE(
        SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END),
        0
      ) AS balance
    FROM customers c
    LEFT JOIN transactions t ON t.customer_id = c.id
    GROUP BY c.id
    ORDER BY balance DESC, c.name ASC
  `);
  return rows;
};

export const getCustomerById = async (id) => {
  const database = getDB();
  const row = await database.getFirstAsync(`
    SELECT
      c.id,
      c.name,
      c.phone,
      c.notes,
      c.created_at,
      COALESCE(
        SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) -
        SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END),
        0
      ) AS balance
    FROM customers c
    LEFT JOIN transactions t ON t.customer_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `, [id]);
  return row;
};

export const updateCustomer = async (id, name, phone, notes) => {
  const database = getDB();
  await database.runAsync(
    'UPDATE customers SET name = ?, phone = ?, notes = ? WHERE id = ?',
    [name.trim(), phone.trim(), notes.trim(), id]
  );
};

export const deleteCustomer = async (id) => {
  const database = getDB();
  await database.runAsync('DELETE FROM customers WHERE id = ?', [id]);
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const addTransaction = async (customerId, amount, type, description = '') => {
  const database = getDB();
  const result = await database.runAsync(
    'INSERT INTO transactions (customer_id, amount, type, description) VALUES (?, ?, ?, ?)',
    [customerId, Math.abs(amount), type, description.trim()]
  );
  return result.lastInsertRowId;
};

export const getTransactionsByCustomer = async (customerId) => {
  const database = getDB();
  const rows = await database.getAllAsync(
    `SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC`,
    [customerId]
  );
  return rows;
};

export const deleteTransaction = async (id) => {
  const database = getDB();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const database = getDB();

  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

  const totals = await database.getFirstAsync(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS total_credit_given,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS total_payments_received
    FROM transactions
  `);

  const todayStats = await database.getFirstAsync(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS today_credit,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS today_payments,
      COUNT(*) AS today_transactions
    FROM transactions
    WHERE created_at >= ?
  `, [todayStart]);

  const debtorCount = await database.getFirstAsync(`
    SELECT COUNT(*) AS count FROM (
      SELECT customer_id,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) AS balance
      FROM transactions
      GROUP BY customer_id
      HAVING balance > 0
    )
  `);

  const totalOwed = (totals?.total_credit_given ?? 0) - (totals?.total_payments_received ?? 0);

  return {
    totalOwed: Math.max(0, totalOwed),
    todayCredit: todayStats?.today_credit ?? 0,
    todayPayments: todayStats?.today_payments ?? 0,
    todayTransactions: todayStats?.today_transactions ?? 0,
    activeDebtors: debtorCount?.count ?? 0,
  };
};

export const getRecentTransactions = async (limit = 10) => {
  const database = getDB();
  const rows = await database.getAllAsync(`
    SELECT t.*, c.name AS customer_name, c.phone AS customer_phone
    FROM transactions t
    JOIN customers c ON c.id = t.customer_id
    ORDER BY t.created_at DESC
    LIMIT ?
  `, [limit]);
  return rows;
};
