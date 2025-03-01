// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYgmtCON2jrxkR81YZ6C-yXaoai5UXjK4",
  authDomain: "grocery-app-fabb9.firebaseapp.com",
  projectId: "grocery-app-fabb9",
  storageBucket: "grocery-app-fabb9.firebasestorage.app",
  messagingSenderId: "205288775545",
  appId: "1:205288775545:web:6137e681b3c535b31899a8",
  measurementId: "G-66TF35X4HF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

// Export collections references
const groceryListRef = collection(db, 'items');

export { auth, googleProvider, db, groceryListRef };