import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
// import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyC5Op1IGajRH-KUj-i9AS5hJ0Sw-yblERE",
  authDomain: "exquisite-corpse-d0cbf.firebaseapp.com",
  databaseURL: "https://exquisite-corpse-d0cbf.firebaseio.com",
  projectId: "exquisite-corpse-d0cbf",
  storageBucket: "exquisite-corpse-d0cbf.appspot.com",
  messagingSenderId: "247490126037",
  appId: "1:247490126037:web:5721043963f00c0ec0425c",
  measurementId: "G-NX8QXVTJ47",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();
// export const storage = firebase.storage();
