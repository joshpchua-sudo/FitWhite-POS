import { create } from 'zustand';
import { User, Branch, Theme, View } from '../types/index';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  currentView: View;
  setCurrentView: (view: View) => void;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
  
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  currentView: 'pos',
  setCurrentView: (currentView) => set({ currentView }),
  
  theme: 'clinic',
  setTheme: (theme) => set({ theme }),
  
  branches: [],
  setBranches: (branches) => set({ branches }),
  
  selectedBranchId: 'Admin',
  setSelectedBranchId: (selectedBranchId) => set({ selectedBranchId }),
  
  isOnline: navigator.onLine,
  setIsOnline: (isOnline) => set({ isOnline }),
  
  isSidebarOpen: false,
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}));
