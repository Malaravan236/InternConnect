import { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "../../api/auth";
import { getFirestore, doc, getDoc } from "../../api/firestore";
import { useNavigate } from "react-router-dom";
import { app } from "../../firebase/firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faCheckCircle,
  faTimes,
  faSpinner,
  faArrowLeft,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showUserNotFoundPopup, setShowUserNotFoundPopup] = useState(false);
  const [showInvalidCredentialsPopup, setShowInvalidCredentialsPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let timer;
    if (showSuccessPopup && isLoggedIn) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/");
        if (window.location.pathname === "/") {
          window.location.reload();
        }
      }, 2e3);
    }
    if (showUserNotFoundPopup) {
      timer = setTimeout(() => {
        setShowUserNotFoundPopup(false);
        navigate("/signup");
      }, 3e3);
    }
    if (showInvalidCredentialsPopup) {
      timer = setTimeout(() => {
        setShowInvalidCredentialsPopup(false);
      }, 3e3);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessPopup, isLoggedIn, navigate, showUserNotFoundPopup, showInvalidCredentialsPopup]);
  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setSuccessMessage(`Welcome back, ${userData.username || "User"}!`);
    setShowSuccessPopup(true);
    setIsLoggedIn(true);
    window.dispatchEvent(new Event("authStateChanged"));
  };
  const handleUserNotFound = () => {
    setShowUserNotFoundPopup(true);
    setIsLoading(false);
  };
  const handleInvalidCredentials = () => {
    setShowInvalidCredentialsPopup(true);
    setIsLoading(false);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const auth = getAuth(app);
    const db = getFirestore(app);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        handleLoginSuccess(userDoc.data());
      } else {
        await auth.signOut();
        handleUserNotFound();
      }
    } catch (error2) {
      console.error("Error logging in:", error2.message);
      if (error2.code === "auth/user-not-found" || error2.code === "auth/wrong-password") {
        handleInvalidCredentials();
        setError("Invalid email or password. Please try again.");
      } else if (error2.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(`Login failed: ${error2.message}`);
      }
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        handleLoginSuccess(userDoc.data());
      } else {
        await auth.signOut();
        handleUserNotFound();
      }
    } catch (error2) {
      console.error("Error logging in with Google:", error2.message);
      if (error2.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was canceled.");
      } else {
        setError(`Login failed: ${error2.message}`);
      }
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    setIsLoading(true);
    const auth = getAuth(app);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setSuccessMessage(`Password reset email sent to ${email}`);
      setShowSuccessPopup(true);
      setShowForgotPassword(false);
    } catch (error2) {
      console.error("Error sending reset email:", error2.message);
      if (error2.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(`Failed to send reset email: ${error2.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 pt-20">
      {
    /* Success Popup */
  }
      {showSuccessPopup && <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-center p-4 border-l-4 border-teal-500">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-teal-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
    onClick={() => setShowSuccessPopup(false)}
    className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
  >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>}

      {
    /* User Not Found Popup */
  }
      {showUserNotFoundPopup && <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-center p-4 border-l-4 border-red-500">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Account not found. Please sign up. Redirecting...</p>
            </div>
            <div className="ml-auto pl-3">
              <button
    onClick={() => setShowUserNotFoundPopup(false)}
    className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
  >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>}

      {
    /* Invalid Credentials Popup */
  }
      {showInvalidCredentialsPopup && <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-center p-4 border-l-4 border-yellow-500">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Invalid credentials. Please check your email and password.</p>
            </div>
            <div className="ml-auto pl-3">
              <button
    onClick={() => setShowInvalidCredentialsPopup(false)}
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
            Transform your workflow with our powerful platform. Join thousands of satisfied users today.
          </p>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <p className="italic mb-4">
              "This platform has completely revolutionized how our team collaborates. The interface is
              intuitive and the features are exactly what we needed."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm">Product Manager</p>
              </div>
            </div>
          </div>
        </div>

        {
    /* Right Panel - Login Form */
  }
        <div className="p-10 flex flex-col justify-center md:w-1/2">
          {showForgotPassword ? <div className="space-y-6">
              <button
    onClick={() => setShowForgotPassword(false)}
    className="flex items-center text-teal-500 hover:text-teal-600 mb-4"
  >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to login
              </button>
              
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
                <p className="text-gray-600">Enter your email to receive a reset link</p>
              </div>

              {error && <div className="text-red-500 text-center p-2 bg-red-50 rounded">
                  {error}
                </div>}

              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <FontAwesomeIcon
    icon={faEnvelope}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
                  <input
    type="email"
    id="resetEmail"
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
    placeholder="Your email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
                </div>
              </div>

              <button
    onClick={handleForgotPassword}
    disabled={isLoading}
    className={`w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-200 flex items-center justify-center ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
  >
                {isLoading ? <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Sending...
                  </> : "Send Reset Link"}
              </button>

              {resetEmailSent && <div className="text-center text-sm text-gray-600 mt-4">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
    onClick={handleForgotPassword}
    className="text-teal-500 hover:text-teal-600"
  >
                    try again
                  </button>
                </div>}
            </div> : <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                <p className="text-gray-600">Log in to access your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && !showInvalidCredentialsPopup && <div className="text-red-500 text-center p-2 bg-red-50 rounded">
                    {error}
                  </div>}
                
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
    placeholder="Your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
    type="checkbox"
    id="remember"
    className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
  />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <button
    type="button"
    className="text-sm text-teal-500 hover:text-teal-600"
    onClick={() => setShowForgotPassword(true)}
  >
                    Forgot password?
                  </button>
                </div>

                <button
    type="submit"
    disabled={isLoading}
    className={`w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-200 flex items-center justify-center ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
  >
                  {isLoading ? <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Logging in...
                    </> : "Log In"}
                </button>

                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="mx-4 text-gray-500">or continue with</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                <button
    type="button"
    className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition duration-200"
    onClick={handleGoogleSignIn}
  >
                  <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png"
    alt="Google logo"
    className="w-5 h-5 mr-2"
  />
                  Google
                </button>

                <div className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account?{" "}
                  <a href="/signup" className="text-teal-500 hover:text-teal-600">
                    Sign up
                  </a>
                </div>
              </form>
            </>}
        </div>
      </div>
    </div>;
};
export default Login;
