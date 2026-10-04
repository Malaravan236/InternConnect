import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faBell,
  faCertificate,
  faSignInAlt,
  faSignOutAlt,
  faUser,
  faBriefcase,
  faHome,
  faChartLine,
  faEnvelope,
  faStar,
  faUserCheck,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Profile from "../../pages/Profile";
import InternshipRegistrationModal from "../../pages/Applicationform";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from "../../api/firestore";
const Navbar = ({
  isHeaderScrolled,
  isMenuOpen,
  setIsMenuOpen
}) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  useEffect(() => {
    const checkUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else {
        setUser(null);
      }
    };
    checkUserData();
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        checkUserData();
      }
    };
    const handleAuthChange = () => {
      checkUserData();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const fetchNotifications = async (creationDate) => {
      const notificationsCollection = collection(db, "notifications");
      const q = query(notificationsCollection, orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notificationsData = snapshot.docs.map((doc2) => {
            const data = doc2.data();
            let notificationDate;
            if (data.createdAt?.toDate) {
              notificationDate = data.createdAt.toDate();
            } else if (typeof data.createdAt === "string") {
              notificationDate = new Date(data.createdAt);
            } else {
              notificationDate = /* @__PURE__ */ new Date();
            }
            if (creationDate && notificationDate < creationDate) {
              return null;
            }
            const notification = {
              id: doc2.id,
              title: data.title,
              message: data.message,
              targetType: data.targetType || "all",
              targetUsers: data.targetUsers || [],
              createdAt: notificationDate,
              readBy: data.readBy || [],
              isRead: false
            };
            if (notification.targetType === "all" || notification.targetType === "specific" && notification.targetUsers?.includes(user.uid)) {
              notification.isRead = notification.readBy?.includes(user.uid) ?? false;
              return notification;
            }
            return null;
          }).filter((notif) => notif !== null);
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter((notif) => !notif.isRead).length);
        },
        (error) => {
          console.error("Error fetching notifications: ", error);
        }
      );
      return () => unsubscribe();
    };
    let userCreationDate = null;
    if (user.createdAt) {
      userCreationDate = new Date(user.createdAt);
    }
    if (!userCreationDate || isNaN(userCreationDate.getTime())) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.createdAt) {
              if (userData.createdAt.toDate) {
                userCreationDate = userData.createdAt.toDate();
              } else {
                userCreationDate = new Date(userData.createdAt);
              }
            }
          }
          fetchNotifications(userCreationDate);
        } catch (error) {
          console.error("Error fetching user data:", error);
          fetchNotifications(null);
        }
      };
      fetchUserData();
    } else {
      fetchNotifications(userCreationDate);
    }
    return () => {
    };
  }, [user]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowUserDropdown(false);
        setShowProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleMarkAsRead = async (notificationId) => {
    if (!user) return;
    try {
      const notificationDocRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationDocRef, {
        readBy: arrayUnion(user.uid)
      });
      setNotifications(
        (prevNotifications) => prevNotifications.map(
          (notif) => notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const unreadNotifications = notifications.filter((notif) => !notif.isRead);
      for (const notif of unreadNotifications) {
        const notificationDocRef = doc(db, "notifications", notif.id);
        await updateDoc(notificationDocRef, {
          readBy: arrayUnion(user.uid)
        });
      }
      setNotifications(
        (prevNotifications) => prevNotifications.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    const event = new Event("authStateChanged");
    window.dispatchEvent(event);
    navigate("/");
  };
  const handleLogin = () => {
    if (!user) {
      navigate("/login");
    } else {
      handleLogout();
    }
  };
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserDropdown) setShowUserDropdown(false);
  };
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    if (showNotifications) setShowNotifications(false);
  };
  const formatDate = (date) => {
    const today = /* @__PURE__ */ new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };
  const isAdmin = user?.email === "admin@gmail.com";
  const handlePostClick = () => {
    setIsPostModalOpen(true);
    setIsDropdownOpen(false);
  };
  return <>
      <header
    id="header"
    className={`fixed top-0 shadow-md w-full z-50 bg-white transition-all duration-300 ${isHeaderScrolled ? "shadow-md py-2" : "py-4"}`}
  >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-gray-800">
              <FontAwesomeIcon icon={faGraduationCap} className="text-emerald-600 mr-2" />
              Intern<span className="text-emerald-600">Connect</span>
            </a>

            <button
    className="lg:hidden flex flex-col space-y-1.5"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
  >
              <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

            <ul className={`lg:flex items-center space-x-8 ${isMenuOpen ? "absolute top-full left-0 right-0 bg-white shadow-lg p-4 space-y-4 flex flex-col items-center" : "hidden"} lg:relative lg:space-y-0 lg:p-0 lg:shadow-none`}>
              {user && <>
                  <li>
                    <a
    onClick={() => navigate("/")}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                      <FontAwesomeIcon icon={faHome} className="mr-2" />
                      Home
                    </a>
                  </li>

                  {isAdmin ? <>
                      <li>
                        <a
    onClick={() => navigate("adminsideviewreview")}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                          Dashboard
                        </a>
                      </li>
                      <li>
                         {isAdmin && <button
    onClick={() => navigate("internacceptedstudent")}
    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  >
                              <FontAwesomeIcon icon={faUserCheck} className="mr-2" />
                              Internship Status
                            </button>}
                      </li>
                      <li className="relative">
                        <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                          <FontAwesomeIcon icon={faUserGraduate} className="mr-2" />
                          Internship Options
                        </button>

                        {isDropdownOpen && <ul className="absolute bg-white border rounded shadow-md mt-2 w-48 z-10">
                            <li>
                              <button
    onClick={handlePostClick}
    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
  >
                                Post Internship
                              </button>
                            </li>
                            <li>
                              <button
    onClick={() => navigate("/updateintern")}
    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
  >
                                Update Internship
                              </button>
                            </li>
                          </ul>}
                      </li>
                      <li>
                        <a
    onClick={() => navigate("internship-request")}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                          <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                          Internship Requests
                        </a>
                      </li>
                      <li>
                        <a
    onClick={() => navigate("/notificationmanager")}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                          <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                          Send Notifications
                        </a>
                      </li>
                    </> : <>
                      <li>
                        <a
    onClick={() => navigate("/certificate")}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                          <FontAwesomeIcon icon={faCertificate} className="mr-2" />
                          View Certificate
                        </a>
                      </li>
                      <li>
                        <a
    onClick={() => navigate("/studentreview")}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center"
  >
                          <FontAwesomeIcon icon={faStar} className="mr-2" />
                          Give Review
                        </a>
                      </li>
                    </>}
                </>}

              {user && !isAdmin && <li className="relative" ref={notificationRef}>
                  <button
    onClick={toggleNotifications}
    className="text-gray-600 hover:text-emerald-600 cursor-pointer focus:outline-none relative"
  >
                    <FontAwesomeIcon icon={faBell} />
                    {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>}
                  </button>

                  {showNotifications && <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center p-3 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && <button
    onClick={handleMarkAllAsRead}
    className="text-xs text-emerald-600 hover:text-emerald-800"
  >
                            Mark all as read
                          </button>}
                      </div>

                      <div className="overflow-y-auto">
                        {notifications.length > 0 ? notifications.map((notification) => <div
    key={notification.id}
    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""}`}
    onClick={() => handleMarkAsRead(notification.id)}
  >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                {!notification.isRead && <span className="h-2 w-2 bg-blue-600 rounded-full mt-1" />}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                            </div>) : <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>}
                      </div>

                      {notifications.length > 0 && <div className="p-2 border-t text-center">
                          <button
    onClick={() => navigate("/notifications")}
    className="text-sm text-emerald-600 hover:text-emerald-800"
  >
                            View all notifications
                          </button>
                        </div>}
                    </div>}
                </li>}

              <li className="relative" ref={profileRef}>
                {user ? <div className="flex items-center">
                    <button
    onClick={toggleUserDropdown}
    className="flex items-center text-gray-600 hover:text-emerald-600 focus:outline-none"
  >
                      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white mr-2">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                      <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {showUserDropdown && <div className="absolute right-1 mt-10 w-48 bg-white rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
    onClick={() => setShowProfile(!showProfile)}
    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  >
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            Profile
                          </button>
                          

                          <a
    onClick={handleLogout}
    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
  >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Logout
                          </a>
                        </div>
                      </div>}

                    {showProfile && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
                        {
    /* Modal positioned at top-right with margin */
  }
                        <div className="absolute mt-16 top-10 right-10 w-full max-w-md"> {
    /* Adjust max-w-md to control width */
  }
                          <Profile onClose={() => setShowProfile(false)} />
                        </div>
                      </div>}
                  </div> : <a onClick={handleLogin} className="text-gray-600 hover:text-emerald-600 cursor-pointer flex items-center">
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                    Login
                  </a>}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <InternshipRegistrationModal
    isOpen={isPostModalOpen}
    onClose={() => setIsPostModalOpen(false)}
  />
    </>;
};
export default Navbar;
