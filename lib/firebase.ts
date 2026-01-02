
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIAuCwFokHnoDoBFggfMB-lS94MfBNX5o",
  authDomain: "jci-member-system.firebaseapp.com",
  projectId: "jci-member-system",
  storageBucket: "jci-member-system.firebasestorage.app",
  messagingSenderId: "349056623748",
  appId: "1:349056623748:web:95b3f7743101d968570ed1",
  measurementId: "G-D81X2B3D6W"
};

const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("您的");

const app = isConfigured ? initializeApp(firebaseConfig) : null;

/**
 * 針對「連線經常斷開」的深度優化方案：
 * 1. experimentalForceLongPolling: 解決 WebSocket 被防火牆封鎖的問題。
 * 2. persistentMultipleTabManager: 解決多個分頁同時開啟導致的資料鎖定問題。
 */
export const db = app ? initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    tabManager: persistentMultipleTabManager() 
  }),
  experimentalForceLongPolling: true, // 強制使用長輪詢，穩定性大幅提升
}) : null;

export const isFirebaseReady = !!db;
