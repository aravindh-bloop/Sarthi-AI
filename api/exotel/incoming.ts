import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Session {
    status: string;
    verification_status: string;
    failed_attempts: number;
    last_response: string;
    username?: string;
}

const sessions = new Map<string, Session>();

function getSession(callSid: string): Session {
    if (!sessions.has(callSid)) {
        sessions.set(callSid, {
            status: 'wait_for_username',
            verification_status: 'none',
            failed_attempts: 0,
            last_response: ''
        });
    }
    return sessions.get(callSid)!;
}

function updateSession(callSid: string, updates: Partial<Session>): void {
    const session = getSession(callSid);
    sessions.set(callSid, { ...session, ...updates });
}

function deleteSession(callSid: string): void {
    sessions.delete(callSid);
}

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function getAIResponse(message: string, language: string = 'en'): Promise<string> {
    try {
        const response = await fetch('https://sarthi-ai-k8lq.onrender.com/api/voice/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                sessionId: 'exotel-temp-' + Date.now(),
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { CallSid, From, To, SpeechResult, Digits } = req.body;
    const sessionId = CallSid || 'unknown-call';
    const userInput = (SpeechResult || Digits || '').trim();

    console.log(`[Exotel Call: ${sessionId}] From: ${From}, Input: "${userInput}"`);

    const session = getSession(sessionId);
    let responseMessage = '';
    let shouldGather = true;
    let shouldHangup = false;

    // State machine for call flow
    if (session.status === 'wait_for_username') {
        if (!userInput) {
            responseMessage = 'Hello, welcome to Sarthi AI. Please say your username.';
        } else {
            const username = userInput.toLowerCase();
            if (username.includes('arvind') || username.includes('aravind')) {
                updateSession(sessionId, {
                    username: 'arvind',
                    status: 'wait_for_password',
                    last_response: 'Username received. Please say your PIN.'
                });
                responseMessage = 'Username received. Please say your PIN.';
            } else {
                updateSession(sessionId, {
                    failed_attempts: session.failed_attempts + 1,
                    last_response: 'Username not recognized. Please try again.'
                });

                if (session.failed_attempts >= 1) {
                    responseMessage = 'Verification failed. Goodbye.';
                    shouldHangup = true;
                    shouldGather = false;
                    deleteSession(sessionId);
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
            // Check if PIN is 1234
            const pinMatch = userInput.match(/\d+/);
            const pin = pinMatch ? pinMatch[0] : userInput;

            if (pin === '1234') {
                updateSession(sessionId, {
                    status: 'answer_agri_question',
                    verification_status: 'success',
                    failed_attempts: 0,
                    last_response: 'Verification successful. How can I help you today?'
                });
                responseMessage = 'Verification successful. How can I help you today?';
            } else {
                const newFailCount = session.failed_attempts + 1;
                updateSession(sessionId, {
                    failed_attempts: newFailCount,
                    last_response: 'Incorrect PIN. Please try again.'
                });

                if (newFailCount >= 2) {
                    responseMessage = 'Verification failed. Goodbye.';
                    shouldHangup = true;
                    shouldGather = false;
                    deleteSession(sessionId);
                } else {
                    responseMessage = 'Incorrect PIN. Please try again.';
                }
            }
        }
    }
    else if (session.status === 'answer_agri_question') {
        if (!userInput) {
            responseMessage = 'I\'m listening. How can I help you?';
        } else {
            // Check if user wants to end call
            const lowerInput = userInput.toLowerCase();
            if (lowerInput.includes('no') || lowerInput.includes('nothing') ||
                lowerInput.includes('bye') || lowerInput.includes('goodbye') ||
                lowerInput.includes('finish') || lowerInput.includes('done')) {
                responseMessage = 'Thank you for calling. Have a good day.';
                shouldHangup = true;
                shouldGather = false;
                deleteSession(sessionId);
            } else {
                // Get AI response for agricultural question
                const aiResponse = await getAIResponse(userInput, 'en');
                responseMessage = aiResponse + '. Do you have any other question?';
                updateSession(sessionId, {
                    last_response: responseMessage
                });
            }
        }
    }
    else {
        responseMessage = 'Hello, welcome to Sarthi AI. Please say your username.';
        updateSession(sessionId, {
            status: 'wait_for_username'
        });
    }

    // Generate Exotel AppletXML response
    res.setHeader('Content-Type', 'application/xml');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';
    xml += `  <Say voice="woman" language="en-IN">${escapeXml(responseMessage)}</Say>\n`;

    if (shouldGather) {
        xml += '  <GetSpeech timeout="7" playBeep="false" engine="google" language="en-IN" action="">\n';
        xml += '    <Say voice="woman" language="en-IN"></Say>\n';
        xml += '  </GetSpeech>\n';
    }

    if (shouldHangup) {
        xml += '  <Hangup/>\n';
    }

    xml += '</Response>';

    console.log(`[Exotel Response] Status: ${session.status}, Message: "${responseMessage}"`);

    return res.status(200).send(xml);
}
