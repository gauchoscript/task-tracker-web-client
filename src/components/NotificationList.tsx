import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function NotificationList() {
  const { notifications, loading, total, fetchNextPage, hasNextPage, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchNextPage();
  };

  const handleNotificationClick = (notificationId: string, taskId: string | null, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
    
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    }
    
    setIsOpen(false);
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
        <div className="fixed left-4 right-4 mt-3 sm:absolute sm:left-auto sm:right-0 sm:w-80 max-h-[480px] overflow-hidden bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b border-navy-700 flex items-center justify-between bg-navy-800/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-semibold text-white">Notifications</h3>
            <span className="text-xs text-slate-400">{total} total</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 && !loading ? (
              <div className="p-8 text-center text-slate-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-navy-700/50">
                {notifications.map((notification) => {
                  const isRead = !!notification.read_at;
                  return (
                    <div
                      key={notification.id}
                      data-testid={`notification-item-${notification.id}`}
                      onClick={() => handleNotificationClick(notification.id, notification.task_id, isRead)}
                      className={`p-4 pr-5 transition-all duration-200 cursor-pointer group flex items-start gap-2 ${
                        !isRead ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : 'hover:bg-navy-700/50'
                      }`}
                    >
                      {/* Unread Indicator Dot / Button */}
                      <div className="flex-shrink-0 w-6 h-5 flex items-center justify-center -ml-1">
                        {!isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:cursor-pointer hover:bg-indigo-500/10 active:bg-indigo-500/20 transition-all -m-2 group/dot"
                            title="Mark as read"
                            aria-label="Mark as read"
                            data-testid={`notification-dot-${notification.id}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover/dot:scale-125 transition-all" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className={`text-sm leading-tight transition-colors ${
                            !isRead ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] whitespace-nowrap text-slate-500 group-hover:text-slate-400 font-medium">
                            {notification.sent_at ? formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 ${!isRead ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'}`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {loading && (
              <div className="p-6 flex justify-center">
                <Loader2 className="animate-spin text-indigo-400/70" size={24} />
              </div>
            )}

            {!loading && hasNextPage && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-navy-700/50 transition-all font-semibold border-t border-navy-700 sticky bottom-0 bg-navy-800"
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
