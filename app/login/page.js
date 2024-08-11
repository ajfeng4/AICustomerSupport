"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, firestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaRobot } from 'react-icons/fa';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        }
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                router.push('/');
            } else {
                setError('User does not exist in our records.');
                await auth.signOut();
            }
        } catch (error) {
            setError('Invalid email or password.');
        }
    };

    const navigateToRegister = () => {
        router.push('/register');
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <FaRobot style={styles.favicon} />
                <h1 style={styles.title}>Hello! Please Login</h1>
                <form onSubmit={handleLogin} style={styles.form}>
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
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
                <p style={styles.text}>
                    Don't have an account?{' '}
                    <span style={styles.link} onClick={navigateToRegister}>
                        Register
                    </span>
                </p>
                {showSuccess && <div style={styles.success}>Registration successful! Please log in.</div>}
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
        backgroundColor: '#e8f5e9', // Light green background
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
    inputFocused: {
        borderColor: '#4caf50',
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
    buttonHovered: {
        backgroundColor: '#388e3c',
    },
    error: {
        color: 'red',
        marginTop: '10px',
    },
    success: {
        marginTop: '10px',
        padding: '10px',
        fontSize: '14px',
        color: 'white',
        backgroundColor: '#66bb6a',
        borderRadius: '4px',
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