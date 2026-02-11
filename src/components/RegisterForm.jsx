import { useState } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        surname: '',
        other_names: '',
        email: '',
        dob: '',
        sex: 'Male',
        lga_origin: '',
        nationality: '',
        phone: '',
        course_study: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            console.log("Submitting to:", `${API_BASE_URL}/register.php`);
            const response = await fetch(`${API_BASE_URL}/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(formData)
            });

            console.log("Response status:", response.status);

            // Try to parse JSON
            const textIdx = response.headers.get("content-type");
            let data;

            // Always try to get text first to debug
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Non-JSON response:", text);
                throw new Error(`Server error (${response.status}): Response was not valid JSON. See console.`);
            }

            if (response.ok) {
                setMessage({ type: 'success', text: 'Registration successful! Wait for admin approval.' });
                setFormData({
                    surname: '', other_names: '', email: '', dob: '', sex: 'Male',
                    lga_origin: '', nationality: '', phone: '', course_study: ''
                });

                // Clear message after 5 seconds
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 5000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Registration failed.' });
                // Optional: also clear error after 5s or leave it? User asked for "gree message" (success), but good UX clears both or just success. 
                // Let's clear both for consistency or just success? "gree message" implies success (green).
                // I'll add it for success specifically as requested, but maybe error too? standard is usually success auto-dismisses, error stays.
                // I will apply it to the success block as explicitly requested "that gree message".
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessage({ type: 'error', text: 'Connection failed: ' + error.message });
        }
        setLoading(false);
    };

    return (
        <div className="student-portal-wrapper">
            <div className="portal-container">
                <div className="portal-header">
                    <div className="university-logo">
                        <img src="https://elthomppoly.edu.ng/wp-content/uploads/2026/01/EL-TOMP_logo-200x200.png" alt="University Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
                    </div>
                    <h1>Student Admission Portal</h1>
                    <p className="subtitle">EL-THOMP Polytechnic • 2025/2026 Session</p>
                </div>

                {message.text && (
                    <div className={`notification ${message.type}`}>
                        {message.type === 'success' ? '✓' : '⚠'} {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="portal-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Surname</label>
                                <input type="text" name="surname" value={formData.surname} onChange={handleChange} required placeholder="Doe" />
                            </div>
                            <div className="input-group">
                                <label>Other Names</label>
                                <input type="text" name="other_names" value={formData.other_names} onChange={handleChange} required placeholder="John" />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>Sex</label>
                                <select name="sex" value={formData.sex} onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label>Nationality</label>
                                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required placeholder="Nigerian" />
                            </div>
                            <div className="input-group">
                                <label>State/LGA of Origin</label>
                                <input type="text" name="lga_origin" value={formData.lga_origin} onChange={handleChange} required placeholder="Lagos Island" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Contact & Academic</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@example.com" />
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+234..." />
                            </div>
                        </div>

                        <div className="input-group full-width">
                            <label>Proposed Course of Study</label>
                            <input type="text" name="course_study" value={formData.course_study} onChange={handleChange} required placeholder="e.g. Computer Science" />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <span className="loader"></span> : 'Submit Application'}
                    </button>

                    <p className="disclaimer">By clicking submit, you agree that all provided information is accurate.</p>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
