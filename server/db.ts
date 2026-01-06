import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('server/krishisethu.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize Database Schema
export function initDB() {
    // Inventory Item Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS inventory_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            min_threshold REAL NOT NULL,
            expiry_date TEXT,
            batch_number TEXT,
            last_restocked TEXT,
            price_per_unit REAL NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Historical Logs Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS historical_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            item_name TEXT NOT NULL,
            action TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            related_task TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Crop Calendar Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS crop_calendar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop TEXT NOT NULL,
            season TEXT NOT NULL,
            sowing_months TEXT, -- JSON Array
            harvest_months TEXT, -- JSON Array
            major_states TEXT -- JSON Array
        )
    `);

    // Plots Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS plots (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            crop TEXT,
            size TEXT,
            soil TEXT,
            irrigation TEXT,
            image TEXT,
            status TEXT DEFAULT 'Active'
        )
    `);

    // Tasks Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            plot_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            cost REAL DEFAULT 0,
            alert TEXT,
            severity TEXT,
            is_ai_suggestion INTEGER DEFAULT 0,
            FOREIGN KEY(plot_id) REFERENCES plots(id)
        )
    `);

    // Support Tickets Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS support_tickets (
            id TEXT PRIMARY KEY,
            issue TEXT NOT NULL,
            crop TEXT NOT NULL,
            severity TEXT NOT NULL,
            officer TEXT,
            status TEXT NOT NULL,
            date_raised TEXT NOT NULL,
            last_update TEXT
        )
    `);

    console.log('Database initialized.');
    seedDB();
}



