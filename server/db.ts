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

    // Call Sessions Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS call_sessions (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            username TEXT,
            verification_status TEXT DEFAULT 'none',
            failed_attempts INTEGER DEFAULT 0,
            last_response TEXT,
            last_interaction TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Database initialized.');
    seedDB();
}



function seedDB() {
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
        { id: 'p1', name: 'Plot A - North', crop: 'Mustard', size: '2.5 Acres', soil: 'Loamy', irrigation: 'Drip', image: '🌾' },
        { id: 'p2', name: 'Plot B - East', crop: 'Potato', size: '1.2 Acres', soil: 'Black Clay', irrigation: 'Sprinkler', image: '🥔' },
        { id: 'p3', name: 'Plot C - South', crop: 'Chilli', size: '0.8 Acres', soil: 'Red Sandy', irrigation: 'Drip', image: '🌶️' },
        { id: 'f1', name: 'Plot D - West', crop: 'Tomato', size: '2.0 Acres', soil: 'Red Loam', irrigation: 'Drip', image: '🍅' },
        { id: 'f2', name: 'Plot E - Central', crop: 'Wheat', size: '1.5 Acres', soil: 'Alluvial', irrigation: 'Flood', image: '🌾' },
        { id: 'f3', name: 'Greenhouse 1', crop: 'Peppers', size: '0.5 Acres', soil: 'Potting Mix', irrigation: 'Mist', image: '🫑' }
    ];
    for (const p of PLOTS) insertPlot.run(p);

    console.log('Seeding Tasks for 2026 Cycle...');
    const insertTask = db.prepare(`
        INSERT INTO tasks (id, plot_id, type, title, date, status, cost, alert, severity, is_ai_suggestion)
        VALUES (@id, @plotId, @type, @title, @date, @status, @cost, @alert, @severity, @isAISuggestion)
    `);

    // Dynamic Date Generation for "Today's Tasks"
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const TASKS = [
        // Immediate/Overdue Tasks (For Agent testing)
        { id: 't1', plotId: 'p2', type: 'harvesting', title: 'Potato Harvest Cycle', date: today, status: 'pending', cost: 4500, alert: 'Optimal Sugar Content', severity: 'low', isAISuggestion: 1 },
        { id: 't2', plotId: 'p1', type: 'irrigation', title: 'Mustard Final Irrigation', date: today, status: 'pending', cost: 1200, alert: null, severity: null, isAISuggestion: 0 },
        { id: 't3', plotId: 'f1', type: 'scouting', title: 'Tomato Quality Audit', date: tomorrow, status: 'upcoming', cost: 0, alert: null, severity: null, isAISuggestion: 1 },

        // Future Tasks
        { id: 't4', plotId: 'p3', type: 'protection', title: 'Frost Shield Monitoring', date: nextWeek, status: 'upcoming', cost: 0, alert: 'Cold Wave Predicted', severity: 'medium', isAISuggestion: 1 },
        { id: 't5', plotId: 'f2', type: 'harvesting', title: 'Wheat Harvesting', date: '2026-03-10', status: 'upcoming', cost: 5000, alert: 'Grain Moisture 12%', severity: 'low', isAISuggestion: 1 },
        { id: 't6', plotId: 'p3', type: 'sowing', title: 'Sow Summer Chilli', date: '2026-02-25', status: 'upcoming', cost: 2800, alert: 'Soil Temp Optimal', severity: 'low', isAISuggestion: 1 },
        { id: 't7', plotId: 'f3', type: 'irrigation', title: 'Misting Schedule', date: '2026-05-12', status: 'upcoming', cost: 800, alert: 'Extreme Heatwave', severity: 'high', isAISuggestion: 1 },

        // Completed History
        { id: 'hist1', plotId: 'p1', type: 'sowing', title: 'Mustard Sowing', date: '2025-10-15', status: 'done', cost: 2000, alert: null, severity: null, isAISuggestion: 0 }
    ];
    for (const t of TASKS) insertTask.run(t);


    // Seed Tickets - Clear and reset
    db.prepare('DELETE FROM support_tickets').run();
    console.log('Seeding Tickets...');
    const insertTicket = db.prepare(`
        INSERT INTO support_tickets (id, issue, crop, severity, officer, status, date_raised, last_update)
        VALUES (@id, @issue, @crop, @severity, @officer, @status, @dateRaised, @lastUpdate)
    `);
    const TICKETS = [
        {
            id: '101',
            issue: 'Yellow Mosaic Virus Symptoms',
            crop: 'Tomato',
            severity: 'High',
            officer: 'Dr. Ramesh Gupta',
            status: 'Open',
            dateRaised: new Date().toISOString().split('T')[0],
            lastUpdate: 'Officer assigned'
        }
    ];
    for (const t of TICKETS) insertTicket.run(t);

    // Seed Inventory - Reset to ensure low stock alerts work
    db.prepare('DELETE FROM inventory_items').run();
    console.log('Seeding Inventory...');
    const insertItem = db.prepare(`
       INSERT INTO inventory_items (name, category, quantity, unit, min_threshold, expiry_date, batch_number, last_restocked, price_per_unit)
       VALUES (@name, @category, @quantity, @unit, @minThreshold, @expiryDate, @batchNumber, @lastRestocked, @pricePerUnit)
    `);

    const INITIAL_INVENTORY = [
        { name: 'Wheat Seeds (HD-3226)', category: 'Seeds', quantity: 45, unit: 'kg', minThreshold: 50, expiryDate: '2026-06-15', batchNumber: 'BAT-001', lastRestocked: '2025-10-01', pricePerUnit: 40 },
        { name: 'Urea Fertilizer', category: 'Fertilizers', quantity: 120, unit: 'kg', minThreshold: 100, expiryDate: '2027-01-20', batchNumber: 'FERT-204', lastRestocked: '2025-09-15', pricePerUnit: 15 },
        { name: 'Mancozeb Fungicide', category: 'Pesticides', quantity: 2, unit: 'L', minThreshold: 5, expiryDate: '2026-02-01', batchNumber: 'PEST-99', lastRestocked: '2025-08-01', pricePerUnit: 450 },
        { name: 'DAP Fertilizer', category: 'Fertilizers', quantity: 10, unit: 'kg', minThreshold: 50, expiryDate: '2027-05-01', batchNumber: 'DAP-101', lastRestocked: '2025-06-01', pricePerUnit: 35 },
        { name: 'Diesel Fuel', category: 'Tools', quantity: 25, unit: 'L', minThreshold: 20, expiryDate: null, batchNumber: null, lastRestocked: '2025-10-25', pricePerUnit: 95 }
    ];
    for (const item of INITIAL_INVENTORY) insertItem.run(item);

    // Logs
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

export const sessionStore = {
    get: (id: string) => db.prepare('SELECT * FROM call_sessions WHERE id = ?').get(id) as any,
    create: (id: string) => db.prepare('INSERT INTO call_sessions (id, status) VALUES (?, ?)').run(id, 'greeting'),
    update: (id: string, data: any) => {
        const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const values = Object.values(data);
        db.prepare(`UPDATE call_sessions SET ${sets}, last_interaction = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
    },
    delete: (id: string) => db.prepare('DELETE FROM call_sessions WHERE id = ?').run(id)
};

export { db };
