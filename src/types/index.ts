export interface File {
  id: string;
  name: string;
  size: number;
  category_id: string;
  mega_url: string;
  user_name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}