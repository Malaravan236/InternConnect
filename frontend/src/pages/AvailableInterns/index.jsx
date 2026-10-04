import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  X,
  Check,
  Loader2,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  FileText,
  AlertCircle
} from "lucide-react";
import { collection, getDocs, addDoc } from "../../api/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
export default function InternshipListings() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [expandedInternshipId, setExpandedInternshipId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    graduationYear: "",
    coverLetter: "",
    resumeDriveLink: "",
    agreeToTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
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
        setFormData((prev) => ({
          ...prev,
          fullName: userData.username || userData.displayName || "",
          email: userData.email || ""
        }));
      } catch (error2) {
        console.error("Error parsing user data:", error2);
        setStudentInfo({
          id: "unknown",
          name: "Anonymous",
          email: "No email"
        });
      }
    }
  }, []);
  const fetchInternships = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "internships"));
      const internshipsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      const activeInternships = internshipsData.filter((internship) => internship.isActive);
      setInternships(activeInternships);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Failed to load internships. Please try again later.");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInternships();
  }, []);
  const toggleInternshipDetails = (internshipId) => {
    setExpandedInternshipId((prev) => prev === internshipId ? null : internshipId);
  };
  const handleApply = (internship) => {
    if (!studentInfo) {
      setShowLoginAlert(true);
      return;
    }
    setSelectedInternship(internship);
    setShowApplyForm(true);
    setFormData({
      fullName: studentInfo.name,
      email: studentInfo.email,
      phone: "",
      college: "",
      course: "",
      graduationYear: "",
      coverLetter: "",
      resumeDriveLink: "",
      agreeToTerms: false
    });
    setFormErrors({});
    setSubmitted(false);
  };
  const closeApplyForm = () => {
    setShowApplyForm(false);
    setSelectedInternship(null);
  };
  const closeLoginAlert = () => {
    setShowLoginAlert(false);
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? e.target.checked : void 0;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.college.trim()) newErrors.college = "College/University name is required";
    if (!formData.course.trim()) newErrors.course = "Course/Program is required";
    if (!formData.graduationYear.trim()) newErrors.graduationYear = "Graduation year is required";
    if (!formData.coverLetter.trim()) newErrors.coverLetter = "Cover letter is required";
    if (!formData.resumeDriveLink.trim()) {
      newErrors.resumeDriveLink = "Google Drive link is required";
    } else if (!formData.resumeDriveLink.includes("drive.google.com")) {
      newErrors.resumeDriveLink = "Please provide a valid Google Drive link";
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        internshipId: selectedInternship?.id,
        internshipTitle: selectedInternship?.internshipTitle,
        ...formData,
        studentId: studentInfo?.id,
        submittedAt: /* @__PURE__ */ new Date(),
        status: "pending",
        internshipStatus: "not started",
        startDate: selectedInternship?.startDate || "",
        endDate: selectedInternship?.endDate || "",
        duration: selectedInternship?.duration || "",
        mentor: "Not assigned"
      });
      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      setFormErrors((prev) => ({ ...prev, submit: "Failed to submit application. Please try again." }));
      setSubmitting(false);
    }
  };
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600 text-lg">Loading internships...</span>
      </div>;
  }
  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        <p>{error}</p>
        <button
      onClick={fetchInternships}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
          Try Again
        </button>
      </div>;
  }
  return <div className="container mx-auto py-8 px-4">
     <h1 className="text-2xl  text-emerald-800 mb-8 mt-20 text-center font-inter">
  Discover Impactful Internship Roles
