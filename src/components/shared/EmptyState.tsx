import type { CSSProperties } from 'react';

interface EmptyStateProps {
  message: string;
  icon?: string;
  subtitle?: string;
  style?: CSSProperties;
}

export function EmptyState({ message, icon, subtitle, style }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569', ...style }}>
      {icon && <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>}
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: subtitle ? 8 : 0 }}>{message}</div>
      {subtitle && <div style={{ fontSize: 13 }}>{subtitle}</div>}
    </div>
  );
}
