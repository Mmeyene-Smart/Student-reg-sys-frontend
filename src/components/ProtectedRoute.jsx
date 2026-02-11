import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if token exists in localStorage (or any other logic for authentication)
    const token = localStorage.getItem('adminToken');

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
