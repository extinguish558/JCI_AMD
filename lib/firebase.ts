
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 已填入您的 Firebase 配置資訊
const firebaseConfig = {
  apiKey: "AIzaSyCIAuCwFokHnoDoBFggfMB-lS94MfBNX5o",
  authDomain: "jci-member-system.firebaseapp.com",
  projectId: "jci-member-system",
  storageBucket: "jci-member-system.firebasestorage.app",
  messagingSenderId: "349056623748",
  appId: "1:349056623748:web:95b3f7743101d968570ed1",
  measurementId: "G-D81X2B3D6W"
};

// 確保配置已正確填寫
const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("您的");

const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const isFirebaseReady = !!db;
