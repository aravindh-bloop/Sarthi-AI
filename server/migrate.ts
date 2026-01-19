
import { db as sqliteDb } from './db';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';

// Initialize Firebase Client SDK (using the Web Config)
// This works in Node.js environments (Node 18+ recommended)
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function migrate() {
    console.log('Starting migration to Firestore (Project: sarthi-ai-platform-v1)...');

    try {
        // --- 1. Plots ---
        const plots = sqliteDb.prepare('SELECT * FROM plots').all() as any[];
        if (plots.length > 0) {
            const batch = writeBatch(firestore);
            for (const p of plots) {
                const ref = doc(firestore, 'plots', p.id);
                batch.set(ref, p);
            }
            await batch.commit();
            console.log(`✅ Migrated ${plots.length} plots.`);
        }

        // --- 2. Tasks ---
        const tasks = sqliteDb.prepare('SELECT * FROM tasks').all() as any[];
        if (tasks.length > 0) {
            // Processing in chunks of 400
            const chunkSize = 400;
            for (let i = 0; i < tasks.length; i += chunkSize) {
                const batch = writeBatch(firestore);
                const chunk = tasks.slice(i, i + chunkSize);
                for (const t of chunk) {
                    const ref = doc(firestore, 'tasks', t.id);
                    batch.set(ref, {
                        ...t,
                        isAISuggestion: !!t.is_ai_suggestion
                    });
                }
                await batch.commit();
            }
            console.log(`✅ Migrated ${tasks.length} tasks.`);
        }

        // --- 3. Tickets ---
        const tickets = sqliteDb.prepare('SELECT * FROM support_tickets').all() as any[];
        if (tickets.length > 0) {
            const batch = writeBatch(firestore);
            for (const t of tickets) {
                const ref = doc(firestore, 'support_tickets', t.id);
                batch.set(ref, t);
            }
            await batch.commit();
            console.log(`✅ Migrated ${tickets.length} tickets.`);
        }

        // --- 4. Inventory ---
        const items = sqliteDb.prepare('SELECT * FROM inventory_items').all() as any[];
        if (items.length > 0) {
            const batch = writeBatch(firestore);
            for (const item of items) {
                const ref = doc(firestore, 'inventory_items', item.id.toString());
                batch.set(ref, item);
            }
            await batch.commit();
            console.log(`✅ Migrated ${items.length} inventory items.`);
        }

        // --- 5. Crop Calendar ---
        const crops = sqliteDb.prepare('SELECT * FROM crop_calendar').all() as any[];
        if (crops.length > 0) {
            const batch = writeBatch(firestore);
            for (const c of crops) {
                const ref = doc(firestore, 'crop_calendar', c.id.toString());
                batch.set(ref, {
                    ...c,
                    sowingMonths: JSON.parse(c.sowing_months || '[]'),
                    harvestMonths: JSON.parse(c.harvest_months || '[]'),
                    majorStates: JSON.parse(c.major_states || '[]')
                });
            }
            await batch.commit();
            console.log(`✅ Migrated ${crops.length} crops.`);
        }

        console.log('🎉 Migration Complete!');
    } catch (error: any) {
        console.error('❌ Migration Failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        if (error.code === 'permission-denied') {
            console.log('\n⚠️  PERMISSION DENIED: database rules are blocking you.');
        } else if (error.code === 'unavailable') {
            console.log('\n⚠️  UNAVAILABLE: User is offline or Firestore is offline.');
        } else if (error.code === 'not-found') {
            console.log('\n⚠️  NOT FOUND: Database instance might not exist yet.');
        }
    }
}

migrate();
