import React from 'react';
import { Link } from '../types';
import { motion } from 'framer-motion';
import * as Icons from 'react-icons/hi';

interface LinkCardProps {
  link: Link;
  index: number;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, index }) => {
  const Icon = Icons[link.icon as keyof typeof Icons] || Icons.HiOutlineFolder;

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white/90 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center text-center transform transition-all duration-300 hover:bg-gradient-to-br from-white to-[#01D8B6]/10 group"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="mb-2"
      >
        <Icon className="w-8 h-8 text-[#01D8B6]" />
      </motion.div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{link.title}</h3>
      <p className="text-xs text-gray-600 line-clamp-2">{link.subtitle}</p>
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[#01D8B6] text-xs">点击访问 →</span>
      </div>
    </motion.a>
  );
};