import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.32,
  ease: [0.4, 0, 0.2, 1],
};

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 pl-64 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="p-8 flex-1 max-w-7xl w-full mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
