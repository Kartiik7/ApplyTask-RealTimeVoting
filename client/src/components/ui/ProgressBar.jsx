import React, { useState, useEffect } from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ 
  value, 
  max = 100, 
  variant = 'primary', 
  label, 
  showValue = false, 
  className = '',
  animate = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const [animatedPercentage, setAnimatedPercentage] = useState(animate ? 0 : percentage);
  
  useEffect(() => {
    if (animate) {
      // Small delay before starting animation for better visual effect
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercentage(percentage);
    }
  }, [percentage, animate]);
  
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
          className={`${styles.fill} ${styles[variant]} ${animate ? styles.animated : ''}`} 
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
