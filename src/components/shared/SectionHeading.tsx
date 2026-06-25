import type { CSSProperties } from 'react';

interface SectionHeadingProps {
  children: React.ReactNode;
  accentColor?: string;
  as?: 'h2' | 'h3' | 'h4';
  fontSize?: number;
  style?: CSSProperties;
}

export function SectionHeading({
  children,
  accentColor = '#16a34a',
  as: Tag = 'h2',
  fontSize = 16,
  style,
}: SectionHeadingProps) {
  return (
    <Tag
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize,
        fontWeight: 800,
        color: '#f1f5f9',
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 14,
        borderLeft: `3px solid ${accentColor}`,
        paddingLeft: 12,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
