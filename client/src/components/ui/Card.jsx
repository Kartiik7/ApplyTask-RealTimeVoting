import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
