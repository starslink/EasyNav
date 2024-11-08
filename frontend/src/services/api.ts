import axios from 'axios';
import { Group, Link, SubGroup } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Exclude certain endpoints from token interception
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/verify-email'];

api.interceptors.request.use((config) => {
  // Skip token for public endpoints
  if (PUBLIC_ENDPOINTS.some(endpoint => config.url?.includes(endpoint))) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.get(`/auth/verify-email?token=${token}`);
  return response.data;
};

// Groups
export const fetchGroups = async (): Promise<Group[]> => {
  const response = await api.get('/groups');
  return response.data;
};

export const createGroup = async (group: {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}): Promise<Group> => {
  const response = await api.post('/groups', group);
  return response.data;
};

export const updateGroup = async (id: string, group: {
  name: string;
  icon: string;
  sort_order: number;
}): Promise<Group> => {
  const response = await api.put(`/groups/${id}`, group);
  return response.data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

// Subgroups
export const fetchSubgroups = async (groupId: string): Promise<SubGroup[]> => {
  const response = await api.get(`/groups/${groupId}/subgroups`);
  return response.data;
};

export const createSubgroup = async (groupId: string, subgroup: {
  name: string;
  sort_order: number;
}): Promise<SubGroup> => {
  const response = await api.post(`/groups/${groupId}/subgroups`, subgroup);
  return response.data;
};

export const updateSubgroup = async (id: string, subgroup: {
  name: string;
  sort_order: number;
}): Promise<SubGroup> => {
  const response = await api.put(`/groups/subgroups/${id}`, subgroup);
  return response.data;
};

export const deleteSubgroup = async (id: string): Promise<void> => {
  const response = await api.delete(`/groups/subgroups/${id}`);
  return response.data;
};

// Links
export const fetchLinks = async (): Promise<Link[]> => {
  const response = await api.get('/links');
  return response.data;
};

export const fetchGroupLinks = async (groupId: string, subgroupId?: string): Promise<Link[]> => {
  const url = subgroupId
      ? `/links/group/${groupId}?subgroupId=${subgroupId}`
      : `/links/group/${groupId}`;
  const response = await api.get(url);
  return response.data;
};

export const createLink = async (link: {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  group_id: string;
  subgroup_id?: string;
}): Promise<Link> => {
  const response = await api.post('/links', link);
  return response.data;
};

export const updateLink = async (
    id: string,
    link: {
      title: string;
      subtitle: string;
      url: string;
      icon: string;
      group_id: string;
      subgroup_id?: string;
    }
): Promise<Link> => {
  const response = await api.put(`/links/${id}`, link);
  return response.data;
};

export const deleteLink = async (id: string): Promise<void> => {
  const response = await api.delete(`/links/${id}`);
  return response.data;
};
