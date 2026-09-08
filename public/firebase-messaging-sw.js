importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAbFVUF34Gkb9ITqHcqyi9gc0-hiP8WgTs",
  authDomain: "haq-plus.firebaseapp.com",
  projectId: "haq-plus",
  storageBucket: "haq-plus.firebasestorage.app",
  messagingSenderId: "365876358912",
  appId: "1:365876358912:web:b3bae2fc1012b40feb4de5",
  measurementId: "G-CWD2HLRP4R"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: payload.notification?.icon || "/logo.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
