import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LinkGrid} from './LinkGrid';
import {SearchBar} from './SearchBar';
import {fetchGroups, fetchLinks} from '../services/api';
import {AuthState, Group, Link, NotificationMessage, SubGroup} from '../types';
import {Watermark} from './Watermark';
import {motion} from 'framer-motion';
import * as Icons from 'react-icons/hi';

interface MainLayoutProps {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  addNotification: (type: NotificationMessage['type'], message: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ auth, setAuth, addNotification }) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<SubGroup[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsExpanded(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const groupsData = await fetchGroups();
      const linksData = await fetchLinks();

      setGroups(groupsData);
      setSubgroups(groupsData.flatMap((group: Group) => group.subgroups || []));
      setLinks(linksData);

      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleLogout();
        addNotification('error', '会话已过期，请重新登录');
      } else {
        addNotification('error', error.message || '加载数据失败，请刷新页面重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth({
      isAuthenticated: false,
      user: null
    });
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleGroupSelect = (groupId: string, subgroupId?: string) => {
    setSelectedGroup(groupId);
    setSelectedSubgroup(subgroupId || '');
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#01D8B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Watermark username={auth.user || ''} />

        {/* Header */}
        <div className="fixed top-0 right-0 p-4 flex justify-end space-x-2 z-20">
          {auth.user === 'admin' && (
              <button
                  onClick={handleAdminClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white transition-colors"
              >
                <Icons.HiOutlineCog className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">管理面板</span>
              </button>
          )}
          <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white transition-colors"
          >
            <Icons.HiOutlineLogout className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">退出登录</span>
          </button>
        </div>

        {/* Main Content */}
        <div className={`relative z-10 transition-all duration-300 ${isExpanded ? 'pt-24' : 'pt-[30vh]'}`}>
          {/* Logo and Search Section */}
          <div className="bg-gradient-to-b from-gray-50 to-transparent pb-6 z-20">
            <div className="flex flex-col items-center">
              {/* Logo */}
              <motion.div
                  initial={false}
                  animate={{
                    scale: isExpanded ? 0.8 : 1,
                    marginBottom: isExpanded ? '1rem' : '2rem'
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-[#01D8B6] to-[#00f5d4] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#01D8B6]/20">
                  <span className="text-white text-3xl font-bold">N</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">公司导航门户</h1>
                {!isExpanded && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-gray-500 text-sm"
                    >
                      向下滚动查看更多内容
                    </motion.p>
                )}
              </motion.div>

              {/* Search Bar */}
              <motion.div
                  initial={false}
                  animate={{ width: isExpanded ? '100%' : '75%' }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-4xl px-4"
              >
                <SearchBar
                    links={links}
                    groups={groups}
                    isExpanded={isExpanded}
                />
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <motion.div
              initial={false}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? 'auto' : 0
              }}
              transition={{ duration: 0.3 }}
              className="w-full px-4"
          >
            <LinkGrid
                links={links}
                groups={groups}
                subgroups={subgroups}
                selectedGroup={selectedGroup}
                selectedSubgroup={selectedSubgroup}
            />
          </motion.div>
        </div>
      </div>
  );
};
