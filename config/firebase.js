import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAx8e5nRI6BQItGBUp6vyHYJfR6eTTxyS4",
    authDomain: "repair-e0494.firebaseapp.com",
    projectId: "repair-e0494",
    storageBucket: "repair-e0494.firebasestorage.app",
    messagingSenderId: "1075863695018",
    appId: "1:1075863695018:web:406f54b1a69cdf5cf42ad3"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 