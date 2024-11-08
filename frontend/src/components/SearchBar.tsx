import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Group } from '../types';
import * as Icons from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'link' | 'group';
  item: Link | Group;
}

interface SearchBarProps {
  links: Link[];
  groups: Group[];
  isExpanded: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ links, groups, isExpanded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      return;
    }

    const searchValue = searchTerm.toLowerCase();
    const linkResults = links
        .filter(link =>
            link.title.toLowerCase().includes(searchValue) ||
            link.subtitle.toLowerCase().includes(searchValue)
        )
        .map(link => ({ type: 'link' as const, item: link }));

    const groupResults = groups
        .filter(group =>
            group.name.toLowerCase().includes(searchValue)
        )
        .map(group => ({ type: 'group' as const, item: group }));

    const newResults = [...linkResults, ...groupResults];
    setResults(newResults);
    setShowDropdown(true);
    // 如果有搜索结果，默认选中第一个
    setSelectedIndex(newResults.length > 0 ? 0 : -1);
  }, [searchTerm, links, groups]);

  const handleSearchEngineRedirect = () => {
    window.open(`https://www.baidu.com/s?wd=${searchTerm}`, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        const selectedResult = results[selectedIndex];
        if (selectedResult.type === 'link') {
          window.open((selectedResult.item as Link).url, '_blank');
        }
      } else {
        handleSearchEngineRedirect();
      }
      setShowDropdown(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : -1
      );
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const getIcon = (iconName: string) => {
    return Icons[iconName as keyof typeof Icons] || Icons.HiOutlineLink;
  };

  return (
      <div ref={searchRef} className="relative w-full">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#01D8B6] to-[#00f5d4] opacity-5 blur-xl transition-opacity group-hover:opacity-10 rounded-xl" />
          <div className="relative flex items-center">
            <Icons.HiOutlineSearch className="absolute left-5 w-6 h-6 text-gray-400" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索链接、分组或使用百度搜索..."
                className="w-full pl-14 pr-6 py-4 bg-white border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-[#01D8B6] text-lg placeholder-gray-400"
            />
          </div>
        </div>

        <AnimatePresence>
          {showDropdown && (searchTerm.trim() !== '') && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="max-h-[60vh] overflow-y-auto">
                  {results.length > 0 ? (
                      <div className="divide-y">
                        {results.map((result, index) => {
                          const Icon = getIcon(
                              result.type === 'link'
                                  ? (result.item as Link).icon
                                  : (result.item as Group).icon
                          );

                          return (
                              <div
                                  key={index}
                                  className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 transition-colors ${
                                      index === selectedIndex ? 'bg-gray-50' : ''
                                  }`}
                                  onClick={() => {
                                    if (result.type === 'link') {
                                      window.open((result.item as Link).url, '_blank');
                                    }
                                    setShowDropdown(false);
                                  }}
                                  onMouseEnter={() => setSelectedIndex(index)}
                              >
                                <Icon className="w-5 h-5 text-[#01D8B6]" />
                                <div>
                                  <div className="font-medium">
                                    {result.type === 'link'
                                        ? (result.item as Link).title
                                        : (result.item as Group).name}
                                  </div>
                                  {result.type === 'link' && (
                                      <div className="text-sm text-gray-500">
                                        {(result.item as Link).subtitle}
                                      </div>
                                  )}
                                </div>
                              </div>
                          );
                        })}
                      </div>
                  ) : (
                      <div
                          className="p-4 hover:bg-gray-50 cursor-pointer text-center transition-colors"
                          onClick={handleSearchEngineRedirect}
                      >
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                          <Icons.HiOutlineSearch className="w-5 h-5" />
                          <span>在百度中搜索 "{searchTerm}"</span>
                        </div>
                      </div>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};
