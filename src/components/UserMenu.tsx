import { useAuthStore } from '@/stores/authStore';
import { LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { signout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignout = () => {
    signout();
    navigate('/signin');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-2 transition-colors rounded-full hover:bg-navy-800 hover:cursor-pointer ${
          isMenuOpen ? 'text-white bg-navy-800' : 'text-slate-400 hover:text-white'
        }`}
        aria-label="User menu"
      >
        <User size={20} />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <button
            onClick={handleSignout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-navy-700 hover:text-white transition-colors hover:cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
