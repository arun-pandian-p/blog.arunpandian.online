import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Awwwards-style magnetic element: the child gently pulls toward the
 * cursor and springs back on leave. Clamp strength keeps it in its hit box.
 * Renders as <a> when `href` is passed, otherwise <button>.
 */
export default function MagneticButton({
  children,
  href,
  className = '',
  strength = 0.35,
  as,
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  const Comp = motion[as || (href ? 'a' : 'button')];

  return (
    <Comp
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`inline-flex items-center justify-center cursor-pointer will-change-transform ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
