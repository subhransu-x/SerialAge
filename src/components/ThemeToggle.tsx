import { useState, useEffect } from 'react';


export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Sync state with DOM after hydration to prevent SSR mismatch
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isActuallyDark = document.documentElement.classList.contains('dark') || 
                             localStorage.getItem('theme') === 'dark';
      setIsDark(isActuallyDark);
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    const isDarkNow = isDark;
    const nextIsDark = !isDarkNow;

    const x = e.clientX;
    const y = e.clientY;

    const performToggle = () => {
      if (nextIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      setIsDark(nextIsDark);
    };

    if (!document.startViewTransition) {
      performToggle();
      return;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(performToggle);

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-nav"
      aria-label="Toggle Dark Mode"
      title="Toggle Dark Mode"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        color: 'var(--slate)',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginLeft: '8px',
        transition: 'color 200ms ease, background-color 200ms ease, transform 300ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--ink)';
        e.currentTarget.style.backgroundColor = 'var(--surface-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--slate)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: isDark ? 'rotate(40deg)' : 'rotate(90deg)',
          transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle
            cx={isDark ? "12" : "25"}
            cy={isDark ? "4" : "0"}
            r="6"
            fill="black"
            style={{ transition: 'cx 500ms cubic-bezier(0.4, 0, 0.2, 1), cy 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r={isDark ? "9" : "5"}
          mask="url(#moon-mask)"
          fill={isDark ? "currentColor" : "none"}
          style={{ transition: 'r 500ms cubic-bezier(0.4, 0, 0.2, 1), fill 500ms ease' }}
        />
        <g
          style={{
            transform: isDark ? 'scale(0)' : 'scale(1)',
            transformOrigin: 'center',
            opacity: isDark ? 0 : 1,
            transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease'
          }}
        >
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </g>
      </svg>
    </button>
  );
}
