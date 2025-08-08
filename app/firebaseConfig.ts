// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBQq9_pMcYdar1WjRxxoq63E1oPxnSJRrM',
  authDomain: 'rentalapp-54095.firebaseapp.com',
  projectId: 'rentalapp-54095',
  storageBucket: 'rentalapp-54095.appspot.com',
  messagingSenderId: '581688903354',
  appId: '1:581688903354:web:ea18ae5f7e69db625a2483',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);