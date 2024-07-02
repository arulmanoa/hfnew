importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyAzRucdc8OXUWzgLR-TZzBV-WMWNKHCV5E",
  authDomain: "zeel-75b7f.firebaseapp.com",
  projectId: "zeel-75b7f",
  storageBucket: "zeel-75b7f.appspot.com",
  messagingSenderId: "313703214237",
  appId: "1:313703214237:web:93fac6a28c78b8e1b77874",
  measurementId: "G-B7VVVQS4EM",
  vapidKey: "BDQcZ7-ELCC6JioG0w4o8ZO-1rroTL7dnY0Sbe57TrjNIv0X3LDAy9q1jVRWwyNLFKad5Uy4ghjWCb9VD9ND-GI"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("firebase-messaging-sw.js").then(function (registration) {
    console.log('Firebase Worker Registered', registration);

  }).catch(function (err) {
    console.log('Service Worker registration failed: ', err);
  });
}