import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import '../admin.css'; // Import the new modern styles

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, Pending, Approved, Rejected
    const [selectedStudent, setSelectedStudent] = useState(null); // For modal
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/students.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();
            setStudents(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError(error.message);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        // If updating from modal, use selectedStudent
        if (!selectedStudent && !window.confirm(`Are you sure you want to mark this student as ${newStatus}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/students.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (response.ok) {
                setStudents(students.map(student =>
                    student.id === id ? { ...student, status: newStatus } : student
                ));
                // Update modal if open
                if (selectedStudent && selectedStudent.id === id) {
                    setSelectedStudent({ ...selectedStudent, status: newStatus });
                }
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    // Derived state for counts
    const counts = {
        total: students.length,
        pending: students.filter(s => s.status === 'Pending').length,
        approved: students.filter(s => s.status === 'Approved').length,
        rejected: students.filter(s => s.status === 'Rejected').length
    };

    // Filter students based on active tab
    const filteredStudents = activeTab === 'dashboard'
        ? students
        : students.filter(s => s.status === activeTab);

    // Build image URL Helper
    const getFileUrl = (filename) => {
        if (!filename) return null;
        // API_BASE_URL is .../backend/api
        // Uploads are .../backend/uploads
        // So we replace '/api' with '/uploads/'
        const baseUrl = API_BASE_URL.replace('/api', '/uploads');
        return `${baseUrl}/${filename}`;
    };

    // Helper to render doc preview
    const renderDocument = (label, filename) => {
        if (!filename) return (
            <div className="doc-card empty">
                <div className="doc-header">{label}</div>
                <div className="doc-preview" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No document
                </div>
            </div>
        );

        const url = getFileUrl(filename);
        const isPdf = filename.toLowerCase().endsWith('.pdf');

        return (
            <div className="doc-card">
                <div className="doc-header">{label}</div>
                <div className="doc-preview" style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f8fafc' }}>
                    {isPdf ? (
                        <iframe src={url} title={label} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
                    ) : (
                        <img src={url} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                </div>
                <div className="doc-actions">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-open-doc">
                        {isPdf ? 'Open PDF ↗' : 'View Full Image ↗'}
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-layout">

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard Overview
                    </button>
                    <button
                        className={activeTab === 'Pending' ? 'active' : ''}
                        onClick={() => setActiveTab('Pending')}
                    >
                        Pending Requests <span className="badge-count">{counts.pending}</span>
                    </button>
                    <button
                        className={activeTab === 'Approved' ? 'active' : ''}
                        onClick={() => setActiveTab('Approved')}
                    >
                        Approved Students <span className="badge-count">{counts.approved}</span>
                    </button>
                    <button
                        className={activeTab === 'Rejected' ? 'active' : ''}
                        onClick={() => setActiveTab('Rejected')}
                    >
                        Rejected Applications <span className="badge-count">{counts.rejected}</span>
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <h1>{activeTab === 'dashboard' ? 'Dashboard' : `${activeTab} Applications`}</h1>
                    <div className="user-info">Admin Account</div>
                </header>

                {error && (
                    <div className="notification error" style={{ margin: '1rem', background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px' }}>
                        Error: {error}
                    </div>
                )}

                {loading ? <div className="loader" style={{ margin: '3rem auto', display: 'block' }}></div> : (
                    <div className="content-area">
                        {/* Dashboard Stats Cards */}
                        {activeTab === 'dashboard' && (
                            <div className="stats-grid">
                                <div className="stat-card pending">
                                    <h3>Pending Requests</h3>
                                    <p className="stat-number">{counts.pending}</p>
                                </div>
                                <div className="stat-card approved">
                                    <h3>Approved Students</h3>
                                    <p className="stat-number">{counts.approved}</p>
                                </div>
                                <div className="stat-card rejected">
                                    <h3>Rejected Applications</h3>
                                    <p className="stat-number">{counts.rejected}</p>
                                </div>
                                <div className="stat-card total">
                                    <h3>Total Applications</h3>
                                    <p className="stat-number">{counts.total}</p>
                                </div>
                            </div>
                        )}

                        {/* Table View */}
                        <div className="table-wrapper">
                            {filteredStudents.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                                    No students found for this category.
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Applicant Profile</th>
                                            <th>Contact Info</th>
                                            <th>Course</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map(student => (
                                            <tr key={student.id}>
                                                <td>#{student.id}</td>
                                                <td>
                                                    <div className="student-name">{student.surname} {student.other_names}</div>
                                                    <div className="student-sub">{student.sex}, {student.nationality}</div>
                                                </td>
                                                <td>
                                                    <div>{student.email}</div>
                                                    <div className="student-sub">{student.phone}</div>
                                                </td>
                                                <td>{student.course_study}</td>
                                                <td>
                                                    <span className={`status-dot ${student.status.toLowerCase()}`}></span>
                                                    {student.status}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-view"
                                                            title="View Details & Docs"
                                                            onClick={() => setSelectedStudent(student)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>

                        <div className="modal-header">
                            <div>
                                <h2>{selectedStudent.surname} {selectedStudent.other_names}</h2>
                                <span className={`status-badge ${selectedStudent.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '2px 8px', borderRadius: '12px', background: '#eee' }}>{selectedStudent.status}</span>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedStudent(null)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Personal & Academic Info</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <p>{selectedStudent.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone Number</label>
                                        <p>{selectedStudent.phone}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth</label>
                                        <p>{selectedStudent.dob}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Sex</label>
                                        <p>{selectedStudent.sex}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Nationality</label>
                                        <p>{selectedStudent.nationality}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>State/LGA</label>
                                        <p>{selectedStudent.lga_origin}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Proposed Course</label>
                                        <p>{selectedStudent.course_study}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>ND Certificate</label>
                                        <p>{selectedStudent.nd_holder == 1 ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>HND Certificate</label>
                                        <p>{selectedStudent.hnd_holder == 1 ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Uploaded Documents</h3>
                                <div className="documents-grid">
                                    {renderDocument('Birth Certificate', selectedStudent.birth_cert)}
                                    {renderDocument('FSLC Certificate', selectedStudent.fslc_cert)}
                                    {renderDocument('SSCE Results', selectedStudent.ssce_cert)}
                                    {renderDocument('JAMB Results', selectedStudent.jamb_result)}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            {selectedStudent.status !== 'Approved' && (
                                <button className="btn-approve" onClick={() => handleStatusUpdate(selectedStudent.id, 'Approved')}>Approve Admission</button>
                            )}
                            {selectedStudent.status !== 'Rejected' && (
                                <button className="btn-reject" onClick={() => handleStatusUpdate(selectedStudent.id, 'Rejected')}>Reject Application</button>
                            )}
                            <button className="btn-close" onClick={() => setSelectedStudent(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
