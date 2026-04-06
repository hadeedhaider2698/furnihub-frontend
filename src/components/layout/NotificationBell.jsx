import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useSocketStore } from '../../store/socketStore.js';
import api from '../../services/api.js';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadNotifications, setNotifications, markNotificationsAsRead } = useSocketStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.data.notifications);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setNotifications]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadNotifications > 0) {
      handleMarkAsRead();
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      markNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const handleClear = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative p-2 text-primary hover:bg-surface-2 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadNotifications > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-surface">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-warm z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2">
            <h3 className="font-serif font-bold text-primary">Notifications</h3>
            <button 
              onClick={handleClear}
              className="text-xs text-text-secondary hover:text-accent flex items-center gap-1"
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`p-4 border-b border-border hover:bg-surface-2 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">{notification.type}</span>
                    <span className="text-[10px] text-text-secondary">{new Date(notification.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-primary mb-1">{notification.title}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2 mb-2">{notification.message}</p>
                  {notification.link && (
                    <Link 
                      to={notification.link} 
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] font-medium text-primary flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink size={10} /> View details
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
