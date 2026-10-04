import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useState } from "react";
export default function MainLayout() {
  const [isHeaderScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <>
      <Header
    isHeaderScrolled={isHeaderScrolled}
    isMenuOpen={isMenuOpen}
    setIsMenuOpen={setIsMenuOpen}
  />
      <Outlet />
      <Footer />
    </>;
}
