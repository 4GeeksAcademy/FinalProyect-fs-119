import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Single from "./pages/Single";
import Demo from "./pages/Demo";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Logister from "./pages/Logister";
import Login from "./pages/Login";
import Register from "./pages/Register";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="resetPassword/:token/token" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="demo" element={<Demo />} />
        <Route path="logister" element={<Logister />} />
        <Route path="profile" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
      </Route>

      <Route path="single/:theId" element={<Single />} />
    </>
  )
);