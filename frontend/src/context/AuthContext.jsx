import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "../api/auth";
import { getFirestore, doc, getDoc } from "../api/firestore";
import { app } from "../firebase/firebaseConfig";
const AuthContext = createContext({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {
  },
  updateUserData: () => {
  }
});
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (error) {
        console.error("Error parsing cached user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);
  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            console.warn("User authenticated but no data found in Firestore");
            const basicUserData = {
              uid: user.uid,
              username: user.displayName || "User",
              email: user.email || "",
              photoURL: user.photoURL || void 0
            };
            setCurrentUser(basicUserData);
            localStorage.setItem("user", JSON.stringify(basicUserData));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const logout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const updateUserData = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  const value = {
    currentUser,
    firebaseUser,
    loading,
    logout,
    updateUserData
  };
  return <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  return useContext(AuthContext);
};
