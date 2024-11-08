import React, { useRef } from 'react';
import * as Icons from 'react-icons/hi';
import { Link, Group, SubGroup } from '../types';

interface LinkListItemProps {
  link: Link;
  group?: Group;
  subgroup?: SubGroup;
  onEdit: (link: Link) => void;
  onDelete: (id: string, name: string, ref: React.RefObject<HTMLButtonElement>) => void;
}

export const LinkListItem: React.FC<LinkListItemProps> = ({
  link,
  group,
  subgroup,
  onEdit,
  onDelete
}) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const Icon = Icons[link.icon as keyof typeof Icons] || Icons.HiOutlineLink;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-[#01D8B6]" />
        <div>
          <div className="font-medium">{link.title}</div>
          <div className="text-sm text-gray-500">
            {link.subtitle}
            <div className="flex items-center space-x-2 mt-1">
              {group && (
                <span className="px-2 py-0.5 bg-[#01D8B6]/10 text-[#01D8B6] rounded-full text-xs">
                  {group.name}
                </span>
              )}
              {subgroup && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {subgroup.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(link)}
          className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
        >
          <Icons.HiOutlinePencil className="w-4 h-4" />
        </button>
        <button
          ref={deleteButtonRef}
          onClick={() => onDelete(link.id, link.title, deleteButtonRef)}
          className="p-2 text-red-500 hover:bg-white rounded-lg transition-colors"
        >
          <Icons.HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};