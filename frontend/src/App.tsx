import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import './styles/global.css';

// Active sub-page routing state
type Page = 'home' | 'dashboard' | 'settings' | '404';

const NavigationManager: React.FC = () => {
  const { user, token } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Handle auto-routing depending on auth status
  useEffect(() => {
    if (token && user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  }, [token, user]);

  const handleGoHome = () => {
    if (token) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onLoginSuccess={() => handleNavigate('dashboard')} />;
      case 'dashboard':
        if (!token) return <Home onLoginSuccess={() => handleNavigate('dashboard')} />;
        return (
          <Dashboard 
            onLogout={() => handleNavigate('home')} 
            onNavigateToSettings={() => handleNavigate('settings')} 
          />
        );
      case 'settings':
        if (!token) return <Home onLoginSuccess={() => handleNavigate('dashboard')} />;
        return <Settings onBackToDashboard={() => handleNavigate('dashboard')} />;
      case '404':
      default:
        return <NotFound onGoHome={handleGoHome} />;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      {renderPage()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationManager />
      </AuthProvider>
    </ErrorBoundary>
  );
};
export default App;