</h1>

      {internships.length === 0 ? <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">No internships available at the moment.</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => <div
    key={internship.id}
    className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col transition-all duration-200 ${expandedInternshipId === internship.id ? "ring-2 ring-emerald-500" : "hover:shadow-lg"}`}
  >
              {
    /* Internship Image */
  }
              <div
    className="h-48 bg-gray-200 cursor-pointer"
    onClick={() => toggleInternshipDetails(internship.id)}
  >
                {internship.internshipImageUrl ? <img
    src={internship.internshipImageUrl}
    alt={internship.internshipTitle}
    className="w-full h-full object-cover"
  /> : <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                    <Briefcase size={48} className="text-emerald-300" />
                  </div>}
              </div>
              
              {
    /* Internship Content */
  }
              <div
    className="p-6 flex-grow cursor-pointer"
    onClick={() => toggleInternshipDetails(internship.id)}
  >
                <div className="mb-2 flex items-center">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full mr-2
                    ${internship.locationType === "remote" ? "bg-blue-100 text-blue-800" : internship.locationType === "onsite" ? "bg-orange-100 text-orange-800" : "bg-purple-100 text-purple-800"}
                  `}>
                    {internship.locationType.charAt(0).toUpperCase() + internship.locationType.slice(1)}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {internship.department}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">{internship.internshipTitle}</h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{internship.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 text-emerald-600" />
                    <span>Duration: {internship.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={16} className="mr-2 text-emerald-600" />
                    <span>{internship.isPaid ? `Stipend: ${internship.stipendAmount}` : "Unpaid Internship"}</span>
                    {internship.isPaid && internship.paymentMode && <span className="ml-1">({internship.paymentMode})</span>}
                  </div>
                </div>
                
                {
    /* Expand/Collapse button */
  }
                <div className="flex items-center text-emerald-600 text-sm font-medium">
                  {expandedInternshipId === internship.id ? <>
                      <ChevronUp size={16} className="mr-1" />
                      <span>Show Less</span>
                    </> : <>
                      <ChevronDown size={16} className="mr-1" />
                      <span>Show More</span>
                    </>}
                </div>
                
                {
    /* Expanded details - only shown when expanded */
  }
                {expandedInternshipId === internship.id && <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="space-y-4">
                      {
    /* Schedule */
  }
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={16} className="mr-2 text-emerald-600" />
                            <span>Dates: {formatDate(internship.startDate)} - {formatDate(internship.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={16} className="mr-2 text-emerald-600" />
                            <span>Work Hours: {internship.workHours}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={16} className="mr-2 text-emerald-600" />
                            <span>Application Period: {formatDate(internship.applicationStartDate)} - {formatDate(internship.applicationDeadline)}</span>
                          </div>
                        </div>
                      </div>

                      {
    /* Location */
  }
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Location</h3>
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin size={16} className="mr-2 text-emerald-600 mt-0.5" />
                          <div>
                            <p>
                              {internship.locationType === "remote" ? "Remote" : internship.locationType === "onsite" ? `${internship.city}, ${internship.state}` : "Hybrid"}
                            </p>
                            {internship.address && internship.locationType !== "remote" && <p className="mt-1">{internship.address}</p>}
                          </div>
                        </div>
                      </div>

                      {
    /* Requirements */
  }
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Requirements</h3>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Eligibility Criteria:</p>
                            <p>{internship.eligibilityCriteria || "Not specified"}</p>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Positions Available: {internship.numberOfPositions}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-800 mb-1">Required Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {internship.requiredSkills.map((skill, index) => <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                                  {skill}
                                </span>)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {
    /* Coordinator */
  }
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Coordinator</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Name:</span>
                            <span>{internship.coordinatorName}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-emerald-600" />
                            <span>{internship.coordinatorEmail}</span>
                          </div>
                          {internship.coordinatorPhone && <div className="flex items-center">
                              <Phone size={16} className="mr-2 text-emerald-600" />
                              <span>{internship.coordinatorPhone}</span>
                            </div>}
                        </div>
                      </div>

                      {
    /* Application Info */
  }
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Application</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText size={16} className="mr-2 text-emerald-600" />
                          <span>Resume Required: {internship.requireResume ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>}
              </div>
              
              {
    /* Apply Button - separate from the clickable card */
  }
              <div className="px-6 pb-6" onClick={(e) => e.stopPropagation()}>
                <button
    onClick={() => handleApply(internship)}
    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
  >
                  Apply Now
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Deadline: {formatDate(internship.applicationDeadline)}
                </p>
              </div>
            </div>)}
        </div>}
      
      {
    /* Application Modal */
  }
      {showApplyForm && selectedInternship && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 relative mt-20">
            <button
    onClick={closeApplyForm}
    className="absolute top-4 right-4 text-white hover:text-white z-10"
  >
              <X size={24} />
            </button>
            
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-6 px-8 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Apply for Internship</h2>
              <p className="text-emerald-100 mt-2">
                {selectedInternship.internshipTitle}
              </p>
            </div>
            
            <div className="p-6">
              {submitted ? <div className="text-center py-12">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Application Submitted!</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your application has been successfully submitted. We'll review it and get back to you soon.
                  </p>
                  <button
    onClick={closeApplyForm}
    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg"
  >
                    Close
                  </button>
                </div> : <form onSubmit={handleSubmit} className="space-y-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name*
                      </label>
                      <input
    type="text"
    id="fullName"
    name="fullName"
    value={formData.fullName}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${formErrors.fullName ? "border-red-500" : "border-gray-300"}`}
    placeholder="Your full name"
  />
                      {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address*
                      </label>
                      <input
    type="email"
    id="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
    placeholder="Your email address"
  />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number*
                      </label>
                      <input
    type="tel"
    id="phone"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${formErrors.phone ? "border-red-500" : "border-gray-300"}`}
    placeholder="Your phone number"
  />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                        College/University*
                      </label>
                      <input
    type="text"
    id="college"
    name="college"
    value={formData.college}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${formErrors.college ? "border-red-500" : "border-gray-300"}`}
    placeholder="Your college/university name"
  />
                      {formErrors.college && <p className="text-red-500 text-sm mt-1">{formErrors.college}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                        Course/Program*
                      </label>
                      <input
    type="text"
    id="course"
    name="course"
    value={formData.course}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${formErrors.course ? "border-red-500" : "border-gray-300"}`}
    placeholder="e.g. B.Tech Computer Science"
  />
                      {formErrors.course && <p className="text-red-500 text-sm mt-1">{formErrors.course}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year*
                      </label>
                      <select
    id="graduationYear"
    name="graduationYear"
    value={formData.graduationYear}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${formErrors.graduationYear ? "border-red-500" : "border-gray-300"}`}
  >
                        <option value="">Select Year</option>
                        {[2023, 2024, 2025, 2026, 2027, 2028].map((year) => <option key={year} value={year}>{year}</option>)}
                      </select>
                      {formErrors.graduationYear && <p className="text-red-500 text-sm mt-1">{formErrors.graduationYear}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter / Statement of Interest*
                    </label>
                    <textarea
    id="coverLetter"
    name="coverLetter"
    value={formData.coverLetter}
    onChange={handleChange}
    rows={4}
    className={`w-full p-3 border rounded-lg ${formErrors.coverLetter ? "border-red-500" : "border-gray-300"}`}
    placeholder="Explain why you're interested in this internship and why you would be a good fit"
  />
                    {formErrors.coverLetter && <p className="text-red-500 text-sm mt-1">{formErrors.coverLetter}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="resumeDriveLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Resume/CV Google Drive Link*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon size={16} className="text-gray-400" />
                      </div>
                      <input
    type="url"
    id="resumeDriveLink"
    name="resumeDriveLink"
    value={formData.resumeDriveLink}
    onChange={handleChange}
    className={`w-full pl-10 p-3 border rounded-lg ${formErrors.resumeDriveLink ? "border-red-500" : "border-gray-300"}`}
    placeholder="https://drive.google.com/your-resume-link"
  />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Please upload your resume to Google Drive and share the link (make sure the link is accessible)
                    </p>
                    {formErrors.resumeDriveLink && <p className="text-red-500 text-sm mt-1">{formErrors.resumeDriveLink}</p>}
                  </div>
                  
                  <div>
                    <label className="flex items-start cursor-pointer">
                      <input
    type="checkbox"
    name="agreeToTerms"
    checked={formData.agreeToTerms}
    onChange={handleChange}
    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mr-2 mt-1"
  />
                      <span className="text-sm text-gray-700">
                        I agree to the terms and conditions and consent to the processing of my personal data for the internship application process.
                      </span>
                    </label>
                    {formErrors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{formErrors.agreeToTerms}</p>}
                  </div>
                  
                  {formErrors.submit && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                      {formErrors.submit}
                    </div>}
                  
                  <div className="flex justify-end pt-4">
                    <button
    type="button"
    onClick={closeApplyForm}
    className="px-6 py-3 mr-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
  >
                      Cancel
                    </button>
                    <button
    type="submit"
    disabled={submitting}
    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-70 flex items-center"
  >
                      {submitting ? <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Submitting...
                        </> : "Submit Application"}
                    </button>
                  </div>
                </form>}
            </div>
          </div>
        </div>}

      {
    /* Login Required Modal */
  }
      {showLoginAlert && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to apply for internships.</p>
            <div className="flex justify-center gap-4">
              <button
    onClick={closeLoginAlert}
    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
  >
                Cancel
              </button>
              <button
    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
    onClick={() => navigate("/login")}
  >
                Sign In
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
