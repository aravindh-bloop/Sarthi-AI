import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBs44jHjXrSsaYTvmlUCb2YR36Ls2BrxrI",
    authDomain: "sarthi-ai-platform-v1.firebaseapp.com",
    projectId: "sarthi-ai-platform-v1",
    storageBucket: "sarthi-ai-platform-v1.firebasestorage.app",
    messagingSenderId: "658517201388",
    appId: "1:658517201388:web:eb86a3cd0d16ab011b30c9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
