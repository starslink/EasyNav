import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AdminPanel} from './AdminPanel';
import {fetchGroups, fetchLinks} from '../services/api';
import {Group, Link, NotificationMessage} from '../types';
import {HiOutlineArrowLeft} from 'react-icons/hi';
import {Watermark} from './Watermark';

interface AdminLayoutProps {
  addNotification: (type: NotificationMessage['type'], message: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ addNotification }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsData, linksData] = await Promise.all([
        fetchGroups(),
        fetchLinks()
      ]);
      setGroups(groupsData);
      setLinks(linksData);
    } catch (error: any) {
      addNotification('error', error.response?.data?.error || '加载数据失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Watermark username={username} />
      <div className="bg-white shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-[#01D8B6] transition-colors"
              >
                <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
                返回主页
              </button>
              <h1 className="ml-8 text-2xl font-bold text-gray-900">管理面板</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AdminPanel
          groups={groups}
          links={links}
          onUpdate={loadData}
          addNotification={addNotification}
        />
      </div>
    </div>
  );
};
