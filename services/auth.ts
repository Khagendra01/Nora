import { auth, googleProvider } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

export const logOut = () => signOut(auth);

export const onUserStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback); 