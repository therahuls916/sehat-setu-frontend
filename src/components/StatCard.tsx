import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber';
}

// --- NEW, SIMPLIFIED COLOR VARIANTS ---
// These colors are now for the icon only. They do not need dark mode variants
// because the card background is always light.
const colorVariants = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
};

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const variant = colorVariants[color];

  return (
    // --- REDESIGNED CARD STYLES ---
    // The card background is now ALWAYS `bg-card` (white).
    // It has a subtle border and shadow that work on any background.
    <div className="bg-card p-6 rounded-lg shadow-sm flex items-center space-x-4 border border-border">
      
      {/* Icon styles are now simpler, pulling from the new variants */}
      <div className={`p-3 rounded-full ${variant.bg} ${variant.text}`}>
        <Icon size={24} />
      </div>

      {/* Text colors are now ALWAYS the light-theme content colors */}
      <div>
        <p className="text-sm text-content-secondary">{title}</p>
        <p className="text-2xl font-bold text-content-primary">{value}</p>
      </div>
    </div>
  );
}