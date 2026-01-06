import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
