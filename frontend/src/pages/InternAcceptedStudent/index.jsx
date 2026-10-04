import { useState, useEffect } from "react";
import {
  User,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  Briefcase,
  Clock as PendingIcon,
  Check as CompletedIcon,
  X as NotCompletedIcon,
  Edit,
  Save,
  X,
  Star
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  where,
  query,
  addDoc,
  deleteDoc
} from "../../api/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
export default function InternshipStudentManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingApplication, setEditingApplication] = useState(null);
  const navigate = useNavigate();
  const [editForm, setEditForm] = useState({});
  const [showWorkAssignmentModal, setShowWorkAssignmentModal] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState("");
  const [currentInternshipId, setCurrentInternshipId] = useState("");
  const [currentInternshipTitle, setCurrentInternshipTitle] = useState("");
  const [workAssignments, setWorkAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const applicationsQuery = query(
          collection(db, "applications"),
          where("status", "==", "accepted")
        );
        const querySnapshot = await getDocs(applicationsQuery);
        const applicationsData = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data(),
          submittedAt: doc2.data().submittedAt?.toDate(),
          statusUpdatedAt: doc2.data().statusUpdatedAt?.toDate(),
          completionDate: doc2.data().completionDate
        }));
        const filteredApplications2 = statusFilter === "all" ? applicationsData : applicationsData.filter((app) => app.internshipStatus === statusFilter);
        setApplications(filteredApplications2);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load application data. Please try again later.");
        setLoading(false);
      }
    };
    fetchApplications();
  }, [statusFilter]);
  const fetchWorkAssignments = async (studentId, internshipId) => {
    setAssignmentLoading(true);
    try {
      const assignmentsQuery = query(
        collection(db, "workAssignments"),
        where("studentId", "==", studentId),
        where("internshipId", "==", internshipId)
      );
      const querySnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
      setWorkAssignments(assignmentsData);
    } catch (err) {
      console.error("Error fetching work assignments:", err);
      alert("Failed to load work assignments");
    } finally {
      setAssignmentLoading(false);
    }
  };
  const openWorkAssignmentModal = (studentId, internshipId, internshipTitle) => {
    setCurrentStudentId(studentId);
    setCurrentInternshipId(internshipId);
    setCurrentInternshipTitle(internshipTitle);
    setCurrentAssignment(null);
    setShowWorkAssignmentModal(true);
    fetchWorkAssignments(studentId, internshipId);
  };
  const saveWorkAssignment = async () => {
    if (!currentAssignment) return;
    try {
      setAssignmentLoading(true);
      const assignmentData = {
        ...currentAssignment,
        studentId: currentStudentId,
        internshipId: currentInternshipId,
        assignedDate: currentAssignment.assignedDate || (/* @__PURE__ */ new Date()).toISOString()
      };
      if (currentAssignment.id) {
        await updateDoc(doc(db, "workAssignments", currentAssignment.id), assignmentData);
        setWorkAssignments(workAssignments.map(
          (a) => a.id === currentAssignment.id ? { ...a, ...assignmentData } : a
        ));
      } else {
        const docRef = await addDoc(collection(db, "workAssignments"), assignmentData);
        setWorkAssignments([...workAssignments, { ...assignmentData, id: docRef.id }]);
      }
      setCurrentAssignment(null);
    } catch (err) {
      console.error("Error saving work assignment:", err);
      alert("Failed to save work assignment");
    } finally {
      setAssignmentLoading(false);
    }
  };
  const deleteWorkAssignment = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      setAssignmentLoading(true);
      await deleteDoc(doc(db, "workAssignments", id));
      setWorkAssignments(workAssignments.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting work assignment:", err);
      alert("Failed to delete work assignment");
    } finally {
      setAssignmentLoading(false);
    }
  };
  const startEditing = (applicationId) => {
    const application = applications.find((app) => app.id === applicationId);
    if (application) {
      setEditingApplication(applicationId);
      setEditForm({
        mentor: application.mentor,
        performanceRating: application.performanceRating,
        notes: application.notes,
        internshipStatus: application.internshipStatus
      });
    }
  };
  const cancelEditing = () => {
    setEditingApplication(null);
    setEditForm({});
  };
  const saveEditing = async (applicationId) => {
    setProcessingId(applicationId);
    try {
      const applicationRef = doc(db, "applications", applicationId);
      const updates = {};
      if (editForm.mentor !== void 0) {
        updates.mentor = editForm.mentor;
      }
      if (editForm.performanceRating !== void 0) {
        updates.performanceRating = editForm.performanceRating;
      }
      if (editForm.notes !== void 0) {
        updates.notes = editForm.notes;
      }
      if (editForm.internshipStatus !== void 0) {
        updates.internshipStatus = editForm.internshipStatus;
        if (editForm.internshipStatus === "completed" || editForm.internshipStatus === "terminated") {
          updates.completionDate = (/* @__PURE__ */ new Date()).toISOString();
        }
      }
      await updateDoc(applicationRef, updates);
      setApplications(applications.map(
        (app) => app.id === applicationId ? {
          ...app,
          ...updates,
          ...editForm.internshipStatus === "completed" || editForm.internshipStatus === "terminated" ? { completionDate: (/* @__PURE__ */ new Date()).toISOString() } : {}
        } : app
      ));
      setEditingApplication(null);
      setEditForm({});
      setProcessingId(null);
    } catch (err) {
      console.error(`Error updating application details:`, err);
      alert(`Failed to save changes. Please try again.`);
      setProcessingId(null);
    }
  };
  const filteredApplications = applications.filter((application) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return application.fullName?.toLowerCase().includes(searchLower) || application.email?.toLowerCase().includes(searchLower) || application.internshipTitle?.toLowerCase().includes(searchLower) || application.college?.toLowerCase().includes(searchLower) || application.mentor?.toLowerCase().includes(searchLower);
  });
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const renderStarRating = (rating, editable, onChange) => {
    return <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => <Star
      key={star}
      size={20}
      onClick={() => editable && onChange && onChange(star)}
      className={`cursor-pointer ${(rating || 0) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
    />)}
        <span className="ml-2 text-sm text-gray-600">{rating || 0}/5</span>
      </div>;
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600 text-lg">Loading applications...</span>
      </div>;
  }
  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        <p>{error}</p>
        <button
      onClick={() => window.location.reload()}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
          Try Again
        </button>
      </div>;
  }
  return <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-16">
        <h1 className="text-2xl  text-emerald-800 mb-4 md:mb-0">Internship Applications</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {
    /* Search */
  }
          <div className="relative">
            <input
    type="text"
    placeholder="Search applications..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
  />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {
    /* Status Filter */
  }
          <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
  >
            <option value="all">All Applications</option>
            <option value="not started">Not Started</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No applications found.</p>
        </div> : <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internship
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internship Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => <>
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                          <div className="text-sm text-gray-500">{application.college}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {application.internshipTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(application.startDate)} - {formatDate(application.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.mentor || "Not assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {application.internshipStatus === "not started" ? <>
                            <PendingIcon size={16} className="text-gray-500 mr-2" />
                            <span className="text-gray-700">Not Started</span>
                          </> : application.internshipStatus === "ongoing" ? <>
                            <PendingIcon size={16} className="text-yellow-500 mr-2" />
                            <span className="text-yellow-700">Ongoing</span>
                          </> : application.internshipStatus === "completed" ? <>
                            <CompletedIcon size={16} className="text-green-500 mr-2" />
                            <span className="text-green-700">Completed</span>
                          </> : <>
                            <NotCompletedIcon size={16} className="text-red-500 mr-2" />
                            <span className="text-red-700">Terminated</span>
                          </>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
    onClick={() => setExpandedApplication(expandedApplication === application.id ? null : application.id)}
    className="text-emerald-600 hover:text-emerald-900 mr-3"
  >
                        {expandedApplication === application.id ? "Hide" : "View"}
                        {expandedApplication === application.id ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />}
                      </button>
                    </td>
                  </tr>

                  {
    /* Expanded View */
  }
                  {expandedApplication === application.id && <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2 space-y-4">
                            {
    /* Student Details */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Student Information</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium">{application.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{application.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{application.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">College/University</p>
                                    <p className="font-medium">{application.college}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Course/Program</p>
                                    <p className="font-medium">{application.course}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Graduation Year</p>
                                    <p className="font-medium">{application.graduationYear}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Application Submitted</p>
                                    <p className="font-medium">{formatDate(application.submittedAt.toString())}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {
    /* Internship Details */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Internship Details</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Title</p>
                                    <p className="font-medium">{application.internshipTitle}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{formatDate(application.startDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">End Date</p>
                                    <p className="font-medium">{formatDate(application.endDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{application.duration}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Status Updated</p>
                                    <p className="font-medium">{formatDate(application.statusUpdatedAt.toString())}</p>
                                  </div>
                                  {application.completionDate && <div>
                                      <p className="text-sm text-gray-500">Completion Date</p>
                                      <p className="font-medium">{formatDate(application.completionDate)}</p>
                                    </div>}
                                </div>
                              </div>
                            </div>

                            {
    /* Performance Notes */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Notes</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {editingApplication === application.id ? <textarea
    value={editForm.notes || ""}
    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded"
    rows={4}
    placeholder="Enter performance notes..."
  /> : application.notes ? <p className="whitespace-pre-line">{application.notes}</p> : <p className="text-gray-500 italic">No performance notes recorded</p>}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {
    /* Mentor Information */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Mentor Information</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {editingApplication === application.id ? <div>
                                    <label className="block text-sm text-gray-500 mb-1">Mentor Name</label>
                                    <input
    type="text"
    value={editForm.mentor || ""}
    onChange={(e) => setEditForm({ ...editForm, mentor: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded"
    placeholder="Enter mentor name"
  />
                                  </div> : <p className="font-medium">{application.mentor || "Not assigned"}</p>}
                              </div>
                            </div>

                            {
    /* Student Performance Rating */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Student Performance Rating</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {editingApplication === application.id ? renderStarRating(
    editForm.performanceRating,
    true,
    (rating) => setEditForm({ ...editForm, performanceRating: rating })
  ) : renderStarRating(application.performanceRating, false)}
                              </div>
                            </div>

                            {
    /* Status Management */
  }
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-900">Internship Status</h3>
                                {editingApplication === application.id ? <div className="flex space-x-2">
                                    <button
    onClick={() => saveEditing(application.id)}
    disabled={processingId === application.id}
    className="text-emerald-600 hover:text-emerald-800"
  >
                                      {processingId === application.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    </button>
                                    <button
    onClick={cancelEditing}
    className="text-red-600 hover:text-red-800"
  >
                                      <X size={18} />
                                    </button>
                                  </div> : <button
    onClick={() => startEditing(application.id)}
    className="text-blue-600 hover:text-blue-800"
  >
                                    <Edit size={18} />
                                  </button>}
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {editingApplication === application.id ? <select
    value={editForm.internshipStatus}
    onChange={(e) => setEditForm({
      ...editForm,
      internshipStatus: e.target.value
    })}
    className="w-full p-2 border border-gray-300 rounded"
  >
                                    <option value="not started">Not Started</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="terminated">Terminated</option>
                                  </select> : application.internshipStatus === "not started" ? <div className="flex items-center text-gray-600">
                                    <PendingIcon size={20} className="mr-2" />
                                    <span className="font-medium">Internship Not Started</span>
                                  </div> : application.internshipStatus === "ongoing" ? <div className="flex items-center text-yellow-600">
                                    <PendingIcon size={20} className="mr-2" />
                                    <span className="font-medium">Internship Ongoing</span>
                                  </div> : <div>
                                    <div className={`flex items-center ${application.internshipStatus === "completed" ? "text-green-600" : "text-red-600"}`}>
                                      {application.internshipStatus === "completed" ? <CompletedIcon size={20} className="mr-2" /> : <NotCompletedIcon size={20} className="mr-2" />}
                                      <span className="font-medium">
                                        {application.internshipStatus === "completed" ? "Completed" : "Terminated"}
                                      </span>
                                    </div>
                                    {application.completionDate && <p className="text-sm text-gray-500 mt-2">
                                        Status updated: {formatDate(application.completionDate)}
                                      </p>}
                                  </div>}
                              </div>
                            </div>

                            {
    /* Quick Actions */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                {
    /* Send Email */
  }
                                <button
    onClick={() => window.location.href = `mailto:${application.email}`}
    className="w-full flex items-center justify-start px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
  >
                                  <Mail size={16} className="mr-2" />
                                  Send Email
                                </button>

                                {
    /* Generate Certificate */
  }
                                <button
    onClick={() => navigate("/adminsidecertificateupload")}
    className="w-full flex items-center justify-start px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded"
  >
                                  <FileText size={16} className="mr-2" />
                                  Generate Certificate
                                </button>

                                {
    /* View Work Assignments */
  }
                                <button
    onClick={() => openWorkAssignmentModal(
      application.studentId,
      application.internshipId,
      application.internshipTitle
    )}
    className="w-full flex items-center justify-start px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded"
  >
                                  <Briefcase size={16} className="mr-2" />
                                  View Work Assignments ({application.internshipTitle})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>}
                </>)}
            </tbody>
          </table>
        </div>}

      {
    /* Work Assignment Modal */
  }
      {showWorkAssignmentModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-emerald-800">
                    Work Assignments for {applications.find((a) => a.studentId === currentStudentId && a.internshipId === currentInternshipId)?.fullName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Internship: {currentInternshipTitle}
                  </p>
                </div>
                <button
    onClick={() => setShowWorkAssignmentModal(false)}
    className="text-gray-500 hover:text-gray-700"
  >
                  <X size={24} />
                </button>
              </div>

              {
    /* Assignment Form */
  }
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-3">
                  {currentAssignment ? "Edit Assignment" : "Add New Assignment"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Title</label>
                    <input
    type="text"
    value={currentAssignment?.title || ""}
    onChange={(e) => setCurrentAssignment({
      ...currentAssignment || {},
      title: e.target.value
    })}
    className="w-full p-2 border border-gray-300 rounded"
    placeholder="Assignment title"
  />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Due Date</label>
                    <input
    type="date"
    value={currentAssignment?.dueDate || ""}
    onChange={(e) => setCurrentAssignment({
      ...currentAssignment || {},
      dueDate: e.target.value
    })}
    className="w-full p-2 border border-gray-300 rounded"
  />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-500 mb-1">Description</label>
                    <textarea
    value={currentAssignment?.description || ""}
    onChange={(e) => setCurrentAssignment({
      ...currentAssignment || {},
      description: e.target.value
    })}
    className="w-full p-2 border border-gray-300 rounded"
    rows={3}
    placeholder="Detailed description of the assignment"
  />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Status</label>
                    <select
    value={currentAssignment?.status || "pending"}
    onChange={(e) => setCurrentAssignment({
      ...currentAssignment || {},
      status: e.target.value
    })}
    className="w-full p-2 border border-gray-300 rounded"
  >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Notes</label>
                    <input
    type="text"
    value={currentAssignment?.notes || ""}
    onChange={(e) => setCurrentAssignment({
      ...currentAssignment || {},
      notes: e.target.value
    })}
    className="w-full p-2 border border-gray-300 rounded"
    placeholder="Additional notes"
  />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  {currentAssignment && <button
    onClick={() => setCurrentAssignment(null)}
    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
  >
                      Cancel
                    </button>}
                  <button
    onClick={saveWorkAssignment}
    disabled={assignmentLoading || !currentAssignment?.title}
    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300"
  >
                    {assignmentLoading ? <Loader2 size={18} className="animate-spin mx-4" /> : currentAssignment?.id ? "Update Assignment" : "Add Assignment"}
                  </button>
                </div>
              </div>

              {
    /* Assignments List */
  }
              <div>
                <h3 className="font-medium mb-3">Current Assignments</h3>
                {assignmentLoading && !workAssignments.length ? <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                  </div> : workAssignments.length === 0 ? <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    No work assignments found for this internship.
                  </div> : <div className="space-y-3">
                    {workAssignments.map((assignment) => <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{assignment.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <span className="text-sm">
                                <span className="text-gray-500">Due:</span> {formatDate(assignment.dueDate)}
                              </span>
                              <span className="text-sm">
                                <span className="text-gray-500">Status:</span> 
                                <span className={`ml-1 ${assignment.status === "completed" ? "text-green-600" : assignment.status === "overdue" ? "text-red-600" : "text-yellow-600"}`}>
                                  {assignment.status}
                                </span>
                              </span>
                              {assignment.completedDate && <span className="text-sm">
                                  <span className="text-gray-500">Completed:</span> {formatDate(assignment.completedDate)}
                                </span>}
                            </div>
                            {assignment.notes && <p className="text-sm text-gray-500 mt-2">
                                <span className="font-medium">Notes:</span> {assignment.notes}
                              </p>}
                          </div>
                          <div className="flex space-x-2">
                            <button
    onClick={() => setCurrentAssignment(assignment)}
    className="text-blue-600 hover:text-blue-800"
  >
                              <Edit size={18} />
                            </button>
                            <button
    onClick={() => assignment.id && deleteWorkAssignment(assignment.id)}
    className="text-red-600 hover:text-red-800"
  >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </div>
            </div>
          </div>
        </div>}
    </div>;
}
