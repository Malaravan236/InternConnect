import { lazy } from "react";
const Home = lazy(() => import("../pages/HomePage"));
const Login = lazy(() => import("../pages/LoginPage"));
const SignUp = lazy(() => import("../pages/SignUp"));
const Profile = lazy(() => import("../pages/Profile"));
const Applicationform = lazy(() => import("../pages/Applicationform"));
const NotificationManager = lazy(() => import("../pages/NotificationManager"));
const StudentReview = lazy(() => import("../pages/Studentreview"));
const Adminsideviewreview = lazy(() => import("../pages/Adminsideviewreview"));
const StudentInternApplication = lazy(() => import("../pages/StudentInternApplication"));
const AvailableInterns = lazy(() => import("../pages/AvailableInterns"));
const InternshipRequest = lazy(() => import("../pages/InternshipRequest"));
const UpdateIntern = lazy(() => import("../pages/UpdateIntern"));
const AdminSideCertificatesUpload = lazy(() => import("../pages/AdminSideCertificatesUpload"));
const StudentSideViewCertificate = lazy(() => import("../pages/StudentSideViewCertificate"));
const InternAcceptedStudent = lazy(() => import("../pages/InternAcceptedStudent"));
export const navigationRouts = [
  {
    name: "Home",
    path: "/",
    component: <Home />
  },
  {
    name: "Login",
    path: "/login",
    component: <Login />
  },
  {
    name: "SignUp",
    path: "/signup",
    component: <SignUp />
  },
  {
    name: "Profile",
    path: "/profile",
    component: <Profile />
  },
  {
    name: "Applicationform",
    path: "/applicationform",
    component: <Applicationform isOpen={false} onClose={function() {
      throw new Error("Function not implemented.");
    }} />
  },
  {
    name: "NotificationManager",
    path: "/notificationmanager",
    component: <NotificationManager />
  },
  {
    name: "StudentReview",
    path: "/studentreview",
    component: <StudentReview />
  },
  {
    name: "Adminsideviewreview",
    path: "/adminsideviewreview",
    component: <Adminsideviewreview />
  },
  {
    name: "StudentInternApplication",
    path: "/studentinternapplication",
    component: <StudentInternApplication isModalOpen={false} setIsModalOpen={function() {
      throw new Error("Function not implemented.");
    }} internshipId={""} />
  },
  {
    name: "AvailableInterns",
    path: "/available-internships",
    component: <AvailableInterns />
  },
  {
    name: "InternshipRequest",
    path: "/internship-request",
    component: <InternshipRequest />
  },
  {
    name: "UpdateIntern",
    path: "/updateintern",
    component: <UpdateIntern />
  },
  {
    name: "AdminSideCertificatesUpload",
    path: "/adminsidecertificateupload",
    component: <AdminSideCertificatesUpload />
  },
  {
    name: "StudentSideViewCertificate",
    path: "/certificate",
    component: <StudentSideViewCertificate />
  },
  {
    name: "InternAcceptedStudent",
    path: "/internacceptedstudent",
    component: <InternAcceptedStudent />
  }
];
export default {
  navigationRouts
};
