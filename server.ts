import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pos.db");

// Initialize Database
db.exec(`
  -- Temporary cleanup for re-seeding
  -- DROP TABLE IF EXISTS sale_items;
  -- DROP TABLE IF EXISTS sales;
  -- DROP TABLE IF EXISTS bundle_items;
  -- DROP TABLE IF EXISTS bundles;
  -- DROP TABLE IF EXISTS variant_stocks;
  -- DROP TABLE IF EXISTS product_stocks;
  -- DROP TABLE IF EXISTS product_variants;
  -- DROP TABLE IF EXISTS customers;
  -- DROP TABLE IF EXISTS users;
  -- DROP TABLE IF EXISTS products;
  -- DROP TABLE IF EXISTS branches;

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
    branch_id TEXT DEFAULT 'Admin',
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    unit TEXT DEFAULT 'pcs'
  );

  CREATE TABLE IF NOT EXISTS product_stocks (
    product_id INTEGER NOT NULL,
    branch_id TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, branch_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
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
    branch_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price_adjustment REAL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS variant_stocks (
    variant_id INTEGER NOT NULL,
    branch_id TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (variant_id, branch_id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
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
    branch_id TEXT NOT NULL,
    customer_id INTEGER,
    total_amount REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    status TEXT NOT NULL DEFAULT 'Completed', -- Completed, Refunded
    receipt_sent_to TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER,
    bundle_id INTEGER,
    variant_id INTEGER,
    quantity INTEGER NOT NULL,
    price_at_sale REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (bundle_id) REFERENCES bundles(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
  );
`);

// Seed initial data if empty
const branchCount = db.prepare("SELECT COUNT(*) as count FROM branches").get() as { count: number };
if (branchCount.count === 0) {
  const insertBranch = db.prepare("INSERT INTO branches (id, name, type) VALUES (?, ?, ?)");
  
  // COMPANY-OWNED
  insertBranch.run("Admin", "Admin HQ", "COMPANY-OWNED");
  insertBranch.run("Imus-00", "FitWhite Imus", "COMPANY-OWNED");
  insertBranch.run("Bacolod-01", "FitWhite Bacolod", "COMPANY-OWNED");
  insertBranch.run("Iloilo-02", "FitWhite Iloilo", "COMPANY-OWNED");
  insertBranch.run("Pampanga-03", "FitWhite Pampanga", "COMPANY-OWNED");
  insertBranch.run("Davao-04", "FitWhite Davao", "COMPANY-OWNED");

  // MANAGED
  insertBranch.run("Calamba-05", "FitWhite Calamba", "MANAGED");
  insertBranch.run("Manila-06", "FitWhite Manila", "MANAGED");
  insertBranch.run("Silang-07", "FitWhite Silang", "MANAGED");
  insertBranch.run("Baclaran-08", "FitWhite Baclaran", "MANAGED");
  insertBranch.run("Makati-09", "FitWhite Makati", "MANAGED");
  insertBranch.run("Pasay-10", "FitWhite Pasay", "MANAGED");
  insertBranch.run("Paranaque-11", "FitWhite Paranaque", "MANAGED");
  insertBranch.run("Eternalbloom-12", "FitWhite Eternalbloom", "MANAGED");
}

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (username, password, role, branch_id) VALUES (?, ?, ?, ?)");
  // HQ Admin
  insertUser.run("admin", "admin123", "SUPER_ADMIN", "Admin");
  
  // Branch Managers
  insertUser.run("manager_imus", "manager123", "BRANCH_MANAGER", "Imus-00");
  insertUser.run("manager_bacoor", "manager123", "BRANCH_MANAGER", "Bacoor-01");
  
  // Cashiers
  insertUser.run("cashier_imus", "cashier123", "CASHIER", "Imus-00");
  insertUser.run("cashier_bacoor", "cashier123", "CASHIER", "Bacoor-01");
}

