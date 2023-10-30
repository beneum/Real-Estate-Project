// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdojeWE-jwVEAfWfiz9TQuLo2ULeqgfHc",
  authDomain: "realestate-project-80dba.firebaseapp.com",
  projectId: "realestate-project-80dba",
  storageBucket: "realestate-project-80dba.appspot.com",
  messagingSenderId: "745977080425",
  appId: "1:745977080425:web:277a10aef114bfd0a890f8"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()

