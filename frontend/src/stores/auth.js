import { defineStore } from 'pinia';
import apiClient from '../services/api';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  },
  
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.post('/login', credentials);
        this.token = response.data.token || response.data.access_token;
        localStorage.setItem('token', this.token);
        
        // Get user info
        await this.fetchUser();
        
        router.push('/dashboard');
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
        const response = await apiClient.post('/register', userData);
        this.token = response.data.token || response.data.access_token;
        localStorage.setItem('token', this.token);
        
        // Get user info
        await this.fetchUser();
        
        router.push('/dashboard');
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
      
      try {
        const response = await apiClient.get('/user');
        this.user = response.data;
      } catch (error) {
        this.error = 'Failed to fetch user data';
        this.logout();
      }
    },
    
    async logout() {
      try {
        if (this.token) {
          await apiClient.post('/logout');
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  }
});