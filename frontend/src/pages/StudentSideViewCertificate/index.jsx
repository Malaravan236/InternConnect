import { useState, useEffect } from "react";
import { Download, Link, Calendar, User, Eye, X } from "lucide-react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "../../api/firestore";
const UserCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({ uid: user.uid, email: user.email });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, "certificates"),
      where("studentId", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const handleViewCertificate = (cert) => {
    setPreviewCertificate(cert);
  };
  const closePreview = () => {
    setPreviewCertificate(null);
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
            </div>;
  }
  return <div className="min-h-screen w-full mt-20  flex flex-col">
            <main className="flex-grow w-full">
                <div className="w-full h-full pb-2 ">
                    {certificates.length === 0 ? <div className="text-center pt-10 w-full bg-black">
                            <div className="mx-auto w-full h-screen max-w-screen-xl">
                                <div className="w-full h-full">
                                    <svg
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
                                        <style>
                                            {`
                @keyframes float {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
                @keyframes dash {
                  to { stroke-dashoffset: 0; }
                }
                @keyframes rotate {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes appear {
                  0% { opacity: 0; transform: translateY(20px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes grow {
                  0% { transform: scale(0); }
                  70% { transform: scale(1.1); }
                  100% { transform: scale(1); }
                }
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
                .character { animation: float 3s ease-in-out infinite; }
                .road { stroke-dasharray: 10; animation: dash 20s linear infinite; }
                .gear { animation: rotate 8s linear infinite; }
                .gear-inner { animation: rotate 8s linear infinite reverse; }
                .text-appear { opacity: 0; animation: appear 1s forwards; }
                .text-appear-2 { opacity: 0; animation: appear 1s 0.5s forwards; }
                .grow { transform-origin: center; animation: grow 1s forwards; }
                .grow-delay-1 { transform-origin: center; animation: grow 1s 0.2s forwards; }
                .grow-delay-2 { transform-origin: center; animation: grow 1s 0.4s forwards; }
                .glow { animation: blink 2s infinite; }
              `}
                                        </style>
                                        <defs>
                                            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#0f2027" />
                                                <stop offset="50%" stopColor="#203a43" />
                                                <stop offset="100%" stopColor="#2c5364" />
                                            </linearGradient>
                                            <linearGradient id="road-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#4facfe" />
                                                <stop offset="100%" stopColor="#00f2fe" />
                                            </linearGradient>
                                        </defs>
                                        <rect width="100%" height="100%" fill="#000000" rx="10" ry="10" />
                                        <path
    className="road"
    d="M50,320 C120,280 200,350 280,280 S400,230 450,280"
    fill="none"
    stroke="url(#road-grad)"
    strokeWidth="4"
    strokeLinecap="round"
    strokeDasharray="15,15"
  />
                                        <g className="character" transform="translate(80, 290)">
                                            <circle cx="0" cy="0" r="15" fill="#64ffda" />
                                            <rect x="-10" y="-5" width="12" height="15" rx="3" fill="#ff7e5f" />
                                            <circle cx="-5" cy="-2" r="2" fill="#37474F" />
                                            <circle cx="5" cy="-2" r="2" fill="#37474F" />
                                            <path d="M-6,5 C-3,9 3,9 6,5" fill="none" stroke="#37474F" strokeWidth="1.5" strokeLinecap="round" />
                                        </g>
                                        <g transform="translate(420, 260)">
                                            <circle className="glow" cx="0" cy="0" r="25" fill="#4facfe" opacity="0.5" />
                                            <g transform="scale(0.6)">
                                                <rect x="-30" y="-40" width="60" height="80" rx="5" fill="#ffffff" />
                                                <rect x="-20" y="-30" width="40" height="8" rx="2" fill="#4facfe" />
                                                <rect x="-20" y="-15" width="30" height="8" rx="2" fill="#4facfe" />
                                                <rect x="-20" y="0" width="40" height="8" rx="2" fill="#4facfe" />
                                                <rect x="-20" y="15" width="25" height="8" rx="2" fill="#4facfe" />
                                                <circle cx="15" cy="20" r="12" stroke="#FFD700" strokeWidth="2" fill="#FFD700" opacity="0.8" />
                                            </g>
                                        </g>
                                        <g transform="translate(150, 310)">
                                            <circle className="grow" cx="0" cy="0" r="0" fill="#64ffda" />
                                        </g>
                                        <g transform="translate(250, 290)">
                                            <circle className="grow-delay-1" cx="0" cy="0" r="0" fill="#64ffda" />
                                        </g>
                                        <g transform="translate(350, 270)">
                                            <circle className="grow-delay-2" cx="0" cy="0" r="0" fill="#64ffda" />
                                        </g>
                                        <g transform="translate(400, 120)">
                                            <g className="gear">
                                                <circle cx="0" cy="0" r="30" fill="none" stroke="#00f2fe" strokeWidth="3" />
                                                <path
    d="M0,-30 L0,-40 M30,0 L40,0 M0,30 L0,40 M-30,0 L-40,0 M21,-21 L28,-28 M21,21 L28,28 M-21,21 L-28,28 M-21,-21 L-28,-28"
    stroke="#00f2fe"
    strokeWidth="6"
    strokeLinecap="round"
  />
                                            </g>
                                        </g>
                                        <g transform="translate(100, 120)">
                                            <g className="gear-inner">
                                                <circle cx="0" cy="0" r="25" fill="none" stroke="#4facfe" strokeWidth="3" />
                                                <path
    d="M0,-25 L0,-33 M25,0 L33,0 M0,25 L0,33 M-25,0 L-33,0 M18,-18 L24,-24 M18,18 L24,24 M-18,18 L-24,24 M-18,-18 L-24,-24"
    stroke="#4facfe"
    strokeWidth="5"
    strokeLinecap="round"
  />
                                            </g>
                                        </g>
                                        <text className="text-appear" x="250" y="80" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#ffffff" textAnchor="middle">No Certificates Yet</text>
                                        <text className="text-appear-2" x="250" y="115" fontFamily="Arial, sans-serif" fontSize="18" fill="#64ffda" textAnchor="middle">Your learning journey has just begun!</text>
                                        <g transform="translate(130, 180)">
                                            <rect className="grow" x="-15" y="-20" width="30" height="40" rx="3" fill="#ff7e5f" />
                                            <rect className="grow" x="-10" y="-15" width="20" height="5" fill="#ffffff" opacity="0.5" />
                                            <rect className="grow" x="-10" y="-5" width="20" height="5" fill="#ffffff" opacity="0.5" />
                                            <rect className="grow" x="-10" y="5" width="15" height="5" fill="#ffffff" opacity="0.5" />
                                        </g>
                                        <g transform="translate(250, 180)">
                                            <circle className="grow-delay-1" cx="0" cy="0" r="20" fill="#feb47b" />
                                            <path className="grow-delay-1" d="M-10,-5 L5,-5 L5,5 L-10,5 Z M-5,-10 L10,-10 L10,0 L-5,0 Z" fill="#ffffff" opacity="0.6" />
                                        </g>
                                        <g transform="translate(370, 180)">
                                            <polygon className="grow-delay-2" points="0,-20 17,10 -17,10" fill="#4facfe" />
                                            <rect className="grow-delay-2" x="-15" y="10" width="30" height="10" fill="#4facfe" />
                                            <rect className="grow-delay-2" x="-8" y="-5" width="16" height="5" fill="#ffffff" opacity="0.5" />
                                        </g>
                                        <g transform="translate(250, 350)">
                                            <path className="text-appear-2" d="M-70,0 L50,0 L40,-10 M50,0 L40,10" stroke="#64ffda" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                            <text className="text-appear-2" x="0" y="20" fontFamily="Arial, sans-serif" fontSize="14" fill="#ffffff" textAnchor="middle">Keep Learning!</text>
                                            <text className="text-appear-2" x="0" y="60" fontFamily="Arial, sans-serif" fontSize="14" fill="#ffffff" textAnchor="middle">Complete courses to earn your first certificate!</text>
                                        </g>
                                    </svg>
                                </div>

                            </div>
                        </div> : <div className="space-y-6 pl-20 pr-20 pt-10">
                            {certificates.map((cert) => <div key={cert.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800 mb-1">
                                                    {cert.certificateName}
                                                </h2>
                                                <p className="text-gray-600 mb-3">{cert.description}</p>

                                                <div className="flex flex-wrap gap-4 mt-4">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <User size={16} className="mr-2 text-emerald-600" />
                                                        <span>Issued to: {cert.studentName}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Calendar size={16} className="mr-2 text-emerald-600" />
                                                        <span>Issued on: {formatDate(cert.issuedAt)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cert.type === "upload" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                                            {cert.type === "upload" ? "File" : "Google Drive"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
    onClick={() => handleViewCertificate(cert)}
    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
    title="Preview"
  >
                                                    <Eye size={16} />
                                                </button>
                                                <a
    href={cert.certificateUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
  >
                                                    {cert.type === "upload" ? <>
                                                            <Download size={16} className="mr-2" />
                                                            Download
                                                        </> : <>
                                                            <Link size={16} className="mr-2" />
                                                            View on Drive
                                                        </>}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>)}
                        </div>}

                    {
    /* Certificate Preview Modal */
  }
                    {previewCertificate && <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                                <div className="flex justify-between items-center border-b p-4">
                                    <h3 className="text-lg font-medium">{previewCertificate.certificateName}</h3>
                                    <button
    onClick={closePreview}
    className="text-gray-500 hover:text-gray-700"
  >
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-4">
                                    {previewCertificate.type === "upload" ? previewCertificate.certificateUrl.endsWith(".pdf") ? <iframe
    src={previewCertificate.certificateUrl}
    className="w-full h-full min-h-[70vh]"
    frameBorder="0"
  /> : <img
    src={previewCertificate.certificateUrl}
    alt={previewCertificate.certificateName}
    className="max-w-full max-h-[70vh] mx-auto"
  /> : <div className="h-full flex items-center justify-center">
                                            <div className="text-center p-8">
                                                <Link size={48} className="mx-auto text-emerald-600 mb-4" />
                                                <p className="mb-4">This certificate is stored in Google Drive</p>
                                                <a
    href={previewCertificate.certificateUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
  >
                                                    Open in Drive
                                                </a>
                                            </div>
                                        </div>}
                                </div>
                                <div className="border-t p-4 text-sm text-gray-500">
                                    <p>Issued to: {previewCertificate.studentName}</p>
                                    <p>Issued on: {formatDate(previewCertificate.issuedAt)}</p>
                                </div>
                            </div>
                        </div>}
                </div>
            </main>
        </div>;
};
export default UserCertificates;
