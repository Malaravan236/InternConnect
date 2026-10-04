import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faArrowUp,
  faBuilding,
  faBrain,
  faUsers,
  faChartLine,
  faShieldAlt,
  faRocket,
  faArrowRight,
  faTimes,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
const InternConnect = () => {
  const [, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your application! We will contact you soon.");
    setIsModalOpen(false);
    e.currentTarget.reset();
  };
  return <>
      <header
    id="header"
    className={`fixed w-full z-40 bg-gray-900 transition-all duration-300 mt-16 ${isHeaderScrolled ? "shadow-md py-2" : "py-4"}`}
  >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center" role="navigation">
            {
    /* Desktop and Mobile Menu */
  }
            <ul className="flex items-center space-x-8 lg:space-x-12">
              <li>
                <a
    onClick={() => scrollToSection("features")}
    className="text-white hover:text-emerald-600 cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg"
  >
                  Features
                </a>
              </li>
              <li>
                <a
    onClick={() => scrollToSection("process")}
    className="text-white hover:text-emerald-600 cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg"
  >
                  How It Works
                </a>
              </li>
              <li>
                <a
    onClick={() => scrollToSection("testimonials")}
    className="text-white hover:text-emerald-600 cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg"
  >
                  Success Stories
                </a>
              </li>
              <li>
                <a
    onClick={() => scrollToSection("program")}
    className="text-white hover:text-emerald-600 cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg"
  >
                  Program
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {
    /* Hero Section */
  }
      <section id="home" className="relative pt-32 pb-20 bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden">
        {
    /* Background Image with Opacity */
  }
        <div className="absolute inset-0  bg-cover bg-[url('https://www.bmwgroup.jobs/de/en/students/internship/_jcr_content/main/layoutcontainer_1033875394/combimodule_copy/columncontrolparsys/combiimage_copy-0b67abe5-1839b8a5.coreimg.jpeg/1741770724777/bmw-careers-students-international-internship.jpeg')] bg-center opacity-30" />

        {
    /* Foreground Content */
  }
        <div className="relative z-10">
          <div className="container mx-auto px-4 mt-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Launch Your Career with <span className="text-emerald-700">Premium Internships</span>
              </h1>
              <p className="text-lg text-black mb-8">
                Connect with top companies and gain valuable experience that will set you apart in the job market.
                Our platform matches students with opportunities that align with their skills and career goals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">


                <button
    onClick={() => navigate("/available-internships")}
    style={{
      backgroundColor: "#3b82f6",
      color: "white",
      padding: "0.75rem 2rem",
      borderRadius: "0.5rem",
      transition: "background-color 0.3s ease"
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
  >
                  Available Internships
                </button>
                <button
    onClick={() => scrollToSection("program")}
    className="border-2 border-black text-primary hover:bg-green-700 hover:text-white hover:border-none px-8 py-3 rounded-lg transition-colors duration-300"
  >
                  Learn More
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-gray-900">Partner Companies</div>
                </div>
                <div className="bg-white/80 p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
                  <div className="text-gray-900">Successful Placements</div>
                </div>
                <div className="bg-white/80 p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-primary mb-2">92%</div>
                  <div className="text-gray-900">Job Offer Rate</div>
                </div>
              </div>

            </div>
          </div>
          <div className="flex justify-center mt-16">
            <button
    onClick={() => scrollToSection("features")}
    className="flex flex-col items-center text-black animate-bounce"
  >
              <FontAwesomeIcon icon={faChevronDown} />
              <span className="mt-2 text-sm text-black">Scroll Down</span>
            </button>
          </div>
        </div>
      </section>

      {
    /* Features Section */
  }
      <section id="features" className="py-10 md:py-12 bg-gradient-to-br  relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative">
          {
    /* Abstract decorative elements */
  }
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300 opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-10 rounded-full transform -translate-x-1/4 translate-y-1/4" />

          {
    /* Section Header */
  }
          <div className="text-center mb-16 md:mb-20 relative z-10">
            <div className="inline-block px-4 py-1 bg-emerald-600 rounded-full text-white font-medium mb-3 tracking-wider uppercase text-xs sm:text-sm">
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
              Features That Set Us <span className="text-emerald-600">Apart</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Our platform offers unique advantages designed to help you succeed in today's competitive job market.
            </p>
            <div className="w-24 h-1 bg-emerald-700 mx-auto mt-6 md:mt-8" />
          </div>

          {
    /* Features Grid */
  }
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-20 relative z-10">
            {
    /* Card 1 */
  }
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Enterprise Network Access</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Connect directly with Fortune 500 companies and industry-leading organizations through our exclusive partnership network.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300 group text-sm sm:text-base">
                Explore Network
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {
    /* Card 2 */
  }
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faBrain} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">AI-Powered Matching</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Advanced machine learning algorithms analyze your profile to deliver precisely matched opportunities aligned with your career trajectory.
              </p>
              <a href="#" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors duration-300 group text-sm sm:text-base">
                Learn More
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {
    /* Card 3 */
  }
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Executive Mentorship</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Gain insights from C-suite executives and industry veterans through our structured mentorship program designed for career acceleration.
              </p>
              <a href="#" className="inline-flex items-center text-cyan-600 font-semibold hover:text-cyan-700 transition-colors duration-300 group text-sm sm:text-base">
                Join Program
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {
    /* Card 4 */
  }
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Skills Intelligence</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Access data-driven insights on market trends and skill demands to strategically develop competencies employers value most.
              </p>
              <a href="#" className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-300 group text-sm sm:text-base">
                View Analytics
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {
    /* Card 5 */
  }
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Performance Tracking</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Comprehensive performance monitoring and feedback systems ensure continuous improvement and measurable career growth.
              </p>
              <a href="#" className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors duration-300 group text-sm sm:text-base">
                Track Progress
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {
    /* Card 6 */
  }
            <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faRocket} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Career Acceleration</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Strategic career planning and placement services with a proven track record of successful transitions to leadership roles.
              </p>
              <a href="#" className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors duration-300 group text-sm sm:text-base">
                Get Started
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>

         
        </div>
      </section>

      {
    /* Testimonials Section */
  }
      <section id="testimonials" className="py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-emerald-900 font-medium mb-3 tracking-wider uppercase text-sm">Success Stories</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our <span className="text-emerald-600">Interns Say</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from students who transformed their careers through our internship program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-6 italic">
                "InternConnect helped me land an internship at my dream tech company. The mentorship
                and interview prep were game-changers for my career!"
              </p>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
    src="https://img.freepik.com/free-photo/indian-business-man-reading-using-smart-phone-office_231208-2569.jpg"
    alt="Sarah Johnson"
    className="w-full h-full object-cover"
  />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">Software Engineering Intern at TechGiant</p>
                </div>
              </div>
              <div className="flex text-yellow-400">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-6 italic">
                "The personalized matching actually works! I was paired with a finance internship that
                perfectly aligned with my career goals and interests."
              </p>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
    src="https://www.vivertourism.com/images/Cool-look-boy-image-for-whatsapp-dp-7.jpg"
    alt="Michael Chen"
    className="w-full h-full object-cover"
  />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800">Michael Chen</h4>
                  <p className="text-gray-600 text-sm">Investment Banking Intern at GlobalFinance</p>
                </div>
              </div>
              <div className="flex text-yellow-400">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} className="text-yellow-200" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-6 italic">
                "The skills workshops prepared me for challenges I faced during my internship.
                My manager was impressed with how quickly I adapted!"
              </p>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
    src="https://static.vecteezy.com/system/resources/thumbnails/038/962/461/small/ai-generated-caucasian-successful-confident-young-businesswoman-ceo-boss-bank-employee-worker-manager-with-arms-crossed-in-formal-wear-isolated-in-white-background-photo.jpg"
    alt="Jessica Patel"
    className="w-full h-full object-cover"
  />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800">Jessica Patel</h4>
                  <p className="text-gray-600 text-sm">Marketing Intern at BrandInnovate</p>
                </div>
              </div>
              <div className="flex text-yellow-400">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {
    /* Program Highlights */
  }
      <section id="program" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {
    /* Image Column */
  }
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {
    /* Decorative elements */
  }
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />

                {
    /* Main image container */
  }
                <div className="relative h-80 lg:h-96 overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 to-blue-600/80 mix-blend-multiply" />
                  <img
    src="https://dpscriz4jc899.cloudfront.net/wp-content/uploads/2020/08/5-Steps-to-Engage-Your-Alumni-Interns.jpg"
    alt="Interns collaborating"
    className="w-full h-full object-cover"
  />

                  {
    /* Floating badge */
  }
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                    <span className="text-primary font-bold">500+ Placements</span>
                  </div>
                </div>
              </div>
            </div>

            {
    /* Content Column */
  }
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="inline-block px-4 py-1 bg-emerald-800 text-white font-semibold rounded-full mb-3">Program Highlights</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Makes Our <span className='text-emerald-800'>Internships Special</span></h2>
              <p className="text-gray-600 mb-8 text-lg">
                Our comprehensive program is designed to provide you with more than just work experience.
                We focus on building your career foundation with real-world skills.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-10">
                {
    /* Feature Items - First Column */
  }
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Competitive Pay</h3>
                      <p className="text-gray-600 text-sm">Paid internships with industry-standard compensation</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Flexible Format</h3>
                      <p className="text-gray-600 text-sm">Remote and in-person opportunities available</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Learning Curriculum</h3>
                      <p className="text-gray-600 text-sm">Structured educational components alongside work</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Regular Feedback</h3>
                      <p className="text-gray-600 text-sm">1-on-1 sessions with experienced supervisors</p>
                    </div>
                  </div>
                </div>

                {
    /* Feature Items - Second Column */
  }
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Professional Networking</h3>
                      <p className="text-gray-600 text-sm">Events with industry leaders and professionals</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Resume Projects</h3>
                      <p className="text-gray-600 text-sm">Build your portfolio with measurable results</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Career Support</h3>
                      <p className="text-gray-600 text-sm">Post-internship guidance and job placement</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Mentorship</h3>
                      <p className="text-gray-600 text-sm">One-on-one guidance from industry experts</p>
                    </div>
                  </div>
                </div>
              </div>

              {
    /* CTA Button */
  }
              <div className="flex flex-col sm:flex-row gap-4">
                <button
    onClick={() => navigate("/available-internships")}
    className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 font-bold text-lg flex items-center justify-center"
  >
                  Apply Now
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>


              </div>
            </div>
          </div>
        </div>
      </section>



      {
    /* Back to Top Button */
  }
      {showBackToTop && <button
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className="fixed bottom-8 right-8 bg-gray-700 hover:bg-primary-dark text-white p-3 rounded-full shadow-lg transition-colors duration-300"
  >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>}

      {
    /* Application Modal */
  }
      {isModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 lg:w-1/3 p-6 relative">
            <button
    onClick={() => setIsModalOpen(false)}
    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
  >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Apply Now</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
    type="text"
    placeholder="Full Name"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
    required
  />
                <input
    type="email"
    placeholder="Email Address"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
    required
  />
                <input
    type="tel"
    placeholder="Phone Number"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
    required
  />
                <textarea
    placeholder="Tell us about yourself and your career goals..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
    rows={4}
    required
  />
                <button
    type="submit"
    className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors duration-300"
  >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>}
    </>;
};
export default InternConnect;
