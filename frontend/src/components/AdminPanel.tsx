import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, Link, SubGroup } from '../types';
import * as Icons from 'react-icons/hi';
import { createGroup, updateGroup, deleteGroup, createLink, updateLink, deleteLink } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { IconSelector } from './IconSelector';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { NotificationMessage } from './Notification';
import { Pagination } from './Pagination';
import { SearchInput } from './SearchInput';
import { usePagination } from '../hooks/usePagination';
import { GroupListItem } from './GroupListItem';
import { LinkListItem } from './LinkListItem';
import { SubgroupManager } from './SubgroupManager';
import { SortOrderInput } from './SortOrderInput';

interface AdminPanelProps {
  groups: Group[];
  links: Link[];
  onUpdate: () => void;
  addNotification: (type: NotificationMessage['type'], message: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const AdminPanel: React.FC<AdminPanelProps> = ({
                                                        groups = [],
                                                        links = [],
                                                        onUpdate,
                                                        addNotification
                                                      }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'links'>('groups');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [groupIcon, setGroupIcon] = useState('HiOutlineFolder');
  const [linkIcon, setLinkIcon] = useState('HiOutlineLink');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [managingSubgroupsFor, setManagingSubgroupsFor] = useState<Group | null>(null);
  const [sortOrder, setSortOrder] = useState(100);
  const [sortOrderError, setSortOrderError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'group' | 'link';
    id: string;
    name: string;
    triggerRef: React.RefObject<HTMLButtonElement> | undefined;
  }>({
    isOpen: false,
    type: 'group',
    id: '',
    name: '',
    triggerRef: undefined
  });

  const {
    items: paginatedGroups,
    currentPage: groupsPage,
    totalPages: totalGroupPages,
    goToPage: goToGroupPage,
    searchTerm: groupSearchTerm,
    setSearchTerm: setGroupSearchTerm,
    totalItems: totalGroups
  } = usePagination(groups || [], ITEMS_PER_PAGE);

  const {
    items: paginatedLinks,
    currentPage: linksPage,
    totalPages: totalLinkPages,
    goToPage: goToLinkPage,
    searchTerm: linkSearchTerm,
    setSearchTerm: setLinkSearchTerm,
    totalItems: totalLinks
  } = usePagination(links || [], ITEMS_PER_PAGE);

  const groupFormRef = useRef<HTMLFormElement>(null);
  const linkFormRef = useRef<HTMLFormElement>(null);

  const resetGroupForm = () => {
    if (groupFormRef.current) {
      groupFormRef.current.reset();
      setGroupIcon('HiOutlineFolder');
      setSelectedSubgroupId('');
      setSortOrder(100);
      setSortOrderError('');
    }
  };

  const resetLinkForm = () => {
    if (linkFormRef.current) {
      linkFormRef.current.reset();
      setLinkIcon('HiOutlineLink');
      setSelectedSubgroupId('');
      setSelectedGroupId('');
    }
  };

  React.useEffect(() => {
    if (editingGroup) {
      setSortOrder(editingGroup.sort_order);
    } else {
      setSortOrder(100);
    }
  }, [editingGroup]);

  const handleGroupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, {
          name: formData.get('name') as string,
          icon: groupIcon,
          sort_order: sortOrder
        });
        setEditingGroup(null);
        addNotification('success', '分组更新成功');
      } else {
        await createGroup({
          id: uuidv4(),
          name: formData.get('name') as string,
          icon: groupIcon,
          sort_order: sortOrder
        });
        resetGroupForm();
        addNotification('success', '分组创建成功');
      }
      onUpdate();
    } catch (err: any) {
      const error = err.response?.data?.error || '操作失败';
      if (error.includes('排序值')) {
        setSortOrderError(error);
      } else {
        addNotification('error', error);
      }
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const linkData = {
        title: formData.get('title') as string,
        subtitle: formData.get('subtitle') as string,
        url: formData.get('url') as string,
        icon: linkIcon,
        group_id: formData.get('group_id') as string,
        subgroup_id: selectedSubgroupId || undefined
      };

      if (editingLink) {
        await updateLink(editingLink.id, linkData);
        setEditingLink(null);
        addNotification('success', '链接更新成功');
      } else {
        await createLink({
          id: uuidv4(),
          ...linkData
        });
        resetLinkForm();
        addNotification('success', '链接创建成功');
      }
      onUpdate();
    } catch (err: any) {
      addNotification('error', err.response?.data?.error || '操作失败');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === 'group') {
        const groupLinks = (links || []).filter(link => link.group_id === deleteConfirm.id);
        if (groupLinks.length > 0) {
          addNotification('error', `无法删除分组"${deleteConfirm.name}"，请先删除该分组下的所有链接（当前有 ${groupLinks.length} 个链接）`);
          setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
          return;
        }

        await deleteGroup(deleteConfirm.id);
        addNotification('success', '分组删除成功');
      } else {
        await deleteLink(deleteConfirm.id);
        addNotification('success', '链接删除成功');
      }
      onUpdate();
    } catch (err: any) {
      addNotification('error', err.response?.data?.error || '删除失败');
    } finally {
      setDeleteConfirm(prev => ({ ...prev, isOpen: false, triggerRef: undefined }));
    }
  };

  const confirmDelete = (type: 'group' | 'link', id: string, name: string, triggerRef: React.RefObject<HTMLButtonElement>) => {
    if (type === 'group') {
      const groupLinks = links.filter(link => link.group_id === id);
      if (groupLinks.length > 0) {
        addNotification('error', `无法删除分组"${name}"，请先删除该分组下的所有链接（当前有 ${groupLinks.length} 个链接）`);
        return;
      }
    }

    setDeleteConfirm({
      isOpen: true,
      type,
      id,
      name,
      triggerRef
    });
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    const selectedGroup = groups.find(g => g.id === groupId);
    if (selectedGroup?.subgroups && selectedGroup.subgroups.length > 0) {
      setSelectedSubgroupId(selectedGroup.subgroups[0].id);
    } else {
      setSelectedSubgroupId('');
    }
  };

  // 当编辑链接时，设置正确的二级分类和分组
  React.useEffect(() => {
    if (editingLink) {
      setSelectedGroupId(editingLink.group_id);
      setSelectedSubgroupId(editingLink.subgroup_id || '');
      setLinkIcon(editingLink.icon);
    } else {
      setSelectedSubgroupId('');
      setSelectedGroupId('');
      setLinkIcon('HiOutlineLink');
    }
  }, [editingLink]);

  // 获取当前选中分组的二级分类
  const currentGroupSubgroups = React.useMemo(() => {
    const currentGroup = groups.find(g => g.id === (editingLink?.group_id || selectedGroupId));
    return currentGroup?.subgroups || [];
  }, [groups, editingLink?.group_id, selectedGroupId]);

  return (
      <div className="p-6">
        <DeleteConfirmDialog
            isOpen={deleteConfirm.isOpen}
            title={`删除${deleteConfirm.type === 'group' ? '分组' : '链接'}`}
            message={`确定要删除${deleteConfirm.type === 'group' ? '分组' : '链接'}"${deleteConfirm.name}"吗？此操作无法撤销。`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false, triggerRef: undefined }))}
            triggerRef={deleteConfirm.triggerRef}
        />

        {managingSubgroupsFor && (
            <SubgroupManager
                group={managingSubgroupsFor}
                subgroups={managingSubgroupsFor.subgroups || []}
                onClose={() => setManagingSubgroupsFor(null)}
                onUpdate={onUpdate}
                addNotification={addNotification}
            />
        )}

        <div className="mb-6 flex space-x-4">
          <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg ${
                  activeTab === 'groups'
                      ? 'bg-[#01D8B6] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            分组管理
          </button>
          <button
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 rounded-lg ${
                  activeTab === 'links'
                      ? 'bg-[#01D8B6] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            链接管理
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'groups' ? (
              <motion.div
                  key="groups"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid gap-4">
                  <form ref={groupFormRef} onSubmit={handleGroupSubmit} className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingGroup ? '编辑分组' : '新增分组'}
                    </h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          名称
                        </label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={editingGroup?.name}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          图标
                        </label>
                        <IconSelector value={groupIcon} onChange={setGroupIcon} />
                      </div>
                      <SortOrderInput
                          value={sortOrder}
                          onChange={setSortOrder}
                          error={sortOrderError}
                      />
                      <div className="flex justify-end space-x-2">
                        {editingGroup && (
                            <button
                                type="button"
                                onClick={() => {
                                  setEditingGroup(null);
                                  resetGroupForm();
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                              取消
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#01D8B6] text-white rounded-lg hover:bg-[#00c4a5]"
                        >
                          {editingGroup ? '保存' : '添加'}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        分组列表
                        <span className="ml-2 text-sm text-gray-500">
                      (共 {totalGroups} 个)
                    </span>
                      </h3>
                      <div className="w-64">
                        <SearchInput
                            value={groupSearchTerm}
                            onChange={setGroupSearchTerm}
                            placeholder="搜索分组..."
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 mb-4">
                      {paginatedGroups.map(group => (
                          <GroupListItem
                              key={group.id}
                              group={group}
                              links={links}
                              subgroups={group.subgroups}
                              onEdit={setEditingGroup}
                              onDelete={confirmDelete.bind(null, 'group')}
                              onManageSubgroups={setManagingSubgroupsFor}
                          />
                      ))}
                    </div>

                    {totalGroupPages > 1 && (
                        <Pagination
                            currentPage={groupsPage}
                            totalPages={totalGroupPages}
                            onPageChange={goToGroupPage}
                        />
                    )}
                  </div>
                </div>
              </motion.div>
          ) : (
              <motion.div
                  key="links"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid gap-4">
                  <form ref={linkFormRef} onSubmit={handleLinkSubmit} className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingLink ? '编辑链接' : '新增链接'}
                    </h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          标题
                        </label>
                        <input
                            type="text"
                            name="title"
                            defaultValue={editingLink?.title}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          副标题
                        </label>
                        <input
                            type="text"
                            name="subtitle"
                            defaultValue={editingLink?.subtitle}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <input
                            type="url"
                            name="url"
                            defaultValue={editingLink?.url}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          图标
                        </label>
                        <IconSelector value={linkIcon} onChange={setLinkIcon} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          所属分组
                        </label>
                        <select
                            name="group_id"
                            value={selectedGroupId}
                            onChange={(e) => handleGroupSelect(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                            required
                        >
                          <option value="">请选择分组</option>
                          {groups.map(group => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                          ))}
                        </select>
                      </div>
                      {currentGroupSubgroups.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              二级分类
                            </label>
                            <select
                                name="subgroup_id"
                                value={selectedSubgroupId}
                                onChange={(e) => setSelectedSubgroupId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                            >
                              <option value="">无</option>
                              {currentGroupSubgroups.map(subgroup => (
                                  <option key={subgroup.id} value={subgroup.id}>
                                    {subgroup.name}
                                  </option>
                              ))}
                            </select>
                          </div>
                      )}
                      <div className="flex justify-end space-x-2">
                        {editingLink && (
                            <button
                                type="button"
                                onClick={() => {
                                  setEditingLink(null);
                                  resetLinkForm();
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                              取消
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#01D8B6] text-white rounded-lg hover:bg-[#00c4a5]"
                        >
                          {editingLink ? '保存' : '添加'}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        链接列表
                        <span className="ml-2 text-sm text-gray-500">
                      (共 {totalLinks} 个)
                    </span>
                      </h3>
                      <div className="w-64">
                        <SearchInput
                            value={linkSearchTerm}
                            onChange={setLinkSearchTerm}
                            placeholder="搜索链接..."
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 mb-4">
                      {paginatedLinks.map(link => (
                          <LinkListItem
                              key={link.id}
                              link={link}
                              group={groups.find(g => g.id === link.group_id)}
                              subgroup={groups
                                  .find(g => g.id === link.group_id)
                                  ?.subgroups?.find(s => s.id === link.subgroup_id)}
                              onEdit={setEditingLink}
                              onDelete={confirmDelete.bind(null, 'link')}
                          />
                      ))}
                    </div>

                    {totalLinkPages > 1 && (
                        <Pagination
                            currentPage={linksPage}
                            totalPages={totalLinkPages}
                            onPageChange={goToLinkPage}
                        />
                    )}
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};
