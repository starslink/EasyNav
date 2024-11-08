import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'react-icons/hi';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const iconList = Object.entries(Icons)
    .filter(([key]) => key.startsWith('HiOutline'))
    .filter(([key]) => 
      key.toLowerCase().includes(search.toLowerCase())
    );

  const selectedIcon = Icons[value as keyof typeof Icons] || Icons.HiOutlineFolder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent bg-white"
      >
        <div className="flex items-center space-x-2">
          {React.createElement(selectedIcon, { className: "w-5 h-5" })}
          <span className="text-sm text-gray-600">{value}</span>
        </div>
        <Icons.HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-[300px] max-h-[400px] overflow-auto mt-1 bg-white rounded-lg shadow-lg border"
          >
            <div className="sticky top-0 bg-white p-2 border-b">
              <input
                type="text"
                placeholder="搜索图标..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent text-sm"
              />
            </div>
            <div className="grid grid-cols-6 gap-1 p-2">
              {iconList.map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg hover:bg-gray-50 flex items-center justify-center ${
                    value === key ? 'bg-[#01D8B6]/10 text-[#01D8B6]' : 'text-gray-600'
                  }`}
                  title={key}
                >
                  {React.createElement(Icon, { className: "w-5 h-5" })}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};