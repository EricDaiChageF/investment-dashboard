import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const ProtectedElement = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <>{children}</>;
  };

  const PublicElement = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/login" element={<PublicElement><Login /></PublicElement>} />
      <Route path="/" element={<ProtectedElement><AppLayout /></ProtectedElement>}>
        <Route index element={<Dashboard />} />
        <Route path="stocks" element={<div>股票管理</div>} />
        <Route path="reports" element={<div>周报报告</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
