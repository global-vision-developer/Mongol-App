
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
import { doc, getDoc, setDoc, updateDoc, DocumentData, serverTimestamp, onSnapshot } from "firebase/firestore";
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
  updateProfilePicture: (photoURL: string) => Promise<void>;
  sendVerificationEmailForUnverifiedUser: (email: string, pass: string) => Promise<void>;
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
    points: firestoreData?.points || 0,
  });

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

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
            console.error("Error with onSnapshot listener:", error);
            setUser(null);
            signOut(auth);
          });

        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (!userCredential.user.emailVerified) {
        await signOut(auth); // Sign them out
        const error = new Error("Email not verified.");
        (error as any).code = 'auth/email-not-verified'; // Custom code for the form to catch
        throw error;
      }
    } catch (error) {
      setLoading(false); 
      throw error;
    }
  };
  
  const sendVerificationEmailForUnverifiedUser = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      await signOut(auth); // Sign out immediately after sending
    } catch (error) {
      console.error("Error during resend verification flow:", error);
      throw error; // Re-throw to be handled by the calling component
    }
  };


  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      
      const userDocRef = doc(db, "users", result.user.uid);
      await setDoc(userDocRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
        points: 0 // Initialize points
      });

      await sendEmailVerification(result.user);
      await signOut(auth);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
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
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { phoneNumber, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error updating phone number:", error);
      throw error;
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
    if (!user || !auth.currentUser) throw new Error("User not logged in");
    try {
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
    } catch (error) {
      console.error("Personal info update error:", error);
      throw error;
    }
  };

  const updateProfilePicture = async (photoURL: string) => {
    if (!auth.currentUser) throw new Error("User not logged in.");
    try {
      const firebaseUser = auth.currentUser;
      await updateProfile(firebaseUser, { photoURL });
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, { photoURL, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePhoneNumber, updateUserPassword, updatePersonalInformation, updateProfilePicture, sendVerificationEmailForUnverifiedUser }}>
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
