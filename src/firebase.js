// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6zYY0xC2SmAJ7XfViy7Ps48O1rnospys",
  authDomain: "all-in-one-finance-ced87.firebaseapp.com",
  projectId: "all-in-one-finance-ced87",
  storageBucket: "all-in-one-finance-ced87.firebasestorage.app",
  messagingSenderId: "937787712365",
  appId: "1:937787712365:web:80ce1e00d2d7177b437064",
  measurementId: "G-SSXWG7EYR0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };
