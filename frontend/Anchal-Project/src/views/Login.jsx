import React from 'react'
import { useState, useEffect } from "react";
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const LoginUser = async () => {
        console.log("Submit clicked! Email:", email, "Password:", password);
        try {
            const { data } = await axios.post("http://localhost:5000/login", { username, password });
            console.log("Login successful:", data);
            setUsername("");
            setPassword("");
        } catch (err) {
            console.error("Error creating card:", err);
        }
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={LoginUser}>Login</button>
        </div>
    )
}

export default Login