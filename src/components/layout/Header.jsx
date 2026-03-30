import { Bell, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--surface-2)]/95 backdrop-blur-md border-b border-[var(--border)] h-14 flex items-center justify-between px-4 md:px-8">
      <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-[var(--primary)]">
        FurniHub
      </Link>
      <div className="flex items-center space-x-5">
        <button className="text-[var(--primary)] hover:opacity-70 transition relative">
          <Bell size={24} strokeWidth={1.5} />
        </button>
        <button className="text-[var(--primary)] hover:opacity-70 transition relative">
          <MessageCircle size={24} strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--error)] rounded-full border-2 border-[var(--surface-2)]"></span>
        </button>
      </div>
    </header>
  );
}
