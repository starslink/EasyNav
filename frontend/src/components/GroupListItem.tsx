import React, { useRef } from 'react';
import * as Icons from 'react-icons/hi';
import { Group, Link, SubGroup } from '../types';

interface GroupListItemProps {
  group: Group;
  links?: Link[];
  subgroups?: SubGroup[];
  onEdit: (group: Group) => void;
  onDelete: (id: string, name: string, ref: React.RefObject<HTMLButtonElement>) => void;
  onManageSubgroups: (group: Group) => void;
}

export const GroupListItem: React.FC<GroupListItemProps> = ({
                                                              group,
                                                              links = [],
                                                              subgroups = [],
                                                              onEdit,
                                                              onDelete,
                                                              onManageSubgroups
                                                            }) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const groupLinks = links.filter(link => link.group_id === group.id);
  const groupSubgroups = subgroups.filter(subgroup => subgroup.group_id === group.id);
  const Icon = Icons[group.icon as keyof typeof Icons] || Icons.HiOutlineFolder;

  return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-[#01D8B6]" />
          <div>
            <div className="flex items-center space-x-2">
              <span>{group.name}</span>
              <span className="text-sm text-gray-500">
              (排序: {group.sort_order})
            </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {groupLinks.length > 0 && (
                  <span className="text-sm text-gray-500">
                {groupLinks.length}个链接
              </span>
              )}
              {groupSubgroups.length > 0 && (
                  <span className="text-sm text-gray-500">
                {groupSubgroups.length}个二级分类
              </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
              onClick={() => onManageSubgroups(group)}
              className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
              title="管理二级分类"
          >
            <Icons.HiOutlineCollection className="w-4 h-4" />
          </button>
          <button
              onClick={() => onEdit(group)}
              className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <Icons.HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
              ref={deleteButtonRef}
              onClick={() => onDelete(group.id, group.name, deleteButtonRef)}
              className={`p-2 ${groupLinks.length > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-white'} rounded-lg transition-colors`}
              disabled={groupLinks.length > 0}
              title={groupLinks.length > 0 ? '请先删除该分组下的所有链接' : '删除分组'}
          >
            <Icons.HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
};
