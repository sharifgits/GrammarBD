import React from 'react';
import { classNames } from '../../lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "relative font-bold rounded-2xl transition-all duration-150 active:transform active:translate-y-1 w-full text-center flex justify-center items-center select-none shrink-0";
  
  const variants = {
    primary: "bg-indigo-500 text-white border-b-4 border-indigo-700 hover:bg-indigo-400 hover:border-indigo-600 active:border-b-0 active:mt-1",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 border-b-4 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-2 active:mt-[2px]",
    danger: "bg-rose-500 text-white border-b-4 border-rose-700 hover:bg-rose-400 hover:border-rose-600 active:border-b-0 active:mt-1",
    success: "bg-emerald-500 text-white border-b-4 border-emerald-700 hover:bg-emerald-400 hover:border-emerald-600 active:border-b-0 active:mt-1",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:translate-y-0 active:mt-0 font-semibold"
  };

  const disabledVariants = {
    primary: "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-b-4 border-slate-300 dark:border-slate-700 translate-y-0",
    secondary: "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-2 border-slate-200 dark:border-slate-800 border-b-4 translate-y-0",
    danger: "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-b-4 border-slate-300 dark:border-slate-700 translate-y-0",
    success: "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-b-4 border-slate-300 dark:border-slate-700 translate-y-0",
    ghost: "text-slate-300 dark:text-slate-600"
  };

  const sizes = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-5 text-base",
    lg: "py-3 px-6 text-lg"
  };

  const currentVariant = disabled ? disabledVariants[variant] : variants[variant];

  // For the active state visual compensation, we need a wrapper if we use margin top.
  // Instead, the active state translates Y and reduces border bottom. The mt-1 pushes it down to fill the gap.
  return (
    <div className={classNames("relative", className)}>
      <motion.button 
        whileTap={disabled ? undefined : { y: 2 }}
        className={classNames(
          baseClasses,
          currentVariant,
          sizes[size]
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    </div>
  );
}
