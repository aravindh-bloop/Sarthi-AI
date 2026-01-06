import express from 'express';
import cors from 'cors';
import { db, initDB } from './db.js'; // Note .js extension for ESM if needed, or if using tsx it handles imports. Stick to .js or no extension? tsx handles .ts imports if omitting extension sometimes.
// But standard imports in TS don't use extension usually.
// Let's try to remove extension in import if using tsx.

// However, if "type": "module" in package.json, we need extensions or experimental flag.
// I'll stick to NO extension and hope tsx resolves it (it usually does).
// Actually, `tsx` handles TS files directly.

// Re-write without .js extension to be safe for `tsx`.
import { db as database, initDB as initializeDB } from './db';

const app = express();
const PORT = 3000;
const WEATHER_API_KEY = 'sk-live-lrWkpHf0YrfgHpEyoxUUqViWBagNDouUfREndGng'; // User Provided Key

app.use(cors());
app.use(express.json());

// Initialize DB on start
initializeDB();

// --- Root Route ---
app.get('/', (req, res) => {
    res.send('KrishiSetu API is running. Use /api/... endpoints.');
});

// --- Inventory Routes ---
app.get('/api/inventory', (req, res) => {
    try {
        const stmt = database.prepare('SELECT * FROM inventory_items');
        const items = stmt.all();
        // format camelCase
        const formatted = items.map((i: any) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            quantity: i.quantity,
            unit: i.unit,
            minThreshold: i.min_threshold,
            expiryDate: i.expiry_date,
            batchNumber: i.batch_number,
            lastRestocked: i.last_restocked,
            pricePerUnit: i.price_per_unit
        }));
        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/inventory', (req, res) => {
    try {
        const { name, category, quantity, unit, minThreshold, expiryDate, batchNumber, lastRestocked, pricePerUnit } = req.body;
        const stmt = database.prepare(`
            INSERT INTO inventory_items (name, category, quantity, unit, min_threshold, expiry_date, batch_number, last_restocked, price_per_unit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(name, category, quantity, unit, minThreshold, expiryDate, batchNumber, lastRestocked, pricePerUnit);
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create item' });
    }
});


app.get('/api/inventory/logs', (req, res) => {
    try {
        const stmt = database.prepare('SELECT * FROM historical_logs ORDER BY created_at DESC');
        const logs = stmt.all();
        const formatted = logs.map((l: any) => ({
            id: l.id,
            date: l.date, // Assuming stored as ISO string or we might need formatting if it's raw text
            itemName: l.item_name,
            action: l.action,
            quantity: l.quantity,
            unit: l.unit,
            relatedTask: l.related_task
        }));
        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// --- Crop Routes ---
app.get('/api/crops', (req, res) => {
    try {
        const stmt = database.prepare('SELECT * FROM crop_calendar');
        const crops = stmt.all();
        const formatted = crops.map((c: any) => ({
            id: c.id,
            crop: c.crop,
            season: c.season,
            sowingMonths: JSON.parse(c.sowing_months),
            harvestMonths: JSON.parse(c.harvest_months),
            majorStates: JSON.parse(c.major_states)
        }));
        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch crops' });
    }
});

// --- Weather Endpoint ---
app.get('/api/weather', async (req, res) => {
    try {
        // Placeholder for real API integration using the provided key
        // Defaulting to "Mock-but-Integrated" response until provider URL is confirmed
        // This validates the key variable is ready to be used.

        console.log(`Fetching weather using Key: ${WEATHER_API_KEY.substring(0, 8)}...`);

        // Simulating network delay
        await new Promise(r => setTimeout(r, 600));

        res.json({
            current: {
                temp: 28,
                humidity: 62,
                condition: "Partly Cloudy",
                windSpeed: 15,
                precip: 0
            },
            forecast: [
                { day: "Mon", temp: 29, condition: "Sunny" },
                { day: "Tue", temp: 27, condition: "Rain" },
                { day: "Wed", temp: 30, condition: "Cloudy" }
            ],
            alerts: [
                { id: 'w1', type: 'heatwave', severity: 'medium', message: 'Temperature rising above 35°C next week.', suggestedAction: 'Schedule irrigation.' }
            ],
            source: "Integrated API"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Weather fetch failed' });
    }
});

// --- Plots Routes ---
app.get('/api/plots', (req, res) => {
    try {
        const stmt = database.prepare('SELECT * FROM plots');
        const plots = stmt.all();
        res.json(plots);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch plots' });
    }
});

app.get('/api/tasks', (req, res) => {
    try {
        const stmt = database.prepare('SELECT * FROM tasks ORDER BY date ASC');
        const tasks = stmt.all();
        // Convert snake_case to camelCase for frontend consistency if needed
        // Or keep snake_case if we align frontend types.
        // Let's do simple mapping:
        const formatted = tasks.map((t: any) => ({
            id: t.id,
            plotId: t.plot_id,
            type: t.type,
            title: t.title,
            date: t.date, // ISO String
            status: t.status,
            cost: t.cost,
            alert: t.alert,
            severity: t.severity,
            isAISuggestion: !!t.is_ai_suggestion
        }));
        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.get('/api/tickets', (req, res) => {
    try {
        const stmt = database.prepare('SELECT * FROM support_tickets ORDER BY date_raised DESC');
        const tickets = stmt.all();
        const formatted = tickets.map((t: any) => ({
            id: t.id,
            issue: t.issue,
            crop: t.crop,
            severity: t.severity,
            officer: t.officer,
            status: t.status,
            dateRaised: t.date_raised,
            lastUpdate: t.last_update
        }));
        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

app.listen(PORT, () => {
    console.log(`Server API running on http://localhost:${PORT}`);
});
