"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FaRobot } from 'react-icons/fa';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(firestore, "users", user.uid), {
                chatHistory: [],
                language: "English",
                username: username,
                email: user.email
            });

            // Redirect to login page with a success query parameter
            router.push('/login?registered=true');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <FaRobot style={styles.favicon} />
                <h1 style={styles.title}>Please register to chat!</h1>
                <form onSubmit={handleRegister} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Register</button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
                <p style={styles.text}>
                    Already have an account?{' '}
                    <span style={styles.link} onClick={() => router.push('/login')}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#e8f5e9',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        width: '320px',
        textAlign: 'center',
    },
    favicon: {
        fontSize: '40px',
        color: '#4caf50',
        marginBottom: '10px',
    },
    title: {
        marginBottom: '20px',
        fontSize: '28px',
        color: '#4caf50',
        fontWeight: 'bold',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        marginBottom: '15px',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    button: {
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    error: {
        color: 'red',
        marginTop: '10px',
    },
    text: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#4caf50',
    },
    link: {
        color: '#388e3c',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};