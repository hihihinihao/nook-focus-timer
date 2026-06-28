import type { ReactNode, HTMLAttributes } from 'react';
import styles from './ui.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={`${styles.card} ${className ?? ''}`} {...rest}>
      {children}
    </div>
  );
}
