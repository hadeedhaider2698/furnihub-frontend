import { motion } from 'framer-motion';

export const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
      className={`bg-[var(--border)] rounded-md ${className}`}
      {...props}
    />
  );
};

export const PostSkeleton = () => {
  return (
    <div className="bg-[var(--surface-2)] border-b lg:border border-[var(--border)] lg:rounded-xl lg:my-6 overflow-hidden max-w-[600px] mx-auto w-full">
      <div className="flex items-center space-x-3 p-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="w-full aspect-square md:aspect-[4/5] rounded-none" />
      <div className="p-3 space-y-4">
        <div className="flex space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};
