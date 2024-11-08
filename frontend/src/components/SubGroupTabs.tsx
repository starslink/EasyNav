import React from 'react';
import { motion } from 'framer-motion';
import { SubGroup } from '../types';

interface SubGroupTabsProps {
  subgroups: SubGroup[];
  activeSubGroup: string;
  onSelectSubGroup: (subgroupId: string) => void;
}

export const SubGroupTabs: React.FC<SubGroupTabsProps> = ({
  subgroups,
  activeSubGroup,
  onSelectSubGroup
}) => {
  if (!subgroups?.length) return null;

  return (
    <div className="px-4 pb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      <div className="flex space-x-2 min-w-max">
        {subgroups.map((subgroup) => (
          <motion.button
            key={subgroup.id}
            onClick={() => onSelectSubGroup(subgroup.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSubGroup === subgroup.id
                ? 'bg-[#01D8B6] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {subgroup.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};