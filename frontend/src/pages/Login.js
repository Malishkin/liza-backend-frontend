import React, { useState } from "react";
import axios from "../axiosConfig"; // Импортируйте настроенный axios из вашего файла axiosConfig
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { username, password };

    try {
      const response = await axios.post("/api/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setAuth(true);
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
        setError("");
        navigate("/admin");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Error logging in. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
