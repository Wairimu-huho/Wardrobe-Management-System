// src/stores/clothing.js
import { defineStore } from 'pinia';
import apiClient from '../services/api';

export const useClothingStore = defineStore('clothing', {
  state: () => ({
    items: [],
    currentItem: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      currentPage: 1,
      perPage: 12,
      lastPage: 1
    },
    filters: {
      search: '',
      category_id: null,
      favorite: null,
      color: null,
      size: null,
      brand: null
    },
    filterOptions: {
      colors: [],
      sizes: [],
      brands: []
    }
  }),
  
  getters: {
    getItemById: (state) => (id) => {
      return state.items.find(item => item.id === parseInt(id));
    }
  },
  
  actions: {
    async fetchItems(page = 1, newFilters = null) {
      this.loading = true;
      this.error = null;
      
      // Update filters if provided
      if (newFilters) {
        this.filters = { ...this.filters, ...newFilters };
      }
      
      try {
        // Build query parameters
        const params = {
          page,
          per_page: this.pagination.perPage,
          ...this.filters
        };
        
        // Remove null/empty values
        Object.keys(params).forEach(key => 
          (params[key] === null || params[key] === '') && delete params[key]
        );
        
        const response = await apiClient.get('/clothing-items', { params });
        
        this.items = response.data.data;
        this.pagination = {
          total: response.data.total,
          currentPage: response.data.current_page,
          perPage: response.data.per_page,
          lastPage: response.data.last_page
        };
        
        return this.items;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load clothing items';
        console.error('Error fetching items:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchItem(id) {
      if (!id) return null;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get(`/clothing-items/${id}`);
        this.currentItem = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to load item #${id}`;
        console.error('Error fetching item:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // In your clothing store
    // src/stores/clothing.js - Update the createItem method
    async createItem(itemData) {
      this.loading = true;
      this.error = null;
      
      console.log("Creating item with data:", itemData);
      
      try {
        // Create a new FormData object
        const formData = new FormData();
        
        // Add all fields to FormData, carefully handling each type
        Object.keys(itemData).forEach(key => {
          if (key === 'image' && itemData[key] instanceof File) {
            // Handle file upload
            formData.append('image', itemData[key]);
            console.log("Adding image file:", itemData[key].name);
          } else if (key === 'favorite') {
            // Convert boolean to 0/1 for Laravel
            const value = itemData[key] ? 1 : 0;
            formData.append(key, value);
            console.log(`Adding ${key}:`, value);
          } else if (itemData[key] !== null && itemData[key] !== undefined) {
            // Add other fields
            formData.append(key, itemData[key]);
            console.log(`Adding ${key}:`, itemData[key]);
          }
        });
        
        // Print the FormData keys for debugging
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
        
        // Make the API request
        console.log("Sending request to /clothing-items");
        const response = await apiClient.post('/clothing-items', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        console.log("Received response:", response.data);
        
        // Add to local state
        this.items.unshift(response.data);
        
        return response.data;
      } catch (error) {
        console.error('Create item error details:', error.response?.data || error.message || error);
        this.error = error.response?.data?.message || 'Failed to create item';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
      // In your clothing store
    async updateItem(id, itemData) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("Updating item with ID:", id, "Data:", itemData);
        
        // Create a new FormData object
        const formData = new FormData();
        
        // Add method override for Laravel
        formData.append('_method', 'PUT');
        
        // Add all fields to FormData
        Object.keys(itemData).forEach(key => {
          if (key === 'image' && itemData[key] instanceof File) {
            formData.append('image', itemData[key]);
            console.log("Adding image file:", itemData[key].name);
          } else if (key === 'favorite') {
            // Convert boolean to 0/1 for Laravel
            const value = itemData[key] ? 1 : 0;
            formData.append(key, value);
            console.log(`Adding ${key}:`, value);
          } else if (itemData[key] !== null && itemData[key] !== undefined) {
            formData.append(key, itemData[key]);
            console.log(`Adding ${key}:`, itemData[key]);
          }
        });
        
        // Debug what's being sent
        console.log("FormData contents:");
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
        
        // Make the POST request (Laravel convention for FormData with files)
        const response = await apiClient.post(`/clothing-items/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        console.log("Update response:", response.data);
        
        // Update item in local state
        const index = this.items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          this.items[index] = response.data;
        }
        
        // Update currentItem if needed
        if (this.currentItem && this.currentItem.id === parseInt(id)) {
          this.currentItem = response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('Update error:', error.response?.data || error);
        this.error = error.response?.data?.message || `Failed to update item #${id}`;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteItem(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await apiClient.delete(`/clothing-items/${id}`);
        
        // Remove from local state
        this.items = this.items.filter(item => item.id !== parseInt(id));
        
        if (this.currentItem && this.currentItem.id === parseInt(id)) {
          this.currentItem = null;
        }
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to delete item #${id}`;
        console.error('Error deleting item:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async toggleFavorite(id, favorite) {
      try {
        const response = await apiClient.put(`/clothing-items/${id}`, {
          favorite: favorite
        });
        
        // Update in local state
        const index = this.items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          this.items[index].favorite = favorite;
        }
        
        if (this.currentItem && this.currentItem.id === parseInt(id)) {
          this.currentItem.favorite = favorite;
        }
        
        return response.data;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }
    },
    
    async fetchFilterOptions() {
      try {
        const response = await apiClient.get('/clothing-items/filter-metadata');
        this.filterOptions = response.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching filter options:', error);
        return null;
      }
    }
  }
});