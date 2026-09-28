import React from 'react';

export function Petals({ tone = 'white', amount = 18 }: { tone?: string; amount?: number }) {
  return (
    <div className={`petals ${tone}`} aria-hidden>
      {Array.from({ length: amount }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${1 + ((i * 3.8) % 100)}%`,
              animationDuration: `${6.5 + (i % 5)}s`,
              animationDelay: `${i * 0.22}s`,
              '--petal-drift': `${i % 2 ? 36 : -28}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
