import { useState, useEffect } from "react";
import {
  User,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Loader2,
  Link as LinkIcon
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, where, query } from "../../api/firestore";
import { request } from "../../api/client";
import { db } from "../../firebase/firebaseConfig";
export default function InternshipApplicationAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        let applicationsQuery = collection(db, "applications");
        if (filter !== "all") {
          applicationsQuery = query(applicationsQuery, where("status", "==", filter));
        }
        const querySnapshot = await getDocs(applicationsQuery);
        const applicationsData = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data(),
          date: doc2.data().submittedAt?.toDate() || /* @__PURE__ */ new Date()
        }));
        applicationsData.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
        setApplications(applicationsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
        setLoading(false);
      }
    };
    fetchApplications();
  }, [filter]);
  const handleStatusChange = async (applicationId, newStatus) => {
    setProcessingId(applicationId);
    try {
      const applicationRef = doc(db, "applications", applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        statusUpdatedAt: /* @__PURE__ */ new Date()
      });
      if (newStatus === "accepted" || newStatus === "rejected") {
        const target = applications.find((a) => a.id === applicationId);
        const to = target?.email || target?.userEmail;
        if (to) {
          request("POST", "/email/acceptance/", {
            body: { to, name: target.fullName || target.name, internshipTitle: target.internshipTitle, status: newStatus },
          }).catch((e) => console.warn("Email not sent:", e.message));
        }
      }
      setApplications(applications.map(
        (app) => app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      setProcessingId(null);
    } catch (err) {
      console.error(`Error updating application status:`, err);
      alert(`Failed to ${newStatus} application. Please try again.`);
      setProcessingId(null);
    }
  };
  const handleDownloadResume = (driveLink) => {
    if (!driveLink) {
      alert("No resume link available");
      return;
    }
    window.open(driveLink, "_blank");
  };
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return app.fullName?.toLowerCase().includes(searchLower) || app.email?.toLowerCase().includes(searchLower) || app.internshipTitle?.toLowerCase().includes(searchLower) || app.college?.toLowerCase().includes(searchLower);
  });
  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
    /* Filter */
  }
          <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
  >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
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
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internship
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{application.internshipTitle}</div>
                      <div className="text-sm text-gray-500">{application.college}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${application.status === "accepted" ? "bg-green-100 text-green-800" : application.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {application.status === "pending" ? "Pending" : application.status === "accepted" ? "Accepted" : application.status === "rejected" ? "Rejected" : "Unknown"}
                      </span>
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
    /* Applicant Details */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Applicant Information</h3>
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
                                    <p className="font-medium">{application.phone || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">College/University</p>
                                    <p className="font-medium">{application.college || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Course/Program</p>
                                    <p className="font-medium">{application.course || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Graduation Year</p>
                                    <p className="font-medium">{application.graduationYear || "N/A"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {
    /* Cover Letter */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Cover Letter</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="whitespace-pre-line">{application.coverLetter}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {
    /* Resume */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Resume</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {application.resumeDriveLink ? <div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <LinkIcon size={20} className="text-blue-500 mr-2" />
                                        <span className="text-sm text-blue-600 break-all">
                                          Google Drive Link
                                        </span>
                                      </div>
                                      <button
    onClick={() => handleDownloadResume(application.resumeDriveLink)}
    className="flex items-center text-emerald-600 hover:text-emerald-800"
  >
                                        <Download size={18} className="mr-1" />
                                        <span className="text-sm">Open</span>
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      Click "Open" to view the resume in Google Drive
                                    </p>
                                  </div> : <p className="text-gray-500 italic">No resume link provided</p>}
                              </div>
                            </div>
                            
                            {
    /* Application Status */
  }
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Status</h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                {application.status === "pending" ? <div className="space-y-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                      This application is awaiting your review. Please accept or reject the application.
                                    </p>
                                    <div className="flex justify-between">
                                      <button
    onClick={() => handleStatusChange(application.id, "rejected")}
    disabled={processingId === application.id}
    className="flex items-center px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
  >
                                        {processingId === application.id ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                                        Reject
                                      </button>
                                      <button
    onClick={() => handleStatusChange(application.id, "accepted")}
    disabled={processingId === application.id}
    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
  >
                                        {processingId === application.id ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                                        Accept
                                      </button>
                                    </div>
                                  </div> : <div>
                                    <div className={`flex items-center ${application.status === "accepted" ? "text-green-600" : "text-red-600"}`}>
                                      {application.status === "accepted" ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
                                      <span className="font-medium">{application.status === "accepted" ? "Accepted" : "Rejected"}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                      Status updated: {formatDate(application.statusUpdatedAt)}
                                    </p>
                                  </div>}
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
    </div>;
}
