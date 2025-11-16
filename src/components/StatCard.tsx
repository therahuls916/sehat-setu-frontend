// Updated File: src/components/StatCard.tsx
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber';
}

// Updated color variants to include dark mode styles for both the icon and shadow
const colorVariants = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    shadow: 'shadow-blue-200/50 dark:shadow-blue-500/10',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    shadow: 'shadow-green-200/50 dark:shadow-green-500/10',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    shadow: 'shadow-amber-200/50 dark:shadow-amber-500/10',
  },
};

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const variant = colorVariants[color];

  return (
    // Added dark mode styles for background, border, and hover effects
    <div className={`
      bg-white dark:bg-dark-surfaceMuted 
      p-6 rounded-lg shadow-xl ${variant.shadow} 
      flex items-center space-x-4 
      border border-gray-200/50 dark:border-dark-border
      hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
    `}>
      {/* Icon styles are now pulled from the updated variants */}
      <div className={`p-3 rounded-full ${variant.bg} ${variant.text}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-textSecondary dark:text-dark-textSecondary">{title}</p>
        <p className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">{value}</p>
      </div>
    </div>
  );
}