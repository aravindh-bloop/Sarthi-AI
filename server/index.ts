import express from 'express';
import cors from 'cors';
import { db as database, initDB as initializeDB, sessionStore } from './db';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as prompts from './ai_config';

dotenv.config();

console.log("--- System Start ---");
console.log("Checking API Key:", process.env.OPENAI_API_KEY ? "PRESENT (length: " + process.env.OPENAI_API_KEY.length + ")" : "MISSING");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

initializeDB();

// --- Database Helpers ---
const getInternalContext = (intent: string) => {
    try {
        if (intent === 'inventory_check') {
            return JSON.stringify(database.prepare("SELECT name, quantity, unit FROM inventory_items WHERE quantity <= min_threshold").all());
        }
        if (intent === 'active_tasks') {
            return JSON.stringify(database.prepare("SELECT title, date FROM tasks WHERE status != 'done' LIMIT 3").all());
        }
    } catch (e) { return ""; }
    return "";
};

// --- AI Pipeline ---
const tryParseJSON = (str: string) => {
    try {
        // Clean up markdown code blocks if present
        const cleaned = str.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("   ❌ JSON Parse Failed. Raw content:", str);
        return null;
    }
};

const runIntentClassifier = async (message: string, language: string = 'en') => {
    const lowerMsg = message.toLowerCase();
    console.log(`\n[1. Intent] Processing: "${message}" (${language})`);

    // Safety Hard-Stop
    if (lowerMsg.includes('suicide') || lowerMsg.includes('kill') || lowerMsg.includes('poison')) {
        return { intent: "unknown", risk_level: "high", needs_escalation: true };
    }

    // 1. Keyword-based "Smart Cost-Saver" (Fast & Free)
    const triggers: Record<string, string[]> = {
        weather_risk: ['weather', 'rain', 'forecast', 'mausam', 'barish', 'வானிலை', 'மழை'],
        market_or_cost: ['price', 'rate', 'mandi', 'bhav', 'cost', 'விலை', 'சந்தை'],
        crop_health: ['diseas', 'pest', 'yellow', 'spot', 'leaf', 'leaves', 'keeda', 'bimari', 'attack', 'நோய்', 'பூச்சி'],
        active_tasks: ['task', 'todo', 'kaam', 'assign', 'வேலை', 'பணி'],
        inventory_check: ['stock', 'inventor', 'store', 'saman', 'இருப்பு']
    };

    for (const [intent, words] of Object.entries(triggers)) {
        if (words.some(w => lowerMsg.includes(w))) {
            console.log(`   -> Hybrid Match (Keyword): ${intent}`);
            return { intent, risk_level: "low" };
        }
    }

    // 2. Fallback to AI for nuanced/complex queries
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20) {
        try {
            console.log("   -> Hybrid Fallback: Calling AI for Nuanced Intent...");
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "google/gemma-3-4b-it",
                messages: [{ role: "system", content: prompts.INTENT_CLASSIFIER_PROMPT + "\nIMPORTANT: You must return ONLY valid JSON." }, { role: "user", content: `Language context: ${language}\nMessage: "${message}"` }]
            });
            const content = response.choices[0].message.content || "{}";
            const res = tryParseJSON(content);
            if (res) {
                console.log("   -> AI Success:", res.intent);
                return res;
            }
        } catch (e: any) {
            console.error("   ❌ AI Intent Error:", e.message);
        }
    }

    return { intent: "unknown", risk_level: "low" };
};

const runAdvisorySkill = async (message: string, intentResult: any, language: string = 'en') => {
    console.log(`[2. Advisory] Intent: ${intentResult.intent}`);
    const context = getInternalContext(intentResult.intent);

    // --- Hard-coded Local Intelligence (Tier 1: Priority Responder) ---
    const localResponses: Record<string, Record<string, string>> = {
        en: {
            weather_risk: "Currently, our local weather alert shows a 'High Risk' of rain in the next 24 hours. Please delay any chemical applications.",
            market_or_cost: "Market rates are fluctuating. Based on local mandi trends, Wheat is at ₹2,125/quintal.",
            crop_health: "I've noted your concern. Please check for leaf discoloration. I recommend an inspection by an officer if damage exceeds 10%.",
            inventory_check: context ? `Your inventory check: ${context}` : "I couldn't find specific inventory items.",
            active_tasks: context ? `Today's priorities: ${context}` : "You have no urgent tasks scheduled for today."
        },
        ta: {
            weather_risk: "தற்போது, அடுத்த 24 மணிநேரத்தில் பலத்த மழை பெய்யக்கூடும் என்று காட்டுகிறது. தயவுசெய்து தெளிப்புகளைத் தள்ளி வைக்கவும்.",
            market_or_cost: "சந்தை விலை மாறிக் கொண்டே இருக்கிறது. கோதுமை ₹2,125/குவிண்டல் ஆக உள்ளது.",
            crop_health: "உங்கள் கவலையை நான் குறித்துக் கொண்டேன். இலை நிறமாற்றம் குறித்து சோதிக்கவும். சேதம் 10% க்கு மேல் இருந்தால் ஆய்வு அவசியம்.",
            inventory_check: context ? `உங்கள் இருப்புச் சரிபார்ப்பு: ${context}` : "இருப்புப் பொருட்களைக் கண்டுபிடிக்க முடியவில்லை.",
            active_tasks: context ? `இன்றைய முன்னுரிமைகள்: ${context}` : "இன்று அவசர பணிகள் எதுவும் இல்லை."
        }
    };

    const responses = localResponses[language] || localResponses['en'];
    const hasLocalResponse = intentResult.intent !== 'unknown' && responses[intentResult.intent];

    if (hasLocalResponse) {
        console.log("   -> Local Agent Succeeded. Returning pre-defined response.");
        return {
            response: `${responses[intentResult.intent]}`,
            type: "advisory"
        };
    }

    // --- Gemma AI Escalation (Tier 2: If Local Agent Fails) ---
    console.log("   -> Local Agent could not handle. Escalating to Gemma...");
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20) {
        try {
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "google/gemma-3-4b-it",
                messages: [
                    { role: "system", content: prompts.ADVISORY_RESPONDER_PROMPT + "\nIMPORTANT: You must return ONLY valid JSON." },
                    { role: "user", content: `Language: ${language}\nFarmer Query: "${message}"\nDetected Intent: ${intentResult.intent}\n\nSTRICT: Respond ONLY in ${language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}.` }
                ]
            });
            const content = response.choices[0].message.content || "{}";
            const res = tryParseJSON(content);
            if (res && res.message) {
                return { response: res.message, type: "advisory" };
            }
        } catch (e: any) {
            console.error(`   ❌ Gemma Escalation Error: ${e.message}`);
        }
    }

    return {
        response: language === 'ta' ? "உள்ளூரிலும் AI-லும் என்னால் பதில் காண முடியவில்லை." : "I am unable to find an answer locally or via AI.",
        type: "advisory"
    };
};

