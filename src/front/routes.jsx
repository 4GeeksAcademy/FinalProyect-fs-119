import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";

import { Layout } from "./pages/Layout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Single from "./pages/Single";
import Demo from "./pages/Demo";
import Login from "./pages/Login";
import Register from "./pages/Register";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />; 
  }

  return children;
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>

      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/home" element={<ProtectedRoute> <Home /></ProtectedRoute>}/>
      <Route path="/single/:theId" element={ <ProtectedRoute> <Single /></ProtectedRoute>} />
      <Route path="/demo"element={<ProtectedRoute> <Demo /></ProtectedRoute>} />
    </>
  )
);