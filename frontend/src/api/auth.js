// Firebase-Auth-compatible helpers backed by Django JWT auth.
import { request, getToken, setToken } from "./client";

let currentUser = null;
let ready = false;
const subscribers = new Set();

const wrapUser = (u) => u && {
  ...u,
  getIdToken: async () => getToken(),
  reload: async () => {
    const res = await request("GET", "/auth/me/");
    setUser(res.user);
  },
};

function setUser(u) {
  currentUser = wrapUser(u);
  subscribers.forEach((cb) => cb(currentUser));
}

const init = (async () => {
  if (getToken()) {
    try {
      const res = await request("GET", "/auth/me/");
      currentUser = wrapUser(res.user);
    } catch {
      setToken(null);
    }
  }
  ready = true;
  subscribers.forEach((cb) => cb(currentUser));
})();

const auth = {
  get currentUser() { return currentUser; },
  signOut: () => signOut(auth),
};

export const getAuth = () => auth;

export const onAuthStateChanged = (_auth, cb) => {
  subscribers.add(cb);
  init.then(() => { if (ready && subscribers.has(cb)) cb(currentUser); });
  return () => subscribers.delete(cb);
};

export const signInWithEmailAndPassword = async (_auth, email, password) => {
  const res = await request("POST", "/auth/login/", { body: { email, password } });
  setToken(res.token);
  setUser(res.user);
  return { user: currentUser };
};

export const createUserWithEmailAndPassword = async (_auth, email, password) => {
  const res = await request("POST", "/auth/register/", { body: { email, password } });
  setToken(res.token);
  setUser(res.user);
  return { user: currentUser };
};

export const signOut = async () => {
  setToken(null);
  setUser(null);
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("authStateChanged"));
};

export const updateProfile = async (user, profile) => {
  const res = await request("PATCH", "/auth/me/", { body: profile });
  setUser(res.user);
};

export const sendEmailVerification = async () => {
  await request("POST", "/auth/send-verification/");
};

export const sendPasswordResetEmail = async (_auth, email) => {
  await request("POST", "/auth/password-reset/", { body: { email } });
};

// Google sign-in is not wired to the Django backend yet.
export class GoogleAuthProvider {}
export const signInWithPopup = async () => {
  const e = new Error("Google sign-in is not enabled in this version. Please use email and password.");
  e.code = "auth/operation-not-supported-in-this-environment";
  throw e;
};
