
// api/twilio/incoming.js
// Vercel Serverless Function (Node.js)

// Helper: Session Store (Note: In-memory only persists for warm containers)
const sessions = new Map();

function getSession(callSid) {
    if (!sessions.has(callSid)) {
        sessions.set(callSid, {
            status: 'wait_for_username',
            verification_status: 'none',
            failed_attempts: 0,
            last_response: ''
        });
    }
    return sessions.get(callSid);
}

function updateSession(callSid, updates) {
    const session = getSession(callSid);
    sessions.set(callSid, { ...session, ...updates });
}

function deleteSession(callSid) {
    sessions.delete(callSid);
}

function escapeXml(unsafe) {
    return (unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function getAIResponse(message, language = 'en') {
    try {
        const response = await fetch('https://sarthi-ai-k8lq.onrender.com/api/voice/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                sessionId: 'twilio-temp-' + Date.now(),
                language
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.message || "I'm sorry, I couldn't process that.";
        }
    } catch (e) {
        console.error('AI call failed:', e);
    }
    return "I'm experiencing technical difficulties.";
}

export default async function handler(req, res) {
    console.log(`[Method]: ${req.method} | [URL]: ${req.url}`);

    // CORS / Health Check
    if (req.method === 'GET' || req.method === 'OPTIONS') {
        res.status(200).send("Twilio Endpoint Active.");
        return;
    }

    try {
        let body = req.body || {};

        // Handle Query Params if Body is empty (Vercel edge case)
        if (Object.keys(body).length === 0) {
            body = req.query || {};
        }

        const CallSid = body.CallSid || 'unknown-call';
        const From = body.From || 'unknown';
        const SpeechResult = body.SpeechResult || '';
        const Digits = body.Digits || '';

        const userInput = (SpeechResult || Digits || '').trim();

        console.log(`[Call: ${CallSid}] Input: "${userInput}"`);

        const session = getSession(CallSid);
        let responseMessage = '';
        let shouldGather = true;
        let shouldHangup = false;

        // --- SESSION LOGIC ---
        if (session.status === 'wait_for_username') {
            if (!userInput) {
                responseMessage = 'Hello, welcome to Sarthi AI. Please say your username.';
            } else {
                const username = userInput.toLowerCase();
                if (username.includes('arvind') || username.includes('aravind')) {
                    updateSession(CallSid, {
                        username: 'arvind',
                        status: 'wait_for_password',
                        last_response: 'Username received. Please say your PIN.'
                    });
                    responseMessage = 'Username received. Please say your PIN.';
                } else {
                    const newFailCount = session.failed_attempts + 1;
                    updateSession(CallSid, {
                        failed_attempts: newFailCount,
                        last_response: 'Username not recognized. Please try again.'
                    });

                    if (newFailCount >= 1) { // Strict demo mode
                        responseMessage = 'Verification failed. Goodbye.';
                        shouldHangup = true;
                        shouldGather = false;
                        deleteSession(CallSid);
                    } else {
                        responseMessage = 'Username not recognized. Please try again.';
                    }
                }
            }
        }
        else if (session.status === 'wait_for_password') {
            if (!userInput) {
                responseMessage = 'Please say your PIN.';
            } else {
                const pinMatch = userInput.match(/\d+/);
                const pin = pinMatch ? pinMatch[0] : userInput;

                if (pin === '1234') {
                    updateSession(CallSid, {
                        status: 'answer_agri_question',
                        verification_status: 'success',
                        failed_attempts: 0,
                        last_response: 'Verification successful. How can I help you today?'
                    });
                    responseMessage = 'Verification successful. How can I help you today?';
                } else {
                    const newFailCount = session.failed_attempts + 1;
                    updateSession(CallSid, {
                        failed_attempts: newFailCount,
                        last_response: 'Incorrect PIN. Please try again.'
                    });

                    if (newFailCount >= 2) {
                        responseMessage = 'Verification failed. Goodbye.';
                        shouldHangup = true;
                        shouldGather = false;
                        deleteSession(CallSid);
                    } else {
                        responseMessage = 'Incorrect PIN. Please try again.';
                    }
                }
            }
        }
        else if (session.status === 'answer_agri_question') {
            if (!userInput) {
                // If we just entered this state, we already greeted them.
                // If they stayed silent, prompt them.
                responseMessage = 'I\'m listening. How can I help you?';
            } else {
                const lower = userInput.toLowerCase();
                if (['no', 'bye', 'goodbye', 'nothing', 'stop'].some(w => lower.includes(w))) {
                    responseMessage = 'Thank you for calling. Have a good day.';
                    shouldHangup = true;
                    shouldGather = false;
                    deleteSession(CallSid);
                } else {
                    const aiResponse = await getAIResponse(userInput, 'en');
                    responseMessage = aiResponse + '. Do you have any other question?';
                    updateSession(CallSid, { last_response: responseMessage });
                }
            }
        }
        else {
            responseMessage = 'Hello, welcome to Sarthi AI. Please say your username.';
            updateSession(CallSid, { status: 'wait_for_username' });
        }

        // --- TwiML RESPONSE ---
        res.setHeader('Content-Type', 'text/xml');

        let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

        if (shouldGather) {
            twiml += '  <Gather input="speech dtmf" timeout="5" action="/api/twilio/incoming" method="POST">\n';
            twiml += `    <Say voice="woman" language="en-IN">${escapeXml(responseMessage)}</Say>\n`;
            twiml += '  </Gather>\n';
            twiml += '  <Say>I did not receive any input.</Say>\n';
            twiml += '  <Hangup/>\n';
        } else {
            twiml += `  <Say voice="woman" language="en-IN">${escapeXml(responseMessage)}</Say>\n`;
            if (shouldHangup) twiml += '  <Hangup/>\n';
        }

        twiml += '</Response>';

        return res.status(200).send(twiml);

    } catch (e) {
        console.error("Endpoint Error:", e);
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response><Say>System Error.</Say><Hangup/></Response>');
    }
}
