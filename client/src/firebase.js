// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-8af7f.firebaseapp.com",
  projectId: "mern-estate-8af7f",
  storageBucket: "mern-estate-8af7f.firebasestorage.app",
  messagingSenderId: "160492726662",
  appId: "1:160492726662:web:81ab7ea6ebde757767a407"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);