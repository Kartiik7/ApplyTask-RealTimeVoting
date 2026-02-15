import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  error,
  id,
  maxLength,
  value,
  className = '',
  containerClassName = '',
  showCount = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  const currentLength = value ? String(value).length : 0;
  
  return (
    <div className={`${styles.container} ${containerClassName}`}>
      {(label || (showCount && maxLength)) && (
        <div className={styles.labelContainer}>
          {label && (
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span 
              className={`${styles.count} ${currentLength > maxLength ? styles.countError : ''}`}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <div className={`${styles.inputWrapper} ${hasError ? styles.hasError : ''}`}>
        <input
          id={inputId}
          className={`${styles.input} ${className}`}
          value={value}
          maxLength={maxLength ? maxLength : undefined} // Don't enforce strictly if we want to show red counter
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      
      {hasError && (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
