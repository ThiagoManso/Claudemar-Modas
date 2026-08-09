import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCprPZApMJ_UCE-cl5ym8qhrK4R3sLBvjA",
  authDomain: "claudemar-modas.firebaseapp.com",
  projectId: "claudemar-modas",
  storageBucket: "claudemar-modas.firebasestorage.app",
  messagingSenderId: "914025159034",
  appId: "1:914025159034:web:5a9736447dcb3a9b039ec3",
  measurementId: "G-BDKN1X1SPF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testRegistration() {
  const email = `test_${Date.now()}@example.com`;
  const password = "password123";
  console.log(`Registering ${email}...`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`User created in Auth with UID: ${user.uid}`);
    console.log(`Current user UID: ${auth.currentUser?.uid}`);
    
    await setDoc(doc(db, 'users', user.uid), {
      name: "Test User",
      email: email,
      role: 'pending',
      createdAt: new Date().toISOString()
    });
    console.log("Document created in Firestore successfully!");
    
    process.exit(0);
  } catch (err) {
    console.error("Error during registration:", err);
    process.exit(1);
  }
}

testRegistration();
