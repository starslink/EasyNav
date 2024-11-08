import React, { useState, useEffect } from 'react';
import { Group, SubGroup } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import * as Icons from 'react-icons/hi';

interface SidebarProps {
  groups: Group[];
  selectedGroup: string;
  selectedSubgroup: string;
  onSelect: (groupId: string, subgroupId?: string) => void;
  username: string;
  onLogout: () => void;
  onAdminClick: () => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  groups, 
  selectedGroup,
  selectedSubgroup,
  onSelect,
  username,
  onLogout,
  onAdminClick,
  isAdmin
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(groups);

  useEffect(() => {
    const initialExpanded = groups.reduce<{ [key: string]: boolean }>((acc, group) => ({
      ...acc,
      [group.id]: selectedGroup === group.id || group.subgroups?.some(sub => sub.id === selectedSubgroup) || false
    }), {});
    setExpandedGroups(initialExpanded);
  }, [groups, selectedGroup, selectedSubgroup]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGroups(groups);
      return;
    }

    const filtered = groups.map(group => {
      const matchingSubgroups = group.subgroups?.filter(subgroup =>
        subgroup.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (group.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return { ...group };
      } else if (matchingSubgroups?.length) {
        return { ...group, subgroups: matchingSubgroups };
      }
      return null;
    }).filter(Boolean) as Group[];

    setFilteredGroups(filtered);

    // Expand groups that have matching items
    const newExpanded = filtered.reduce<{ [key: string]: boolean }>((acc, group) => ({
      ...acc,
      [group.id]: true
    }), {});
    setExpandedGroups(prev => ({ ...prev, ...newExpanded }));
  }, [searchTerm, groups]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 20;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleGroupClick = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    
    // Toggle expansion if the group has subgroups
    if (group?.subgroups?.length) {
      setExpandedGroups(prev => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    }

    // Select group and scroll to section
    onSelect(groupId);
    scrollToSection(groupId);
  };

  const handleSubgroupClick = (groupId: string, subgroupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Ensure parent group is expanded
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: true
    }));

    // Select subgroup and scroll to section
    onSelect(groupId, subgroupId);
    setTimeout(() => {
      scrollToSection(subgroupId);
    }, 100);
  };

  const getIcon = (iconName: string) => {
    return Icons[iconName as keyof typeof Icons] || Icons.HiOutlineFolder;
  };

  return (
    <motion.div 
      className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col z-50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100">
        <motion.div 
          className="flex items-center space-x-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-8 h-8 bg-[#01D8B6] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <h1 className="text-gray-800 text-xl font-bold">公司导航</h1>
        </motion.div>
        <motion.div
          className="px-3 py-1.5 bg-gray-50 rounded-full flex items-center space-x-2 w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Icons.HiOutlineUser className="w-4 h-4 text-[#01D8B6]" />
          <span className="text-sm text-gray-600">{username}</span>
        </motion.div>
      </div>

      {/* Search Section */}
      <div className="px-4 pt-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索分组和分类..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D8B6]/50 transition-all duration-200"
          />
          <Icons.HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icons.HiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Admin Button */}
      {isAdmin && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onAdminClick}
          className="mx-4 mt-4 flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-[#01D8B6]/10 text-[#01D8B6] hover:bg-[#01D8B6]/20 transition-colors"
        >
          <Icons.HiOutlineCog className="w-5 h-5" />
          <span className="text-sm font-medium">管理面板</span>
        </motion.button>
      )}

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        {filteredGroups.map((group, index) => {
          const Icon = getIcon(group.icon);
          const isExpanded = expandedGroups[group.id];
          const hasSubgroups = group.subgroups && group.subgroups.length > 0;
          const isSelected = selectedGroup === group.id;
          
          return (
            <div key={group.id} className="space-y-1">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGroupClick(group.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200',
                  isSelected && !selectedSubgroup
                    ? 'bg-[#01D8B6] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{group.name}</span>
                </div>
                {hasSubgroups && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icons.HiChevronDown className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>

              {/* Subgroups */}
              <AnimatePresence initial={false}>
                {hasSubgroups && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 space-y-1 overflow-hidden"
                  >
                    {group.subgroups?.map((subgroup: SubGroup) => (
                      <motion.button
                        key={subgroup.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -10, opacity: 0 }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => handleSubgroupClick(group.id, subgroup.id, e)}
                        className={clsx(
                          'w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          selectedSubgroup === subgroup.id
                            ? 'bg-[#01D8B6] text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50'
                        )}
                      >
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span className="truncate">{subgroup.name}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            未找到匹配的结果
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onLogout}
        className="p-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-gray-600 hover:text-[#01D8B6] hover:bg-gray-50 transition-all duration-200"
      >
        <Icons.HiOutlineLogout className="w-5 h-5" />
        <span className="text-sm font-medium">退出登录</span>
      </motion.button>
    </motion.div>
  );
};