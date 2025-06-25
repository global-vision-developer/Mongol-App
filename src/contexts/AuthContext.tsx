
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, DocumentData, serverTimestamp, onSnapshot, collection, deleteDoc } from "firebase/firestore";
import type { UserProfile, RecommendedItem, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItemIds, setSavedItemIds] = useState(new Set<string>());

  const formatUser = (firebaseUser: User, firestoreData?: DocumentData): UserProfile => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || firestoreData?.displayName || "",
    photoURL: firebaseUser.photoURL || firestoreData?.photoURL || null,
    phoneNumber: firestoreData?.phoneNumber || null,
    firstName: firestoreData?.firstName || null,
    lastName: firestoreData?.lastName || null,
    dateOfBirth: firestoreData?.dateOfBirth || null,
    gender: firestoreData?.gender || null,
    homeAddress: firestoreData?.homeAddress || null,
    points: firestoreData?.points || 0,
  });

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;
    let unsubscribeSavedItems: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribeSavedItems) unsubscribeSavedItems();
      unsubscribeUserDoc = null;
      unsubscribeSavedItems = null;

      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUser(formatUser(firebaseUser, docSnap.data()));
            } else {
              const initialUserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: serverTimestamp(),
                points: 0,
              };
              setDoc(userDocRef, initialUserData).then(() => {
                setUser(formatUser(firebaseUser, initialUserData));
              });
            }
          }, (error) => {
            console.error("Error with user onSnapshot listener:", error);
            setUser(null);
            signOut(auth);
          });

          // Set up listener for saved items
          const savedItemsColRef = collection(db, "users", firebaseUser.uid, "savedItems");
          unsubscribeSavedItems = onSnapshot(savedItemsColRef, (snapshot) => {
            const ids = new Set<string>();
            snapshot.forEach((doc) => {
              ids.add(doc.id);
            });
            setSavedItemIds(ids);
          }, (error) => {
            console.error("Error listening to saved items:", error);
            setSavedItemIds(new Set());
          });

        } else {
          setUser(null);
          setSavedItemIds(new Set());
        }
      } else {
        setUser(null);
        setSavedItemIds(new Set());
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribeSavedItems) unsubscribeSavedItems();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      const error = new Error("Email not verified.");
      (error as any).code = 'auth/email-not-verified';
      throw error;
    }
  };
  
  const sendVerificationEmailForUnverifiedUser = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    await signOut(auth);
  };

  const register = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    const userDocRef = doc(db, "users", result.user.uid);
    await setDoc(userDocRef, {
      uid: result.user.uid,
      email: result.user.email,
      displayName: name,
      photoURL: result.user.photoURL,
      createdAt: serverTimestamp(),
      points: 0
    });
    await sendEmailVerification(result.user);
    await signOut(auth);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updatePhoneNumber = async (phoneNumber: string) => {
    if (!user) throw new Error("User not logged in");
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { phoneNumber, updatedAt: serverTimestamp() });
  };

  const updateUserPassword = async (currentPass: string, newPass: string) => {
    if (!auth.currentUser) throw new Error("User not logged in.");
    const firebaseUser = auth.currentUser;
    if (!firebaseUser.email) throw new Error("User email is not available.");
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPass);
    await reauthenticateWithCredential(firebaseUser, credential);
    await firebaseUpdatePassword(firebaseUser, newPass);
  };

  const updatePersonalInformation = async (data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'homeAddress'>>) => {
    if (!user || !auth.currentUser) throw new Error("User not logged in");
    const firebaseUser = auth.currentUser;
    const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    if (displayName && displayName !== firebaseUser.displayName) {
      await updateProfile(firebaseUser, { displayName });
    }
    const userDocRef = doc(db, "users", user.uid);
    const updateData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    await updateDoc(userDocRef, {
      ...updateData,
      displayName: displayName || user.displayName,
      updatedAt: serverTimestamp()
    });
  };

  const updateProfilePicture = async (photoURL: string) => {
    if (!auth.currentUser) throw new Error("User not logged in.");
    const firebaseUser = auth.currentUser;
    await updateProfile(firebaseUser, { photoURL });
    const userDocRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userDocRef, { photoURL, updatedAt: serverTimestamp() });
  };

  const isItemFavorite = (itemId: string): boolean => {
    return savedItemIds.has(itemId);
  };

  const addFavorite = async (item: RecommendedItem) => {
    if (!user || !item.id) throw new Error("User not logged in or item ID is missing.");
    const favDocRef = doc(db, "users", user.uid, "savedItems", item.id);
    const { id, ...itemDataFromItem } = item;
    const cleanedItemData: { [key: string]: any } = {};
    for (const key in itemDataFromItem) {
      if (Object.prototype.hasOwnProperty.call(itemDataFromItem, key)) {
        const value = (itemDataFromItem as any)[key];
        cleanedItemData[key] = value === undefined ? null : value;
      }
    }
    const firestoreData = { ...cleanedItemData, originalItemId: id, savedAt: serverTimestamp() };
    await setDoc(favDocRef, firestoreData);
  };

  const removeFavorite = async (itemId: string) => {
    if (!user) throw new Error("User not logged in.");
    const favDocRef = doc(db, "users", user.uid, "savedItems", itemId);
    await deleteDoc(favDocRef);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updatePhoneNumber,
      updateUserPassword, updatePersonalInformation, updateProfilePicture,
      sendVerificationEmailForUnverifiedUser, savedItemIds, isItemFavorite,
      addFavorite, removeFavorite
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
