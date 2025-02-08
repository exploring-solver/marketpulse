import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { Lock, PersonStanding } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth(); // Access login function from AuthContext
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any existing errors

        try {
            const result = await login(formData);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            setError('An unexpected error occurred');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Paper className="p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <Lock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <Typography variant="h5" className="font-bold">
                        Sign In
                    </Typography>
                </div>

                <form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        className="mb-4"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        className="mb-6"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    {error && (
                        <Alert severity="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className="bg-blue-600 hover:bg-blue-700 py-3"
                    >
                        Sign In
                    </Button>

                    <Box className="mt-4 text-center">
                        <Link to={'/register'}>
                            <Typography variant="body2" className="text-gray-600">
                                Don't have an account?{' '}
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                    Sign Up
                                </span>
                            </Typography>
                        </Link>
                    </Box>
                </form>
            </Paper>
        </div>
    );
};

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any existing errors
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            // Register the user
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            // If registration is successful, log them in automatically
            if (response.data.token) {
                const loginResult = await login({
                    email: formData.email,
                    password: formData.password
                });
                
                if (loginResult.success) {
                    navigate('/');
                } else {
                    setError(loginResult.error || 'Auto-login failed after registration');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            setError(errorMessage);
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Paper className="p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <PersonStanding className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <Typography variant="h5" className="font-bold">
                        Create Account
                    </Typography>
                </div>

                <form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        name="username"
                        autoFocus
                        className="mb-4"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        className="mb-4"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        className="mb-4"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        className="mb-6"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />

                    {error && (
                        <Alert severity="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className="bg-blue-600 hover:bg-blue-700 py-3"
                    >
                        Create Account
                    </Button>

                    <Box className="mt-4 text-center">
                        <Link to={'/login'}>
                            <Typography variant="body2" className="text-gray-600">
                                Already have an account?{' '}
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                    Sign In
                                </span>
                            </Typography>
                        </Link>
                    </Box>
                </form>
            </Paper>
        </div>
    );
};

export { Login, Register };