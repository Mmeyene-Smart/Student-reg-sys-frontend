import { useState } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Login failed. Please check your connection.');
        }
        setLoading(false);
    };

    return (
        <div className="student-portal-wrapper">
            <div className="portal-container" style={{ maxWidth: '450px' }}>
                <div className="portal-header">
                    <div className="university-logo">
                        <img src="https://elthomppoly.edu.ng/wp-content/uploads/2026/01/EL-TOMP_logo-200x200.png" alt="University Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
                    </div>
                    <h1>Admin Portal</h1>
                    <p className="subtitle">Authorized Personnel Only</p>
                </div>

                {error && (
                    <div className="notification error">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="portal-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            placeholder="admin@university.edu"
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <span className="loader"></span> : 'Secure Login'}
                    </button>
                    <p className="disclaimer" style={{ marginTop: '1rem' }}>
                        Access is monitored and logged.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
