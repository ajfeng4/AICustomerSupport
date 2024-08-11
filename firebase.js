// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfn3OnDp4TeDjLB3YPBZGN55Cdj_cxOeE",
    authDomain: "aicustomersupportdb.firebaseapp.com",
    projectId: "aicustomersupportdb",
    storageBucket: "aicustomersupportdb.appspot.com",
    messagingSenderId: "649773749090",
    appId: "1:649773749090:web:cc3ac3ecd72134fbe7d23b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const auth = getAuth(app);

export {firestore, auth}