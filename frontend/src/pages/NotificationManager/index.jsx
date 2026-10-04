import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Send, Users, User, ChevronDown, Check } from "lucide-react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from "../../api/firestore";
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [targetType, setTargetType] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsCollection = collection(db, "notifications");
  const usersCollection = collection(db, "users");
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(usersCollection);
        const users = snapshot.docs.map((doc2) => ({
          id: doc2.id,
          name: doc2.data().name || doc2.data().email || doc2.id
        }));
        setUserOptions(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    const q = query(notificationsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc2) => ({
          id: doc2.id,
          title: doc2.data().title,
          message: doc2.data().message,
          targetType: doc2.data().targetType || "all",
          targetUsers: doc2.data().targetUsers || [],
          createdAt: doc2.data().createdAt?.toDate() || /* @__PURE__ */ new Date()
        }));
        setNotifications(notificationsData);
      },
      (error) => {
        console.error("Error fetching notifications: ", error);
      }
    );
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const filteredUsers = userOptions.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const toggleUserSelection = (userId) => {
    setSelectedUsers(
      (prevSelected) => prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]
    );
  };
  const handleSend = async () => {
    if (!title || !message) {
      alert("Please provide both title and message");
      return;
    }
    if (targetType === "specific" && selectedUsers.length === 0) {
      alert("Please select at least one user for specific notification");
      return;
    }
    const notificationData = {
      title,
      message,
      targetType,
      targetUsers: targetType === "specific" ? selectedUsers : [],
      createdAt: /* @__PURE__ */ new Date()
    };
    try {
      if (editId) {
        const notificationRef = doc(db, "notifications", editId);
        await updateDoc(notificationRef, notificationData);
        setEditId(null);
      } else {
        await addDoc(notificationsCollection, notificationData);
      }
      setTitle("");
      setMessage("");
      setTargetType("all");
      setSelectedUsers([]);
      setSearchTerm("");
      setShowUserDropdown(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3e3);
    } catch (error) {
      console.error("Error with notification:", error);
      alert("Failed to send notification");
    }
  };
  const handleEdit = (notif) => {
    setEditId(notif.id);
    setTitle(notif.title);
    setMessage(notif.message);
    setTargetType(notif.targetType);
    setSelectedUsers(notif.targetUsers || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteDoc(doc(db, "notifications", id));
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Failed to delete notification");
      }
    }
  };
  const getUserNames = (userIds) => {
    return userIds.map((id) => {
      const user = userOptions.find((u) => u.id === id);
      return user ? user.name : id;
    }).join(", ");
  };
  return <div className="p-6 mx-auto p-2 mt-10 pt-20 mb-20">
      {
    /* Success Notification */
  }
      {showSuccess && <div className="fixed top-6 right-6 bg-white text-emerald-800 px-6 py-3 rounded-lg shadow-lg z-50 border-t-2 border-emerald-500 flex items-center gap-2 animate-slide-in">
          <Check className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">
            {editId ? "Notification updated!" : "Notification sent successfully!"}
          </span>
        </div>}

      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {
    /* Left Panel - Form */
  }
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-8">
          <div className="bg-emerald-700 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-xl font-bold">
              {editId ? "Edit Notification" : "Create New Notification"}
            </h3>
            <p className="text-white opacity-90">
              {editId ? "Update the notification details" : "Send a notification to users"}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
    type="text"
    placeholder="Notification Title"
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
    placeholder="Notification Message"
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-32"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    maxLength={500}
  />
              <div className="text-right text-sm text-gray-500 mt-1">
                {message.length}/500 characters
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Target Audience</label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center">
                  <input
    type="radio"
    name="targetType"
    className="mr-2 text-emerald-600 focus:ring-emerald-500"
    checked={targetType === "all"}
    onChange={() => {
      setTargetType("all");
      setShowUserDropdown(false);
    }}
  />
                  <span className="flex items-center">
                    <Users size={16} className="mr-1" /> All Users
                  </span>
                </label>
                <label className="flex items-center">
                  <input
    type="radio"
    name="targetType"
    className="mr-2 text-emerald-600 focus:ring-emerald-500"
    checked={targetType === "specific"}
    onChange={() => setTargetType("specific")}
  />
                  <span className="flex items-center">
                    <User size={16} className="mr-1" /> Specific Users
                  </span>
                </label>
              </div>

              {targetType === "specific" && <div className="mb-2 relative" ref={dropdownRef}>
                  <div
    className="border border-gray-300 rounded-lg p-2 cursor-text bg-white"
    onClick={() => setShowUserDropdown(true)}
  >
                    {selectedUsers.length > 0 ? <div className="flex flex-wrap gap-1 mb-1">
                        {selectedUsers.map((userId) => {
    const user = userOptions.find((u) => u.id === userId);
    return <span
      key={userId}
      className="bg-emerald-100 text-emerald-800 text-sm rounded-full px-2 py-1 flex items-center"
    >
                              {user?.name || userId}
                              <button
      className="ml-1 text-emerald-600 hover:text-emerald-800"
      onClick={(e) => {
        e.stopPropagation();
        toggleUserSelection(userId);
      }}
    >
                                ×
                              </button>
                            </span>;
  })}
                      </div> : <span className="text-gray-500">Select users...</span>}
                    <input
    type="text"
    className="mt-1 w-full p-2 focus:outline-none bg-transparent"
    placeholder="Search users..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onFocus={() => setShowUserDropdown(true)}
    onClick={(e) => e.stopPropagation()}
  />
                    <ChevronDown
    size={16}
    className={`absolute right-3 top-3 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
  />
                  </div>

                  {showUserDropdown && <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredUsers.length > 0 ? filteredUsers.map((user) => <div
    key={user.id}
    className={`p-2 cursor-pointer flex items-center ${selectedUsers.includes(user.id) ? "bg-emerald-50" : "hover:bg-gray-50"}`}
    onClick={(e) => {
      e.stopPropagation();
      toggleUserSelection(user.id);
    }}
  >
                            <input
    type="checkbox"
    checked={selectedUsers.includes(user.id)}
    readOnly
    className="mr-2 h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
  />
                            {user.name}
                          </div>) : <div className="p-2 text-gray-500">No users found</div>}
                    </div>}
                </div>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
    onClick={() => {
      setEditId(null);
      setTitle("");
      setMessage("");
      setTargetType("all");
      setSelectedUsers([]);
      setShowUserDropdown(false);
    }}
    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
  >
                Reset
              </button>
              <button
    onClick={handleSend}
    disabled={!title || !message || targetType === "specific" && selectedUsers.length === 0}
    className={`px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${!title || !message || targetType === "specific" && selectedUsers.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
  >
                <Send size={18} className="shrink-0" />
                {editId ? "Update" : "Send"}
              </button>
            </div>
          </div>
        </div>

        {
    /* Right Panel - Notifications List */
  }
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
          <div className="bg-emerald-700 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-xl font-bold">Notification History</h3>
            <p className="text-white opacity-90">
              View and manage all sent notifications
            </p>
          </div>

          {notifications.length > 0 ? <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {notifications.map((notif) => <div
    key={notif.id}
    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
  >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-emerald-800">
                      {notif.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
    className="text-emerald-600 hover:text-emerald-800 p-1"
    onClick={() => handleEdit(notif)}
    title="Edit"
  >
                        <Pencil size={18} />
                      </button>
                      <button
    className="text-red-500 hover:text-red-700 p-1"
    onClick={() => handleDelete(notif.id)}
    title="Delete"
  >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="mb-3 text-gray-700">{notif.message}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                      {notif.targetType === "all" ? <>
                          <Users size={14} className="mr-1.5" /> All Users
                        </> : <>
                          <User size={14} className="mr-1.5" /> 
                          {notif.targetUsers?.length || 0} Users
                        </>}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      {notif.createdAt.toLocaleDateString()} at {notif.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  
                  {notif.targetType === "specific" && notif.targetUsers && notif.targetUsers.length > 0 && <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                      <p className="font-medium text-gray-700 mb-1">Recipients:</p>
                      <p className="text-gray-600 line-clamp-2">
                        {getUserNames(notif.targetUsers)}
                      </p>
                    </div>}
                </div>)}
            </div> : <div className="text-center py-8 text-gray-500">
              <div className="max-w-xs mx-auto">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <h4 className="font-medium text-lg mb-1">No notifications yet</h4>
                <p className="text-sm">Create your first notification using the form</p>
              </div>
            </div>}
        </div>
      </div>

      {
    /* Animation styles */
  }
      <style>{`
        @keyframes slide-in {
          0% { 
            opacity: 0; 
            transform: translateX(20px);
          }
          20% { 
            opacity: 1; 
            transform: translateX(0);
          }
          80% { 
            opacity: 1; 
            transform: translateX(0);
          }
          100% { 
            opacity: 0; 
            transform: translateX(20px);
          }
        }
        .animate-slide-in {
          animation: slide-in 3s ease-in-out forwards;
          box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
        }
      `}</style>
    </div>;
};
export default NotificationManager;
