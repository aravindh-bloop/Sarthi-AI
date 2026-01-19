import express from 'express';
import { sessionStore } from './db';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as prompts from './ai_config';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const tryParseJSON = (str: string) => {
    try {
        const cleaned = str.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Failed:", str);
        return null;
    }
};

export const handleExotelIncoming = async (req: express.Request, res: express.Response) => {
    const { CallSid, From, To, RecordingUrl, SpeechResult, Digits } = req.body;

    const sessionId = CallSid || 'unknown-call';
    const userInput = SpeechResult || Digits || '';

    console.log(`\n[Exotel Call: ${sessionId}] From: ${From}, Input: "${userInput}"`);

    let session = sessionStore.get(sessionId);
    if (!session) {
        sessionStore.create(sessionId);
        session = sessionStore.get(sessionId);
    }

    let responseMessage = '';
    let shouldGather = true;
    let shouldHangup = false;

    // Hard-coded verification for demo
    let forceVerificationResult: any = null;
    if (session.status === 'wait_for_password') {
        if (userInput && userInput.trim() === '1234') {
            forceVerificationResult = { is_attempt_success: true, is_attempt_failure: false };
        } else {
            forceVerificationResult = { is_attempt_success: false, is_attempt_failure: true };
        }
    }

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "google/gemma-3-4b-it",
            messages: [
                { role: "system", content: prompts.VOICE_CALL_SESSION_PROMPT },
                { role: "assistant", content: `Current Session State: ${JSON.stringify(session)}` },
                { role: "user", content: `Message: "${userInput || '(Call Started)'}"\nLanguage: en${forceVerificationResult ? `\n\nINTERNAL SYSTEM NOTE: The user's input was ${forceVerificationResult.is_attempt_success ? 'CORRECT' : 'INCORRECT'}. Follow verification rules accordingly.` : ''}` }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || "{}";
        let resData = tryParseJSON(content);

        if (resData && forceVerificationResult) {
            resData.is_attempt_success = forceVerificationResult.is_attempt_success;
            resData.is_attempt_failure = forceVerificationResult.is_attempt_failure;
        }

        if (resData) {
            const updates: any = {
                status: resData.next_action || session.status,
                verification_status: resData.verification_status || session.verification_status,
                last_response: resData.message,
                failed_attempts: session.failed_attempts || 0
            };

            const isFailure = resData.is_attempt_failure === true ||
                (resData.message && resData.message.includes("Verification failed. Please try again."));

            if (isFailure) {
                updates.failed_attempts += 1;
                console.log(`   -> Verification Failed! Count: ${updates.failed_attempts}`);

                if (updates.failed_attempts >= 2) {
                    resData.message = "Verification failed. Goodbye.";
                    resData.call_status = "ended";
                    resData.next_action = "end_call";
                    updates.status = "end_call";
                    updates.verification_status = "terminated";
                    shouldHangup = true;
                    shouldGather = false;
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

            if (resData.call_status === 'ended' || resData.next_action === 'end_call') {
                shouldHangup = true;
                shouldGather = false;
                sessionStore.delete(sessionId);
            } else {
                sessionStore.update(sessionId, updates);
            }

            responseMessage = resData.message || "I'm sorry, I didn't understand that.";
            console.log(`   -> Response: ${responseMessage}`);
        }
    } catch (e: any) {
        console.error("Exotel Voice Error:", e);
        responseMessage = "I'm experiencing technical difficulties. Please try again later.";
        shouldHangup = true;
        shouldGather = false;
    }

    // Generate Exotel AppletXML
    res.set('Content-Type', 'application/xml');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';
    xml += `  <Say voice="woman" language="en-IN">${escapeXml(responseMessage)}</Say>\n`;

    if (shouldGather) {
        xml += '  <GetSpeech timeout="5" playBeep="false" engine="google" language="en-IN">\n';
        xml += '    <Say voice="woman" language="en-IN"></Say>\n';
        xml += '  </GetSpeech>\n';
    }

    if (shouldHangup) {
        xml += '  <Hangup/>\n';
    }

    xml += '</Response>';

    res.send(xml);
};

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
