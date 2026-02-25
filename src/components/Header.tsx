import { NotificationList } from './NotificationList';
import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-4 py-3 bg-navy-900/95 backdrop-blur border-b border-navy-700">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white">Tasflou</h1>
        <div className="flex items-center gap-2">
          <NotificationList />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
