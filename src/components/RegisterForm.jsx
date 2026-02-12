import { useState } from 'react';
import { API_BASE_URL } from '../config';
import '../form-styles.css';

// Helper component outside of main component to avoid re-mounting issues
const FileInput = ({ label, name, required, onChange, file }) => {
    const hasFile = !!file;
    const fileName = hasFile ? file.name : 'Click to Upload (PDF only)';

    return (
        <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <div className="file-upload-wrapper">
                <input
                    type="file"
                    id={`file-${name}`}
                    name={name}
                    accept=".pdf"
                    onChange={onChange}
                    required={required}
                    className="file-input-hidden"
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                />
                <div className={`file-upload-label ${hasFile ? 'has-file' : ''}`} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '150px', border: hasFile ? '2px solid #10b981' : '2px dashed #cbd5e1',
                    borderRadius: '8px', backgroundColor: hasFile ? '#ecfdf5' : '#f8fafc',
                    position: 'relative', zIndex: 1
                }}>
                    <div className="upload-icon" style={{ fontSize: '32px', marginBottom: '8px', color: hasFile ? '#10b981' : '#64748b' }}>
                        {hasFile ? '✔' : '📄'}
                    </div>
                    <div className="file-name" style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569', textAlign: 'center', padding: '0 20px' }}>
                        {fileName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>
                        Supported format: PDF
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        course_type: 'ND'
    });

    // Separate state for files
    const [files, setFiles] = useState({
        merged_pdf: null
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
        if (!files.merged_pdf) {
            setMessage({ type: 'error', text: 'Please upload the required merged PDF document.' });
            setLoading(false);
            return;
        }

        const data = new FormData();

        // Append text fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Append files
        if (files.merged_pdf) {
            data.append('merged_pdf', files.merged_pdf);
        }

        try {
            console.log("Submitting form data to:", `${API_BASE_URL}/register.php`);

            const response = await fetch(`${API_BASE_URL}/register.php`, {
                method: 'POST',
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                },
                body: data
            });

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
                    course_type: 'ND'
                });
                setFiles({
                    merged_pdf: null
                });

                // Reset file inputs visually
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

                        <div className="input-group full-width" style={{ marginTop: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Course Category</label>
                            <div className="category-selection">
                                <label className={`category-label ${formData.course_type === 'ND' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="course_type"
                                        value="ND"
                                        checked={formData.course_type === 'ND'}
                                        onChange={handleChange}
                                    />
                                    ND Courses
                                </label>
                                <label className={`category-label ${formData.course_type === 'HND' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="course_type"
                                        value="HND"
                                        checked={formData.course_type === 'HND'}
                                        onChange={handleChange}
                                    />
                                    HND Courses
                                </label>
                            </div>

                            <label>Proposed Course of Study</label>
                            <select name="course_study" value={formData.course_study} onChange={handleChange} required>
                                <option value="" disabled>-- Select a Course --</option>
                                <option value="Computer Science">Computer Science </option>
                                <option value="Computer Engineering">Computer Engineering </option>
                                <option value="Electrical Electronic Engineering ">Electrical Electronic Engineering </option>
                                <option value="Accountancy">Accountancy </option>
                                <option value="Statistics ">Statistics </option>
                                <option value="Public Administration ">Public Administration </option>
                                <option value="Business Administration ">Business Administration </option>
                                <option value="Estate Management ">Estate Management </option>
                                <option value="Marketing ">Marketing </option>
                                <option value="Mass Communication ">Mass Communication </option>
                                <option value="Science Laboratory Technology ">Science Laboratory Technology </option>
                                <option value="Building Technology ">Building Technology </option>
                                <option value="Quantity Surveying ">Quantity Surveying </option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section" style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px', marginTop: '30px' }}>
                        <h3>Document Upload</h3>
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ fontWeight: '700', color: '#0369a1', marginBottom: '10px', fontSize: '1rem' }}>Please upload the following documents merged into ONE (1) PDF file:</p>
                            <ol style={{ fontSize: '0.9rem', color: '#0c4a6e', lineHeight: '1.6', marginLeft: '20px' }}>
                                <li>Birth certificate</li>
                                <li>First school leaving certificate (FSLC)</li>
                                <li>SSCE</li>
                                <li>JAMB results (optional)</li>
                                <li>ND certificate (if applying for HND)</li>
                            </ol>
                        </div>

                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <FileInput label="Upload Merged PDF" name="merged_pdf" required={true} onChange={handleFileChange} file={files.merged_pdf} />
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Need to merge your documents? Use this tool:
                                <a href="https://www.ilovepdf.com/jpg_to_pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#b6260c', fontWeight: '600', marginLeft: '5px', textDecoration: 'underline' }}>
                                    Merge JPGs/PDFs here
                                </a>
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', padding: '15px', fontSize: '1rem', fontWeight: '600', background: '#ffffff', color: '#b6260cd9', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
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
