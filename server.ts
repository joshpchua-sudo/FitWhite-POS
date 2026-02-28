import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Central Database for Users and Branch Metadata
const centralDb = new Database("central.db");
centralDb.pragma('journal_mode = WAL');
centralDb.pragma('foreign_keys = ON');

// Initialize Central Database
centralDb.exec(`
  CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL -- COMPANY-OWNED, MANAGED
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- SUPER_ADMIN, BRANCH_MANAGER, CASHIER
    branch_id TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );
`);

// Seed Branches
const branches = [
  { id: 'imus', name: 'Imus', type: 'COMPANY-OWNED' },
  { id: 'pasay', name: 'Pasay', type: 'COMPANY-OWNED' },
  { id: 'manila', name: 'Manila', type: 'COMPANY-OWNED' },
  { id: 'makati', name: 'Makati', type: 'COMPANY-OWNED' },
  { id: 'iloilo', name: 'Iloilo', type: 'COMPANY-OWNED' },
  { id: 'bacolod', name: 'Bacolod', type: 'COMPANY-OWNED' },
  { id: 'davao', name: 'Davao', type: 'COMPANY-OWNED' },
  { id: 'calamba', name: 'Calamba', type: 'MANAGED' },
  { id: 'paranaque', name: 'Paranaque', type: 'MANAGED' },
  { id: 'quezon-city', name: 'Quezon City', type: 'MANAGED' },
  { id: 'baclaran', name: 'Baclaran', type: 'MANAGED' }
];

// Cleanup: Remove Silang if it exists (User requested removal)
centralDb.prepare("DELETE FROM users WHERE branch_id = 'silang'").run();
centralDb.prepare("DELETE FROM branches WHERE id = 'silang'").run();

const insertBranch = centralDb.prepare("INSERT OR REPLACE INTO branches (id, name, type) VALUES (?, ?, ?)");
for (const b of branches) {
  insertBranch.run(b.id, b.name, b.type);
}

// Ensure Admin User exists
const adminExists = centralDb.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!adminExists) {
  centralDb.prepare("INSERT INTO users (username, password, role, branch_id) VALUES (?, ?, ?, ?)")
    .run('admin', 'admin123', 'SUPER_ADMIN', null);
}

// Seed Users for each branch
for (const b of branches) {
  const managerUsername = `manager_${b.id}`;
  const cashierUsername = `cashier_${b.id}`;
  
  if (!centralDb.prepare("SELECT * FROM users WHERE username = ?").get(managerUsername)) {
    centralDb.prepare("INSERT INTO users (username, password, role, branch_id) VALUES (?, ?, ?, ?)")
      .run(managerUsername, 'manager123', 'BRANCH_MANAGER', b.id);
  }
  
  if (!centralDb.prepare("SELECT * FROM users WHERE username = ?").get(cashierUsername)) {
    centralDb.prepare("INSERT INTO users (username, password, role, branch_id) VALUES (?, ?, ?, ?)")
      .run(cashierUsername, 'cashier123', 'CASHIER', b.id);
  }
}

const branchDbConnections: Record<string, any> = {};

