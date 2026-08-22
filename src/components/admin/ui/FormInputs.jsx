import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Label = ({ className, children, required, ...props }) => (
  <label className={cn("block text-sm font-semibold text-slate-800 mb-1.5", className)} {...props}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const ErrorMsg = ({ message }) => {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-500 mt-1.5">{message}</p>;
};

/* Eye toggle controlling whether the element is SHOWN ON THE PUBLIC SITE.
   Amber = hidden from visitors. Saved with the form, applied in realtime. */
export const EyeToggle = ({ visible, onToggle, label = 'element' }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={!visible}
    aria-label={visible ? `Hide ${label} on the site` : `Show ${label} on the site`}
    title={visible ? 'Visible on site — click to hide' : 'Hidden on site — click to show'}
    className={cn(
      'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors cursor-pointer',
      visible
        ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
        : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
    )}
  >
    {visible ? <Eye size={13} /> : <EyeOff size={13} />}
    {!visible && 'Hidden'}
  </button>
);

/* Label row combining the field label with an optional site-visibility eye */
const LabelRow = ({ label, required, siteVisible, onToggleVisible }) => (
  <div className="flex items-center justify-between gap-2 mb-1.5">
    <Label className="mb-0" required={required}>{label}</Label>
    {onToggleVisible && <EyeToggle visible={siteVisible} onToggle={onToggleVisible} label={label} />}
  </div>
);

export const TextField = React.forwardRef(({ label, error, className, siteVisible = true, onToggleVisible, ...props }, ref) => (
  <div className={className}>
    {label && (onToggleVisible
      ? <LabelRow label={label} required={props.required} siteVisible={siteVisible} onToggleVisible={onToggleVisible} />
      : <Label required={props.required}>{label}</Label>)}
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl border bg-slate-50 text-slate-800 text-sm outline-none transition-shadow",
        error ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
        props.disabled && "opacity-60 cursor-not-allowed bg-slate-100",
        onToggleVisible && !siteVisible && "opacity-50"
      )}
      {...props}
    />
    <ErrorMsg message={error} />
  </div>
));
TextField.displayName = "TextField";

export const TextArea = React.forwardRef(({ label, error, className, rows = 4, siteVisible = true, onToggleVisible, ...props }, ref) => (
  <div className={className}>
    {label && (onToggleVisible
      ? <LabelRow label={label} required={props.required} siteVisible={siteVisible} onToggleVisible={onToggleVisible} />
      : <Label required={props.required}>{label}</Label>)}
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm outline-none transition-shadow resize-y",
        error ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
        props.disabled && "opacity-60 cursor-not-allowed bg-slate-100",
        onToggleVisible && !siteVisible && "opacity-50"
      )}
      {...props}
    />
    <ErrorMsg message={error} />
  </div>
));
TextArea.displayName = "TextArea";

export const Toggle = React.forwardRef(({ label, description, error, className, checked, onChange, ...props }, ref) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div>
      {label && <Label className="mb-0">{label}</Label>}
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      <ErrorMsg message={error} />
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        checked ? 'bg-blue-600' : 'bg-slate-200',
        props.disabled && "opacity-50 cursor-not-allowed"
      )}
      ref={ref}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  </div>
));
Toggle.displayName = "Toggle";
