import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Role, UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: Role) => Promise<void>;
  signInWithGoogle: (intendedRole?: Role) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

async function loadOrCreateProfile(u: User, role: Role = "buyer"): Promise<UserProfile> {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;
  const profile: UserProfile = {
    id: u.uid,
    email: u.email ?? "",
    displayName: u.displayName ?? (u.email?.split("@")[0] ?? "Member"),
    photoURL: u.photoURL ?? undefined,
    role,
    createdAt: Date.now(),
  };
  await setDoc(ref, { ...profile, _serverCreatedAt: serverTimestamp() });
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await loadOrCreateProfile(u);
          setProfile(p);
        } catch (e) {
          console.error("profile load failed", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  const value: AuthState = {
    user,
    profile,
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signUp: async (email, password, displayName, role) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await loadOrCreateProfile(cred.user, role);
    },
    signInWithGoogle: async (intendedRole = "buyer") => {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await loadOrCreateProfile(cred.user, intendedRole);
    },
    signOut: async () => {
      await fbSignOut(auth);
    },
    refreshProfile,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}
