import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAavO2BeM3voZcbHKSMwGKs65nEktp0TXM",
  authDomain: "ew-domingo-helper.firebaseapp.com",
  projectId: "ew-domingo-helper",
  storageBucket: "ew-domingo-helper.firebasestorage.app",
  messagingSenderId: "8836886534",
  appId: "1:8836886534:web:09293c3bac3e8d820c5387"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const storage = getStorage(app)

console.log('[firebase.js] ✓ Firebase initialized')
