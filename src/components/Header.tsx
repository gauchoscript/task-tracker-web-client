import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { NotificationList } from './NotificationList';

export function Header() {
  const { signout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignout = () => {
    signout();
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-40 px-4 py-3 bg-navy-900/95 backdrop-blur border-b border-navy-700">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white">Tasflou</h1>
        <div className="flex items-center gap-2">
          <NotificationList />
          <button
            onClick={handleSignout}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors hover:cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
