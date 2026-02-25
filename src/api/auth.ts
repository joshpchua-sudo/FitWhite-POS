import { apiClient } from './apiClient';

export const authApi = {
  login: (credentials: any) => fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(res => res.json()),
  
  logout: () => {
    // Logic for logout if needed
  }
};
