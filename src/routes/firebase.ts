import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_55T4c_9Opq3iRlxg7tm1nkFq0tQKPD8",
  authDomain: "nwitter-reloaded-6ea43.firebaseapp.com",
  projectId: "nwitter-reloaded-6ea43",
  storageBucket: "nwitter-reloaded-6ea43.firebasestorage.app",
  messagingSenderId: "854891389309",
  appId: "1:854891389309:web:e1037c7602148e4b972c14",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
