"use client";

import { motion } from 'framer-motion';
import styles from './Components.module.css';

export default function LoadingState({ message = "Architecting your infrastructure..." }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.loadingContainer}
    >
      <div className={styles.spinner}></div>
      <motion.p 
        className={styles.loadingText}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
