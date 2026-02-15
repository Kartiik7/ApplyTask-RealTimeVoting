import React from 'react';
import styles from './Layout.module.css';

const Layout = ({ children, title, subtitle }) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        {title && <h1 className={styles.logo}>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </header>
      <main className={`${styles.main} fade-in`}>
        {children}
      </main>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} Poll App. Built with React.
      </footer>
    </div>
  );
};

export default Layout;
