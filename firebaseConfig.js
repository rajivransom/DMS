// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8d4NdvCV7rlgAIYwoHdVXO9vFDmVN_NM",
  authDomain: "dmsapp-f4a70.firebaseapp.com",
  projectId: "dmsapp-f4a70",
  storageBucket: "dmsapp-f4a70.firebasestorage.app",
  messagingSenderId: "479017752036",
  appId: "1:479017752036:web:6b880cd671480ada0ba3f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
