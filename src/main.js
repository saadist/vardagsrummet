// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBddn5eKhFv1DpnCP27T181yNeT4cU7BC0",
    authDomain: "vardagsrummet.firebaseapp.com",
    projectId: "vardagsrummet",
    storageBucket: "vardagsrummet.firebasestorage.app",
    messagingSenderId: "432139088040",
    appId: "1:432139088040:web:1adafa18b433b4dd2b129d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("HELLO", app);
