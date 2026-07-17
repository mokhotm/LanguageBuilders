import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import Navbar from './components/Navbar.tsx';
import LandingPage from './pages/LandingPage.tsx';
import DictionaryExplorer from './pages/DictionaryExplorer.tsx';
import Workshop from './pages/Workshop.tsx';
import ModeratorDashboard from './pages/ModeratorDashboard.tsx';
import AuthPage from './pages/AuthPage.tsx';
import ChatbotWidget from './components/ChatbotWidget.tsx';

interface UserData {
  id: number;
  username: string;
  role: 'user' | 'moderator';
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [, setLocation] = useLocation();

  // Validate session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('lbos_token');
    if (savedToken) {
      setToken(savedToken);
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Session expired');
          }
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('lbos_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: UserData) => {
    localStorage.setItem('lbos_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('lbos_token');
    setToken(null);
    setUser(null);
    setLocation('/');
  };

  if (checkingAuth) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
        <div className="glow-pulse" style={{ width: '45px', height: '45px', background: 'var(--primary)', borderRadius: '50%' }}></div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>E sa kenya LBOS...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Decorative Gradient elements */}
      <div className="ambient-left"></div>

      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-wrapper">
        <Switch>
          <Route path="/">
            <LandingPage />
          </Route>

          <Route path="/dictionary">
            <DictionaryExplorer user={user} token={token} />
          </Route>

          <Route path="/workshop">
            {token ? (
              <Workshop user={user} token={token} />
            ) : (
              <Redirect to="/auth" />
            )}
          </Route>

          <Route path="/moderator">
            {user && user.role === 'moderator' ? (
              <ModeratorDashboard user={user} token={token} />
            ) : (
              <Redirect to="/dictionary" />
            )}
          </Route>

          <Route path="/auth">
            {user ? (
              <Redirect to="/dictionary" />
            ) : (
              <AuthPage onLoginSuccess={handleLoginSuccess} />
            )}
          </Route>

          {/* Catch-all */}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </main>
      <ChatbotWidget />
    </div>
  );
}
