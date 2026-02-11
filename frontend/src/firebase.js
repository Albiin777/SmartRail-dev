import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAh_TiIXzPmFDjP4a_KOH-l9ENKL0LctIA",
  authDomain: "smartrail-c8f77.firebaseapp.com",
  projectId: "smartrail-c8f77",
  storageBucket: "smartrail-c8f77.firebasestorage.app",
  messagingSenderId: "600637007375",
  appId: "1:600637007375:web:8c9149e139c0d9b380e57a",
  measurementId: "G-XNKM5SWQE5",
};

const app = initializeApp(firebaseConfig);

// ✅ Authentication
const auth = getAuth(app);

// ✅ Firestore Database
const db = getFirestore(app);

// ✅ Google Provider
const googleProvider = new GoogleAuthProvider();

// ✅ Analytics (only if supported)
let analytics;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

export { app, auth, db, googleProvider };