function seedBranchDb(db: any) {
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count > 0) return;

  const insertProduct = db.prepare("INSERT INTO products (name, category, price, unit) VALUES (?, ?, ?, ?)");
  const insertInventory = db.prepare("INSERT INTO inventory (product_id, stock) VALUES (?, ?)");

  const services = [
    "FAT MELTING IV PUSH", "BEAUTIGENESIS GLOW IV PUSH", "HANGOVER COCKTAIL DRIP", "EMPRESS ADVANCE DRIP",
    "PREMIER ROYALTY DRIP", "MELASMA & SCAR REMOVER DRIP", "FIT & WHITE DUO DRIP", "CELESTIAL YOUTH DRIP",
    "APHRODITE LUXE DRIP", "FIT WHITE ELITE DRIP (ALL IN)", "LIPOLYSIS FACE", "LIPOLYSIS BODY",
    "LEMON FACE", "LEMON BODY", "HIFU ARMS + RF + LEMON BODY", "HIFU TUMMY + RF + LEMON BODY",
    "HIFU FACE + RF + LEMON FACE", "NOSE SCULPT", "NASO FORM", "RHINOLIFT", "PIXIE TIP",
    "UPPER / LOWER BOTOX", "ARMS / SHOULDER BOTOX", "PALM /SWEATOX BOTOX", "CALVES - BOTOX",
    "STUDENT FACIAL", "CLASSIC FACIAL", "FW SIGNATURE FACIAL", "DIAMOND PEEL", "DIAMOND PEEL 10 iN 1",
    "HYDRA FACIAL", "HYDRA BEAUTY", "CARBON FACIAL", "CO2 FACIAL", "VAMPIRE FACIAL", "VIVACE FACIAL",
    "ACNE INJECTION", "ACNE MILD", "ACNE MODERATE", "ACNE SEVERE", "BACK ACNE MILD", "BACK ACNE MODERATE",
    "BACK ACNE SEVERE", "CARBON LASER W/ WHITENING - UA TREATMENT", "DIAMOND W/ WHITENING- UA TREATMENT",
    "WAXING- UA TREATMENT", "FEM TIGHTENING", "HEADSPA TREATMENT", "TATTOO REMOVAL", "FIT & WHITE PROGRAM",
    "APHRODITE GLOW UP", "ADVANCE ACNE CLEAR", "ADVANCED SCAR THERAPY", "ADVANCED POWER SHAPE BODY",
    "ADVANCED POWER SHAPE F & N", "GLAM MAKEOVER", "7D V SHAPE FACE", "LIPS - FILLERS", "CHIN - FILLERS",
    "CHEEK - FILLERS", "WRINKLE - FILLERS", "LAUGH LINE - FILLERS", "UNDER EYE - FILLERS", "FOREHEAD - FILLERS",
    "BODY FILLERS -BUTT", "BODY FILLERS - BREAST", "BODY FILLERS - HIPS", "MILIA / WARTS / SYRINGOMA REMOVAL - PER PIECE",
    "MILIA / WARTS / SYRINGOMA REMOVAL - UNLI FACE / NECK", "MILIA / WARTS / SYRINGOMA REMOVAL - UNLI FACE & NECK",
    "MILIA / WARTS / SYRINGOMA REMOVAL - UNLI BACK / TUMMY", "MILIA / WARTS / SYRINGOMA REMOVAL - UNI BACK & TUMMY",
    "MILIA / WARTS / SYRINGOMA REMOVAL - WHOLE BODY MILD", "MILIA / WARTS / SYRINGOMA REMOVAL - WHOLE BODY MODERATE",
    "MILIA / WARTS / SYRINGOMA REMOVAL - WHOLE BODY SEVERE", "BB FOUNDATION", "BB BLUSH", "MICROBLADING",
    "OMBRE BROWS", "HYBRID BROWS", "MEN'S BROWS", "LAMINATION / TINT", "BROW THREADING", "TOP EYELINER - TATTOO MAKE UP",
    "LIP BLUSH - TATTOO MAKE UP", "CLASSIC - EYELASH EXTENSION", "GLAMOUROUS - EYELASH EXTENSION",
    "CUSTOMIZED STYLE - EYELASH EXTESION", "LASHLIFT W/ TINT - LASHES", "LASHLIFT W/O TINT", "EYELASH REMOVAL - LASHES",
    "EMSLIM", "CRYOTHERAPY", "RF FACE ( 10 MINS)", "RF BODY ( 10 MINS)", "UPPER & LOWER LIP -IPL TREATMENT",
    "FULL FACE-IPL TREATMENT", "UNDERARM-IPL TREATMENT", "ARMS / LEGS-IPL TREATMENT", "BRAZILLIAN-IPL TREATMENT",
    "UPPER & LOWER LIP -DIODE / OPT TREATMENT", "UNDERARM -DIODE / OPT TREATMENT", "ARMS / LEGS -DIODE / OPT TREATMENT",
    "BRAZILLIAN -DIODE / OPT TREATMENT", "PICO MELA", "PICO FULL FACE", "UNDERARM - PICO TREATMENT",
    "BRAZILLIAN / BUTT / BIKINI- PICO TREATMENT", "ARMS / LEGS - WAXING", "BRAZILLIAN - WAXING", "BROW-WAXING",
    "FACE & NECK - HIFU", "ARMS - HIFU", "TUMMY - HIFU", "RHINOPLASTY - ALARTRIM", "RHINOPLASTY -ALARTRIM + LIFT",
    "RHINOPLASTY -TIPPLASTY EAR CARTILAGE", "RHINOPLASTY -ALARTRIM + TIPPLASTY", "RHINOPLASTY - VIRGIN NOSE SILICONE RHINOPLASTY",
    "RHINOPLASTY - VIRGIN NOSE GORETEX RHINOPLASTY", "RHINOPLASTY - VIRGIN NOSE EAR CARTILAGE RHINOPLASTY",
    "RHINOPLASTY - VIRGIN NOSE RIB CARTILAGE RHINOPLASTY", "RHINOPLASTY - REVISION NOSE TO SILICONE RHINOPLASTY",
    "RHINOPLASTY - REVISION NOSE TO GORETEX RHINOPLASTY", "RHINOPLASTY - REVISION NOSE TO EAR CARTILAGE RHINOPLASTY",
    "RHINOPLASTY - REVISION NOSE TO RIB CARTILAGE RHINOPLASTY", "BUCCAL FAT REMOVAL", "CHIN AUGMENTATION",
    "DIMPLE CREATION", "FACELIFT (FULL)", "FACELIFT (MINI)", "OTOPLASTY", "VAGINOPLASTY", "LABBIAPLASTY",
    "RHINOFIXED ( RHINOLIFT + ALAR TRIM)", "LIPOSUCTION - ABDOMEN", "LIPOSUCTION - ARMS", "LIPOSUCTION - BACK",
    "LIPOSUCTION - THIGHS", "LIPOSUCTION - SUBMENTAL/ CHIN", "LIPOSUCTION - TUMMY TUCK", "LIPOSUCTION - MINI TUCK",
    "LIPOSUCTION - BRAZILIAN BUTT LIFT (BBL)", "UPPER BLEP", "LOWER BLEP", "UPPER + LOWER BLEP", "DOUBLE EYELID CREATION",
    "LIP AUGMENTATION - UPPER + LOWER BLEP", "LIP AUGMENTATION - DOUBLE EYELID CREATION", "LIP AUGMENTATION - UPPER LIP RESHAPING",
    "LIP AUGMENTATION - UPPER + LOWER LIP RESHAPING", "LIP AUGMENTATION - LIP LIFT SURGERY", "BREAST AUGMENTATION - BREAST UNDER SKIN",
    "BREAST AUGMENTATION -BREAST UNDER MUSCLE", "BREAST AUGMENTATION -REVISION BREAST", "BABY FACE BOOSTER",
    "MADONA GOLD FACIAL", "MONO THREADS", "COG THREADS", "SKIN BOOSTER", "SCLEROTHERAPY", "CAVITATION",
    "HAIR RESTORATION", "NAILS", "HAIR CUT MEN", "HAIRCUT WOMEN", "HAIR COLOR - FULL", "HIGHLIGHTS",
    "ROOTS RETOUCH", "LIGHTENING & BLEACH", "REBOND YUKO JAPANESE", "REBOND VOLUME", "RELAX", "REBOND RETOUCH",
    "HAIR SPA", "ORGANIC COLLAGEN", "DRY SCALP", "ANTI HAIRLOSS", "STEMCELL THERAPY", "HAIR & MAKE UP",
    "SHAMPOO & BLOWDRY", "STRAIGHT/ BEACH WAVE", "UP STYLE / HAIRDO", "KERATIN SMOOTHING", "STRAIGHT THERAPY",
    "CLEANSING FACIAL", "CRYSTAL GLOW FACIAL", "ORGANIQUE FACIAL", "ACNE TREATMENT FACIAL", "GLYCOLIC FACIAL",
    "MANICURE CLEANING", "PEDICURE CLEANING", "GEL MANICURE", "GEL PEDICURE", "FOOTSPA", "GEL REMOVER",
    "SOFTGEL EXT. W/ COLORS", "POLYGEL EXT. W/ COLORS", "CLASSIC EYELASH", "HYBRID EYELASH", "VOLUME EYELASH",
    "BARBIE DOLL EYELASH", "LASH REMOVAL", "THREADING UNDERARM", "THREDING EYEBROW", "THREADING UPPERLIP",
    "THREADING FULLFACE", "SHAMPOO, BLOWDRY & IRON", "SLIMFINITY"
  ];

  const addons = [
    "STEMCELL", "WHITENING BOOSTER", "PLACENTA", "COLLAGEN", "VITAMIN C", "VITAMIN B COMPLEX",
    "CALAMANSI SOAP", "CARROT SOAP", "COLLAGEN SOAP", "GLUTATHIONE SOAP", "KOJIC SOAP", "LEMON SOAP",
    "OATMEAL SOAP", "PLACENTA SOAP", "TOMATO SOAP", "GLUTAMANSI SOAP", "NIACINAMIDE SOAP", "SUGARCANE SOAP",
    "COLLAGEN ELASTIN CREAM", "MELA WHITE CREAM", "STRETCHMARK CREAM", "SUNBLOCK BEIGE CREAM", "UNDERARM CREAM",
    "SUNBLOCK GEL", "ANTIBACTERIAL CREAM", "CO2 CREAM", "HYDROCORTISONE CREAM", "SKIN DEFENDER", "EYELIFT CREAM",
    "ACNE TONER", "CLARIFYING SOL'N BIG", "CLARIFYING SOL'N SMALL", "MELA CLEAR SOL'N BIG", "MELA CLEAR SOL'N SMALL",
    "INTENSIVE", "INSTANT WHITE", "SUNBLOCK SPF 70", "HAND LOTION", "SKIN MOISTURIZING LOTION", "NIACINAMIDE LOTION",
    "Glass Skin Serum", "Glass Skin Set", "Whitening Tea", "Medical Kit ( Complete)", "Medical Kit ( Mupirucin & Antibiotics)",
    "Medical Kit ( Antibiotics & Mefenamic)", "Aphrodite Softgel", "Vitamin C Orals", "Vitamin B Orals", "Vitamin E Orals",
    "Tea Tree Soothing gel", "Mupirucin", "Etherium", "Fougera", "BINDER CORSET"
  ];

  for (const s of services) {
    const info = insertProduct.run(s, "Service", 1000, "session");
    insertInventory.run(info.lastInsertRowid, 999);
  }

  for (const a of addons) {
    const info = insertProduct.run(a, "Add-on", 500, "pcs");
    insertInventory.run(info.lastInsertRowid, 50);
  }
}

