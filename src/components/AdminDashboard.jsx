import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, Pending, Approved, Rejected
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
            const data = await response.json();
            if (response.ok) {
                setStudents(data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this student as ${newStatus}?`)) return;

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
                                                        <button title="Approve" className="btn-icon approve" onClick={() => handleStatusUpdate(student.id, 'Approved')}>✓</button>
                                                        <button title="Reject" className="btn-icon reject" onClick={() => handleStatusUpdate(student.id, 'Rejected')}>✕</button>
                                                        <button title="Reset" className="btn-text" onClick={() => handleStatusUpdate(student.id, 'Pending')}>Reset</button>
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
        </div>
    );
};

export default AdminDashboard;
