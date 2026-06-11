import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/Constants';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { auth } = useAuth();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    const authRole = normalizeRole(auth.role);
    if (allowedRoles?.length && !allowedRoles.includes(authRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
