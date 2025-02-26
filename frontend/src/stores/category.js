// src/stores/category.js
import { defineStore } from 'pinia';
import apiClient from '../services/api';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(category => category.id === parseInt(id));
    }
  },
  
  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get('/categories');
        this.categories = response.data;
        return this.categories;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load categories';
        console.error('Error fetching categories:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get(`/categories/${id}`);
        this.currentCategory = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to load category #${id}`;
        console.error('Error fetching category:', error);
        return null;
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
        this.error = error.response?.data?.message || 'Failed to create category';
        console.error('Error creating category:', error);
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
        const index = this.categories.findIndex(category => category.id === parseInt(id));
        if (index !== -1) {
          this.categories[index] = response.data;
        }
        
        this.currentCategory = response.data;
        
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to update category #${id}`;
        console.error('Error updating category:', error);
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
        this.categories = this.categories.filter(category => category.id !== parseInt(id));
        
        if (this.currentCategory && this.currentCategory.id === parseInt(id)) {
          this.currentCategory = null;
        }
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to delete category #${id}`;
        console.error('Error deleting category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});