import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ 
  value, 
  max = 100, 
  variant = 'primary', 
  label, 
  showValue = false, 
  className = '' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`${styles.container} ${className}`}>
      {(label || showValue) && (
        <div className={styles.labelContainer}>
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={styles.track} role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax={max}>
        <div 
          className={`${styles.fill} ${styles[variant]}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
