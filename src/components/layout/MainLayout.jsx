import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface)] font-sans antialiased pb-[68px] md:pb-0">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1A1A2E', color: '#fff', borderRadius: '12px' }
      }} />
      <Header />
      
      {/* Mobile-first layout constraint: max-w-lg centers it like Instagram web */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto flex justify-center">
        {/* Desktop Left Sidebar (Placeholder for scale) */}
        
        {/* Main Feed Content Area */}
        <div className="w-full max-w-[600px] min-h-screen">
          <Outlet />
        </div>
        
        {/* Desktop Right Sidebar (Placeholder for scale) */}
      </main>

      {/* Main Bottom Nav for Mobile */}
      <BottomNav />
    </div>
  );
}
