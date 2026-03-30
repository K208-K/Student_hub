import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export function PageHeader({ title, subtitle, icon: Icon }) {
  const { dark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Icon className="text-white text-xl" />
          </div>
        )}
        <h1 className={`text-2xl md:text-3xl font-bold ${dark ? 'text-white' : 'text-surface-900'}`}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className={`text-sm ${dark ? 'text-surface-700' : 'text-surface-700'} ml-[52px]`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export function Card({ children, className = '', delay = 0 }) {
  const { dark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`card ${dark ? 'card-dark' : 'card-light'} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', delay = 0 }) {
  const { dark } = useTheme();
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    success: 'from-success-400/20 to-success-500/20 text-success-400',
    warning: 'from-warning-400/20 to-warning-500/20 text-warning-400',
    danger: 'from-danger-400/20 to-danger-500/20 text-danger-400',
  };

  return (
    <Card delay={delay} className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[color]} rounded-bl-3xl opacity-50`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
        {Icon && <Icon className="text-xl" />}
      </div>
      <p className={`text-sm ${dark ? 'text-surface-700' : 'text-surface-700'}`}>{title}</p>
      <p className={`text-2xl font-bold mt-1 ${dark ? 'text-white' : 'text-surface-900'}`}>{value}</p>
      {subtitle && <p className={`text-xs mt-1 ${colors[color].split(' ')[2]}`}>{subtitle}</p>}
    </Card>
  );
}

export function ProgressBar({ value, max = 100, color = '#3b82f6', height = 8, showLabel = true }) {
  const { dark } = useTheme();
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className={`text-xs ${dark ? 'text-surface-700' : 'text-surface-700'}`}>{pct}%</span>
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${dark ? 'bg-surface-800' : 'bg-surface-200'}`} style={{ height }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
        />
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  const { dark } = useTheme();
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-24 rounded-2xl ${dark ? 'bg-surface-800/50' : 'bg-surface-200/50'}`} />
      ))}
    </div>
  );
}

export function EmptyState({ message = 'No data yet', icon: Icon }) {
  const { dark } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-60">
      {Icon && <Icon className={`text-5xl mb-3 ${dark ? 'text-surface-700' : 'text-surface-200'}`} />}
      <p className={`text-sm ${dark ? 'text-surface-700' : 'text-surface-700'}`}>{message}</p>
    </div>
  );
}
