import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

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
    const renderDocumentPreview = (label, filename) => {
        if (!filename) return (
            <div className="document-item empty">
                <p><strong>{label}:</strong> <span style={{ color: 'red' }}>Not uploaded</span></p>
            </div>
        );

        const url = getFileUrl(filename);
        const isPdf = filename.toLowerCase().endsWith('.pdf');

        return (
            <div className="document-item">
                <p><strong>{label}:</strong></p>
                {isPdf ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                        📄 View PDF Document
                    </a>
                ) : (
                    <div className="image-preview">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={label} />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="admin-layout">
            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white; width: 90%; max-width: 800px; max-height: 90vh;
                    border-radius: 8px; position: relative; display: flex; flex-direction: column;
                }
                .modal-close {
                    position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; border: none; background: none;
                }
                .modal-header { padding: 20px; border-bottom: 1px solid #eee; }
                .modal-body-scroll { padding: 20px; overflow-y: auto; flex: 1; }
                .modal-footer { padding: 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }
                .detail-section { margin-bottom: 25px; }
                .detail-section h3 { margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px; color: #333; }
                .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
                .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
                .document-item { border: 1px solid #ddd; padding: 10px; border-radius: 6px; background: #fff; }
                .image-preview img { width: 100%; height: 200px; object-fit: contain; background: #f9f9f9; }
                .pdf-link { display: block; padding: 15px; background: #f0f0f0; text-align: center; text-decoration: none; color: #333; border-radius: 4px; }
                .btn-view { background: #17a2b8; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; }
                .btn-approve { background: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
                .btn-reject { background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
                .btn-cancel { background: #6c757d; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
            `}</style>

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
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', padding: '0 1rem', marginBottom: '0.5rem' }}>EL-THOMP Admin</div>
                    <button onClick={handleLogout} className="btn-logout" style={{ margin: '0 1rem', width: 'auto' }}>Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <h1>{activeTab === 'dashboard' ? 'Dashboard' : `${activeTab} Applications`}</h1>
                    <div className="user-info">Admin</div>
                </header>

                {error && (
                    <div className="notification error" style={{ margin: '1rem' }}>
                        Error: {error}
                    </div>
                )}

                {loading ? <div className="loader" style={{ margin: '3rem auto', display: 'block' }}></div> : (
                    <div className="content-area">
                        {/* Dashboard Stats Cards */}
                        {activeTab === 'dashboard' && (
                            <div className="stats-grid">
                                <div className="stat-card pending">
                                    <h3>Pending</h3>
                                    <p className="stat-number">{counts.pending}</p>
                                </div>
                                <div className="stat-card approved">
                                    <h3>Approved</h3>
                                    <p className="stat-number">{counts.approved}</p>
                                </div>
                                <div className="stat-card rejected">
                                    <h3>Rejected</h3>
                                    <p className="stat-number">{counts.rejected}</p>
                                </div>
                                <div className="stat-card total">
                                    <h3>Total</h3>
                                    <p className="stat-number">{counts.total}</p>
                                </div>
                            </div>
                        )}

                        {/* Table View */}
                        <div className="table-wrapper">
                            {filteredStudents.length === 0 ? (
                                <p className="no-data">No students found.</p>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email / Phone</th>
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
                                                    {student.email}
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
                                                            👁 View
                                                        </button>
                                                        {activeTab !== 'Approved' && (
                                                            <button title="Approve" className="btn-icon approve" onClick={() => handleStatusUpdate(student.id, 'Approved')}>✓</button>
                                                        )}
                                                        {activeTab !== 'Rejected' && (
                                                            <button title="Reject" className="btn-icon reject" onClick={() => handleStatusUpdate(student.id, 'Rejected')}>✕</button>
                                                        )}
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
                        <button className="modal-close" onClick={() => setSelectedStudent(null)}>&times;</button>

                        <div className="modal-header">
                            <h2>Applicant: {selectedStudent.surname} {selectedStudent.other_names}</h2>
                            <span className={`status-badge ${selectedStudent.status.toLowerCase()}`}>{selectedStudent.status}</span>
                        </div>

                        <div className="modal-body-scroll">
                            <div className="detail-section">
                                <h3>Personal & Academic Info</h3>
                                <div className="detail-grid">
                                    <p><strong>Email:</strong> {selectedStudent.email}</p>
                                    <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                                    <p><strong>DOB:</strong> {selectedStudent.dob}</p>
                                    <p><strong>Sex:</strong> {selectedStudent.sex}</p>
                                    <p><strong>Nationality:</strong> {selectedStudent.nationality}</p>
                                    <p><strong>LGA/State:</strong> {selectedStudent.lga_origin}</p>
                                    <p><strong>Course:</strong> {selectedStudent.course_study}</p>
                                    <p><strong>ND/HND Holder:</strong> {selectedStudent.nd_hnd_holder == 1 ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Uploaded Documents</h3>
                                <div className="documents-grid">
                                    {renderDocumentPreview('Birth Certificate', selectedStudent.birth_cert)}
                                    {renderDocumentPreview('FSLC Certificate', selectedStudent.fslc_cert)}
                                    {renderDocumentPreview('SSCE Results', selectedStudent.ssce_cert)}
                                    {renderDocumentPreview('JAMB Results', selectedStudent.jamb_result)}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-approve" onClick={() => handleStatusUpdate(selectedStudent.id, 'Approved')}>Approve Admission</button>
                            <button className="btn-reject" onClick={() => handleStatusUpdate(selectedStudent.id, 'Rejected')}>Reject Application</button>
                            <button className="btn-cancel" onClick={() => setSelectedStudent(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
