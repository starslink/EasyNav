import React, { useState, useEffect } from 'react';
import { Link, Group, SubGroup } from '../types';
import { LinkCard } from './LinkCard';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'react-icons/hi';

interface LinkGridProps {
  links: Link[];
  groups: Group[];
  subgroups: SubGroup[];
  selectedGroup: string;
  selectedSubgroup: string;
}

export const LinkGrid: React.FC<LinkGridProps> = ({ 
  links, 
  groups, 
  subgroups,
  selectedGroup,
  selectedSubgroup
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const initialExpanded = groups.reduce((acc, group) => ({
      ...acc,
      [group.id]: group.id === selectedGroup || group.subgroups?.some(sub => sub.id === selectedSubgroup)
    }), {});
    setExpandedGroups(initialExpanded);
  }, [groups, selectedGroup, selectedSubgroup]);

  const getIcon = (iconName: string) => {
    return Icons[iconName as keyof typeof Icons] || Icons.HiOutlineFolder;
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getGroupLinks = (groupId: string, subgroupId?: string) => {
    return links.filter(link => {
      if (subgroupId) {
        return link.group_id === groupId && link.subgroup_id === subgroupId;
      }
      return link.group_id === groupId && !link.subgroup_id;
    });
  };

  return (
    <div className="max-w-[2000px] mx-auto">
      <div className="p-4">
        {groups.map((group) => {
          const Icon = getIcon(group.icon);
          const isExpanded = expandedGroups[group.id];
          const groupSubgroups = subgroups.filter(sub => sub.group_id === group.id);
          const mainGroupLinks = getGroupLinks(group.id);

          return (
            <motion.div
              key={group.id}
              id={group.id}
              className="mb-8 bg-white rounded-lg shadow-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="sticky top-0 z-20 bg-white rounded-t-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-[#01D8B6]" />
                    <h2 className="text-xl font-bold text-gray-800">{group.name}</h2>
                    <span className="ml-3 text-sm text-gray-500">
                      ({links.filter(link => link.group_id === group.id).length})
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icons.HiChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
              </motion.div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {/* Main group links (without subgroup) */}
                    {mainGroupLinks.length > 0 && (
                      <div className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                          {mainGroupLinks.map((link, index) => (
                            <LinkCard key={link.id} link={link} index={index} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subgroups and their links */}
                    {groupSubgroups.map(subgroup => {
                      const subgroupLinks = getGroupLinks(group.id, subgroup.id);
                      if (subgroupLinks.length === 0) return null;

                      return (
                        <div key={subgroup.id} id={subgroup.id} className="border-t border-gray-100">
                          <div className="px-4 py-2 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-600">
                              {subgroup.name}
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                              {subgroupLinks.map((link, index) => (
                                <LinkCard key={link.id} link={link} index={index} />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {mainGroupLinks.length === 0 && groupSubgroups.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        暂无链接
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};