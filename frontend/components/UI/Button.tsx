'use client';
import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition';
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
  const variants =
    variant === 'primary'
      ? 'bg-black text-white hover:bg-black/90'
      : variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-transparent hover:bg-gray-100 text-gray-800';

  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </button>
  );
}
