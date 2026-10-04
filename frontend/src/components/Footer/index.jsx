import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn
} from "@fortawesome/free-brands-svg-icons";
const Footer = () => {
  return <footer className="bg-gray-800  bottom-0 left-0 right-0 text-white py-12">
      {
    /* <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-4"> */
  }
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {
    /* About Section */
  }
          <div>
            <h3 className="text-lg font-bold mb-4">InternConnect</h3>
            <p className="text-gray-400">
              Empowering students to launch their careers through premium internships and personalized support.
            </p>
          </div>

          {
    /* Quick Links Section */
  }
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  Program
                </a>
              </li>
            </ul>
          </div>

          {
    /* Contact Us Section */
  }
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: nxtgenistrumentsind@gmail.com</li>
              <li className="text-gray-400">Phone: +91 88833 63799, 78450 63799</li>
              <li className="text-gray-400">Address: 20/2, Shrijay Apex, Manickam Street, Nalli Hospital Road, Municipal Coloy, ERode - 638004</li>
            </ul>
          </div>

          {
    /* Follow Us Section */
  }
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
    href="https://www.facebook.com/"
    className="text-gray-400 hover:text-primary transition-colors duration-300"
    aria-label="Facebook"
  >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
    href="https://twitter.com/"
    className="text-gray-400 hover:text-primary transition-colors duration-300"
    aria-label="Twitter"
  >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a
    href="https://www.instagram.com/"
    className="text-gray-400 hover:text-primary transition-colors duration-300"
    aria-label="Instagram"
  >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
    href="https://www.linkedin.com/"
    className="text-gray-400 hover:text-primary transition-colors duration-300"
    aria-label="LinkedIn"
  >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
            </div>
          </div>
        </div>

        {
    /* Copyright Section */
  }
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          &copy; {(/* @__PURE__ */ new Date()).getFullYear()} InternConnect. All rights reserved.
        </div>
      </div>
    </footer>;
};
export default Footer;
