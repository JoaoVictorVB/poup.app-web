import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-100 text-blue-600',
    trend: 'text-blue-600',
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'bg-green-100 text-green-600',
    trend: 'text-green-600',
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-100 text-purple-600',
    trend: 'text-purple-600',
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-100 text-orange-600',
    trend: 'text-orange-600',
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
      />

      <div className="relative bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
            {trend && (
              <div className={cn('flex items-center text-sm', colors.trend)}>
                <span className="font-semibold">
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="ml-2 text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', colors.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Decorative gradient bar */}
        <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r', colors.bg)} />
      </div>
    </motion.div>
  );
}
