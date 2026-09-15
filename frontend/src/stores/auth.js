import { defineStore } from 'pinia';
import { getApiUrl } from '../config/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => (state.user?.role || '').toUpperCase() === 'ADMIN',
    isFTA: (state) => (state.user?.role || '').toUpperCase() === 'FTA',
    isCSA: (state) => (state.user?.role || '').toUpperCase() === 'CSA'
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(getApiUrl('/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to authenticate');
        }

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    async fetchCurrentUser() {
      if (!this.token) return;
      try {
        const response = await fetch(getApiUrl('/auth/me'), {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          this.user = {
            ...this.user,
            ...data
          };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (err) {
        console.error('Failed to sync current user profile:', err);
      }
    }
  }
});
