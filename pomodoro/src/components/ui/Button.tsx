import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
