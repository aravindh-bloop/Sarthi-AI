
// Use standard request handling
export default async function handler(req: any, res: any) {
    console.log(`[Method]: ${req.method} | [URL]: ${req.url}`);

    // 1. Health verify for Browser (GET)
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send("Twilio Endpoint is Active. POST to this URL for calls.");
    }

    try {
        // 2. Parse Body safely
        let body = req.body;

        // If body is empty or header is application/x-www-form-urlencoded, Vercel might give us an object
        // If not, we try to parse it if it's a string
        if (!body || Object.keys(body).length === 0) {
            console.log("Body empty, checking query...");
            body = req.query || {};
        }

        const CallSid = body.CallSid || req.query.CallSid || 'unknown-sid';
        const From = body.From || req.query.From || 'unknown';
        const SpeechResult = body.SpeechResult || '';
        const Digits = body.Digits || '';
        const userInput = (SpeechResult || Digits || '').trim();

        console.log(`[Twilio Call ${CallSid}] Input: "${userInput}"`);

        // --- HARDCODED SESSION MOCK (for stability test) ---
        // We will just reply TwiML to ensure connection works.
        // Once this works, we re-enable the full logic.

        const responseMessage = (!userInput)
            ? "Hello, welcome to Sarthi AI. Please say your username."
            : "I heard you. But I am in debug mode. Please check logs.";

        // --- TwiML Generation ---
        res.setHeader('Content-Type', 'text/xml');
        let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

        // Always gather input to keep line open
        twiml += '  <Gather input="speech dtmf" timeout="5" action="/api/twilio/incoming" method="POST">\n';
        twiml += `    <Say voice="woman" language="en-IN">${escapeXml(responseMessage)}</Say>\n`;
        twiml += '  </Gather>\n';
        twiml += '  <Say>No input received. Goodbye.</Say>\n';
        twiml += '  <Hangup/>\n';

        twiml += '</Response>';

        return res.status(200).send(twiml);

    } catch (e: any) {
        console.error("CRASH:", e);
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>System Error.</Say></Response>`);
    }
}

function escapeXml(unsafe: string): string {
    return (unsafe || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
