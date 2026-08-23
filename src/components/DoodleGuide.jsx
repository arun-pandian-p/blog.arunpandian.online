import React from 'react';
import { motion } from 'framer-motion';

// Organic spring easing for sticky notes and doodles
const stickySpring = { type: 'spring', stiffness: 260, damping: 20 };

/**
 * Hand-drawn Vector Arrow Variants
 */
export const DoodleArrow = ({
  variant = 'curved-down-right',
  color = '#2563EB',
  width = 60,
  height = 50,
  className = '',
  strokeWidth = 2.4,
  animate = true,
}) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
    },
  };

  switch (variant) {
    case 'curved-down-right':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 70 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`overflow-visible doodle-stroke ${className}`}
        >
          <motion.path
            d="M8 8 C 22 6, 48 14, 52 38 C 53 42, 54 45, 55 48"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M44 41 C 49 46, 54 48, 55 48"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M58 37 C 56 43, 55 48, 55 48"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
        </svg>
      );

    case 'curved-down-left':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 70 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`overflow-visible doodle-stroke ${className}`}
        >
          <motion.path
            d="M62 8 C 48 6, 22 14, 18 38 C 17 42, 16 45, 15 48"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M26 41 C 21 46, 16 48, 15 48"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M12 37 C 14 43, 15 48, 15 48"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
        </svg>
      );

    case 'curved-up-right':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 70 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`overflow-visible doodle-stroke ${className}`}
        >
          <motion.path
            d="M10 46 C 26 48, 48 38, 54 16 C 55 12, 56 9, 56 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M44 14 C 50 9, 56 7, 56 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M59 18 C 57 12, 56 7, 56 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
        </svg>
      );

    case 'loop-arrow':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 80 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`overflow-visible doodle-stroke ${className}`}
        >
          <motion.path
            d="M12 18 C 30 4, 45 10, 42 28 C 38 42, 22 36, 26 22 C 30 10, 52 14, 68 45"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M58 43 C 64 45, 68 45, 68 45 L 68 34"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
        </svg>
      );

    case 'straight-squiggle':
    default:
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 65 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`overflow-visible doodle-stroke ${className}`}
        >
          <motion.path
            d="M6 15 C 16 10, 24 20, 36 12 C 44 8, 50 16, 56 14"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
          <motion.path
            d="M48 8 C 53 12, 56 14, 56 14 L 49 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={animate ? pathVariants : undefined}
            initial={animate ? 'hidden' : undefined}
            whileInView={animate ? 'show' : undefined}
            viewport={{ once: true }}
          />
        </svg>
      );
  }
};

/**
 * Hand-drawn Sparkle / Starburst Doodles
 */
