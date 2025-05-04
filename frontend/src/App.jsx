// frontend/src/App.jsx
import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Navbar      from "./components/Navbar";
import Homepage    from "./pages/HomePage";   
import CreatePage  from "./pages/CreatePage";   
import SignupPage  from "./pages/SignupPage";
import LoginPage   from "./pages/LoginPage";
import OrdersPage  from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import LogoutPage  from "./pages/LogoutPage";
import PaymentPage from "./pages/PaymentPage";
import ProjectCredentialsPage from "./pages/ProjectCredentialsPage";
import CategoryPage from "./pages/CategoryPage";

function App() {
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <Navbar />

      <Routes>
        <Route path="/"         element={<Homepage />} />
        <Route path="/create"   element={<CreatePage />} />
        <Route path="/signup"   element={<SignupPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/orders"   element={<OrdersPage />} />
        <Route path="/profile"  element={<ProfilePage />} />
        <Route path="/logout"   element={<LogoutPage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/credentials" element={<ProjectCredentialsPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
      </Routes>
    </Box>
  );
}

export default App;
