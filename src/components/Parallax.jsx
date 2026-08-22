import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Scroll-linked parallax. The outer element is measured (never transformed)
 * and the inner element drifts on the Y axis as it moves through the viewport.
 * `speed` ~ how far it drifts (px each direction). Respects reduced-motion
 * automatically because framer pauses transforms when the OS requests it.
 */
export default function Parallax({ children, speed = 40, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">{children}</motion.div>
    </div>
  );
}
