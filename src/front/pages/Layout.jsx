import { Outlet, useLocation, Navigate } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { NavbarUser } from "../components/NavbarUser";

export const Layout = () => {
  const location = useLocation();
  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  const isPublicPath = ["/", "/logister"].includes(location.pathname);
  const showUserNavbar = user_id && !isPublicPath;

  if (!token && !isPublicPath) {
    return <Navigate to="/logister" replace />;
  }

  return (
    <ScrollToTop>
      {showUserNavbar ? <NavbarUser /> : <Navbar />}
      <Outlet />
    </ScrollToTop>
  );
};