function getBranchDb(branchId: string) {
  if (!branchId || branchId === 'Admin' || branchId === 'HQ') return null;
  
  if (!branchDbConnections[branchId]) {
    const dbPath = path.join(__dirname, `branch_${branchId}.db`);
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize Branch Database Schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        unit TEXT DEFAULT 'pcs',
        low_stock_threshold INTEGER DEFAULT 10
      );

      CREATE TABLE IF NOT EXISTS inventory (
        product_id INTEGER PRIMARY KEY,
        stock INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        store_credit REAL DEFAULT 0,
        allergies TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS treatment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        treatment_name TEXT NOT NULL,
        dosage TEXT,
        notes TEXT,
        administered_by TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS bundles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS bundle_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bundle_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (bundle_id) REFERENCES bundles(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        total_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'Completed',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER,
        bundle_id INTEGER,
        quantity INTEGER NOT NULL,
        price_at_sale REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (bundle_id) REFERENCES bundles(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    seedBranchDb(db);
    branchDbConnections[branchId] = db;
  }
  return branchDbConnections[branchId];
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to attach branch DB
  app.use((req, res, next) => {
    const branchId = req.headers['x-branch-id'] as string || req.query.branchId as string;
    if (branchId && branchId !== 'Admin' && branchId !== 'HQ') {
      (req as any).branchDb = getBranchDb(branchId);
      (req as any).branchId = branchId;
    }
    next();
  });

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = centralDb.prepare(`
      SELECT u.*, b.name as branch_name 
      FROM users u 
      LEFT JOIN branches b ON u.branch_id = b.id 
      WHERE u.username = ? AND u.password = ?
    `).get(username, password) as any;
    
    if (user) {
      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        branch_id: user.branch_id || 'HQ',
        branch_name: user.branch_name || 'Headquarters'
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/branches", (req, res) => {
    const branches = centralDb.prepare("SELECT * FROM branches").all();
    res.json(branches);
  });

  // API Routes
  app.get("/api/products", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) {
      // HQ view - return all products from all branches or just a list
      // For now, let's return an empty list or handle HQ specifically
      return res.json([]);
    }
    
    const products = db.prepare(`
      SELECT p.*, i.stock 
      FROM products p 
      LEFT JOIN inventory i ON p.id = i.product_id
    `).all();
    res.json(products);
  });

  app.get("/api/bundles", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.json([]);
    
    const bundles = db.prepare("SELECT * FROM bundles WHERE active = 1").all() as any[];
    for (const b of bundles) {
      b.items = db.prepare(`
        SELECT bi.id, bi.quantity, p.name, p.price 
        FROM bundle_items bi 
        JOIN products p ON bi.product_id = p.id 
        WHERE bi.bundle_id = ?
      `).all(b.id);
    }
    res.json(bundles);
  });

  app.get("/api/customers", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.json([]);
    
    const customers = db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { name, email, phone, store_credit, allergies, notes } = req.body;
    const info = db.prepare("INSERT INTO customers (name, email, phone, store_credit, allergies, notes) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, email, phone, store_credit || 0, allergies || '', notes || '');
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/customers/:id", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { name, email, phone, store_credit, allergies, notes } = req.body;
    db.prepare("UPDATE customers SET name = ?, email = ?, phone = ?, store_credit = ?, allergies = ?, notes = ? WHERE id = ?")
      .run(name, email, phone, store_credit, allergies, notes, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/customers/:id/treatments", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.json([]);
    
    const treatments = db.prepare(`
      SELECT * FROM treatment_history 
      WHERE customer_id = ?
      ORDER BY timestamp DESC
    `).all(req.params.id);
    res.json(treatments);
  });

  app.post("/api/customers/:id/treatments", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { treatment_name, dosage, notes, administered_by } = req.body;
    const info = db.prepare(`
      INSERT INTO treatment_history (customer_id, treatment_name, dosage, notes, administered_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, treatment_name, dosage, notes, administered_by);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/customers/:id", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const customerId = parseInt(req.params.id);
    try {
      db.transaction(() => {
        db.prepare("UPDATE sales SET customer_id = NULL WHERE customer_id = ?").run(customerId);
        db.prepare("DELETE FROM customers WHERE id = ?").run(customerId);
      })();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer profile." });
    }
  });

  app.post("/api/bundles", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { name, price, items } = req.body;
    try {
      let bundleId: number | bigint;
      db.transaction(() => {
        const info = db.prepare("INSERT INTO bundles (name, price) VALUES (?, ?)").run(name, price);
        bundleId = info.lastInsertRowid;
        const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)");
        for (const item of items) {
          insertItem.run(bundleId, item.id, item.quantity);
        }
      })();
      const bundle = db.prepare("SELECT * FROM bundles WHERE id = ?").get(bundleId!);
      const bundleItems = db.prepare(`
        SELECT bi.*, p.name, p.price 
        FROM bundle_items bi 
        JOIN products p ON bi.product_id = p.id 
        WHERE bi.bundle_id = ?
      `).all(bundleId!);
      res.json({ ...bundle, items: bundleItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to create bundle" });
    }
  });

  app.put("/api/bundles/:id", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { name, price, items } = req.body;
    const bundleId = req.params.id;
    try {
      db.transaction(() => {
        db.prepare("UPDATE bundles SET name = ?, price = ? WHERE id = ?").run(name, price, bundleId);
        db.prepare("DELETE FROM bundle_items WHERE bundle_id = ?").run(bundleId);
        const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)");
        for (const item of items) {
          insertItem.run(bundleId, item.id, item.quantity);
        }
      })();
      const bundle = db.prepare("SELECT * FROM bundles WHERE id = ?").get(bundleId);
      const bundleItems = db.prepare(`
        SELECT bi.*, p.name, p.price 
        FROM bundle_items bi 
        JOIN products p ON bi.product_id = p.id 
        WHERE bi.bundle_id = ?
      `).all(bundleId);
      res.json({ ...bundle, items: bundleItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to update bundle" });
    }
  });

  app.delete("/api/bundles/:id", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const bundleId = parseInt(req.params.id);
    try {
      db.prepare("UPDATE bundles SET active = 0 WHERE id = ?").run(bundleId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bundle" });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { name, category, price, unit } = req.body;
    const { id } = req.params;
    try {
      db.prepare("UPDATE products SET name = ?, category = ?, price = ?, unit = ? WHERE id = ?")
        .run(name, category, price, unit, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update product." });
    }
  });

  app.post("/api/products", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { id, name, category, price, stockToAdd, unit } = req.body;
    try {
      db.transaction(() => {
        let productId = id;
        if (!id) {
          const info = db.prepare("INSERT INTO products (name, category, price, unit) VALUES (?, ?, ?, ?)")
            .run(name, category, price, unit);
          productId = info.lastInsertRowid;
          db.prepare("INSERT INTO inventory (product_id, stock) VALUES (?, ?)").run(productId, stockToAdd || 0);
        } else {
          db.prepare("UPDATE products SET name = ?, category = ?, price = ?, unit = ? WHERE id = ?")
            .run(name, category, price, unit, id);
          if (stockToAdd) {
            db.prepare("UPDATE inventory SET stock = stock + ? WHERE product_id = ?").run(stockToAdd, id);
          }
        }
      })();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save product." });
    }
  });

  app.post("/api/products/:id/stock", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { delta } = req.body;
    const productId = req.params.id;
    try {
      db.prepare("UPDATE inventory SET stock = stock + ? WHERE product_id = ?").run(delta, productId);
      const stock = db.prepare("SELECT stock FROM inventory WHERE product_id = ?").get(productId);
      res.json({ stock: stock.stock });
    } catch (error) {
      res.status(500).json({ error: "Failed to adjust stock" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { id } = req.params;
    try {
      db.transaction(() => {
        db.prepare("DELETE FROM inventory WHERE product_id = ?").run(id);
        db.prepare("DELETE FROM bundle_items WHERE product_id = ?").run(id);
        db.prepare("DELETE FROM sale_items WHERE product_id = ?").run(id);
        db.prepare("DELETE FROM products WHERE id = ?").run(id);
      })();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product." });
    }
  });

  app.post("/api/checkout", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { items, bundles, total, discount, paymentMethod, customerId, receiptTo } = req.body;
    
    const transaction = db.transaction(() => {
      // Stock validation
      for (const item of items) {
        if (item.category !== 'Service') {
          const currentStock = db.prepare("SELECT stock FROM inventory WHERE product_id = ?").get(item.id) as any;
          if (!currentStock || currentStock.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}`);
          }
        }
      }

      const saleInfo = db.prepare(`
        INSERT INTO sales (total_amount, discount_amount, payment_method, customer_id) 
        VALUES (?, ?, ?, ?)
      `).run(total, discount, paymentMethod, customerId);
      const saleId = saleInfo.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, bundle_id, quantity, price_at_sale) 
        VALUES (?, ?, ?, ?, ?)
      `);
      const updateStock = db.prepare("UPDATE inventory SET stock = stock - ? WHERE product_id = ?");

      for (const item of items) {
        insertItem.run(saleId, item.id, null, item.quantity, item.price);
        if (item.category !== 'Service') {
          updateStock.run(item.quantity, item.id);
        }
      }

      for (const bundle of bundles || []) {
        insertItem.run(saleId, null, bundle.id, bundle.quantity, bundle.price);
        const bItems = db.prepare("SELECT product_id, quantity FROM bundle_items WHERE bundle_id = ?").all(bundle.id) as any[];
        for (const bi of bItems) {
          const prod = db.prepare("SELECT category FROM products WHERE id = ?").get(bi.product_id) as any;
          if (prod.category !== 'Service') {
            updateStock.run(bi.quantity * bundle.quantity, bi.product_id);
          }
        }
      }

      if (paymentMethod === 'Store Credit' && customerId) {
        db.prepare("UPDATE customers SET store_credit = store_credit - ? WHERE id = ?").run(total, customerId);
      }

      return saleId;
    });

    try {
      const saleId = transaction();
      res.json({ success: true, saleId });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/sync", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    const { sales } = req.body;
    if (!Array.isArray(sales)) return res.status(400).json({ error: "Invalid data" });

    const results = [];
    for (const sale of sales) {
      try {
        const response = db.transaction(() => {
          const exists = db.prepare("SELECT id FROM sales WHERE timestamp = ? AND total_amount = ?").get(sale.timestamp, sale.total);
          if (exists) return { success: true, alreadySynced: true };

          const saleInfo = db.prepare(`
            INSERT INTO sales (total_amount, discount_amount, payment_method, customer_id, timestamp) 
            VALUES (?, ?, ?, ?, ?)
          `).run(sale.total, sale.discount, sale.paymentMethod, sale.customerId, sale.timestamp);
          
          return { success: true, id: saleInfo.lastInsertRowid };
        })();
        results.push(response);
      } catch (err) {
        results.push({ success: false, error: (err as Error).message });
      }
    }
    res.json(results);
  });

  app.get("/api/notifications", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.json([]);
    
    const notifications = db.prepare("SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50").all();
    res.json(notifications);
  });

  app.post("/api/notifications/read", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.status(400).json({ error: "Branch context required" });
    
    db.prepare("UPDATE notifications SET is_read = 1").run();
    res.json({ success: true });
  });

  app.get("/api/reports/daily", (req, res) => {
    const db = (req as any).branchDb;
    if (!db) return res.json({ sales: [], summary: { total_revenue: 0, total_transactions: 0 } });
    
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const sales = db.prepare(`
      SELECT s.id, s.total_amount, s.payment_method, s.status, s.timestamp, s.discount_amount,
             c.name as customer_name,
             GROUP_CONCAT(COALESCE(p.name, bd.name) || ' (x' || si.quantity || ')') as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN bundles bd ON si.bundle_id = bd.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE date(s.timestamp) = date(?)
      GROUP BY s.id 
      ORDER BY s.timestamp DESC
    `).all(date);
    
    const summary = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_transactions
      FROM sales
      WHERE date(timestamp) = date(?) AND status = 'Completed'
    `).get(date) as { total_revenue: number, total_transactions: number };

    res.json({ sales, summary: summary || { total_revenue: 0, total_transactions: 0 } });
  });

  app.get("/api/reports/performance", (req, res) => {
    const period = req.query.period || 'daily';
    let dateFilter = '';
    
    if (period === 'daily') {
      dateFilter = "date(timestamp) = date('now', 'localtime')";
    } else if (period === 'weekly') {
      dateFilter = "date(timestamp) >= date('now', 'localtime', '-7 days')";
    } else if (period === 'monthly') {
      dateFilter = "date(timestamp) >= date('now', 'localtime', 'start of month')";
    } else if (period === 'yearly') {
      dateFilter = "date(timestamp) >= date('now', 'localtime', 'start of year')";
    }

    const performance = branches.map(b => {
      const bDb = getBranchDb(b.id);
      const stats = bDb.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as transactions
        FROM sales
        WHERE status = 'Completed' AND ${dateFilter}
      `).get() as any;
      return {
        id: b.id,
        name: b.name,
        revenue: stats.revenue,
        transactions: stats.transactions
      };
    });

    res.json(performance.sort((a, b) => b.revenue - a.revenue));
  });

  app.get("/api/hq/stats", (req, res) => {
    try {
      const totalSales = branches.reduce((acc, b) => {
        const bDb = getBranchDb(b.id);
        const stats = bDb.prepare("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE status = 'Completed'").get() as any;
        return acc + stats.revenue;
      }, 0);

      const totalTransactions = branches.reduce((acc, b) => {
        const bDb = getBranchDb(b.id);
        const stats = bDb.prepare("SELECT COUNT(*) as transactions FROM sales WHERE status = 'Completed'").get() as any;
        return acc + stats.transactions;
      }, 0);

      const totalCustomers = branches.reduce((acc, b) => {
        const bDb = getBranchDb(b.id);
        const stats = bDb.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
        return acc + stats.count;
      }, 0);

      const lowStockAlerts = branches.reduce((acc, b) => {
        const bDb = getBranchDb(b.id);
        const alerts = bDb.prepare("SELECT COUNT(*) as count FROM inventory WHERE stock <= 10").get() as any;
        return acc + alerts.count;
      }, 0);

      res.json({
        totalSales,
        totalTransactions,
        totalCustomers,
        lowStockAlerts
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch HQ stats" });
    }
  });

  // User Management Routes (Central DB)
  app.get("/api/users", (req, res) => {
    const users = centralDb.prepare(`
      SELECT u.id, u.username, u.role, u.branch_id, b.name as branch_name 
      FROM users u 
      LEFT JOIN branches b ON u.branch_id = b.id
      ORDER BY u.role, u.username
    `).all();
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { username, password, role, branch_id } = req.body;
    try {
      const info = centralDb.prepare("INSERT INTO users (username, password, role, branch_id) VALUES (?, ?, ?, ?)")
        .run(username, password, role, branch_id);
      const user = centralDb.prepare("SELECT u.*, b.name as branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.id = ?").get(info.lastInsertRowid);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user." });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, password, role, branch_id } = req.body;
    
    try {
      if (password) {
        centralDb.prepare("UPDATE users SET username = ?, password = ?, role = ?, branch_id = ? WHERE id = ?")
          .run(username, password, role, branch_id, id);
      } else {
        centralDb.prepare("UPDATE users SET username = ?, role = ?, branch_id = ? WHERE id = ?")
          .run(username, role, branch_id, id);
      }
      const user = centralDb.prepare("SELECT u.*, b.name as branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.id = ?").get(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user." });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    try {
      centralDb.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user." });
    }
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
