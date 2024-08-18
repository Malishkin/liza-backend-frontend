import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { Helmet } from "react-helmet";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Helmet>
        <meta name="author" content="El Messeg Team" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Layout>
        <Routes>
          <Route path="/" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/login"
            element={<Login setAuth={setIsAuthenticated} />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                element={Admin}
                isAuthenticated={isAuthenticated}
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
