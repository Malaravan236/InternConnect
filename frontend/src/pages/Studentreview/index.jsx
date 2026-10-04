import { useState, useEffect } from "react";
import { Star, Send, AlertCircle, Check, Loader2 } from "lucide-react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs
} from "../../api/firestore";
const PersonalTrainerReview = () => {
  const [trainerName, setTrainerName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editId, setEditId] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const reviewsCollection = collection(db, "trainerReviews");
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setStudentInfo({
          id: userData.uid,
          name: userData.username || userData.displayName || "Anonymous",
          email: userData.email || "No email"
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        setStudentInfo({
          id: "unknown",
          name: "Anonymous",
          email: "No email"
        });
      }
    }
  }, []);
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainersQuery = query(collection(db, "trainers"));
        const querySnapshot = await getDocs(trainersQuery);
        const trainersList = querySnapshot.docs.map((doc2) => doc2.data().name);
        setTrainers(trainersList);
      } catch (error) {
        console.error("Error fetching trainers:", error);
        setTrainers(["John Smith", "Maria Rodriguez", "David Johnson", "Sarah Wong"]);
      }
    };
    fetchTrainers();
  }, []);
  const handleSubmit = async () => {
    if (!studentInfo) {
      alert("Please log in to submit a review");
      return;
    }
    const finalTrainerName = selectedTrainer || trainerName;
    if (!finalTrainerName || !courseName || !rating || !comment) {
      alert("Please fill in all fields");
      return;
    }
    const reviewData = {
      trainerName: finalTrainerName,
      courseName,
      studentId: studentInfo.id,
      studentName: studentInfo.name,
      studentEmail: studentInfo.email,
      rating,
      comment,
      createdAt: /* @__PURE__ */ new Date()
    };
    try {
      setLoading(true);
      if (editId) {
        await updateDoc(doc(db, "trainerReviews", editId), reviewData);
        setEditId(null);
      } else {
        const existingReviewQuery = query(
          reviewsCollection,
          where("studentId", "==", studentInfo.id),
          where("trainerName", "==", finalTrainerName)
        );
        const querySnapshot = await getDocs(existingReviewQuery);
        if (!querySnapshot.empty && !confirm("You've already reviewed this trainer. Submit another review?")) {
          return;
        }
        await addDoc(reviewsCollection, reviewData);
      }
      setTrainerName("");
      setSelectedTrainer("");
      setCourseName("");
      setRating(0);
      setComment("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3e3);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };
  const isFormValid = (selectedTrainer || trainerName) && courseName && rating > 0 && comment.length > 0;
  if (!studentInfo) {
    return <div className="max-w-4xl mx-auto p-6 my-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <AlertCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to submit trainer reviews.</p>
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            Sign In
          </button>
        </div>
      </div>;
  }
  return <div className="max-w-4xl mx-auto mt-20 my-12 p-4">
      {
    /* Success Notification */
  }
      {showSuccess && <div className="fixed top-6 right-6 bg-white text-emerald-800 px-6 py-3 rounded-lg shadow-lg z-50 border-t-2 border-emerald-500 flex items-center gap-2 animate-slide-in">
          <Check className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">Review submitted successfully!</span>
        </div>}

      {
    /* Form Header */
  }
      <div className="bg-emerald-600 rounded-t-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {editId ? "Edit Your Review" : "Share Your Experience"}
        </h1>
        <p className="text-emerald-100 opacity-90">
          Help us improve by sharing feedback about your trainer
        </p>
      </div>

      {
    /* Form Content */
  }
      <div className="bg-white rounded-b-xl shadow-md p-6 md:p-8 border border-gray-100">
        <div className="grid md:grid-cols-2 gap-8">
          {
    /* Left Column */
  }
          <div className="space-y-6">
            {
    /* Trainer Selection */
  }
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Trainer
              </label>
              {trainers.length > 0 ? <div>
                  <select
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-800"
    value={selectedTrainer}
    onChange={(e) => {
      setSelectedTrainer(e.target.value);
      setTrainerName(e.target.value === "other" ? "" : e.target.value);
    }}
  >
                    <option value="">Select a trainer</option>
                    {trainers.map((trainer) => <option key={trainer} value={trainer}>
                        {trainer}
                      </option>)}
                    <option value="other">Other trainer</option>
                  </select>
                  
                  {selectedTrainer === "other" && <input
    type="text"
    placeholder="Enter trainer's name"
    className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-800"
    value={trainerName}
    onChange={(e) => setTrainerName(e.target.value)}
  />}
                </div> : <input
    type="text"
    placeholder="Enter trainer's name"
    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
    value={trainerName}
    onChange={(e) => setTrainerName(e.target.value)}
  />}
            </div>

            {
    /* Course Name */
  }
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Course/Program
              </label>
              <input
    type="text"
    placeholder="Enter course name"
    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
    value={courseName}
    onChange={(e) => setCourseName(e.target.value)}
  />
            </div>

            {
    /* Rating */
  }
            <div>
              <label className="block text-gray-700 font-medium mb-3">
                Your Rating
              </label>
              <div className="flex justify-center gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {[1, 2, 3, 4, 5].map((star) => <button
    key={star}
    type="button"
    onClick={() => setRating(star)}
    className="focus:outline-none transition-transform hover:scale-110"
  >
                    <Star
    size={32}
    className={star <= rating ? "text-yellow-500 fill-yellow-400" : "text-gray-300"}
  />
                  </button>)}
              </div>
              <div className="text-center mt-2 text-sm text-gray-500">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </div>
            </div>
          </div>

          {
    /* Right Column - Comments */
  }
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Detailed Feedback
            </label>
            <textarea
    placeholder="Share your experience with this trainer..."
    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
    rows={8}
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    maxLength={500}
  />
            <div className="text-right text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </div>
          </div>
        </div>

        {
    /* Form Actions */
  }
        <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-4">
          <button
    onClick={() => {
      setEditId(null);
      setTrainerName("");
      setSelectedTrainer("");
      setCourseName("");
      setRating(0);
      setComment("");
    }}
    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
  >
            {editId ? "Cancel Edit" : "Reset Form"}
          </button>
          <button
    onClick={handleSubmit}
    disabled={!isFormValid || loading}
    className={`px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${!isFormValid || loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
  >
            {loading ? <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </> : <>
                <Send className="h-5 w-5" />
                {editId ? "Update Review" : "Submit Review"}
              </>}
          </button>
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
export default PersonalTrainerReview;
