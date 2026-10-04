import { useState, useEffect, useRef } from "react";
import { Upload, User, Check, X, Search, Download, Trash2, ChevronDown, Link } from "lucide-react";
import { db, storage } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  getDocs
} from "../../api/firestore";
import { ref, uploadBytes, getDownloadURL } from "../../api/storage";
import { v4 as uuidv4 } from "uuid";
const CertificateManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const dropdownRef = useRef(null);
  const certificatesCollection = collection(db, "certificates");
  const usersCollection = collection(db, "users");
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(usersCollection);
        const snapshot = await getDocs(q);
        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().email,
          email: doc.data().email
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(certificatesCollection, (snapshot) => {
      const certificatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        studentId: doc.data().studentId,
        studentName: doc.data().studentName,
        certificateUrl: doc.data().certificateUrl,
        certificateName: doc.data().certificateName,
        issuedAt: doc.data().issuedAt?.toDate() || /* @__PURE__ */ new Date(),
        description: doc.data().description || "",
        type: doc.data().type || "upload"
      }));
      setCertificates(certificatesData);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const filteredStudents = students.filter(
    (student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };
  const isValidDriveLink = (link) => {
    return link.includes("drive.google.com") || link.includes("docs.google.com");
  };
  const handleSubmit = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }
    if (uploadMethod === "upload" && !certificateFile) {
      alert("Please select a certificate file");
      return;
    }
    if (uploadMethod === "drive" && (!driveLink || !isValidDriveLink(driveLink))) {
      alert("Please enter a valid Google Drive link");
      return;
    }
    try {
      let certificateUrl = "";
      let certificateName = "";
      if (uploadMethod === "upload" && certificateFile) {
        const fileId = uuidv4();
        const fileExtension = certificateFile.name.split(".").pop();
        const fileName = `certificate_${fileId}.${fileExtension}`;
        const storageRef = ref(storage, `certificates/${fileName}`);
        setUploadProgress(0);
        const uploadTask = uploadBytes(storageRef, certificateFile);
        const interval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);
        await uploadTask;
        clearInterval(interval);
        setUploadProgress(100);
        certificateUrl = await getDownloadURL(storageRef);
        certificateName = certificateFile.name;
      } else if (uploadMethod === "drive") {
        certificateUrl = driveLink;
        certificateName = `Certificate_${selectedStudent.name}`;
      }
      await addDoc(certificatesCollection, {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        certificateUrl,
        certificateName,
        issuedAt: /* @__PURE__ */ new Date(),
        description,
        type: uploadMethod
      });
      setCertificateFile(null);
      setDriveLink("");
      setDescription("");
      setUploadProgress(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3e3);
    } catch (error) {
      console.error("Error uploading certificate:", error);
      alert("Failed to upload certificate");
      setUploadProgress(0);
    }
  };
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return <div className="max-w-8xl mx-auto p-4 pt-20">
      {
    /* Success Notification */
  }
      {showSuccess && <div className="fixed top-6 right-6 bg-white text-emerald-800 px-6 py-3 rounded-lg shadow-lg z-50 border-t-2 border-emerald-500 flex items-center gap-2 animate-slide-in">
          <Check className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">Certificate added successfully!</span>
        </div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {
    /* Left Panel - Upload Form */
  }
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
          <div className="bg-emerald-600 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-xl font-bold">Add Certificate</h3>
            <p className="text-emerald-100 opacity-90">
              Issue certificates to students via upload or Drive link
            </p>
          </div>

          <div className="space-y-4">
            {
    /* Student Selection */
  }
            <div className="relative" ref={dropdownRef}>
              <label className="block text-gray-700 font-medium mb-1">
                Select Student
              </label>
              <div
    className="border border-gray-300 rounded-lg p-3 cursor-pointer flex justify-between items-center"
    onClick={() => setShowDropdown(!showDropdown)}
  >
                {selectedStudent ? <div className="flex items-center gap-2">
                    <User size={18} className="text-emerald-600" />
                    <span>{selectedStudent.name}</span>
                    <span className="text-gray-500 text-sm">
                      ({selectedStudent.email})
                    </span>
                  </div> : <span className="text-gray-400">Search for a student...</span>}
                <ChevronDown
    size={18}
    className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
  />
              </div>

              {showDropdown && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="relative">
                      <Search
    size={18}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  />
                      <input
    type="text"
    placeholder="Search students..."
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
                    </div>
                  </div>
                  {filteredStudents.length > 0 ? filteredStudents.map((student) => <div
    key={student.id}
    className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedStudent?.id === student.id ? "bg-emerald-50" : ""}`}
    onClick={() => {
      setSelectedStudent(student);
      setShowDropdown(false);
    }}
  >
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-full">
                            <User size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </div>) : <div className="p-4 text-center text-gray-500">
                      No students found
                    </div>}
                </div>}
            </div>

            {
    /* Upload Method Selection */
  }
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Certificate Source
              </label>
              <div className="flex gap-4 mb-3">
                <button
    onClick={() => setUploadMethod("upload")}
    className={`flex items-center px-4 py-2 rounded-lg border ${uploadMethod === "upload" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-700"}`}
  >
                  <Upload size={16} className="mr-2" />
                  File Upload
                </button>
                <button
    onClick={() => setUploadMethod("drive")}
    className={`flex items-center px-4 py-2 rounded-lg border ${uploadMethod === "drive" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-700"}`}
  >
                  <Link size={16} className="mr-2" />
                  Google Drive
                </button>
              </div>
            </div>

            {
    /* File Upload or Drive Link */
  }
            {uploadMethod === "upload" ? <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Certificate File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {certificateFile ? <div className="flex flex-col items-center">
                      <div className="bg-emerald-100 p-3 rounded-full mb-3">
                        <Check size={24} className="text-emerald-600" />
                      </div>
                      <p className="font-medium text-gray-800">
                        {certificateFile.name}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        {(certificateFile.size / 1024).toFixed(2)} KB
                      </p>
                      <button
    onClick={() => setCertificateFile(null)}
    className="text-red-500 text-sm flex items-center gap-1"
  >
                        <X size={14} /> Remove file
                      </button>
                    </div> : <label className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <Upload size={24} className="text-gray-500" />
                        </div>
                        <p className="font-medium text-gray-800">
                          Click to upload certificate
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF, JPG, or PNG (max 5MB)
                        </p>
                      </div>
                      <input
    type="file"
    className="hidden"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={handleFileChange}
  />
                    </label>}
                </div>
              </div> : <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Google Drive Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link size={18} className="text-gray-400" />
                  </div>
                  <input
    type="url"
    placeholder="https://drive.google.com/file/d/..."
    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
    value={driveLink}
    onChange={(e) => setDriveLink(e.target.value)}
  />
                </div>
                {driveLink && !isValidDriveLink(driveLink) && <p className="mt-1 text-sm text-red-500">
                    Please enter a valid Google Drive link
                  </p>}
              </div>}

            {
    /* Upload Progress */
  }
            {uploadProgress > 0 && uploadMethod === "upload" && <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
    className="bg-emerald-600 h-2.5 rounded-full"
    style={{ width: `${uploadProgress}%` }}
  />
                </div>
                <p className="text-right text-sm text-gray-500 mt-1">
                  {uploadProgress}% uploaded
                </p>
              </div>}

            {
    /* Description */
  }
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Description (Optional)
              </label>
              <textarea
    placeholder="e.g., 'Certificate of Completion for Web Development Course'"
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-24"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    maxLength={200}
  />
              <div className="text-right text-sm text-gray-500 mt-1">
                {description.length}/200 characters
              </div>
            </div>

            {
    /* Submit Button */
  }
            <div className="pt-4">
              <button
    onClick={handleSubmit}
    disabled={!selectedStudent || uploadMethod === "upload" && !certificateFile || uploadMethod === "drive" && (!driveLink || !isValidDriveLink(driveLink)) || uploadProgress > 0}
    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${!selectedStudent || uploadMethod === "upload" && !certificateFile || uploadMethod === "drive" && (!driveLink || !isValidDriveLink(driveLink)) || uploadProgress > 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
  >
                {uploadMethod === "upload" ? <Upload size={18} className="shrink-0" /> : <Link size={18} className="shrink-0" />}
                {uploadProgress > 0 ? "Processing..." : "Add Certificate"}
              </button>
            </div>
          </div>
        </div>

        {
    /* Right Panel - Certificates List */
  }
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
          <div className="bg-emerald-600 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-xl font-bold">Issued Certificates</h3>
            <p className="text-emerald-100 opacity-90">
              View all certificates issued to students
            </p>
          </div>

          {certificates.length > 0 ? <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {certificates.map((cert) => <div
    key={cert.id}
    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
  >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-emerald-800">
                        {cert.certificateName}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Issued to: {cert.studentName}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cert.type === "upload" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                          {cert.type === "upload" ? "File Upload" : "Google Drive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
    href={cert.certificateUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-emerald-600 hover:text-emerald-800 p-1"
    title={cert.type === "upload" ? "Download" : "View"}
  >
                        {cert.type === "upload" ? <Download size={18} /> : <Link size={18} />}
                      </a>
                      <button
    className="text-red-500 hover:text-red-700 p-1"
    title="Delete"
    onClick={() => {
      alert("Delete functionality would be implemented here");
    }}
  >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {cert.description && <p className="mt-2 text-gray-700 line-clamp-2">
                      {cert.description}
                    </p>}
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                    Issued on: {formatDate(cert.issuedAt)}
                  </div>
                </div>)}
            </div> : <div className="text-center py-8 text-gray-500">
              <div className="max-w-xs mx-auto">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                  <Upload size={36} className="text-gray-400 mx-auto" />
                </div>
                <h4 className="font-medium text-lg mb-1">No certificates yet</h4>
                <p className="text-sm">
                  Add certificates using the form on the left
                </p>
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
export default CertificateManager;
