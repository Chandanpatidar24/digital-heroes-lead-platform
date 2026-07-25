import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, Send, Users } from 'lucide-react';

const Navbar = ({ onOpenTeam }) => {
  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <Link to={token ? '/dashboard' : '/'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-amber-100 font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              DH
            </div>
            <div>
              <span className="font-black text-stone-900 text-lg tracking-tight block leading-tight">
                Digital Heroes
              </span>
              <span className="text-[10px] font-bold text-amber-900 tracking-wider uppercase block">
                Lead Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {token ? (
              <>
                {/* Logged in Navigation */}
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    location.pathname === '/dashboard'
                      ? 'bg-stone-200/80 text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-800" />
                  <span>Sales Dashboard</span>
                </Link>

                {onOpenTeam && (
                  <button
                    onClick={onOpenTeam}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition-all flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-800" />
                    <span>{isAdmin ? 'Manage Team' : 'Team Members'}</span>
                  </button>
                )}

                <div className="hidden sm:flex items-center space-x-2 border-l border-stone-300 pl-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900">{user?.name}</div>
                    <div className="text-[10px] text-stone-500">{user?.email}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                      isAdmin
                        ? 'bg-amber-100/60 text-amber-900 border-amber-300'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {isAdmin && <ShieldCheck className="w-3 h-3 text-amber-800" />}
                    <span>{user?.role}</span>
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Guest Navigation */}
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    location.pathname === '/'
                      ? 'bg-amber-100/60 text-amber-900 font-extrabold border border-amber-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Public Form</span>
                </Link>

                <Link
                  to="/login"
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-100 rounded-xl text-xs font-extrabold transition-all shadow-xs"
                >
                  Team Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
