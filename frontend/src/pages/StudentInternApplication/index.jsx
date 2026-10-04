import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperclip, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "../../api/storage";
import { collection, addDoc, serverTimestamp } from "../../api/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "../../api/auth";
const ApplicationModal = ({
  isModalOpen,
  setIsModalOpen,
  internshipId
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    major: "",
    graduationYear: "",
    skills: "",
    experience: "",
    coverLetter: "",
    resumeFile: null,
    resumeUrl: "",
    transcriptFile: null,
    transcriptUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = getAuth();
  const storage = getStorage();
  useEffect(() => {
    if (auth.currentUser?.email) {
      setFormData((prev) => ({
        ...prev,
        email: auth.currentUser?.email || ""
      }));
    }
  }, [auth.currentUser]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [field]: "File size should be less than 5MB" }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [field]: file
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.university.trim()) newErrors.university = "University is required";
    if (!formData.major.trim()) newErrors.major = "Major is required";
    if (!formData.graduationYear) newErrors.graduationYear = "Graduation year is required";
    if (!formData.skills.trim()) newErrors.skills = "Skills are required";
    if (!formData.coverLetter.trim()) newErrors.coverLetter = "Cover letter is required";
    if (!formData.resumeFile && !formData.resumeUrl) newErrors.resumeFile = "Resume is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      let resumeUrl = formData.resumeUrl;
      let transcriptUrl = formData.transcriptUrl;
      if (formData.resumeFile) {
        resumeUrl = await uploadFile(formData.resumeFile, "resumes");
      }
      if (formData.transcriptFile) {
        transcriptUrl = await uploadFile(formData.transcriptFile, "transcripts");
      }
      await addDoc(collection(db, "applications"), {
        internshipId,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        major: formData.major,
        graduationYear: formData.graduationYear,
        skills: formData.skills,
        experience: formData.experience,
        coverLetter: formData.coverLetter,
        resumeUrl,
        transcriptUrl,
        status: "pending",
        appliedAt: serverTimestamp()
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          university: "",
          major: "",
          graduationYear: "",
          skills: "",
          experience: "",
          coverLetter: "",
          resumeFile: null,
          resumeUrl: "",
          transcriptFile: null,
          transcriptUrl: ""
        });
      }, 2e3);
    } catch (error) {
      console.error("Error submitting application:", error);
      setErrors({ submit: "Failed to submit application. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isModalOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
  >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {submitSuccess ? <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
              <p className="text-gray-600 mb-6">Your application has been successfully submitted.</p>
              <button
    type="button"
    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
    onClick={() => setIsModalOpen(false)}
  >
                Close
              </button>
            </div> : <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Apply for Internship</h2>
              <p className="text-gray-600 mb-6">Fill out the form below to submit your application</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && <div className="p-3 bg-red-50 text-red-600 rounded-md">
                    {errors.submit}
                  </div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
    type="text"
    id="fullName"
    name="fullName"
    value={formData.fullName}
    onChange={handleChange}
    className={`w-full px-4 py-2 border ${errors.fullName ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="Your full name"
  />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
    type="email"
    id="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="Your email address"
  />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
    type="tel"
    id="phone"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    className={`w-full px-4 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="Your phone number"
  />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                      University *
                    </label>
                    <input
    type="text"
    id="university"
    name="university"
    value={formData.university}
    onChange={handleChange}
    className={`w-full px-4 py-2 border ${errors.university ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="Your university"
  />
                    {errors.university && <p className="mt-1 text-sm text-red-600">{errors.university}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
                      Major *
                    </label>
                    <input
    type="text"
    id="major"
    name="major"
    value={formData.major}
    onChange={handleChange}
    className={`w-full px-4 py-2 border ${errors.major ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="Your major"
  />
                    {errors.major && <p className="mt-1 text-sm text-red-600">{errors.major}</p>}
                  </div>

                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Graduation Year *
                    </label>
                    <select
    id="graduationYear"
    name="graduationYear"
    value={formData.graduationYear}
    onChange={handleChange}
    className={`w-full px-4 py-2 border ${errors.graduationYear ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
  >
                      <option value="">Select year</option>
                      {Array.from({ length: 5 }, (_, i) => {
    const year = (/* @__PURE__ */ new Date()).getFullYear() + i;
    return <option key={year} value={year}>{year}</option>;
  })}
                    </select>
                    {errors.graduationYear && <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Relevant Skills *
                  </label>
                  <textarea
    id="skills"
    name="skills"
    value={formData.skills}
    onChange={handleChange}
    rows={3}
    className={`w-full px-4 py-2 border ${errors.skills ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="List your relevant skills (separated by commas)"
  />
                  {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Experience
                  </label>
                  <textarea
    id="experience"
    name="experience"
    value={formData.experience}
    onChange={handleChange}
    rows={3}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
    placeholder="Describe your previous work experience or projects"
  />
                </div>

                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter *
                  </label>
                  <textarea
    id="coverLetter"
    name="coverLetter"
    value={formData.coverLetter}
    onChange={handleChange}
    rows={5}
    className={`w-full px-4 py-2 border ${errors.coverLetter ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
    placeholder="Why are you interested in this internship? What makes you a good candidate?"
  />
                  {errors.coverLetter && <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Resume *
                    </label>
                    <div className="flex items-center">
                      <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center">
                          <FontAwesomeIcon icon={faPaperclip} className="text-emerald-600 mb-2" />
                          <p className="text-sm text-gray-600">
                            {formData.resumeFile ? formData.resumeFile.name : "Click to upload resume"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                        </div>
                        <input
    id="resumeFile"
    name="resumeFile"
    type="file"
    accept=".pdf,.doc,.docx"
    onChange={(e) => handleFileChange(e, "resumeFile")}
    className="hidden"
  />
                      </label>
                    </div>
                    {errors.resumeFile && <p className="mt-1 text-sm text-red-600">{errors.resumeFile}</p>}
                  </div>

                  <div>
                    <label htmlFor="transcriptFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Transcript (Optional)
                    </label>
                    <div className="flex items-center">
                      <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center">
                          <FontAwesomeIcon icon={faPaperclip} className="text-emerald-600 mb-2" />
                          <p className="text-sm text-gray-600">
                            {formData.transcriptFile ? formData.transcriptFile.name : "Click to upload transcript"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                        </div>
                        <input
    id="transcriptFile"
    name="transcriptFile"
    type="file"
    accept=".pdf,.doc,.docx"
    onChange={(e) => handleFileChange(e, "transcriptFile")}
    className="hidden"
  />
                      </label>
                    </div>
                    {errors.transcriptFile && <p className="mt-1 text-sm text-red-600">{errors.transcriptFile}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </>}
        </div>
      </div>
    </div>;
};
export default ApplicationModal;
