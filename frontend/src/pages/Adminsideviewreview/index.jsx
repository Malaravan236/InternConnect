import { useState, useEffect } from "react";
import { Star, Search, BarChart2, Filter } from "lucide-react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "../../api/firestore";
const AdminTrainerReviews = () => {
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrainer, setFilterTrainer] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterRating, setFilterRating] = useState(null);
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  useEffect(() => {
    const reviewsCollection = collection(db, "trainerReviews");
    const q = query(reviewsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          trainerName: doc.data().trainerName,
          courseName: doc.data().courseName,
          studentName: doc.data().studentName,
          rating: doc.data().rating,
          comment: doc.data().comment,
          createdAt: doc.data().createdAt?.toDate() || /* @__PURE__ */ new Date()
        }));
        setAllReviews(reviewsData);
        setFilteredReviews(reviewsData);
        const trainers = [...new Set(reviewsData.map((r) => r.trainerName))];
        const courses = [...new Set(reviewsData.map((r) => r.courseName))];
        setAvailableTrainers(trainers);
        setAvailableCourses(courses);
      },
      (error) => {
        console.error("Error fetching reviews: ", error);
      }
    );
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    let results = allReviews;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (review) => review.trainerName.toLowerCase().includes(term) || review.courseName.toLowerCase().includes(term) || review.studentName.toLowerCase().includes(term) || review.comment.toLowerCase().includes(term)
      );
    }
    if (filterTrainer) {
      results = results.filter((review) => review.trainerName === filterTrainer);
    }
    if (filterCourse) {
      results = results.filter((review) => review.courseName === filterCourse);
    }
    if (filterRating !== null) {
      results = results.filter((review) => review.rating === filterRating);
    }
    setFilteredReviews(results);
  }, [searchTerm, filterTrainer, filterCourse, filterRating, allReviews]);
  const calculateStats = () => {
    if (allReviews.length === 0) return null;
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const trainerStats = allReviews.reduce((acc, review) => {
      if (!acc[review.trainerName]) {
        acc[review.trainerName] = { total: 0, sum: 0, courses: [] };
      }
      acc[review.trainerName].total++;
      acc[review.trainerName].sum += review.rating;
      if (!acc[review.trainerName].courses.includes(review.courseName)) {
        acc[review.trainerName].courses.push(review.courseName);
      }
      return acc;
    }, {});
    const courseStats = allReviews.reduce((acc, review) => {
      if (!acc[review.courseName]) {
        acc[review.courseName] = { total: 0, sum: 0, trainers: [] };
      }
      acc[review.courseName].total++;
      acc[review.courseName].sum += review.rating;
      if (!acc[review.courseName].trainers.includes(review.trainerName)) {
        acc[review.courseName].trainers.push(review.trainerName);
      }
      return acc;
    }, {});
    return {
      totalReviews,
      averageRating,
      trainerStats,
      courseStats
    };
  };
  const stats = calculateStats();
  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => <Star
      key={i}
      size={16}
      className={i < count ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
    />);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setFilterTrainer("");
    setFilterCourse("");
    setFilterRating(null);
  };
  return <div className="max-w-7xl mx-auto p-8  mb-20 mt-20 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl  mb-6 text-center  text-emerald-800">
        Trainer Reviews Dashboard
      </h2>

      {
    /* Statistics Section */
  }
      {stats && <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <BarChart2 className="mr-2" /> Overall Statistics
            </h3>
            <div className="space-y-2">
              <p>Total Reviews: <span className="font-bold">{stats.totalReviews}</span></p>
              <p>Average Rating: 
                <span className="font-bold ml-2">
                  {stats.averageRating.toFixed(1)}/5
                </span>
                <span className="ml-2 inline-flex">
                  {renderStars(Math.round(stats.averageRating))}
                </span>
              </p>
              <p>Unique Trainers: <span className="font-bold">{Object.keys(stats.trainerStats).length}</span></p>
              <p>Unique Courses: <span className="font-bold">{Object.keys(stats.courseStats).length}</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-lg mb-2">Top Trainers</h3>
            {Object.entries(stats.trainerStats).sort((a, b) => b[1].sum / b[1].total - a[1].sum / a[1].total).slice(0, 3).map(([trainer, data]) => <div key={trainer} className="mb-3">
                  <div className="font-medium">{trainer}</div>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(Math.round(data.sum / data.total))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({(data.sum / data.total).toFixed(1)} from {data.total} reviews)
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Courses: {data.courses.join(", ")}
                  </div>
                </div>)}
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-lg mb-2">Top Courses</h3>
            {Object.entries(stats.courseStats).sort((a, b) => b[1].sum / b[1].total - a[1].sum / a[1].total).slice(0, 3).map(([course, data]) => <div key={course} className="mb-3">
                  <div className="font-medium">{course}</div>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(Math.round(data.sum / data.total))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({(data.sum / data.total).toFixed(1)} from {data.total} reviews)
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Trainers: {data.trainers.join(", ")}
                  </div>
                </div>)}
          </div>
        </div>}

      {
    /* Filters Section */
  }
      <div className="mb-6 bg-white p-4 rounded-md shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center">
            <Filter className="mr-2" size={18} /> Filters
          </h3>
          <button
    onClick={resetFilters}
    className="text-sm text-blue-600 hover:text-blue-800"
  >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
    type="text"
    placeholder="Search reviews..."
    className="pl-10 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
            <select
    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={filterTrainer}
    onChange={(e) => setFilterTrainer(e.target.value)}
  >
              <option value="">All Trainers</option>
              {availableTrainers.map((trainer) => <option key={trainer} value={trainer}>
                  {trainer}
                </option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={filterCourse}
    onChange={(e) => setFilterCourse(e.target.value)}
  >
              <option value="">All Courses</option>
              {availableCourses.map((course) => <option key={course} value={course}>
                  {course}
                </option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={filterRating || ""}
    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
  >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((num) => <option key={num} value={num}>
                  {num} Star{num !== 1 ? "s" : ""}
                </option>)}
            </select>
          </div>
        </div>
      </div>

      {
    /* Reviews List */
  }
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">
            {filteredReviews.length} Review{filteredReviews.length !== 1 ? "s" : ""} Found
          </h3>
          {filteredReviews.length > 0 && <div className="text-sm text-gray-500">
              Showing {Math.min(filteredReviews.length, 10)} of {filteredReviews.length}
            </div>}
        </div>

        {filteredReviews.length > 0 ? <div className="space-y-4">
            {filteredReviews.slice(0, 10).map((review) => <div
    key={review.id}
    className="border p-4 rounded shadow bg-white"
  >
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-lg">{review.trainerName}</h3>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-1">
                  Course: <span className="font-medium">{review.courseName}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Student: <span className="font-medium">{review.studentName}</span>
                </p>
                <p className="mb-2 mt-3 p-2 bg-gray-50 rounded border-l-4 border-blue-300">
                  {review.comment}
                </p>
                <div className="text-sm text-gray-500 text-right">
                  {review.createdAt.toLocaleDateString()} at {review.createdAt.toLocaleTimeString()}
                </div>
              </div>)}
          </div> : <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow border">
            <p className="mb-2 text-lg">
              No reviews found matching your criteria
            </p>
            <p className="text-sm">
              Try adjusting your filters or search term
            </p>
          </div>}
      </div>
    </div>;
};
export default AdminTrainerReviews;
