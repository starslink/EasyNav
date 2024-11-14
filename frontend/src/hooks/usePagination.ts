import {useMemo, useState} from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    return items.filter((item: any) => {
      const searchString = Object.values([
        item.title,
        item.subtitle,
        item.url,
        item.group_name,
        item.subgroup_name
      ])
        .filter(value => typeof value === 'string')
        .join(' ')
        .toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    searchTerm,
    setSearchTerm,
    totalItems: filteredItems.length
  };
}
