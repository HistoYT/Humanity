// Configuración de Firebase - Realtime Database para comentarios públicos

const firebaseConfig = {
  apiKey: "AIzaSyBiiCzC1MpG7dX-LkN6Dht5eiP0vjdObso",
  authDomain: "humanity-baa0e.firebaseapp.com",
  databaseURL: "https://humanity-baa0e-default-rtdb.firebaseio.com",
  projectId: "humanity-baa0e",
  storageBucket: "humanity-baa0e.firebasestorage.app",
  messagingSenderId: "232845628084",
  appId: "1:232845628084:web:92f233486f7350ee297de1"
};

// Inicializar Firebase cuando esté disponible
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();
  window.firebaseDB = database;
  console.log('Firebase inicializado correctamente');
} else {
  console.error('Firebase SDK no cargó');
}


