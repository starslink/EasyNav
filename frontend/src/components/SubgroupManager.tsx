import React, {useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {Group, SubGroup} from '../types';
import * as Icons from 'react-icons/hi';
import {createSubgroup, deleteSubgroup, fetchSubgroups, updateSubgroup} from '../services/api';
import {NotificationMessage} from './Notification';
import {DeleteConfirmDialog} from './DeleteConfirmDialog';
import {SortOrderInput} from './SortOrderInput';

interface SubgroupManagerProps {
  group: Group;
  subgroups: SubGroup[];
  onClose: () => void;
  onUpdate: () => void;
  addNotification: (type: NotificationMessage['type'], message: string) => void;
}

const ITEMS_PER_PAGE = 5;

export const SubgroupManager: React.FC<SubgroupManagerProps> = ({
                                                                  group,
                                                                  subgroups: initialSubgroups,
                                                                  onClose,
                                                                  onUpdate,
                                                                  addNotification
                                                                }) => {
  const [subgroups, setSubgroups] = useState<SubGroup[]>(initialSubgroups);
  const [editingSubgroup, setEditingSubgroup] = useState<SubGroup | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(editingSubgroup?.sort_order || 100);
  const [sortOrderError, setSortOrderError] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    subgroup: SubGroup | null;
  }>({
    isOpen: false,
    subgroup: null
  });

  const totalPages = Math.ceil(subgroups.length / ITEMS_PER_PAGE);
  const paginatedSubgroups = subgroups.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setSortOrder(editingSubgroup?.sort_order || 100);
  }, [editingSubgroup]);

  const refreshSubgroups = async () => {
    try {
      const updatedSubgroups = await fetchSubgroups(group.id);
      setSubgroups(updatedSubgroups);
    } catch (err: any) {
      addNotification('error', '刷新二级分类列表失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setIsSubmitting(true);
      if (editingSubgroup) {
        await updateSubgroup(editingSubgroup.id, {
          name: formData.get('name') as string,
          sort_order: sortOrder
        });
        setEditingSubgroup(null);
        addNotification('success', '二级分类更新成功');
      } else {
        await createSubgroup(group.id, {
          name: formData.get('name') as string,
          sort_order: sortOrder
        });
        form.reset();
        setSortOrder(100);
        addNotification('success', '二级分类创建成功');
      }
      await refreshSubgroups();
      await onUpdate();
    } catch (err: any) {
      addNotification('error', err.response?.data?.error || '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (subgroup: SubGroup) => {
    setDeleteConfirm({
      isOpen: true,
      subgroup
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.subgroup) return;

    try {
      await deleteSubgroup(deleteConfirm.subgroup.id);
      addNotification('success', '二级分类删除成功');

      await refreshSubgroups();

      // 如果当前页面已空，且不是第一页，则回到上一页
      const remainingItems = subgroups.length - 1;
      const newTotalPages = Math.ceil(remainingItems / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(newTotalPages);
      }

      await onUpdate();
    } catch (err: any) {
      addNotification('error', err.response?.data?.error || '删除失败');
    } finally {
      setDeleteConfirm({
        isOpen: false,
        subgroup: null
      });
    }
  };

  return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <DeleteConfirmDialog
            isOpen={deleteConfirm.isOpen}
            title="删除二级分类"
            message={`确定要删除二级分类"${deleteConfirm.subgroup?.name}"吗？此操作无法撤销。`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirm({ isOpen: false, subgroup: null })}
            triggerRef={deleteButtonRef}
        />

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              管理 "{group.name}" 的二级分类
            </h2>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <form ref={formRef} onSubmit={handleSubmit} className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称
                </label>
                <input
                    type="text"
                    name="name"
                    defaultValue={editingSubgroup?.name}
                    placeholder="输入二级分类名称"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent"
                    required
                    disabled={isSubmitting}
                />
              </div>

              <SortOrderInput
                  value={sortOrder}
                  onChange={setSortOrder}
                  error={sortOrderError}
              />

              <div className="flex justify-end space-x-2">
                {editingSubgroup && (
                    <button
                        type="button"
                        onClick={() => {
                          setEditingSubgroup(null);
                          setSortOrder(100);
                          setSortOrderError('');
                          formRef.current?.reset();
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      取消
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#01D8B6] text-white rounded-lg hover:bg-[#00c4a5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && (
                      <Icons.HiOutlineRefresh className="w-4 h-4 animate-spin" />
                  )}
                  <span>{editingSubgroup ? '保存' : '添加'}</span>
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {paginatedSubgroups.map(subgroup => (
                  <div
                      key={subgroup.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span>{subgroup.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                    (排序: {subgroup.sort_order})
                  </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                          onClick={() => setEditingSubgroup(subgroup)}
                          disabled={deleteConfirm.isOpen}
                          className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Icons.HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                          ref={deleteButtonRef}
                          onClick={() => confirmDelete(subgroup)}
                          disabled={deleteConfirm.isOpen}
                          className="p-2 text-red-500 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Icons.HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              ))}

              {subgroups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    暂无二级分类
                  </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
              <div className="border-t p-4 flex justify-center items-center space-x-2">
                <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  <Icons.HiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  <Icons.HiChevronRight className="w-5 h-5" />
                </button>
              </div>
          )}
        </motion.div>
      </div>
  );
};
