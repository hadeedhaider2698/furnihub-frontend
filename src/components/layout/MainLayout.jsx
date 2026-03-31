import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';
import Sidebar from './Sidebar.jsx';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  return (
    <div className="flex bg-[var(--surface)] font-sans antialiased">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1A1A2E', color: '#fff', borderRadius: '12px' }
      }} />
      
      {/* Sidebar for Desktop */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen pb-[68px] md:pb-0 w-full">
        {/* Header - Fixed on mobile, hidden logo on desktop if sidebar is wide */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile-only Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
