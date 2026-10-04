import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Search,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Save,
  ChevronLeft
} from "lucide-react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "../../api/firestore";
import { db } from "../../firebase/firebaseConfig";
const departmentOptions = ["CSE", "ECE", "EEE", "ME", "CE", "IT", "Other"];
const durationOptions = ["1 month", "2 months", "3 months", "4 months", "5 months", "6 months", "6+ months"];
const paymentModeOptions = ["Bank Transfer", "UPI", "Cheque", "Cash", "Other"];
const locationTypeOptions = ["onsite", "remote", "hybrid"];
export default function InternshipListingsAdmin() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedInternship, setExpandedInternship] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingInternship, setEditingInternship] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const fetchInternships = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "internships"));
      const internshipsData = querySnapshot.docs.map((doc2) => {
        const data = doc2.data();
        return {
          id: doc2.id,
          ...data,
          createdAt: data.createdAt?.toDate() || /* @__PURE__ */ new Date(),
          updatedAt: data.updatedAt?.toDate() || /* @__PURE__ */ new Date()
        };
      });
      setInternships(internshipsData);
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
  const toggleInternshipStatus = async (internshipId, currentStatus) => {
    setProcessingId(internshipId);
    try {
      const internshipRef = doc(db, "internships", internshipId);
      await updateDoc(internshipRef, {
        isActive: !currentStatus,
        updatedAt: /* @__PURE__ */ new Date()
      });
      setInternships(internships.map(
        (internship) => internship.id === internshipId ? {
          ...internship,
          isActive: !currentStatus,
          updatedAt: /* @__PURE__ */ new Date()
        } : internship
      ));
      setProcessingId(null);
    } catch (err) {
      console.error("Error updating internship status:", err);
      setError("Failed to update internship status.");
      setProcessingId(null);
    }
  };
  const handleDeleteInternship = async (internshipId) => {
    if (!window.confirm("Are you sure you want to delete this internship? This action cannot be undone.")) {
      return;
    }
    setProcessingId(internshipId);
    try {
      await deleteDoc(doc(db, "internships", internshipId));
      setInternships(internships.filter((internship) => internship.id !== internshipId));
      setProcessingId(null);
    } catch (err) {
      console.error("Error deleting internship:", err);
      setError("Failed to delete internship.");
      setProcessingId(null);
    }
  };
  const startEditing = (internship) => {
    setEditingInternship(internship);
    setEditFormData({ ...internship });
    setExpandedInternship(internship.id);
  };
  const cancelEditing = () => {
    setEditingInternship(null);
    setEditFormData({});
  };
  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? e.target.checked : void 0;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleArrayChange = (field, index, value) => {
    setEditFormData((prev) => {
      if (field !== "requiredSkills") {
        console.error(`Field ${field} is not an array`);
        return prev;
      }
      const currentArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
      currentArray[index] = value;
      return {
        ...prev,
        [field]: currentArray
      };
    });
  };
  const addSkill = () => {
    setEditFormData((prev) => {
      const currentSkills = [...prev.requiredSkills || []];
      return { ...prev, requiredSkills: [...currentSkills, ""] };
    });
  };
  const removeSkill = (index) => {
    setEditFormData((prev) => {
      const currentSkills = [...prev.requiredSkills || []];
      currentSkills.splice(index, 1);
      return { ...prev, requiredSkills: currentSkills };
    });
  };
  const saveEditedInternship = async () => {
    if (!editingInternship) return;
    setProcessingId(editingInternship.id);
    try {
      const internshipRef = doc(db, "internships", editingInternship.id);
      await updateDoc(internshipRef, {
        ...editFormData,
        updatedAt: /* @__PURE__ */ new Date()
      });
      setInternships(internships.map(
        (internship) => internship.id === editingInternship.id ? {
          ...internship,
          ...editFormData,
          updatedAt: /* @__PURE__ */ new Date()
        } : internship
      ));
      setEditingInternship(null);
      setEditFormData({});
      setProcessingId(null);
    } catch (err) {
      console.error("Error updating internship:", err);
      setError("Failed to update internship.");
      setProcessingId(null);
    }
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not specified";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Not specified";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const filteredInternships = internships.filter((internship) => {
    if (statusFilter === "active" && !internship.isActive) return false;
    if (statusFilter === "inactive" && internship.isActive) return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return internship.internshipTitle.toLowerCase().includes(searchLower) || internship.department.toLowerCase().includes(searchLower) || internship.description.toLowerCase().includes(searchLower) || internship.coordinatorName && internship.coordinatorName.toLowerCase().includes(searchLower) || internship.requiredSkills.some((skill) => skill.toLowerCase().includes(searchLower));
  });
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600 text-lg">Loading internships...</span>
      </div>;
  }
  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center max-w-md mx-auto">
        <p className="text-lg">{error}</p>
        <button
      onClick={fetchInternships}
      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg"
    >
          Try Again
        </button>
      </div>;
  }
  return <div className="container mx-auto py-6 mt-10 px-2 sm:py-6 sm:px-4 lg:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-8 sm:mt-12">
        <h1 className="text-1xl sm:text-2xl font-bold text-emerald-800">Manage Internships</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {
    /* Search */
  }
          <div className="relative flex-1 min-w-[200px]">
            <input
    type="text"
    placeholder="Search internships..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg w-full text-base sm:text-lg"
  />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {
    /* Status Filter */
  }
          <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-base sm:text-lg"
  >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {filteredInternships.length === 0 ? <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <p className="text-gray-600 text-lg sm:text-xl">No internships found.</p>
        </div> : <div className="bg-white shadow rounded-lg overflow-hidden">
          {
    /* Mobile Cards View */
  }
          <div className="md:hidden space-y-4 p-2 sm:p-4">
            {filteredInternships.map((internship) => <div key={internship.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {internship.internshipImageUrl && <img
    src={internship.internshipImageUrl}
    alt={internship.internshipTitle}
    className="w-12 h-12 rounded-md object-cover"
  />}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{internship.internshipTitle}</h3>
                      <p className="text-sm text-gray-500">{internship.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${internship.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {internship.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-1 text-emerald-600" />
                    <span>{formatDate(internship.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-1 text-emerald-600" />
                    <span>{formatDate(internship.endDate)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <button
    onClick={() => {
      if (expandedInternship === internship.id) {
        setExpandedInternship(null);
      } else {
        setExpandedInternship(internship.id);
      }
    }}
    className="text-emerald-600 hover:text-emerald-900 text-sm flex items-center"
  >
                    {expandedInternship === internship.id ? "Hide Details" : "View Details"}
                    {expandedInternship === internship.id ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                  </button>
                  
                  <div className="flex gap-2">
                    <button
    onClick={() => startEditing(internship)}
    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
  >
                      <Edit size={16} />
                    </button>
                    <button
    onClick={() => handleDeleteInternship(internship.id)}
    disabled={processingId === internship.id}
    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
  >
                      {processingId === internship.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
                
                {
    /* Expanded Mobile View */
  }
                {expandedInternship === internship.id && <div className="mt-4 pt-4 border-t border-gray-200">
                    {editingInternship?.id === internship.id ? <div className="space-y-4">
                        {
    /* Basic Details */
  }
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
    type="text"
    name="internshipTitle"
    value={editFormData.internshipTitle || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
  />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
    name="description"
    value={editFormData.description || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
    rows={3}
  />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select
    name="department"
    value={editFormData.department || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
  >
                            {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
    type="date"
    name="startDate"
    value={editFormData.startDate || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
  />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
    type="date"
    name="endDate"
    value={editFormData.endDate || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
  />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button
    onClick={saveEditedInternship}
    disabled={processingId === internship.id}
    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm"
  >
                            {processingId === internship.id ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                          </button>
                          <button
    onClick={cancelEditing}
    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
  >
                            Cancel
                          </button>
                        </div>
                      </div> : <div className="space-y-4">
                        <div className="text-sm text-gray-700">
                          <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                          <p>{internship.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Duration</h4>
                            <p className="text-sm text-gray-700">{internship.duration}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Positions</h4>
                            <p className="text-sm text-gray-700">{internship.numberOfPositions}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">Work Hours</h4>
                          <div className="flex items-center text-sm text-gray-700">
                            <Clock size={14} className="mr-1 text-emerald-600" />
                            <span>{internship.workHours}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">Location</h4>
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin size={14} className="mr-1 text-emerald-600" />
                            <span>
                              {internship.locationType === "remote" ? "Remote" : internship.locationType === "onsite" ? `${internship.city}, ${internship.state}` : "Hybrid"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-3">
                          <button
    onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
    className={`px-4 py-2 rounded text-sm flex items-center ${internship.isActive ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}
  >
                            {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-1" /> : internship.isActive ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />}
                            {internship.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>}
                  </div>}
              </div>)}
          </div>
          
          {
    /* Desktop Table View */
  }
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Internship
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-sm sm:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInternships.map((internship) => <>
                    <tr key={internship.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {internship.internshipImageUrl && <img
    src={internship.internshipImageUrl}
    alt={internship.internshipTitle}
    className="w-12 h-12 rounded-md object-cover mr-3"
  />}
                          <div>
                            <div className="text-base sm:text-lg font-medium text-gray-900">
                              {editingInternship?.id === internship.id ? <input
    type="text"
    name="internshipTitle"
    value={editFormData.internshipTitle || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
  /> : internship.internshipTitle}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {editingInternship?.id === internship.id ? <textarea
    name="description"
    value={editFormData.description || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
    rows={2}
  /> : internship.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">
                        {editingInternship?.id === internship.id ? <select
    name="department"
    value={editFormData.department || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-base"
  >
                            {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select> : internship.department}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">
                        {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs sm:text-sm leading-4 font-semibold rounded-full ${internship.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {internship.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
                        {editingInternship?.id === internship.id ? <div className="flex justify-end gap-2">
                            <button
    onClick={saveEditedInternship}
    disabled={processingId === internship.id}
    className="text-emerald-600 hover:text-emerald-800 flex items-center text-sm sm:text-base"
  >
                              {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-1" /> : <Save size={16} className="mr-1" />}
                              Save
                            </button>
                            <button
    onClick={cancelEditing}
    className="text-gray-600 hover:text-gray-800 flex items-center text-sm sm:text-base"
  >
                              <ChevronLeft size={16} className="mr-1" />
                              Cancel
                            </button>
                          </div> : <button
    onClick={() => {
      if (expandedInternship === internship.id) {
        setExpandedInternship(null);
      } else {
        setExpandedInternship(internship.id);
      }
    }}
    className="text-emerald-600 hover:text-emerald-900 mr-2 text-sm sm:text-base"
  >
                            {expandedInternship === internship.id ? "Hide" : "Details"}
                            {expandedInternship === internship.id ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />}
                          </button>}
                      </td>
                    </tr>
                    
                    {
    /* Expanded View */
  }
                    {expandedInternship === internship.id && <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-4">
                          {editingInternship?.id === internship.id ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {
    /* Left Column */
  }
                              <div className="space-y-4">
                                {
    /* Basic Details */
  }
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Details</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
                                      <input
    type="text"
    name="eligibilityCriteria"
    value={editFormData.eligibilityCriteria || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Positions</label>
                                      <input
    type="text"
    name="numberOfPositions"
    value={editFormData.numberOfPositions || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                      <select
    name="duration"
    value={editFormData.duration || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  >
                                        {durationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {
    /* Schedule */
  }
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Hours</label>
                                      <input
    type="text"
    name="workHours"
    value={editFormData.workHours || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                                      <select
    name="locationType"
    value={editFormData.locationType || "onsite"}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  >
                                        {locationTypeOptions.map((option) => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
                                      </select>
                                    </div>
                                    {editFormData.locationType !== "remote" && <>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                          <input
    type="text"
    name="city"
    value={editFormData.city || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                          <input
    type="text"
    name="state"
    value={editFormData.state || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                          <input
    type="text"
    name="address"
    value={editFormData.address || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                        </div>
                                      </>}
                                  </div>
                                </div>
                              </div>

                              {
    /* Right Column */
  }
                              <div className="space-y-4">
                                {
    /* Payment Details */
  }
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
                                  <div className="space-y-4">
                                    <div className="flex items-center">
                                      <input
    type="checkbox"
    id="isPaid"
    name="isPaid"
    checked={editFormData.isPaid || false}
    onChange={handleEditChange}
    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
  />
                                      <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                                        Paid Internship
                                      </label>
                                    </div>
                                    {editFormData.isPaid && <>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Stipend Amount</label>
                                          <input
    type="text"
    name="stipendAmount"
    value={editFormData.stipendAmount || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                          <select
    name="paymentMode"
    value={editFormData.paymentMode || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  >
                                            {paymentModeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                          </select>
                                        </div>
                                      </>}
                                  </div>
                                </div>

                                {
    /* Required Skills */
  }
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                                  <div className="space-y-2">
                                    {(editFormData.requiredSkills || []).map((skill, index) => <div key={index} className="flex items-center gap-2">
                                        <input
    type="text"
    value={skill}
    onChange={(e) => handleArrayChange("requiredSkills", index, e.target.value)}
    className="flex-1 p-2 border border-gray-300 rounded text-sm"
  />
                                        <button
    type="button"
    onClick={() => removeSkill(index)}
    className="text-red-500 hover:text-red-700"
  >
                                          <X size={16} />
                                        </button>
                                      </div>)}
                                    <button
    type="button"
    onClick={addSkill}
    className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center"
  >
                                      <Plus size={14} className="mr-1" />
                                      Add Skill
                                    </button>
                                  </div>
                                </div>

                                {
    /* Application Details */
  }
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Application Details</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Start Date</label>
                                      <input
    type="date"
    name="applicationStartDate"
    value={editFormData.applicationStartDate || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                                      <input
    type="date"
    name="applicationDeadline"
    value={editFormData.applicationDeadline || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                    </div>
                                    <div className="flex items-center">
                                      <input
    type="checkbox"
    id="requireResume"
    name="requireResume"
    checked={editFormData.requireResume || false}
    onChange={handleEditChange}
    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
  />
                                      <label htmlFor="requireResume" className="ml-2 block text-sm text-gray-700">
                                        Require Resume
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {
    /* Coordinator Details */
  }
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900 mb-3">Coordinator Details</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                      <input
    type="text"
    name="coordinatorName"
    value={editFormData.coordinatorName || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                    </div>
                                    <div>
                                                                       <input
    type="email"
    name="coordinatorEmail"
    value={editFormData.coordinatorEmail || ""}
    onChange={handleEditChange}
    className="w-full p-3 border border-gray-300 rounded text-lg"
  />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
    type="tel"
    name="coordinatorPhone"
    value={editFormData.coordinatorPhone || ""}
    onChange={handleEditChange}
    className="w-full p-2 border border-gray-300 rounded text-sm"
  />
                                          </div>
                                        </div>
                                      </div>
      
                                      {
    /* Status Management */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Status Management</h3>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm text-gray-600">Created: {formatDateTime(internship.createdAt)}</p>
                                            <p className="text-sm text-gray-600">Last Updated: {formatDateTime(internship.updatedAt)}</p>
                                          </div>
                                          <button
    onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
    disabled={processingId === internship.id}
    className={`px-4 py-2 rounded text-sm flex items-center ${internship.isActive ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}
  >
                                            {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-1" /> : internship.isActive ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />}
                                            {internship.isActive ? "Deactivate" : "Activate"}
                                          </button>
                                        </div>
                                      </div>
      
                                      {
    /* Action Buttons */
  }
                                      <div className="flex justify-end gap-3 pt-4">
                                        <button
    onClick={saveEditedInternship}
    disabled={processingId === internship.id}
    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300"
  >
                                          {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                          Save Changes
                                        </button>
                                        <button
    onClick={cancelEditing}
    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
  >
                                          <X size={16} className="mr-2" />
                                          Cancel
                                        </button>
                                        <button
    onClick={() => handleDeleteInternship(internship.id)}
    disabled={processingId === internship.id}
    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-red-50"
  >
                                          {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {
    /* Left Column */
  }
                                    <div className="space-y-6">
                                      {
    /* Basic Details */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Eligibility Criteria</h4>
                                            <p className="text-sm text-gray-600">{internship.eligibilityCriteria}</p>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Positions</h4>
                                              <p className="text-sm text-gray-600">{internship.numberOfPositions}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                                              <p className="text-sm text-gray-600">{internship.duration}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
      
                                      {
    /* Schedule */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Work Hours</h4>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <Clock size={14} className="mr-1 text-emerald-600" />
                                              <span>{internship.workHours}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Location</h4>
                                            <div className="flex items-center text-sm text-gray-600">
                                              <MapPin size={14} className="mr-1 text-emerald-600" />
                                              <span>
                                                {internship.locationType === "remote" ? "Remote" : internship.locationType === "onsite" ? `${internship.city}, ${internship.state}` : "Hybrid"}
                                                {internship.locationType !== "remote" && internship.address && <span className="block mt-1">{internship.address}</span>}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
      
                                      {
    /* Payment Details */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Payment Status</h4>
                                            <p className="text-sm text-gray-600">
                                              {internship.isPaid ? <span className="flex items-center">
                                                  <DollarSign size={14} className="mr-1 text-emerald-600" />
                                                  Paid - {internship.stipendAmount} ({internship.paymentMode})
                                                </span> : "Unpaid"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
      
                                    {
    /* Right Column */
  }
                                    <div className="space-y-6">
                                      {
    /* Required Skills */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                          {internship.requiredSkills.map((skill, index) => <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                              {skill}
                                            </span>)}
                                        </div>
                                      </div>
      
                                      {
    /* Application Details */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Application Details</h3>
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Start Date</h4>
                                              <p className="text-sm text-gray-600">{formatDate(internship.applicationStartDate)}</p>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Deadline</h4>
                                              <p className="text-sm text-gray-600">{formatDate(internship.applicationDeadline)}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Requirements</h4>
                                            <p className="text-sm text-gray-600">
                                              {internship.requireResume ? "Resume required" : "No resume required"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
      
                                      {
    /* Coordinator Details */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Coordinator Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-700">Name</h4>
                                            <p className="text-sm text-gray-600">{internship.coordinatorName}</p>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Email</h4>
                                              <div className="flex items-center text-sm text-gray-600">
                                                <Mail size={14} className="mr-1 text-emerald-600" />
                                                <a href={`mailto:${internship.coordinatorEmail}`} className="hover:underline">
                                                  {internship.coordinatorEmail}
                                                </a>
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                                              <div className="flex items-center text-sm text-gray-600">
                                                <Phone size={14} className="mr-1 text-emerald-600" />
                                                <a href={`tel:${internship.coordinatorPhone}`} className="hover:underline">
                                                  {internship.coordinatorPhone}
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
      
                                      {
    /* Status Management */
  }
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Status Management</h3>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm text-gray-600">Created: {formatDateTime(internship.createdAt)}</p>
                                            <p className="text-sm text-gray-600">Last Updated: {formatDateTime(internship.updatedAt)}</p>
                                          </div>
                                          <div className="flex gap-3">
                                            <button
    onClick={() => startEditing(internship)}
    className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
  >
                                              <Edit size={16} className="mr-2" />
                                              Edit
                                            </button>
                                            <button
    onClick={() => toggleInternshipStatus(internship.id, internship.isActive)}
    disabled={processingId === internship.id}
    className={`px-4 py-2 rounded text-sm flex items-center ${internship.isActive ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"}`}
  >
                                              {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-1" /> : internship.isActive ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />}
                                              {internship.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
    onClick={() => handleDeleteInternship(internship.id)}
    disabled={processingId === internship.id}
    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-red-50 flex items-center"
  >
                                              {processingId === internship.id ? <Loader2 size={16} className="animate-spin mr-1" /> : <Trash2 size={16} className="mr-1" />}
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>}
                              </td>
                            </tr>}
                        </>)}
                    </tbody>
                  </table>
                </div>
              </div>}
          </div>;
}
