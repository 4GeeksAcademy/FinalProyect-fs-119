import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { CreateRestaurantForm } from "./pages/CreateRestaurantForm";
import { Profile } from "./pages/Profile"

export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route index element={<Home />} />
      <Route path="single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="demo" element={<Demo />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="user/restaurants" element={<CreateRestaurantForm />} />
      <Route path="profile" element={<Profile />} />
    </Route>
  )
);
