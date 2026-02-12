import { useState } from 'react';
import { API_BASE_URL } from '../config';
import '../form-styles.css';

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
        course_study: '',
        nd_holder: false,
        hnd_holder: false
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
                    lga_origin: '', nationality: '', phone: '', course_study: '',
                    nd_holder: false, hnd_holder: false
                });
                setFiles({
                    birth_cert: null,
                    fslc_cert: null,
                    ssce_cert: null,
                    jamb_result: null
                });

                // Reset file inputs visually by clearing state (inputs will rerender)
                document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');

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

    // Helper for beautiful file input component
    const FileInput = ({ label, name, required }) => {
        const hasFile = !!files[name];
        const fileName = hasFile ? files[name].name : 'Click to Upload (PDF, JPG, PNG)';

        return (
            <div className="input-group">
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
                <div className="file-upload-wrapper">
                    <input
                        type="file"
                        id={`file-${name}`}
                        name={name}
                        accept=".pdf,.image/jpeg,.image/png,.image/jpg"
                        onChange={handleFileChange}
                        required={required}
                        className="file-input-hidden"
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                    />
                    <div className={`file-upload-label ${hasFile ? 'has-file' : ''}`} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        width: '100%', height: '120px', border: hasFile ? '2px solid #10b981' : '2px dashed #cbd5e1',
                        borderRadius: '8px', backgroundColor: hasFile ? '#ecfdf5' : '#f8fafc',
                        position: 'relative', zIndex: 1
                    }}>
                        <div className="upload-icon" style={{ fontSize: '24px', marginBottom: '8px', color: hasFile ? '#10b981' : '#64748b' }}>
                            {hasFile ? '✔' : '☁️'}
                        </div>
                        <div className="file-name" style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'center', padding: '0 10px' }}>
                            {fileName}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="student-portal-wrapper">
            <div className="portal-container">
                <div className="portal-header">
                    <div className="university-logo">
                        <img src="https://elthomppoly.edu.ng/wp-content/uploads/2026/01/EL-TOMP_logo-200x200.png" alt="University Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '15px' }} />
                    </div>
                    <h1>Student Admission Portal</h1>
                    <p className="subtitle">EL-THOMP Polytechnic • 2025/2026 Session</p>
                </div>

                {message.text && (
                    <div className={`notification ${message.type}`} style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                        {message.type === 'success' ? '✓ ' : '⚠ '} {message.text}
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

                    <div className="form-section" style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px', marginTop: '30px' }}>
                        <h3>Document Uploads</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                            Please upload clear scans or photos of your documents.
                        </p>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <FileInput label="Birth Certificate" name="birth_cert" required={true} />
                            <FileInput label="FSLC Certificate" name="fslc_cert" required={true} />
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <FileInput label="SSCE Results" name="ssce_cert" required={true} />
                            <FileInput label="JAMB Results (Optional)" name="jamb_result" required={false} />
                        </div>

                        <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#334155', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Additional Qualifications</h4>
                        <div className="checkbox-group" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <label className="custom-checkbox" style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="nd_holder"
                                    checked={formData.nd_holder}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', marginRight: '10px' }}
                                />
                                <span style={{ fontWeight: '500', color: '#334155' }}>I possess an ND Certificate</span>
                            </label>

                            <label className="custom-checkbox" style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="hnd_holder"
                                    checked={formData.hnd_holder}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', marginRight: '10px' }}
                                />
                                <span style={{ fontWeight: '500', color: '#334155' }}>I possess an HND Certificate</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', padding: '15px', fontSize: '1rem', fontWeight: '600', background: '#ffffff', color: '#b6260cd9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            {loading ? <span className="loader"></span> : 'Submit Application'}
                        </button>
                    </div>

                    <p className="disclaimer" style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '15px' }}>By clicking submit, you agree that all provided information is accurate.</p>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
