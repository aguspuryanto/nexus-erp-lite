import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("erp.db");

// Initialize Database Schema
db.exec(`
  -- Master Data
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    tax_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    name TEXT NOT NULL,
    address TEXT,
    FOREIGN KEY(company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS coa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Asset, Liability, Equity, Income, Expense
    parent_id INTEGER,
    FOREIGN KEY(parent_id) REFERENCES coa(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    purchase_price REAL,
    sales_price REAL,
    stock_qty REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- Customer, Supplier
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT
  );

  -- Sales & Purchasing
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- QUOTATION, SO, PO, PR, INVOICE_IN, INVOICE_OUT
    number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    partner_id INTEGER,
    status TEXT DEFAULT 'DRAFT',
    total_amount REAL DEFAULT 0,
    FOREIGN KEY(partner_id) REFERENCES partners(id)
  );

  CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    product_id INTEGER,
    qty REAL,
    price REAL,
    subtotal REAL,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  -- Accounting
  CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    reference TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_id INTEGER,
    coa_id INTEGER,
    debit REAL DEFAULT 0,
    credit REAL DEFAULT 0,
    FOREIGN KEY(journal_id) REFERENCES journals(id),
    FOREIGN KEY(coa_id) REFERENCES coa(id)
  );

  -- HRD
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    join_date DATE,
    salary REAL,
    status TEXT DEFAULT 'ACTIVE'
  );

  -- CRM
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    status TEXT DEFAULT 'NEW', -- NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST
    value REAL,
    last_follow_up DATE
  );

  -- Audit Trail
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    action TEXT,
    module TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  db.prepare("INSERT INTO products (code, name, category, unit, purchase_price, sales_price, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    'P001', 'Laptop Pro 14', 'Electronics', 'Unit', 1200, 1500, 10
  );
  db.prepare("INSERT INTO partners (type, name, email) VALUES (?, ?, ?)").run('Customer', 'John Doe Corp', 'john@example.com');
  db.prepare("INSERT INTO partners (type, name, email) VALUES (?, ?, ?)").run('Supplier', 'Global Tech Ltd', 'sales@globaltech.com');
  db.prepare("INSERT INTO coa (code, name, type) VALUES (?, ?, ?)").run('1000', 'Cash', 'Asset');
  db.prepare("INSERT INTO coa (code, name, type) VALUES (?, ?, ?)").run('4000', 'Sales Revenue', 'Income');

  // Seed CRM
  db.prepare("INSERT INTO leads (name, company, status, value, last_follow_up) VALUES (?, ?, ?, ?, ?)").run('Alice Smith', 'Tech Solutions', 'QUALIFIED', 5000, '2024-02-20');
  db.prepare("INSERT INTO leads (name, company, status, value, last_follow_up) VALUES (?, ?, ?, ?, ?)").run('Bob Jones', 'Creative Agency', 'NEW', 2500, '2024-02-22');
  db.prepare("INSERT INTO leads (name, company, status, value, last_follow_up) VALUES (?, ?, ?, ?, ?)").run('Charlie Brown', 'Retail Hub', 'PROPOSAL', 12000, '2024-02-18');

  // Seed HRD
  db.prepare("INSERT INTO employees (name, position, department, join_date, salary) VALUES (?, ?, ?, ?, ?)").run('Emma Wilson', 'Senior Developer', 'Engineering', '2023-01-15', 8500);
  db.prepare("INSERT INTO employees (name, position, department, join_date, salary) VALUES (?, ?, ?, ?, ?)").run('Liam Johnson', 'Product Manager', 'Product', '2023-05-10', 7500);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/dashboard/stats", (req, res) => {
    const sales = db.prepare("SELECT SUM(total_amount) as total FROM transactions WHERE type = 'INVOICE_OUT'").get() as any;
    const purchases = db.prepare("SELECT SUM(total_amount) as total FROM transactions WHERE type = 'INVOICE_IN'").get() as any;
    const products = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
    const employees = db.prepare("SELECT COUNT(*) as count FROM employees").get() as any;
    
    res.json({
      revenue: sales.total || 0,
      expenses: purchases.total || 0,
      productCount: products.count,
      employeeCount: employees.count
    });
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/partners", (req, res) => {
    const partners = db.prepare("SELECT * FROM partners").all();
    res.json(partners);
  });

  app.get("/api/transactions", (req, res) => {
    const type = req.query.type;
    let query = `
      SELECT t.*, p.name as partner_name 
      FROM transactions t 
      LEFT JOIN partners p ON t.partner_id = p.id
    `;
    const params: any[] = [];
    
    if (type) {
      query += " WHERE t.type = ?";
      params.push(type);
    }
    
    query += " ORDER BY t.date DESC";
    
    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  });

  app.get("/api/transactions/:id/items", (req, res) => {
    const items = db.prepare(`
      SELECT ti.*, p.name as product_name, p.code as product_code
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ?
    `).all(req.params.id);
    res.json(items);
  });

  app.post("/api/transactions", (req, res) => {
    const { type, number, date, partner_id, status, total_amount, items } = req.body;
    
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (type, number, date, partner_id, status, total_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, product_id, qty, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const result = insertTransaction.run(type, number, date, partner_id, status, total_amount);
      const transactionId = result.lastInsertRowid;
      
      for (const item of items) {
        insertItem.run(transactionId, item.product_id, item.qty, item.price, item.subtotal);
      }
      
      return transactionId;
    });

    try {
      const id = transaction();
      res.json({ id, number });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/transactions/:id", (req, res) => {
    const { status, total_amount, items } = req.body;
    const id = req.params.id;

    const updateTransaction = db.prepare(`
      UPDATE transactions SET status = ?, total_amount = ? WHERE id = ?
    `);

    const deleteItems = db.prepare("DELETE FROM transaction_items WHERE transaction_id = ?");
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, product_id, qty, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateTransaction.run(status, total_amount, id);
      
      if (items) {
        deleteItems.run(id);
        for (const item of items) {
          insertItem.run(id, item.product_id, item.qty, item.price, item.subtotal);
        }
      }
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/transactions/:id", (req, res) => {
    const id = req.params.id;
    const deleteItems = db.prepare("DELETE FROM transaction_items WHERE transaction_id = ?");
    const deleteTransaction = db.prepare("DELETE FROM transactions WHERE id = ?");

    const transaction = db.transaction(() => {
      deleteItems.run(id);
      deleteTransaction.run(id);
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/employees", (req, res) => {
    const employees = db.prepare("SELECT * FROM employees").all();
    res.json(employees);
  });

  app.get("/api/leads", (req, res) => {
    const leads = db.prepare("SELECT * FROM leads").all();
    res.json(leads);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
