importScripts("https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyCmO-b2bgoyRO1NEfJsVtTiKE3GJ2kQFzE",
  authDomain: "push-notification-5172c.firebaseapp.com",
  projectId: "push-notification-5172c",
  storageBucket: "push-notification-5172c.appspot.com",
  messagingSenderId: "1091006732378",
  appId: "1:1091006732378:web:8818695e9b6fb9fb392063",
  measurementId: "G-9HY887RPFG"
});

const messaging = firebase.messaging();