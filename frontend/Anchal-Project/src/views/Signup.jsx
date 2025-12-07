import React from 'react'
import { useState, useEffect } from "react";
import axios from 'axios';

const Signup = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const SignupUser = async () => {
        console.log("Submit clicked! Email:", email, "Password:", password);
        setError("");
        setSuccess("");
        // Client-side validation to avoid sending incomplete requests
        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            setError('Name, email and password are required');
            return;
        }

        try {
            const { data } = await axios.post(
                "http://localhost:5000/signup",
                { name, password, phone, email },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            console.log("Signup successful:", data);
            setSuccess(data.message);
            setName("");
            setPhone("");
            setPassword("");
            setEmail("");
        } catch (err) {
            console.error("Error during signup:", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMsg);
        }
    };

    return (
        <div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <input
                type="text"
                placeholder="Enter Username"  
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="tel"
                placeholder="Enter Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <input
                type="password"
                placeholder="Enter password"    
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={SignupUser}>Signup</button>
        </div>
    );
}


export default Signup