function seedDB() {
    const check = db.prepare('SELECT count(*) as count FROM inventory_items').get() as { count: number };

    // Seed Inventory if empty
    if (check.count === 0) {
        console.log('Seeding Inventory...');
        const insertItem = db.prepare(`
            INSERT INTO inventory_items (name, category, quantity, unit, min_threshold, expiry_date, batch_number, last_restocked, price_per_unit)
            VALUES (@name, @category, @quantity, @unit, @minThreshold, @expiryDate, @batchNumber, @lastRestocked, @pricePerUnit)
        `);

        const INITIAL_INVENTORY = [
            { name: 'Wheat Seeds (HD-3226)', category: 'Seeds', quantity: 45, unit: 'kg', minThreshold: 50, expiryDate: '2026-06-15', batchNumber: 'BAT-001', lastRestocked: '2025-10-01', pricePerUnit: 40 },
            { name: 'Urea Fertilizer', category: 'Fertilizers', quantity: 120, unit: 'kg', minThreshold: 100, expiryDate: '2027-01-20', batchNumber: 'FERT-204', lastRestocked: '2025-09-15', pricePerUnit: 15 },
            { name: 'Mancozeb Fungicide', category: 'Pesticides', quantity: 2, unit: 'L', minThreshold: 5, expiryDate: '2026-02-01', batchNumber: 'PEST-99', lastRestocked: '2025-08-01', pricePerUnit: 450 },
            { name: 'Diesel Fuel', category: 'Tools', quantity: 25, unit: 'L', minThreshold: 20, expiryDate: null, batchNumber: null, lastRestocked: '2025-10-25', pricePerUnit: 95 },
            { name: 'Daily Wage Labor', category: 'Labor', quantity: 12, unit: 'man-days', minThreshold: 10, expiryDate: null, batchNumber: null, lastRestocked: null, pricePerUnit: 500 },
        ];
        for (const item of INITIAL_INVENTORY) insertItem.run(item);
    }

    // Seed Tasks - Clear and always re-seed for consistent development data
    db.prepare('DELETE FROM tasks').run();

    // Seed Plots - always reset for consistent data
    db.prepare('DELETE FROM plots').run();
    console.log('Seeding Plots...');
    const insertPlot = db.prepare(`
        INSERT INTO plots (id, name, crop, size, soil, irrigation, image)
        VALUES (@id, @name, @crop, @size, @soil, @irrigation, @image)
    `);
    const PLOTS = [
        { id: 'p1', name: 'Plot A - North', crop: 'Mustard (RMS)', size: '2.5 Acres', soil: 'Loamy', irrigation: 'Drip', image: '🌾' },
        { id: 'p2', name: 'Plot B - East', crop: 'Potato (Rabi)', size: '1.2 Acres', soil: 'Black Clay', irrigation: 'Sprinkler', image: '🥔' },
        { id: 'p3', name: 'Plot C - South', crop: 'Chilli (Kharif)', size: '0.8 Acres', soil: 'Red Sandy', irrigation: 'Drip', image: '🌶️' },
        { id: 'f1', name: 'Plot D - West (Tomato)', crop: 'Tomato', size: '2.0 Acres', soil: 'Red Loam', irrigation: 'Drip', image: '🍅' },
        { id: 'f2', name: 'Plot E - Central (Wheat)', crop: 'Wheat', size: '1.5 Acres', soil: 'Alluvial', irrigation: 'Flood', image: '🌾' },
        { id: 'f3', name: 'Greenhouse 1 (Peppers)', crop: 'Peppers', size: '0.5 Acres', soil: 'Potting Mix', irrigation: 'Mist', image: '🫑' }
    ];
    for (const p of PLOTS) insertPlot.run(p);

    console.log('Seeding Tasks for 2026 Cycle...');
    const insertTask = db.prepare(`
        INSERT INTO tasks (id, plot_id, type, title, date, status, cost, alert, severity, is_ai_suggestion)
        VALUES (@id, @plotId, @type, @title, @date, @status, @cost, @alert, @severity, @isAISuggestion)
    `);
    const TASKS = [
        // January 2026: Post-Rabi Yield Retrieval
        { id: 't1', plotId: 'p2', type: 'harvesting', title: 'Potato Harvest Cycle (Rabi)', date: new Date(2026, 0, 10).toISOString(), status: 'done', cost: 4500, alert: 'Optimal Sugar Content', severity: 'low', isAISuggestion: 1 },
        { id: 't2', plotId: 'p1', type: 'irrigation', title: 'Mustard Final Irrigation', date: new Date(2026, 0, 15).toISOString(), status: 'done', cost: 1200, alert: null, severity: null, isAISuggestion: 0 },
        { id: 't3', plotId: 'p3', type: 'protection', title: 'Frost Shield Monitoring (Chilli)', date: new Date(2026, 0, 22).toISOString(), status: 'pending', cost: 0, alert: 'Cold Wave Predicted', severity: 'medium', isAISuggestion: 1 },
        { id: 't3b', plotId: 'f1', type: 'scouting', title: 'Tomato Quality Audit', date: new Date(2026, 0, 25).toISOString(), status: 'upcoming', cost: 0, alert: null, severity: null, isAISuggestion: 1 },

        // February 2026: Peak Harvest & Summer Preparation
        { id: 't4', plotId: 'f1', type: 'harvesting', title: 'Chana (Gram) Harvesting', date: new Date(2026, 1, 12).toISOString(), status: 'upcoming', cost: 3500, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't5', plotId: 'p3', type: 'sowing', title: 'Sow Summer Chilli (Zaid)', date: new Date(2026, 1, 25).toISOString(), status: 'upcoming', cost: 2800, alert: 'Soil Temp Optimal', severity: 'low', isAISuggestion: 1 },
        { id: 't5b', plotId: 'f1', type: 'general', title: 'Post-Harvest Soil Prep (Plot D)', date: new Date(2026, 1, 28).toISOString(), status: 'upcoming', cost: 1500, alert: null, severity: null, isAISuggestion: 0 },

        // March 2026: Transition & Market Timing
        { id: 't6', plotId: 'f2', type: 'harvesting', title: 'Wheat (Winter) Harvesting', date: new Date(2026, 2, 10).toISOString(), status: 'upcoming', cost: 5000, alert: 'Grain Moisture 12%', severity: 'low', isAISuggestion: 1 },
        { id: 't7', plotId: 'p1', type: 'general', title: 'Market Logic Analysis (Wait to Sell)', date: new Date(2026, 2, 20).toISOString(), status: 'upcoming', cost: 0, alert: 'Price Trend Rising', severity: 'low', isAISuggestion: 1 },
        { id: 't7b', plotId: 'f2', type: 'general', title: 'Wheat Threshing Logistics', date: new Date(2026, 2, 15).toISOString(), status: 'upcoming', cost: 2000, alert: null, severity: null, isAISuggestion: 0 },

        // April 2026: Soil Rehabilitation
        { id: 't8', plotId: 'p1', type: 'general', title: 'Autonomous pH Balancing', date: new Date(2026, 3, 5).toISOString(), status: 'upcoming', cost: 1500, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't9', plotId: 'p2', type: 'fertilization', title: 'Organic Matter Enrichment', date: new Date(2026, 3, 18).toISOString(), status: 'upcoming', cost: 2200, alert: null, severity: null, isAISuggestion: 0 },
        { id: 't9b', plotId: 'p3', type: 'irrigation', title: 'Pre-Summer Saturation Feed', date: new Date(2026, 3, 25).toISOString(), status: 'upcoming', cost: 800, alert: null, severity: null, isAISuggestion: 1 },

        // May 2026: Heat Stress & Resource Staging
        { id: 't10', plotId: 'f3', type: 'irrigation', title: 'Misting Schedule (Mentha)', date: new Date(2026, 4, 12).toISOString(), status: 'upcoming', cost: 800, alert: 'Extreme Heatwave', severity: 'high', isAISuggestion: 1 },
        { id: 't11', plotId: 'p1', type: 'general', title: 'Soybean Seed Staging', date: new Date(2026, 4, 28).toISOString(), status: 'upcoming', cost: 12000, alert: 'Anti-Surge Pricing', severity: 'low', isAISuggestion: 1 },
        { id: 't11b', plotId: 'f1', type: 'protection', title: 'Heat-Resistant Mulching', date: new Date(2026, 4, 15).toISOString(), status: 'upcoming', cost: 1200, alert: null, severity: null, isAISuggestion: 0 },

        // June 2026: Kharif Launch
        { id: 't12', plotId: 'p1', type: 'sowing', title: 'Soybean Sowing Pulse', date: new Date(2026, 5, 10).toISOString(), status: 'upcoming', cost: 4500, alert: 'Monsoon Triggered', severity: 'medium', isAISuggestion: 1 },
        { id: 't13', plotId: 'f1', type: 'sowing', title: 'Cotton Sowing Window', date: new Date(2026, 5, 20).toISOString(), status: 'upcoming', cost: 5200, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't13b', plotId: 'p2', type: 'general', title: 'Tractor Service & Calibration', date: new Date(2026, 5, 5).toISOString(), status: 'upcoming', cost: 3500, alert: null, severity: null, isAISuggestion: 0 },

        // July 2026: Vigor Establishment
        { id: 't14', plotId: 'p2', type: 'weeding', title: 'Post-Monsoon Weed Shield', date: new Date(2026, 6, 12).toISOString(), status: 'upcoming', cost: 1800, alert: 'Surge Growth Risk', severity: 'medium', isAISuggestion: 1 },
        { id: 't15', plotId: 'p1', type: 'scouting', title: 'Vigor Establishment Check', date: new Date(2026, 6, 25).toISOString(), status: 'upcoming', cost: 0, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't15b', plotId: 'f1', type: 'fertilization', title: 'Cotton Early Nitro Boost', date: new Date(2026, 6, 30).toISOString(), status: 'upcoming', cost: 2400, alert: null, severity: null, isAISuggestion: 1 },

        // August 2026: Nutrient Pulse
        { id: 't16', plotId: 'p3', type: 'fertilization', title: 'NPK Delivery (Turmeric)', date: new Date(2026, 7, 5).toISOString(), status: 'upcoming', cost: 2500, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't17', plotId: 'f1', type: 'scouting', title: 'Pest Scan (Cotton Red Spider)', date: new Date(2026, 7, 22).toISOString(), status: 'upcoming', cost: 0, alert: 'Humidity Warning', severity: 'medium', isAISuggestion: 1 },
        { id: 't17b', plotId: 'p1', type: 'protection', title: 'Soybean Fungal Shield', date: new Date(2026, 7, 28).toISOString(), status: 'upcoming', cost: 3200, alert: 'Rainy Forecast', severity: 'medium', isAISuggestion: 1 },

        // September 2026: Pre-Rabi Calibration
        { id: 't18', plotId: 'f3', type: 'sowing', title: 'Sow Black Pepper (Perennial)', date: new Date(2026, 8, 15).toISOString(), status: 'upcoming', cost: 3000, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't19', plotId: 'p2', type: 'general', title: 'Soil Nutrient Audit', date: new Date(2026, 8, 30).toISOString(), status: 'upcoming', cost: 500, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't19b', plotId: 'p1', type: 'harvesting', title: 'Maize (Kharif) Harvesting', date: new Date(2026, 8, 25).toISOString(), status: 'upcoming', cost: 3800, alert: null, severity: null, isAISuggestion: 0 },

        // October 2026: Rabi Launch
        { id: 't20', plotId: 'p1', type: 'harvesting', title: 'Soybean Harvesting Cycle', date: new Date(2026, 9, 5).toISOString(), status: 'upcoming', cost: 5500, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't21', plotId: 'p1', type: 'sowing', title: 'Sow Mustard (RMS)', date: new Date(2026, 9, 25).toISOString(), status: 'upcoming', cost: 3200, alert: 'Equipment De-conflicted', severity: 'low', isAISuggestion: 1 },
        { id: 't21b', plotId: 'p2', type: 'sowing', title: 'Sow Potato (Rabi)', date: new Date(2026, 9, 15).toISOString(), status: 'upcoming', cost: 6000, alert: null, severity: null, isAISuggestion: 1 },

        // November 2026: Irrigation Precision
        { id: 't22', plotId: 'f2', type: 'irrigation', title: 'Jeera Drip Precision Cycle', date: new Date(2026, 10, 10).toISOString(), status: 'upcoming', cost: 900, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't23', plotId: 'p2', type: 'protection', title: 'Potato Frost Protection', date: new Date(2026, 10, 28).toISOString(), status: 'upcoming', cost: 1200, alert: 'Night Temp Drop', severity: 'medium', isAISuggestion: 1 },
        { id: 't23b', plotId: 'f1', type: 'harvesting', title: 'Cotton Final Picking', date: new Date(2026, 10, 15).toISOString(), status: 'upcoming', cost: 4500, alert: null, severity: null, isAISuggestion: 1 },

        // December 2026: Dormancy Management
        { id: 't24', plotId: 'p1', type: 'fertilization', title: 'Micro-nutrient Resist Feed', date: new Date(2026, 11, 15).toISOString(), status: 'upcoming', cost: 1800, alert: null, severity: null, isAISuggestion: 1 },
        { id: 't25', plotId: 'f3', type: 'general', title: 'Metabolic Regulation Audit', date: new Date(2026, 11, 28).toISOString(), status: 'upcoming', cost: 0, alert: 'Low Light Survival', severity: 'low', isAISuggestion: 1 },
        { id: 't25b', plotId: 'p2', type: 'irrigation', title: 'Winter Moisture Lock', date: new Date(2026, 11, 5).toISOString(), status: 'upcoming', cost: 1100, alert: null, severity: null, isAISuggestion: 1 },
    ];
    for (const t of TASKS) insertTask.run(t);


    // Seed Tickets
    const ticketCheck = db.prepare('SELECT count(*) as count FROM support_tickets').get() as { count: number };
    if (ticketCheck.count === 0) {
        console.log('Seeding Tickets...');
        const insertTicket = db.prepare(`
            INSERT INTO support_tickets (id, issue, crop, severity, officer, status, date_raised, last_update)
            VALUES (@id, @issue, @crop, @severity, @officer, @status, @dateRaised, @lastUpdate)
        `);
        const TICKETS = [
            {
                id: 'TKT-2025-001',
                issue: 'Severe Leaf Blight Outbreak',
                crop: 'Tomato',
                severity: 'Critical',
                officer: 'Dr. Ramesh Gupta',
                status: 'In Progress',
                dateRaised: 'Oct 24, 2025',
                lastUpdate: 'Officer scheduled visit for Oct 26'
            }
        ];
        for (const t of TICKETS) insertTicket.run(t);
    }

    // Seed Crops
    const insertCrop = db.prepare(`
         INSERT INTO crop_calendar (crop, season, sowing_months, harvest_months, major_states)
         VALUES (@crop, @season, @sowingMonths, @harvestMonths, @majorStates)
    `);
    const countCheck = db.prepare('SELECT count(*) as count FROM crop_calendar').get() as { count: number };

    if (countCheck.count === 0) {
        const CROP_CALENDAR = [
            {
                "crop": "Soybean",
                "season": "Kharif",
                "sowingMonths": JSON.stringify(["June", "July", "August"]),
                "harvestMonths": JSON.stringify(["September", "October"]),
                "majorStates": JSON.stringify(["MP", "MH", "Rajasthan"])
            },
            {
                "crop": "Cotton (Kapas)",
                "season": "Kharif",
                "sowingMonths": JSON.stringify(["June", "July", "August", "September"]),
                "harvestMonths": JSON.stringify(["October", "November"]),
                "majorStates": JSON.stringify(["Gujarat", "MH", "AP", "MP", "Karnataka"])
            }
        ];
        for (const crop of CROP_CALENDAR) insertCrop.run(crop);
    }

    // Seed Logs
    const logCheck = db.prepare('SELECT count(*) as count FROM historical_logs').get() as { count: number };
    if (logCheck.count === 0) {
        const insertLog = db.prepare(`
            INSERT INTO historical_logs (date, item_name, action, quantity, unit, related_task)
            VALUES (@date, @itemName, @action, @quantity, @unit, @relatedTask)
        `);

        const HISTORY_LOGS = [
            { date: 'Oct 26, 2025', itemName: 'Mancozeb Fungicide', action: 'Used', quantity: 0.5, unit: 'L', relatedTask: 'Apply Fungicide' },
            { date: 'Oct 25, 2025', itemName: 'Diesel Fuel', action: 'Used', quantity: 5, unit: 'L', relatedTask: 'Tractor Plowing' },
            { date: 'Oct 20, 2025', itemName: 'Urea Fertilizer', action: 'Restocked', quantity: 50, unit: 'kg', relatedTask: null },
        ];

        for (const log of HISTORY_LOGS) insertLog.run(log);
    }

    console.log('Seeding complete.');
}

export { db };
