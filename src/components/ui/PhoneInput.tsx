'use client';

import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, placeholder = 'Phone number', required, className }: Props) {
  return (
    <PhoneInputLib
      international
      defaultCountry="TZ"
      value={value}
      onChange={(val) => onChange(val || '')}
      placeholder={placeholder}
      className={className || 'phone-input-wrapper'}
      required={required}
    />
  );
}
