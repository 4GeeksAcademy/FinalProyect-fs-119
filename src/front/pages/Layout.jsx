import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { NavbarUser } from "../components/NavbarUser";
import { Footer } from "../components/Footer";
import NavbarV2 from "../v2/components/NavbarV2";

export const Layout = () => {
  const location = useLocation();
  const user_id = localStorage.getItem("user_id");

  //const showUserNavbar = user_id && !["/", "/login", "/register"].includes(location.pathname);

  return (
    <ScrollToTop>
      <NavbarV2 />
      <Outlet />
    </ScrollToTop>
  );
};