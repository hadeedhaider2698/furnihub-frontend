import { Loader2 } from 'lucide-react';

export const Loader = ({ className, size = 24 }) => {
  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <Loader2 size={size} className={`animate-spin text-primary ${className || ''}`} />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <Loader2 size={40} className="animate-spin text-primary" />
  </div>
);
