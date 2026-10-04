import { useState } from "react";
import { X, Check, Loader2, Calendar, MapPin, DollarSign, Briefcase, Image as ImageIcon } from "lucide-react";
import { addDoc, collection } from "../../api/firestore";
import { db, storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "../../api/storage";
export default function InternshipRegistrationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    internshipTitle: "",
    description: "",
    requiredSkills: [""],
    numberOfPositions: "",
    department: "",
    eligibilityCriteria: "",
    startDate: "",
    endDate: "",
    duration: "",
    workHours: "",
    locationType: "onsite",
    city: "",
    state: "",
    address: "",
    isPaid: false,
    stipendAmount: "",
    paymentMode: "",
    applicationStartDate: "",
    applicationDeadline: "",
    coordinatorName: "",
    coordinatorEmail: "",
    coordinatorPhone: "",
    requireResume: true,
    internshipImage: null,
    internshipImageUrl: "",
    imageSource: "upload"
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const departmentOptions = ["CSE", "ECE", "EEE", "ME", "CE", "IT", "Other"];
  const durationOptions = ["1 month", "2 months", "3 months", "4 months", "5 months", "6 months", "6+ months"];
  const paymentModeOptions = ["Bank Transfer", "UPI", "Cheque", "Cash", "Other"];
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? e.target.checked : void 0;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, internshipImage: file }));
    }
  };
  const handleArrayItemChange = (index, value) => {
    setFormData((prev) => {
      const newSkills = [...prev.requiredSkills];
      newSkills[index] = value;
      return { ...prev, requiredSkills: newSkills };
    });
  };
  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, ""]
    }));
  };
  const removeSkill = (index) => {
    setFormData((prev) => {
      const newSkills = [...prev.requiredSkills];
      newSkills.splice(index, 1);
      return { ...prev, requiredSkills: newSkills };
    });
  };
  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.internshipTitle) newErrors.internshipTitle = "Internship title is required";
      if (!formData.description) newErrors.description = "Description is required";
      if (formData.requiredSkills.some((s) => !s.trim())) {
        newErrors.requiredSkills = "All skills must be filled";
      }
      if (!formData.numberOfPositions) newErrors.numberOfPositions = "Number of positions is required";
      if (!formData.department) newErrors.department = "Department is required";
    }
    if (currentStep === 2) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (!formData.duration) newErrors.duration = "Duration is required";
      if (!formData.workHours) newErrors.workHours = "Working hours are required";
      if (formData.locationType !== "remote" && !formData.city) {
        newErrors.city = "City is required for on-site/hybrid internships";
      }
    }
    if (currentStep === 3) {
      if (formData.isPaid && !formData.stipendAmount) {
        newErrors.stipendAmount = "Stipend amount is required for paid internships";
      }
      if (formData.isPaid && !formData.paymentMode) {
        newErrors.paymentMode = "Payment mode is required for paid internships";
      }
    }
    if (currentStep === 4) {
      if (!formData.applicationStartDate) newErrors.applicationStartDate = "Application start date is required";
      if (!formData.applicationDeadline) newErrors.applicationDeadline = "Application deadline is required";
    }
    if (currentStep === 5) {
      if (!formData.coordinatorName) newErrors.coordinatorName = "Coordinator name is required";
      if (!formData.coordinatorEmail) newErrors.coordinatorEmail = "Coordinator email is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };
  const prevStep = () => {
    setStep((prev) => prev - 1);
  };
  const resetForm = () => {
    setFormData({
      internshipTitle: "",
      description: "",
      requiredSkills: [""],
      numberOfPositions: "",
      department: "",
      eligibilityCriteria: "",
      startDate: "",
      endDate: "",
      duration: "",
      workHours: "",
      locationType: "onsite",
      city: "",
      state: "",
      address: "",
      isPaid: false,
      stipendAmount: "",
      paymentMode: "",
      applicationStartDate: "",
      applicationDeadline: "",
      coordinatorName: "",
      coordinatorEmail: "",
      coordinatorPhone: "",
      requireResume: true,
      internshipImage: null,
      internshipImageUrl: "",
      imageSource: "upload"
    });
    setStep(1);
    setSubmitted(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(step)) {
      setIsSubmitting(true);
      try {
        let imageUrl = "";
        if (formData.imageSource === "upload" && formData.internshipImage) {
          const storageRef = ref(storage, `internship_images/${formData.internshipImage.name}`);
          await uploadBytes(storageRef, formData.internshipImage);
          imageUrl = await getDownloadURL(storageRef);
        } else if (formData.imageSource === "url" && formData.internshipImageUrl) {
          imageUrl = formData.internshipImageUrl;
        }
        await addDoc(collection(db, "internships"), {
          ...formData,
          internshipImageUrl: imageUrl,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          status: "active"
        });
        setIsSubmitting(false);
        setSubmitted(true);
      } catch (error) {
        console.error("Error submitting internship: ", error);
        setIsSubmitting(false);
      }
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 pt-20 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 relative">
        <button
    onClick={onClose}
    className="absolute top-4 right-4 text-white hover:text-white z-10"
  >
          <X size={20} />
        </button>
        
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-6 px-8 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">Post an Internship Opportunity</h2>
          <p className="text-emerald-100 mt-2">
            Fill out the form to list your internship opportunity
          </p>
          
          {!submitted && <div className="flex justify-between mt-6 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-white bg-opacity-30 -translate-y-1/2" />
              
              {[
    { step: 1, icon: Briefcase, label: "Details" },
    { step: 2, icon: Calendar, label: "Timing" },
    { step: 3, icon: DollarSign, label: "Stipend" },
    { step: 4, icon: Calendar, label: "Application" },
    { step: 5, icon: MapPin, label: "Contact" }
  ].map(({ step: stepNum, icon: Icon, label }) => <div key={stepNum} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${step === stepNum ? "bg-white text-emerald-700" : step > stepNum ? "bg-emerald-300 text-white" : "bg-white bg-opacity-30 text-white"}`}>
                    {step > stepNum ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <span className={`text-xs mt-2 font-medium 
                    ${step >= stepNum ? "text-white" : "text-emerald-100"}`}>
                    {label}
                  </span>
                </div>)}
            </div>}
        </div>
        
        <div className="p-6">
          {submitted ? <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Internship Posted Successfully!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your internship opportunity has been registered and will be visible to students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
    onClick={onClose}
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg"
  >
                  Close
                </button>
                <button
    onClick={resetForm}
    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg"
  >
                  Post Another Internship
                </button>
              </div>
            </div> : <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-4 -mr-4">
              {step === 1 && <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Briefcase size={20} className="text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-800">Basic Internship Details</h3>
                  </div>
                  
                  {
    /* Internship Image Upload */
  }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internship Image
                    </label>
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
    type="radio"
    name="imageSource"
    value="upload"
    checked={formData.imageSource === "upload"}
    onChange={handleChange}
    className="sr-only"
  />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${formData.imageSource === "upload" ? "border-emerald-600" : "border-gray-300"}`}>
                            {formData.imageSource === "upload" && <div className="w-3 h-3 rounded-full bg-emerald-600" />}
                          </div>
                          <span>Upload Image</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
    type="radio"
    name="imageSource"
    value="url"
    checked={formData.imageSource === "url"}
    onChange={handleChange}
    className="sr-only"
  />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${formData.imageSource === "url" ? "border-emerald-600" : "border-gray-300"}`}>
                            {formData.imageSource === "url" && <div className="w-3 h-3 rounded-full bg-emerald-600" />}
                          </div>
                          <span>Image URL</span>
                        </label>
                      </div>

                      {formData.imageSource === "upload" ? <div className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <input
    type="file"
    id="internshipImage"
    name="internshipImage"
    accept="image/*"
    onChange={handleFileChange}
    className="hidden"
  />
                          <label htmlFor="internshipImage" className="flex flex-col items-center justify-center cursor-pointer">
                            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                              {formData.internshipImage ? <img
    src={URL.createObjectURL(formData.internshipImage)}
    alt="Internship preview"
    className="w-full h-full object-cover rounded-lg"
  /> : <div className="flex flex-col items-center text-gray-400">
                                  <ImageIcon size={40} className="mb-2" />
                                  <span>Click to upload image</span>
                                  <span className="text-xs mt-1">Recommended size: 800x400px, JPG/PNG</span>
                                </div>}
                            </div>
                            <span className="text-emerald-600 font-medium">
                              {formData.internshipImage ? formData.internshipImage.name : "No file selected"}
                            </span>
                          </label>
                        </div> : <div>
                          <label htmlFor="internshipImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                          </label>
                          <input
    type="url"
    id="internshipImageUrl"
    name="internshipImageUrl"
    value={formData.internshipImageUrl}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg"
    placeholder="https://example.com/image.jpg"
  />
                          {formData.internshipImageUrl && <div className="mt-2 w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                              <img
    src={formData.internshipImageUrl}
    alt="Preview"
    className="w-full h-full object-cover"
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
                            </div>}
                        </div>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="internshipTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Internship Title*
                    </label>
                    <input
    type="text"
    id="internshipTitle"
    name="internshipTitle"
    value={formData.internshipTitle}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.internshipTitle ? "border-red-500" : "border-gray-300"}`}
    placeholder="e.g. Web Development Intern"
  />
                    {errors.internshipTitle && <p className="text-red-500 text-sm mt-1">{errors.internshipTitle}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Internship Description*
                    </label>
                    <textarea
    id="description"
    name="description"
    value={formData.description}
    onChange={handleChange}
    rows={4}
    className={`w-full p-3 border rounded-lg ${errors.description ? "border-red-500" : "border-gray-300"}`}
    placeholder="Overview of the role, expectations, responsibilities..."
  />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills*
                    </label>
                    {errors.requiredSkills && <p className="text-red-500 text-sm mb-2">{errors.requiredSkills}</p>}
                    
                    {formData.requiredSkills.map((skill, index) => <div key={index} className="flex items-center mb-2">
                        <input
    type="text"
    value={skill}
    onChange={(e) => handleArrayItemChange(index, e.target.value)}
    className="w-full p-3 border border-gray-300 rounded-lg"
    placeholder={`Skill ${index + 1}`}
  />
                        {formData.requiredSkills.length > 1 && <button
    type="button"
    onClick={() => removeSkill(index)}
    className="ml-2 text-red-500 hover:text-red-700"
  >
                            <X size={20} />
                          </button>}
                      </div>)}
                    
                    <button
    type="button"
    onClick={addSkill}
    className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium mt-2"
  >
                      <span className="mr-1">+</span> Add Skill
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="numberOfPositions" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Positions*
                      </label>
                      <input
    type="number"
    id="numberOfPositions"
    name="numberOfPositions"
    value={formData.numberOfPositions}
    onChange={handleChange}
    min="1"
    className={`w-full p-3 border rounded-lg ${errors.numberOfPositions ? "border-red-500" : "border-gray-300"}`}
    placeholder="How many students can be selected"
  />
                      {errors.numberOfPositions && <p className="text-red-500 text-sm mt-1">{errors.numberOfPositions}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department*
                      </label>
                      <select
    id="department"
    name="department"
    value={formData.department}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.department ? "border-red-500" : "border-gray-300"}`}
  >
                        <option value="">Select Department</option>
                        {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="eligibilityCriteria" className="block text-sm font-medium text-gray-700 mb-1">
                      Eligibility Criteria
                    </label>
                    <input
    type="text"
    id="eligibilityCriteria"
    name="eligibilityCriteria"
    value={formData.eligibilityCriteria}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg"
    placeholder="e.g. CGPA > 7, Year: 3rd or Final"
  />
                  </div>
                </div>}
              
             
               {step === 2 && <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Calendar size={20} className="text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-800">Duration & Timing</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date*
                      </label>
                      <input
    type="date"
    id="startDate"
    name="startDate"
    value={formData.startDate}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.startDate ? "border-red-500" : "border-gray-300"}`}
  />
                      {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date*
                      </label>
                      <input
    type="date"
    id="endDate"
    name="endDate"
    value={formData.endDate}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.endDate ? "border-red-500" : "border-gray-300"}`}
  />
                      {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Duration*
                      </label>
                      <select
    id="duration"
    name="duration"
    value={formData.duration}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.duration ? "border-red-500" : "border-gray-300"}`}
  >
                        <option value="">Select Duration</option>
                        {durationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="workHours" className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours / Schedule*
                      </label>
                      <input
    type="text"
    id="workHours"
    name="workHours"
    value={formData.workHours}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.workHours ? "border-red-500" : "border-gray-300"}`}
    placeholder="e.g. 9 AM - 5 PM, flexible, part-time"
  />
                      {errors.workHours && <p className="text-red-500 text-sm mt-1">{errors.workHours}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Internship*</label>
                    <div className="flex space-x-4">
                      {["onsite", "remote", "hybrid"].map((type) => <label key={type} className="flex items-center cursor-pointer">
                          <input
    type="radio"
    name="locationType"
    value={type}
    checked={formData.locationType === type}
    onChange={handleChange}
    className="sr-only"
  />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${formData.locationType === type ? "border-emerald-600" : "border-gray-300"}`}>
                            {formData.locationType === type && <div className="w-3 h-3 rounded-full bg-emerald-600" />}
                          </div>
                          <span className="capitalize">{type}</span>
                        </label>)}
                    </div>
                  </div>
                  
                  {(formData.locationType === "onsite" || formData.locationType === "hybrid") && <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City*
                        </label>
                        <input
    type="text"
    id="city"
    name="city"
    value={formData.city}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.city ? "border-red-500" : "border-gray-300"}`}
    placeholder="City"
  />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
    type="text"
    id="state"
    name="state"
    value={formData.state}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg"
    placeholder="State"
  />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address (Optional)
                        </label>
                        <input
    type="text"
    id="address"
    name="address"
    value={formData.address}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg"
    placeholder="Full address"
  />
                      </div>
                    </div>}
                </div>}
              
              {
    /* Step 3: Stipend Details */
  }
              {step === 3 && <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <DollarSign size={20} className="text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-800">Stipend Details</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Is this a paid internship?*</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
    type="radio"
    name="isPaid"
    checked={formData.isPaid}
    onChange={() => setFormData((prev) => ({ ...prev, isPaid: true }))}
    className="sr-only"
  />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${formData.isPaid ? "border-emerald-600" : "border-gray-300"}`}>
                          {formData.isPaid && <div className="w-3 h-3 rounded-full bg-emerald-600" />}
                        </div>
                        <span>Paid</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
    type="radio"
    name="isPaid"
    checked={!formData.isPaid}
    onChange={() => setFormData((prev) => ({ ...prev, isPaid: false }))}
    className="sr-only"
  />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${!formData.isPaid ? "border-emerald-600" : "border-gray-300"}`}>
                          {!formData.isPaid && <div className="w-3 h-3 rounded-full bg-emerald-600" />}
                        </div>
                        <span>Unpaid</span>
                      </label>
                    </div>
                  </div>
                  
                  {formData.isPaid && <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="stipendAmount" className="block text-sm font-medium text-gray-700 mb-1">
                          Stipend Amount*
                        </label>
                        <input
    type="text"
    id="stipendAmount"
    name="stipendAmount"
    value={formData.stipendAmount}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.stipendAmount ? "border-red-500" : "border-gray-300"}`}
    placeholder="e.g. ₹5000/month"
  />
                        {errors.stipendAmount && <p className="text-red-500 text-sm mt-1">{errors.stipendAmount}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Mode*
                        </label>
                        <select
    id="paymentMode"
    name="paymentMode"
    value={formData.paymentMode}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.paymentMode ? "border-red-500" : "border-gray-300"}`}
  >
                          <option value="">Select Payment Mode</option>
                          {paymentModeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        {errors.paymentMode && <p className="text-red-500 text-sm mt-1">{errors.paymentMode}</p>}
                      </div>
                    </div>}
                </div>}
              
              {
    /* Step 4: Application Timeline */
  }
              {step === 4 && <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Calendar size={20} className="text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-800">Application Timeline</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="applicationStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Application Start Date*
                      </label>
                      <input
    type="date"
    id="applicationStartDate"
    name="applicationStartDate"
    value={formData.applicationStartDate}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.applicationStartDate ? "border-red-500" : "border-gray-300"}`}
  />
                      {errors.applicationStartDate && <p className="text-red-500 text-sm mt-1">{errors.applicationStartDate}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                        Application Deadline*
                      </label>
                      <input
    type="date"
    id="applicationDeadline"
    name="applicationDeadline"
    value={formData.applicationDeadline}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.applicationDeadline ? "border-red-500" : "border-gray-300"}`}
  />
                      {errors.applicationDeadline && <p className="text-red-500 text-sm mt-1">{errors.applicationDeadline}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
    type="checkbox"
    name="requireResume"
    checked={formData.requireResume}
    onChange={handleChange}
    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mr-2"
  />
                      <span className="text-sm font-medium text-gray-700">
                        Require resume submission from applicants
                      </span>
                    </label>
                  </div>
                </div>}
              
              {
    /* Step 5: Contact Information */
  }
              {step === 5 && <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <MapPin size={20} className="text-emerald-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="coordinatorName" className="block text-sm font-medium text-gray-700 mb-1">
                        Internship Coordinator Name*
                      </label>
                      <input
    type="text"
    id="coordinatorName"
    name="coordinatorName"
    value={formData.coordinatorName}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.coordinatorName ? "border-red-500" : "border-gray-300"}`}
    placeholder="Full name"
  />
                      {errors.coordinatorName && <p className="text-red-500 text-sm mt-1">{errors.coordinatorName}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="coordinatorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email*
                      </label>
                      <input
    type="email"
    id="coordinatorEmail"
    name="coordinatorEmail"
    value={formData.coordinatorEmail}
    onChange={handleChange}
    className={`w-full p-3 border rounded-lg ${errors.coordinatorEmail ? "border-red-500" : "border-gray-300"}`}
    placeholder="Email address"
  />
                      {errors.coordinatorEmail && <p className="text-red-500 text-sm mt-1">{errors.coordinatorEmail}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="coordinatorPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
    type="tel"
    id="coordinatorPhone"
    name="coordinatorPhone"
    value={formData.coordinatorPhone}
    onChange={handleChange}
    className="w-full p-3 border border-gray-300 rounded-lg"
    placeholder="Phone number"
  />
                    </div>
                  </div>
                </div>} 

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {step > 1 ? <button
    type="button"
    onClick={prevStep}
    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
  >
                    Back
                  </button> : <div />}
                
                {step < 5 ? <button
    type="button"
    onClick={nextStep}
    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
  >
                    Continue
                  </button> : <button
    type="submit"
    disabled={isSubmitting}
    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-70 flex items-center"
  >
                    {isSubmitting ? <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Processing...
                      </> : "Submit Internship"}
                  </button>}
              </div>
            </form>}
        </div>
      </div>
    </div>;
}
