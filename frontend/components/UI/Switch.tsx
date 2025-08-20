'use client';
import * as React from 'react';

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
};

export default function Switch({ checked, onChange, label, disabled, id }: SwitchProps) {
  const generatedId = React.useId(); // always called
  const switchId = id || generatedId;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label htmlFor={switchId} className="text-sm text-gray-800 select-none">
          {label}
        </label>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`h-7 w-12 rounded-full p-1 transition ${checked ? 'bg-black' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}
