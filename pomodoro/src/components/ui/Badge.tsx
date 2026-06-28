import type { ReactNode, HTMLAttributes } from 'react';
import styles from './ui.module.css';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function Badge({ children, className, ...rest }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${className ?? ''}`} {...rest}>
      {children}
    </span>
  );
}
