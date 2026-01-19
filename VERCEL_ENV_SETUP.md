# VERCEL ENVIRONMENT VARIABLES SETUP

Add these in your Vercel Dashboard → Project Settings → Environment Variables:

## Backend / API Variables
```
OPENAI_API_KEY=your_new_openrouter_api_key_here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=google/gemma-3-4b-it
```

## Frontend Variables (Vite requires VITE_ prefix)
```
VITE_FIREBASE_API_KEY=AIzaSyBs44jHjXrSsaYTvmlUCb2YR36Ls2BrxrI
VITE_FIREBASE_AUTH_DOMAIN=sarthi-ai-platform-v1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sarthi-ai-platform-v1
VITE_FIREBASE_STORAGE_BUCKET=sarthi-ai-platform-v1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=658517201388
VITE_FIREBASE_APP_ID=1:658517201388:web:eb86a3cd0d16ab011b30c9
```

## IMPORTANT NOTES:
1. Set all variables as "Production", "Preview", and "Development" environments in Vercel
2. Firebase keys are NOT sensitive (public client config), but OpenRouter key IS SENSITIVE
3. The OpenRouter key starts with "sk-or-v1-", get it from your .env file (DO NOT commit .env)
4. After adding, redeploy your Vercel project for changes to take effect
