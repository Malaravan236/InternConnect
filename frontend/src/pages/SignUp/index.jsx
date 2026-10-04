import { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification
} from "../../api/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "../../api/firestore";
import { useNavigate } from "react-router-dom";
import { app } from "../../firebase/firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faCheckCircle,
  faTimes,
  faEnvelopeOpenText,
  faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let timer;
    if (showSuccessPopup && !verificationSent) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/");
        if (window.location.pathname === "/") {
          window.location.reload();
        }
      }, 2e3);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessPopup, navigate, verificationSent]);
  const checkEmailExistsInManualUsers = async (_email) => {
    // Duplicate emails are rejected by the Django register endpoint (auth/email-already-in-use).
    return false;
  };
  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      setSuccessMessage(`Verification email sent to ${email}. Please check your inbox.`);
      setShowSuccessPopup(true);
      const db = getFirestore(app);
      await setDoc(doc(db, "manualUsers", user.uid), {
        emailVerified: false
      }, { merge: true });
      await setDoc(doc(db, "users", user.uid), {
        emailVerified: false
      }, { merge: true });
    } catch (error2) {
      console.error("Error sending verification email:", error2.message);
      setError(`Failed to send verification email: ${error2.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }
    const db = getFirestore(app);
    try {
      const emailExists = await checkEmailExistsInManualUsers(email);
      if (emailExists) {
        setError("This email is already registered. Please use a different email or log in.");
        setIsLoading(false);
        return;
      }
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (username) {
        await updateProfile(user, {
          displayName: username
        });
      }
      const userData = {
        uid: user.uid,
        email: user.email,
        username,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
        authType: "manual",
        emailVerified: user.emailVerified
      };
      await setDoc(doc(db, "manualUsers", user.uid), userData);
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        authType: "manual"
      });
      localStorage.setItem("user", JSON.stringify({
        ...userData,
        authType: "manual"
      }));
      setSuccessMessage(`Account created successfully! Welcome, ${username}!`);
      setShowSuccessPopup(true);
      await sendVerificationEmail(user);
    } catch (error2) {
      console.error("Error signing up:", error2.message);
      if (error2.code === "auth/email-already-in-use") {
        setError("This email is already in use. If you signed up with Google previously, please use Google sign-in.");
      } else if (error2.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error2.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(`Signup failed: ${error2.message}`);
      }
      setIsLoading(false);
    }
  };
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = result.additionalUserInfo?.isNewUser;
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || `User_${user.uid.substring(0, 5)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
        profilePicture: user.photoURL || "",
        authType: "google",
        emailVerified: user.emailVerified
      };
      await setDoc(doc(db, "googleUsers", user.uid), userData, { merge: true });
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        authType: "google"
      }, { merge: true });
      localStorage.setItem("user", JSON.stringify({
        ...userData,
        authType: "google"
      }));
      if (isNewUser) {
        setSuccessMessage(`Account created successfully! Welcome, ${userData.username}!`);
      } else {
        setSuccessMessage(`Welcome back, ${userData.username}!`);
      }
      setShowSuccessPopup(true);
    } catch (error2) {
      console.error("Error signing up with Google:", error2.message);
      if (error2.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was canceled.");
      } else {
        setError(`Signup failed: ${error2.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 pt-20">
      {
    /* Success Popup */
  }
      {showSuccessPopup && <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-md">
          <div className="flex items-center p-4 border-l-4 border-teal-500">
            <div className="flex-shrink-0">
              <FontAwesomeIcon
    icon={verificationSent ? faEnvelopeOpenText : faCheckCircle}
    className={`h-5 w-5 ${verificationSent ? "text-blue-500" : "text-teal-500"}`}
  />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{successMessage}</p>
              {verificationSent && <p className="text-xs mt-1 text-gray-600">
                  Didn't receive the email? <button
    onClick={() => {
      const user = getAuth().currentUser;
      if (user) sendVerificationEmail(user);
    }}
    className="text-blue-500 hover:underline"
  >
                    Resend
                  </button>
                </p>}
            </div>
            <div className="ml-auto pl-3">
              <button
    onClick={() => {
      setShowSuccessPopup(false);
      if (!verificationSent) navigate("/");
    }}
    className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
  >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>}

      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {
    /* Left Panel */
  }
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-10 flex flex-col justify-center items-center md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">Intern Connect</h1>
          <p className="text-lg text-center mb-8">
            Join our community of professionals and unlock your career potential.
          </p>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <p className="italic mb-4">
              "Signing up was the best career decision I made this year. The networking opportunities and resources are invaluable."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm">Software Developer</p>
              </div>
            </div>
          </div>
        </div>

        {
    /* Right Panel - Signup Form */
  }
        <div className="p-10 flex flex-col justify-center md:w-1/2">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600">Join Intern Connect today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon
    icon={faCircleExclamation}
    className="text-red-500 mr-3"
  />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <FontAwesomeIcon
    icon={faUser}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
                <input
    type="text"
    id="username"
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
    placeholder="Choose a username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
  />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <FontAwesomeIcon
    icon={faEnvelope}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
                <input
    type="email"
    id="email"
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
    placeholder="Your email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <FontAwesomeIcon
    icon={faLock}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
                <input
    type="password"
    id="password"
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
    placeholder="Create a password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <FontAwesomeIcon
    icon={faLock}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
                <input
    type="password"
    id="confirmPassword"
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
    placeholder="Confirm your password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />
              </div>
            </div>

            <div className="flex items-center">
              <input
    type="checkbox"
    id="terms"
    className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
    required
  />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="/terms" className="text-teal-500 hover:text-teal-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-teal-500 hover:text-teal-600">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
    type="submit"
    className={`w-full flex justify-center items-center bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
    disabled={isLoading}
  >
              {isLoading ? <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </> : "Create Account"}
            </button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500">or continue with</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <button
    type="button"
    className={`w-full flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
    onClick={handleGoogleSignup}
    disabled={isLoading}
  >
              <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png"
    alt="Google logo"
    className="w-5 h-5 mr-2"
  />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <a href="/login" className="text-teal-500 hover:text-teal-600">
                Log in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>;
};
export default Signup;
