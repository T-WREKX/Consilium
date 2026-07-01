// apps/web/src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 24, className, style, alt = 'Consilium' }) => (
  <img
    src="/consilium-logo.png"
    width={size}
    height={size}
    alt={alt}
    draggable={false}
    className={className}
    style={{
      display: 'block',
      width: size,
      height: size,
      objectFit: 'contain',
      userSelect: 'none',
      ...style,
    }}
  />
);