const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare("INSERT INTO products (name, category, price, unit) VALUES (?, ?, ?, ?)");
  const insertStock = db.prepare("INSERT INTO product_stocks (product_id, branch_id, stock) VALUES (?, ?, ?)");
  const branches = db.prepare("SELECT id FROM branches").all() as { id: string }[];
  
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

  db.transaction(() => {
    for (const s of services) {
      const info = insert.run(s, "Service", 1000, "session");
      for (const b of branches) {
        insertStock.run(info.lastInsertRowid, b.id, 999);
      }
    }

    for (const a of addons) {
      const info = insert.run(a, "Add-on", 500, "pcs");
      for (const b of branches) {
        insertStock.run(info.lastInsertRowid, b.id, 50);
      }
      
      // Add some variants for certain products
      if (a.includes("SOAP")) {
        const insertVariant = db.prepare("INSERT INTO product_variants (product_id, name, price_adjustment) VALUES (?, ?, ?)");
        const insertVariantStock = db.prepare("INSERT INTO variant_stocks (variant_id, branch_id, stock) VALUES (?, ?, ?)");
        
        const v1 = insertVariant.run(info.lastInsertRowid, "Small (50g)", -50);
        const v2 = insertVariant.run(info.lastInsertRowid, "Large (150g)", 50);
        
        for (const b of branches) {
          insertVariantStock.run(v1.lastInsertRowid, b.id, 20);
          insertVariantStock.run(v2.lastInsertRowid, b.id, 30);
        }
      }
    }
  })();

  // Seed some bundles
  const insertBundle = db.prepare("INSERT INTO bundles (name, price) VALUES (?, ?)");
  const insertBundleItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)");
  
  const b1 = insertBundle.run("Glow Up Bundle", 5000);
  const p1 = db.prepare("SELECT id FROM products WHERE name = 'FAT MELTING IV PUSH'").get() as any;
  const p2 = db.prepare("SELECT id FROM products WHERE name = 'WHITENING BOOSTER'").get() as any;
  if (p1 && p2) {
    insertBundleItem.run(b1.lastInsertRowid, p1.id, 1);
    insertBundleItem.run(b1.lastInsertRowid, p2.id, 1);
  }

  // Seed some customers
  const insertCustomer = db.prepare("INSERT INTO customers (name, email, phone, store_credit) VALUES (?, ?, ?, ?)");
  insertCustomer.run("John Doe", "john@example.com", "09123456789", 1000);
  insertCustomer.run("Jane Smith", "jane@example.com", "09987654321", 0);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare(`
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
        branch_id: user.branch_id,
        branch_name: user.branch_name
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/branches", (req, res) => {
    const branches = db.prepare("SELECT * FROM branches").all();
    res.json(branches);
  });

  // API Routes
  app.get("/api/products", (req, res) => {
    const branchId = req.query.branchId as string;
    let products;
    
    if (branchId && branchId !== 'Admin') {
      products = db.prepare(`
        SELECT p.*, ps.stock 
        FROM products p 
        JOIN product_stocks ps ON p.id = ps.product_id 
        WHERE ps.branch_id = ?
      `).all(branchId) as any[];
      
      for (const p of products) {
        p.variants = db.prepare(`
          SELECT pv.*, vs.stock 
          FROM product_variants pv 
          JOIN variant_stocks vs ON pv.id = vs.variant_id 
          WHERE vs.branch_id = ? AND pv.product_id = ?
        `).all(branchId, p.id);
      }
    } else {
      // Aggregated stock for Admin
      products = db.prepare(`
        SELECT p.*, SUM(ps.stock) as stock 
        FROM products p 
        LEFT JOIN product_stocks ps ON p.id = ps.product_id 
        GROUP BY p.id
      `).all() as any[];
      
      for (const p of products) {
        p.variants = db.prepare(`
          SELECT pv.*, SUM(vs.stock) as stock 
          FROM product_variants pv 
          LEFT JOIN variant_stocks vs ON pv.id = vs.variant_id 
          WHERE pv.product_id = ?
          GROUP BY pv.id
        `).all(p.id);
      }
    }
    res.json(products);
  });

  app.get("/api/bundles", (req, res) => {
    const bundles = db.prepare("SELECT * FROM bundles WHERE active = 1").all() as any[];
    for (const b of bundles) {
      b.items = db.prepare(`
        SELECT bi.quantity, p.name, p.price 
        FROM bundle_items bi 
        JOIN products p ON bi.product_id = p.id 
        WHERE bi.bundle_id = ?
      `).all(b.id);
    }
    res.json(bundles);
  });

  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { name, email, phone, store_credit, allergies, notes } = req.body;
    const info = db.prepare("INSERT INTO customers (name, email, phone, store_credit, allergies, notes) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, email, phone, store_credit || 0, allergies || '', notes || '');
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/customers/:id", (req, res) => {
    const { name, email, phone, store_credit, allergies, notes } = req.body;
    db.prepare("UPDATE customers SET name = ?, email = ?, phone = ?, store_credit = ?, allergies = ?, notes = ? WHERE id = ?")
      .run(name, email, phone, store_credit, allergies, notes, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/customers/:id/treatments", (req, res) => {
    const treatments = db.prepare(`
      SELECT th.*, b.name as branch_name 
      FROM treatment_history th
      LEFT JOIN branches b ON th.branch_id = b.id
      WHERE th.customer_id = ?
      ORDER BY th.timestamp DESC
    `).all(req.params.id);
    res.json(treatments);
  });

  app.post("/api/customers/:id/treatments", (req, res) => {
    const { treatment_name, dosage, notes, administered_by, branch_id } = req.body;
    const info = db.prepare(`
      INSERT INTO treatment_history (customer_id, treatment_name, dosage, notes, administered_by, branch_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.id, treatment_name, dosage, notes, administered_by, branch_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/customers/:id", (req, res) => {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    try {
      db.transaction(() => {
        db.prepare("UPDATE sales SET customer_id = NULL WHERE customer_id = ?").run(customerId);
        db.prepare("DELETE FROM customers WHERE id = ?").run(customerId);
      })();
      res.json({ success: true });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({ error: "Failed to delete customer profile." });
    }
  });

  app.post("/api/bundles", (req, res) => {
    const { name, price, items } = req.body;
    try {
      db.transaction(() => {
        const info = db.prepare("INSERT INTO bundles (name, price) VALUES (?, ?)").run(name, price);
        const bundleId = info.lastInsertRowid;
        const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)");
        for (const item of items) {
          insertItem.run(bundleId, item.productId, item.quantity);
        }
      })();
      res.json({ success: true });
    } catch (error) {
      console.error('Create bundle error:', error);
      res.status(500).json({ error: "Failed to create bundle" });
    }
  });

  app.delete("/api/bundles/:id", (req, res) => {
    const bundleId = parseInt(req.params.id);
    try {
      // Instead of deleting, we mark as inactive to preserve sales history
      db.prepare("UPDATE bundles SET active = 0 WHERE id = ?").run(bundleId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete bundle error:', error);
      res.status(500).json({ error: "Failed to delete bundle" });
    }
  });

  app.post("/api/products", (req, res) => {
    const { id, name, category, price, stockToAdd, unit, branchId } = req.body;
    
    try {
      db.transaction(() => {
        let productId = id;
        if (!id) {
          const info = db.prepare("INSERT INTO products (name, category, price, unit) VALUES (?, ?, ?, ?)")
            .run(name, category, price, unit);
          productId = info.lastInsertRowid;
          
          // Initialize stock for all branches if new product
          const branches = db.prepare("SELECT id FROM branches").all() as any[];
          const insertStock = db.prepare("INSERT INTO product_stocks (product_id, branch_id, stock) VALUES (?, ?, ?)");
          for (const b of branches) {
            insertStock.run(productId, b.id, b.id === branchId ? stockToAdd : 0);
          }
        } else {
          // Update existing product
          db.prepare("UPDATE products SET name = ?, category = ?, price = ?, unit = ? WHERE id = ?")
            .run(name, category, price, unit, id);
          
          if (branchId && branchId !== 'Admin') {
            db.prepare("UPDATE product_stocks SET stock = stock + ? WHERE product_id = ? AND branch_id = ?")
              .run(stockToAdd, id, branchId);
          }
        }
      })();
      res.json({ success: true });
    } catch (error) {
      console.error('Product save error:', error);
      res.status(500).json({ error: "Failed to save product." });
    }
  });

  app.post("/api/checkout", (req, res) => {
    const { items, bundles, total, discount, paymentMethod, customerId, receiptTo, branchId } = req.body;
    
    const transaction = db.transaction(() => {
      // Server-side stock validation
      for (const item of items) {
        if (item.category !== 'Service') {
          const currentStock = db.prepare("SELECT stock FROM product_stocks WHERE product_id = ? AND branch_id = ?")
            .get(item.id, branchId) as any;
          if (!currentStock || currentStock.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock?.stock || 0}`);
          }
        }
        if (item.variantId) {
          const currentVariantStock = db.prepare("SELECT stock FROM variant_stocks WHERE variant_id = ? AND branch_id = ?")
            .get(item.variantId, branchId) as any;
          if (!currentVariantStock || currentVariantStock.stock < item.quantity) {
            throw new Error(`Insufficient stock for variant of ${item.name}. Available: ${currentVariantStock?.stock || 0}`);
          }
        }
      }

      const saleInfo = db.prepare(`
        INSERT INTO sales (branch_id, total_amount, discount_amount, payment_method, customer_id, receipt_sent_to) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(branchId, total, discount, paymentMethod, customerId, receiptTo);
      const saleId = saleInfo.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, bundle_id, variant_id, quantity, price_at_sale) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const updateStock = db.prepare("UPDATE product_stocks SET stock = stock - ? WHERE product_id = ? AND branch_id = ?");
      const updateVariantStock = db.prepare("UPDATE variant_stocks SET stock = stock - ? WHERE variant_id = ? AND branch_id = ?");

      // Handle regular items and variants
      for (const item of items) {
        insertItem.run(saleId, item.id, null, item.variantId || null, item.quantity, item.price);
        
        if (item.variantId) {
          updateVariantStock.run(item.quantity, item.variantId, branchId);
        } else if (item.category !== 'Service') {
          updateStock.run(item.quantity, item.id, branchId);
        }
      }

      // Handle bundles
      for (const bundle of bundles || []) {
        insertItem.run(saleId, null, bundle.id, null, bundle.quantity, bundle.price);
        const bItems = db.prepare("SELECT product_id, quantity FROM bundle_items WHERE bundle_id = ?").all(bundle.id) as any[];
        for (const bi of bItems) {
          const prod = db.prepare("SELECT category FROM products WHERE id = ?").get(bi.product_id) as any;
          if (prod.category !== 'Service') {
            updateStock.run(bi.quantity * bundle.quantity, bi.product_id, branchId);
          }
        }
      }

      // Handle store credit if payment method is Store Credit
      if (paymentMethod === 'Store Credit' && customerId) {
        const customer = db.prepare("SELECT store_credit FROM customers WHERE id = ?").get(customerId) as any;
        if (customer.store_credit < total) {
          throw new Error("Insufficient store credit");
        }
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

  app.get("/api/reports/daily", (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const branchId = req.query.branchId as string;
    
    let salesQuery = `
      SELECT s.id, s.total_amount, s.payment_method, s.status, s.timestamp, s.discount_amount,
             c.name as customer_name, b.name as branch_name,
             GROUP_CONCAT(COALESCE(p.name, bd.name) || ' (x' || si.quantity || ')') as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN bundles bd ON si.bundle_id = bd.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE date(s.timestamp) = date(?)
    `;
    
    let summaryQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_transactions
      FROM sales
      WHERE date(timestamp) = date(?) AND status = 'Completed'
    `;

    const queryParams: any[] = [date];
    
    if (branchId && branchId !== 'Admin') {
      salesQuery += ` AND s.branch_id = ?`;
      summaryQuery += ` AND branch_id = ?`;
      queryParams.push(branchId);
    }

    salesQuery += ` GROUP BY s.id ORDER BY s.timestamp DESC`;

    const sales = db.prepare(salesQuery).all(...queryParams);
    const summary = db.prepare(summaryQuery).get(...queryParams) as { total_revenue: number, total_transactions: number };

    res.json({ sales, summary: summary || { total_revenue: 0, total_transactions: 0 } });
  });

  app.post("/api/sales/:id/refund", (req, res) => {
    const { id } = req.params;
    const { refundToStoreCredit } = req.body;
    const saleId = parseInt(id);
    
    const transaction = db.transaction(() => {
      const sale = db.prepare("SELECT status, total_amount, customer_id, branch_id FROM sales WHERE id = ?").get(saleId) as any;
      if (!sale || sale.status === 'Refunded') {
        throw new Error("Sale already refunded or not found");
      }

      // Update sale status
      db.prepare("UPDATE sales SET status = 'Refunded' WHERE id = ?").run(saleId);

      // Restore stock for regular items
      const items = db.prepare(`
        SELECT si.product_id, si.variant_id, si.bundle_id, si.quantity, p.category 
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `).all(saleId) as any[];

      const updateStock = db.prepare("UPDATE product_stocks SET stock = stock + ? WHERE product_id = ? AND branch_id = ?");
      const updateVariantStock = db.prepare("UPDATE variant_stocks SET stock = stock + ? WHERE variant_id = ? AND branch_id = ?");

      for (const item of items) {
        if (item.variant_id) {
          updateVariantStock.run(item.quantity, item.variant_id, sale.branch_id);
        } else if (item.product_id && item.category !== 'Service') {
          updateStock.run(item.quantity, item.product_id, sale.branch_id);
        } else if (item.bundle_id) {
          const bItems = db.prepare("SELECT product_id, quantity FROM bundle_items WHERE bundle_id = ?").all(item.bundle_id) as any[];
          for (const bi of bItems) {
            const prod = db.prepare("SELECT category FROM products WHERE id = ?").get(bi.product_id) as any;
            if (prod.category !== 'Service') {
              updateStock.run(bi.quantity * item.quantity, bi.product_id, sale.branch_id);
            }
          }
        }
      }

      // Handle store credit refund
      if (refundToStoreCredit && sale.customer_id) {
        db.prepare("UPDATE customers SET store_credit = store_credit + ? WHERE id = ?").run(sale.total_amount, sale.customer_id);
      }
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/reports/inventory-status", (req, res) => {
    const branchId = req.query.branchId as string;
    let lowStock;
    if (branchId && branchId !== 'Admin') {
      lowStock = db.prepare(`
        SELECT p.*, ps.stock 
        FROM products p 
        JOIN product_stocks ps ON p.id = ps.product_id 
        WHERE ps.branch_id = ? AND ps.stock <= 100 AND p.category != 'Service'
      `).all(branchId);
    } else {
      lowStock = db.prepare(`
        SELECT p.*, SUM(ps.stock) as stock 
        FROM products p 
        JOIN product_stocks ps ON p.id = ps.product_id 
        WHERE p.category != 'Service'
        GROUP BY p.id
        HAVING SUM(ps.stock) <= 100
      `).all();
    }
    res.json(lowStock);
  });

  // User Management Routes
  app.get("/api/users", (req, res) => {
    const users = db.prepare(`
      SELECT u.id, u.username, u.role, u.branch_id, b.name as branch_name 
      FROM users u 
      LEFT JOIN branches b ON u.branch_id = b.id
      ORDER BY u.role, u.username
    `).all();
    res.json(users);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    
    try {
      if (password) {
        db.prepare("UPDATE users SET username = ?, password = ? WHERE id = ?")
          .run(username, password, id);
      } else {
        db.prepare("UPDATE users SET username = ? WHERE id = ?")
          .run(username, id);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: "Failed to update user credentials. Username might already be taken." });
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
