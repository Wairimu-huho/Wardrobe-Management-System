// src/stores/auth.js
import { defineStore } from 'pinia';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials);
        const token = response.data.token || response.data.access_token;
        
        this.token = token;
        localStorage.setItem('token', token);
        
        await this.fetchUser();
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(userData);
        const token = response.data.token || response.data.access_token;
        
        this.token = token;
        localStorage.setItem('token', token);
        
        await this.fetchUser();
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUser() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const response = await authService.getUser();
        this.user = response.data;
      } catch (error) {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        this.error = 'Session expired';
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      this.loading = true;
      
      try {
        if (this.token) {
          await authService.logout();
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        this.loading = false;
      }
    }
  }
});