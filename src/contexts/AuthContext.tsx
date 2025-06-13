
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
  updatePassword as firebaseUpdatePassword, // Renamed to avoid conflict
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, DocumentData, serverTimestamp } from "firebase/firestore";
import type { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  updatePersonalInformation: (data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'homeAddress'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser(formatUser(firebaseUser, userDocSnap.data()));
          } else {
            // This will create the user doc with basic info + personal info fields as null/undefined
            const initialUserData: UserProfile & { createdAt: any } = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              phoneNumber: null,
              firstName: null,
              lastName: null,
              dateOfBirth: null,
              gender: null,
              homeAddress: null,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, initialUserData);
            setUser(formatUser(firebaseUser, initialUserData));
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser(formatUser(firebaseUser)); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw error;
    } finally {
      // setLoading(false); // onAuthStateChanged will handle this
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      // Firestore document will be created by onAuthStateChanged listener
    } catch (error) {
      throw error;
    } finally {
      // setLoading(false); // onAuthStateChanged will handle this
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePhoneNumber = async (phoneNumber: string) => {
    if (!user) throw new Error("User not logged in");
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { phoneNumber });
      setUser((prevUser) => ({ ...prevUser!, phoneNumber }));
    } catch (error) {
      console.error("Error updating phone number:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (currentPass: string, newPass: string) => {
    if (!auth.currentUser) throw new Error("User not logged in.");
    setLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser.email) throw new Error("User email is not available.");

      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPass);
      await reauthenticateWithCredential(firebaseUser, credential);
      await firebaseUpdatePassword(firebaseUser, newPass);
    } catch (error: any) {
      console.error("Password update error in AuthContext:", error);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInformation = async (data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'homeAddress'>>) => {
    if (!user) throw new Error("User not logged in");
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      // Filter out undefined values to prevent them from overwriting existing fields with null in Firestore
      const updateData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      
      await updateDoc(userDocRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      setUser((prevUser) => ({ ...prevUser!, ...updateData }));
    } catch (error) {
      console.error("Error updating personal information:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePhoneNumber, updateUserPassword, updatePersonalInformation }}>
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

