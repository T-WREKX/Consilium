interface Props {
  size?: number;
  className?: string;
}

export function GeminiIcon({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="consilium-gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1FA0FA" />
          <stop offset="35%" stopColor="#4F89E8" />
          <stop offset="60%" stopColor="#9B5BCE" />
          <stop offset="85%" stopColor="#E33B7D" />
          <stop offset="100%" stopColor="#F58D32" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 7 17 12 22 12 C17 12 12 17 12 22 C12 17 7 12 2 12 C7 12 12 7 12 2 Z"
        fill="url(#consilium-gemini-gradient)"
      />
    </svg>
  );
}
