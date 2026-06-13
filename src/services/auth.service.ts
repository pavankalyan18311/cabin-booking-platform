import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  const user: User = {
    uid: cred.user.uid,
    email,
    displayName,
    photoURL: '',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBlocked: false,
    isEmailVerified: false,
    authProvider: 'email',
  };

  await setDoc(doc(db, COLLECTIONS.USERS, cred.user.uid), user);
  return user;
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, COLLECTIONS.USERS, cred.user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const user: User = {
      uid: cred.user.uid,
      email: cred.user.email!,
      displayName: cred.user.displayName ?? 'User',
      photoURL: cred.user.photoURL ?? '',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBlocked: false,
      isEmailVerified: true,
      authProvider: 'google',
    };
    await setDoc(userRef, user);
    return user;
  }

  return userSnap.data() as User;
}

export async function sendResetEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });

  if ((data.displayName || data.photoURL) && auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  }
}

export async function changeEmail(currentPassword: string, newEmail: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updateEmail(user, newEmail);
  await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    email: newEmail,
    updatedAt: new Date().toISOString(),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
