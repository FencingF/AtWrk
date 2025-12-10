import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAaar_daW9-GieSIVE9ZgBu4kfKejJEQvw",
    authDomain: "atwrk-c0a97.firebaseapp.com",
    projectId: "atwrk-c0a97",
    storageBucket: "atwrk-c0a97.firebasestorage.app",
    messagingSenderId: "32785242566",
    appId: "1:32785242566:web:6a65b9d8f61cb39abb3ac7",
    measurementId: "G-06Q73LDY2C"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
