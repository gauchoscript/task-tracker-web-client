import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function NotificationList() {
  const { notifications, loading, total, fetchNextPage, hasNextPage, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors rounded-full hover:bg-navy-800 hover:cursor-pointer ${
          isOpen ? 'text-white bg-navy-800' : 'text-slate-400 hover:text-white'
        }`}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[480px] overflow-hidden bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b border-navy-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <span className="text-xs text-slate-400">{total} total</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 && !loading ? (
              <div className="p-8 text-center text-slate-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-navy-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 transition-colors ${
                      !notification.read_at ? 'bg-navy-900/30' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read_at ? 'text-white font-medium' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {notification.sent_at ? formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {loading && (
              <div className="p-4 flex justify-center">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            )}

            {!loading && hasNextPage && (
              <button
                onClick={handleLoadMore}
                className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium border-t border-navy-700"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
