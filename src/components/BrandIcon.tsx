interface BrandIconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

export function BrandIcon({ size = 18, color = "currentColor", className }: BrandIconProps) {
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 18 18" 
      fill="none" 
      aria-hidden="true"
    >
      <path 
        d="M9 2v14M2 9h14M4.5 4.5l9 9M13.5 4.5l-9 9" 
        stroke={color} 
        strokeWidth="1.9" 
        strokeLinecap="round"
      />
    </svg>
  );
}
