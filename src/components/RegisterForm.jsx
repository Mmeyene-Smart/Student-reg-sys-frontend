import { useState } from 'react';
import { API_BASE_URL } from '../config';

const RegisterForm = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        surname: '',
        other_names: '',
        email: '',
        dob: '',
        sex: 'Male',
        lga_origin: '',
        nationality: '',
        phone: '',
        course_study: '',
        nd_hnd_holder: false
    });

    // Separate state for files
    const [files, setFiles] = useState({
        birth_cert: null,
        fslc_cert: null,
        ssce_cert: null,
        jamb_result: null
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({
                ...prev,
                [name]: selectedFiles[0]
            }));
        }
    };

    const nextStep = () => {
        // Validate Step 1 fields
        const required = ['surname', 'other_names', 'dob', 'nationality', 'lga_origin', 'email', 'phone'];
        const empty = required.filter(f => !formData[f]);

        if (empty.length > 0) {
            setMessage({ type: 'error', text: 'Please fill in all personal and contact information fields.' });
            return;
        }
        setMessage({ type: '', text: '' });
        setStep(2);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(1);
        setMessage({ type: '', text: '' });
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Basic file validation
        if (!files.birth_cert || !files.fslc_cert || !files.ssce_cert) {
            setMessage({ type: 'error', text: 'Please upload all required documents (Birth Cert, FSLC, SSCE).' });
            setLoading(false);
            return;
        }

        const data = new FormData();

        // Append text fields
        Object.keys(formData).forEach(key => {
            if (typeof formData[key] === 'boolean') {
                data.append(key, formData[key] ? '1' : '0');
            } else {
                data.append(key, formData[key]);
            }
        });

        // Append files
        Object.keys(files).forEach(key => {
            if (files[key]) {
                data.append(key, files[key]);
            }
        });

        try {
            console.log("Submitting form data to:", `${API_BASE_URL}/register.php`);

            const response = await fetch(`${API_BASE_URL}/register.php`, {
                method: 'POST',
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                },
                body: data
            });

            console.log("Response status:", response.status);

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (jsonError) {
                console.error("Non-JSON response:", text);
                throw new Error(`Server error (${response.status}): Invalid response format.`);
            }

            if (response.ok) {
                setMessage({ type: 'success', text: 'Registration successful! Wait for admin approval.' });

                // Reset form
                setFormData({
                    surname: '', other_names: '', email: '', dob: '', sex: 'Male',
                    lga_origin: '', nationality: '', phone: '', course_study: '', nd_hnd_holder: false
                });
                setFiles({
                    birth_cert: null,
                    fslc_cert: null,
                    ssce_cert: null,
                    jamb_result: null
                });
                setStep(1); // Go back to start

                // Clear file inputs
                document.querySelectorAll('input[type="file"]').forEach(el => el.value = '');

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 5000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Registration failed.' });
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

                <div className="portal-form">
                    {/* Progress Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
                        <span style={{
                            padding: '5px 12px',
                            borderRadius: '50%',
                            background: step === 1 ? '#007bff' : '#ccc',
                            color: '#fff',
                            fontWeight: 'bold'
                        }}>1</span>
                        <span style={{
                            padding: '5px 12px',
                            borderRadius: '50%',
                            background: step === 2 ? '#007bff' : '#ccc',
                            color: '#fff',
                            fontWeight: 'bold'
                        }}>2</span>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* STEP 1: PERSONAL INFORMATION */}
                        {step === 1 && (
                            <div className="form-step">
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
                                    <h3>Contact Details</h3>
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
                                </div>

                                <button type="button" className="submit-btn" onClick={nextStep}>
                                    Next
                                </button>
                            </div>
                        )}

                        {/* STEP 2: ACADEMIC INFORMATION */}
                        {step === 2 && (
                            <div className="form-step">
                                <div className="form-section">
                                    <h3>Academic Information</h3>
                                    <div className="input-group full-width">
                                        <label>Proposed Course of Study</label>
                                        <input type="text" name="course_study" value={formData.course_study} onChange={handleChange} required placeholder="e.g. Computer Science" />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Document Uploads</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                                        Please upload the required documents. Accepted formats: <strong>PDF, JPG, PNG</strong>.
                                    </p>

                                    <div className="grid-2">
                                        <div className="input-group">
                                            <label>Birth Certificate <span style={{ color: 'red' }}>*</span></label>
                                            <input type="file" name="birth_cert" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                                        </div>
                                        <div className="input-group">
                                            <label>FSLC Certificate <span style={{ color: 'red' }}>*</span></label>
                                            <input type="file" name="fslc_cert" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                                        </div>
                                    </div>

                                    <div className="grid-2">
                                        <div className="input-group">
                                            <label>SSCE Results <span style={{ color: 'red' }}>*</span></label>
                                            <input type="file" name="ssce_cert" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
                                        </div>
                                        <div className="input-group">
                                            <label>JAMB Results (Optional)</label>
                                            <input type="file" name="jamb_result" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                        </div>
                                    </div>

                                    <div className="input-group full-width" style={{ marginTop: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                                            <input
                                                type="checkbox"
                                                id="nd_hnd_check"
                                                name="nd_hnd_holder"
                                                checked={formData.nd_hnd_holder}
                                                onChange={handleChange}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="nd_hnd_check" style={{ margin: 0, cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' }}>
                                                I possess an ND (National Diploma) or HND Certificate
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button type="button" className="submit-btn" onClick={prevStep} style={{ background: '#666' }}>
                                        Back
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? <span className="loader"></span> : 'Submit Application'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="disclaimer" style={{ marginTop: '20px' }}>By clicking submit, you agree that all provided information is accurate.</p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
