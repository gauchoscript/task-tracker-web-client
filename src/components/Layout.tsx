import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