const AGENT_BRAIN = async (req: express.Request, res: express.Response) => {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Empty message' });

    try {
        const intent = await runIntentClassifier(message, language);
        const advisory = await runAdvisorySkill(message, intent, language);
        res.json({ ...advisory, intent });
    } catch (e: any) {
        console.error("Critical Orchestration Error:", e);
        res.status(500).json({ error: 'Orchestration Failed', details: e.message });
    }
};

const VOICE_AGENT_BRAIN = async (req: express.Request, res: express.Response) => {
    const { message, sessionId, language = 'en' } = req.body;

    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    let session = sessionStore.get(sessionId);
    if (!session) {
        sessionStore.create(sessionId);
        session = sessionStore.get(sessionId);
    }

    console.log(`\n[Voice Session: ${sessionId}] Input: "${message}" | Current Status: ${session.status}`);

    // --- Hard-coded Logic Gate for Strict Verification ---
    let forceVerificationResult: any = null;
    if (session.status === 'wait_for_password') {
        if (message && message.trim() === '1234') {
            console.log("   -> Hard-coded Pass: Correct PIN.");
            forceVerificationResult = { is_attempt_success: true, is_attempt_failure: false };
        } else {
            console.log("   -> Hard-coded Fail: Incorrect PIN.");
            forceVerificationResult = { is_attempt_success: false, is_attempt_failure: true };
        }
    }

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "google/gemma-3-4b-it",
            messages: [
                { role: "system", content: prompts.VOICE_CALL_SESSION_PROMPT },
                { role: "assistant", content: `Current Session State: ${JSON.stringify(session)}` },
                { role: "user", content: `Message: "${message || '(Call Started)'}"\nLanguage: ${language}${forceVerificationResult ? `\n\nINTERNAL SYSTEM NOTE: The user's input was ${forceVerificationResult.is_attempt_success ? 'CORRECT' : 'INCORRECT'}. Follow verification rules accordingly.` : ''}` }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || "{}";
        let resData = tryParseJSON(content);

        // Inject hard-coded result if available to override AI hallucinations
        if (resData && forceVerificationResult) {
            resData.is_attempt_success = forceVerificationResult.is_attempt_success;
            resData.is_attempt_failure = forceVerificationResult.is_attempt_failure;
        }

        if (resData) {
            // Update session based on AI's decision
            const updates: any = {
                status: resData.next_action || session.status,
                verification_status: resData.verification_status || session.verification_status,
                last_response: resData.message,
                failed_attempts: session.failed_attempts || 0
            };

            // Handle Verification Logic
            const isFailure = resData.is_attempt_failure === true ||
                (resData.message && resData.message.includes("Verification failed. Please try again."));

            if (isFailure) {
                updates.failed_attempts += 1;
                console.log(`   -> Verification Attempt Failed! Count: ${updates.failed_attempts}`);

                if (updates.failed_attempts >= 2) {
                    resData.message = "Verification failed. Goodbye.";
                    resData.call_status = "ended";
                    resData.next_action = "end_call";
                    updates.status = "end_call";
                    updates.verification_status = "terminated";
                } else {
                    resData.message = "Verification failed. Please try again.";
                    resData.next_action = "wait_for_password";
                    updates.verification_status = "failed_retry";
                    updates.status = "wait_for_password";
                }
            }

            const isSuccess = resData.is_attempt_success === true ||
                (resData.message && resData.message.includes("Verification successful."));

            if (isSuccess && !isFailure) {
                updates.verification_status = 'success';
                updates.status = 'answer_agri_question';
                resData.message = "Verification successful. How can I help you today?";
                resData.next_action = "answer_agri_question";
            }

            if (updates.verification_status === 'terminated' || resData.call_status === 'ended') {
                console.log(`   -> Call Session terminating.`);
                sessionStore.delete(sessionId);
            } else {
                sessionStore.update(sessionId, updates);
            }

            console.log(`   -> Next Status: ${updates.status} | Msg: ${resData.message}`);
            return res.json(resData);
        }

    } catch (e: any) {
        console.error("Voice Orchestration Error:", e);
        res.status(500).json({ error: 'Voice Agent Failed', details: e.message });
    }
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/chat', AGENT_BRAIN);
app.post('/api/voice/chat', VOICE_AGENT_BRAIN);

app.listen(PORT, () => console.log(`\n🚀 Server live on http://localhost:${PORT}`));