export const DoodleSparkle = ({ size = 20, color = '#D97706', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path
      d="M12 2 C 12 7.5, 16.5 12, 22 12 C 16.5 12, 12 16.5, 12 22 C 12 16.5, 7.5 12, 2 12 C 7.5 12, 12 7.5, 12 2 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.2"
    />
  </svg>
);

export const DoodleStar = ({ size = 20, color = '#D97706', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path
      d="M12 2.5 L 14.8 8.8 L 21.6 9.4 L 16.5 14 L 18 20.8 L 12 17.2 L 6 20.8 L 7.5 14 L 2.4 9.4 L 9.2 8.8 Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.25"
    />
  </svg>
);

/**
 * Hand-drawn Idea Lightbulb
 */
export const DoodleLightbulb = ({ size = 22, color = '#D97706', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path
      d="M16 4 C 10.5 4, 6 8.5, 6 14 C 6 17.5, 8.5 20.5, 11 23 C 12 24, 12 25, 12 26 L 20 26 C 20 25, 20 24, 21 23 C 23.5 20.5, 26 17.5, 26 14 C 26 8.5, 21.5 4, 16 4 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.2"
    />
    <path d="M12 28 L 20 28" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M14 30 L 18 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 0.5 L 16 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M4 14 L 2 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M28 14 L 30 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Hand-drawn Mini Analytics Chart
 */
export const DoodleChart = ({ size = 22, color = '#2563EB', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path d="M4 4 L 4 28 L 28 28" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 28 L 9 20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M16 28 L 16 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M23 28 L 23 7" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <motion.path
      d="M7 21 C 12 18, 15 11, 25 5"
      stroke="#10B981"
      strokeWidth="2.2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    />
    <path d="M22 5 L 25 5 L 25 8" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Hand-drawn Paper Airplane
 */
export const DoodlePaperPlane = ({ size = 24, color = '#2563EB', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path
      d="M32 4 L 4 17 L 15 22 L 32 4 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.15"
    />
    <path
      d="M32 4 L 19 32 L 15 22 L 32 4 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.3"
    />
    <path d="M15 22 L 20 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Hand-drawn Thought / Question Cloud
 */
export const DoodleQuestion = ({ size = 22, color = '#D97706', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path
      d="M10 10 C 10 6.5, 13 4, 16.5 4 C 20 4, 23 6.5, 23 10 C 23 13, 20.5 15, 17 16 C 16 16.5, 16 18, 16 19.5"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="16" cy="25" r="1.6" fill={color} />
  </svg>
);

/**
 * Hand-drawn Heart
 */
export const DoodleHeart = ({ size = 20, color = '#EF4444', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`doodle-stroke shrink-0 ${className}`}
  >
    <path
      d="M12 20.5 C 12 20.5, 3.5 15, 2.5 9.5 C 1.5 4.5, 6 2, 9.5 3.5 C 11 4.2, 12 5.8, 12 5.8 C 12 5.8, 13 4.2, 14.5 3.5 C 18 2, 22.5 4.5, 21.5 9.5 C 20.5 15, 12 20.5, 12 20.5 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.25"
    />
  </svg>
);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Master Component: DoodleGuide (Yellow Sticky Note Style)
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders an authentic, realistic Yellow Sticky Post-It Note with handwritten
 * typography, tape strip, folded corner, drop shadow, and animated pointer arrows.
 */
export default function DoodleGuide({
  tag = 'Note',
  text,
  subtext,
  icon = 'sparkle',
  arrow = 'none', // 'curved-down-right' | 'curved-down-left' | 'curved-up-right' | 'loop-arrow' | 'straight-squiggle' | 'none'
  arrowPosition = 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'right' | 'left'
  rotation = -2,
  arrowColor = '#2563EB',
  className = '',
  hideOnMobile = false,
}) {
  const getIcon = () => {
    switch (icon) {
      case 'sparkle':
        return <DoodleSparkle color="#D97706" size={18} />;
      case 'star':
        return <DoodleStar color="#D97706" size={18} />;
      case 'lightbulb':
        return <DoodleLightbulb color="#D97706" size={19} />;
      case 'chart':
        return <DoodleChart color="#2563EB" size={20} />;
      case 'plane':
        return <DoodlePaperPlane color="#2563EB" size={20} />;
      case 'question':
        return <DoodleQuestion color="#D97706" size={19} />;
      case 'heart':
        return <DoodleHeart color="#EF4444" size={18} />;
      default:
        return <DoodleSparkle color="#D97706" size={18} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative inline-flex flex-col select-none z-20 group ${
        hideOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'
      } ${className}`}
    >
      {/* Top arrow if positioned on top */}
      {arrow !== 'none' && (arrowPosition === 'top-left' || arrowPosition === 'top-right') && (
        <div
          className={`flex mb-1 ${
            arrowPosition === 'top-right' ? 'justify-end pr-3' : 'justify-start pl-3'
          }`}
        >
          <DoodleArrow
            variant={arrow}
            color={arrowColor}
            width={52}
            height={38}
            className="group-hover:scale-105 transition-transform"
          />
        </div>
      )}

      {/* ── Realistic Yellow Sticky Note Paper ── */}
      <motion.div
        whileHover={{ scale: 1.025, rotate: rotation + 1.2, y: -2 }}
        transition={stickySpring}
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow:
            '0 10px 25px -5px rgba(202, 138, 4, 0.28), 0 4px 10px -2px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
        className="relative bg-gradient-to-b from-[#FEF9C3] via-[#FEF08A] to-[#FDE047] border border-amber-300/80 rounded-[3px] px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-sm sm:max-w-md transition-shadow hover:shadow-[0_15px_30px_-5px_rgba(202,138,4,0.38),0_6px_14px_-2px_rgba(0,0,0,0.15)]"
      >
        {/* Translucent Washi Tape Strip at top */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-4 bg-amber-100/80 border border-amber-300/50 shadow-xs rotate-[-1.5deg] backdrop-blur-xs rounded-[1px] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(217, 119, 6, 0.1) 3px, rgba(217, 119, 6, 0.1) 6px)',
          }}
        />

        {/* Paper Dog-Ear Corner Fold (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gradient-to-tl from-amber-400 to-amber-200 border-l border-t border-amber-300/80 rounded-tl-sm pointer-events-none shadow-xs" />

        {/* Header line inside note: Icon & Tag */}
        <div className="flex items-center gap-2 mb-1">
          <div className="shrink-0">{getIcon()}</div>
          {tag && (
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/90 border border-amber-300/60 px-1.5 py-0.5 rounded-[2px] shadow-2xs">
              {tag}
            </span>
          )}
        </div>

        {/* Handwritten Main Text */}
        <div className="flex flex-col pr-1">
          <span className="font-handwriting text-slate-900 text-base sm:text-lg font-bold leading-snug tracking-wide">
            {text}
          </span>
          {subtext && (
            <span className="font-handwriting text-slate-700 text-xs sm:text-sm leading-tight mt-0.5 font-medium">
              {subtext}
            </span>
          )}
        </div>
      </motion.div>

      {/* Bottom arrow if positioned on bottom */}
      {arrow !== 'none' &&
        (arrowPosition === 'bottom-right' ||
          arrowPosition === 'bottom-left' ||
          arrowPosition === 'bottom') && (
          <div
            className={`flex mt-1 ${
              arrowPosition === 'bottom-right'
                ? 'justify-end pr-4'
                : arrowPosition === 'bottom-left'
                ? 'justify-start pl-4'
                : 'justify-center'
            }`}
          >
            <DoodleArrow
              variant={arrow}
              color={arrowColor}
              width={54}
              height={42}
              className="group-hover:translate-y-1 transition-transform"
            />
          </div>
        )}

      {/* Right/Left inline arrows */}
      {arrow !== 'none' && arrowPosition === 'right' && (
        <div className="absolute -right-14 top-1/2 -translate-y-1/2">
          <DoodleArrow variant={arrow} color={arrowColor} width={50} height={30} />
        </div>
      )}
      {arrow !== 'none' && arrowPosition === 'left' && (
        <div className="absolute -left-14 top-1/2 -translate-y-1/2">
          <DoodleArrow variant={arrow} color={arrowColor} width={50} height={30} />
        </div>
      )}
    </motion.div>
  );
}
