import React from 'react';
import { Link, useLocation } from 'wouter';
import { Sparkles, Library, Hammer, ShieldAlert, LogOut, LogIn, User } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  role: 'user' | 'moderator';
}

interface NavbarProps {
  user: UserData | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [location] = useLocation();

  return (
    <header className="glass-panel navbar-container">
      <Link href="/" className="nav-logo">
        <Sparkles className="text-primary" size={24} />
        <span>LBOS</span>
        <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 400, letterSpacing: 0 }}>
          Language Builder OS
        </span>
      </Link>

      <nav className="nav-links">
        <Link href="/dictionary" className={`nav-link flex-center gap-sm ${location === '/dictionary' ? 'active' : ''}`}>
          <Library size={16} />
          <span>Buka ya Mantswe</span>
        </Link>
        
        <Link href="/workshop" className={`nav-link flex-center gap-sm ${location === '/workshop' ? 'active' : ''}`}>
          <Hammer size={16} />
          <span>Sekolo sa Kaho</span>
        </Link>

        {user && user.role === 'moderator' && (
          <Link href="/moderator" className={`nav-link flex-center gap-sm ${location === '/moderator' ? 'active' : ''}`}>
            <ShieldAlert size={16} className="text-secondary" />
            <span>Moderator</span>
          </Link>
        )}

        <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }}></div>

        {user ? (
          <div className="flex-center gap-md">
            <div className="flex-center gap-sm" style={{ background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <User size={14} className="text-primary" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.username}</span>
              <span className={`badge ${user.role === 'moderator' ? 'badge-approved' : 'badge-pos'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem' }}>
                {user.role}
              </span>
            </div>
            <button onClick={onLogout} className="btn btn-secondary btn-sm flex-center gap-sm" style={{ padding: '0.4rem 0.8rem' }}>
              <LogOut size={14} />
              <span>Tsoa</span>
            </button>
          </div>
        ) : (
          <Link href="/auth" className="btn btn-primary btn-sm flex-center gap-sm">
            <LogIn size={14} />
            <span>Kena kapa Ngolisa</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
