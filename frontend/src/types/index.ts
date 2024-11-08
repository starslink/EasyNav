export interface Link {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  group_id: string;
  subgroup_id?: string;
}

export interface SubGroup {
  id: string;
  name: string;
  group_id: string;
  sort_order: number;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  subgroups?: SubGroup[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
