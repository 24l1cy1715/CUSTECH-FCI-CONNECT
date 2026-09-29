import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="font-display font-extrabold text-7xl sm:text-9xl text-accent">
        404
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-white">
          Page Not Found
        </h1>
        <p className="text-sm text-text-secondary">
          The page or digital resource you are looking for has been moved or does not exist on CUSTECH FCI Connect.
        </p>
      </div>

      <div className="flex gap-4">
        <Link to="/">
          <Button variant="accent" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
