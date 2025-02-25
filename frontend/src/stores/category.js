import { defineStore } from 'pinia';
import apiClient from '../services/api';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getCategories: (state) => state.categories,
    isLoading: (state) => state.loading
  },
  
  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get('/categories');
        this.categories = response.data;
      } catch (error) {
        this.error = 'Failed to fetch categories';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async createCategory(categoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.post('/categories', categoryData);
        this.categories.push(response.data);
        return response.data;
      } catch (error) {
        this.error = 'Failed to create category';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateCategory(id, categoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.put(`/categories/${id}`, categoryData);
        
        // Update in local state
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          this.categories[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = `Failed to update category #${id}`;
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteCategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await apiClient.delete(`/categories/${id}`);
        // Remove from local state
        this.categories = this.categories.filter(cat => cat.id !== id);
        return true;
      } catch (error) {
        this.error = `Failed to delete category #${id}`;
        console.error(error);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});