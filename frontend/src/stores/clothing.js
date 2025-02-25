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
      perPage: 15
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
    getItems: (state) => state.items,
    getCurrentItem: (state) => state.currentItem,
    isLoading: (state) => state.loading
  },
  
  actions: {
    async fetchItems(page = 1, filters = {}) {
      this.loading = true;
      this.error = null;
      
      // Merge current filters with any new ones
      this.filters = { ...this.filters, ...filters };
      this.pagination.currentPage = page;
      
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
          perPage: response.data.per_page
        };
      } catch (error) {
        this.error = 'Failed to fetch clothing items';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchFilterMetadata() {
      try {
        const response = await apiClient.get('/clothing-items/filter-metadata');
        this.filterOptions = response.data;
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    },
    
    async fetchItemById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get(`/clothing-items/${id}`);
        this.currentItem = response.data;
      } catch (error) {
        this.error = `Failed to fetch item #${id}`;
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async createItem(itemData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Handle FormData for file uploads
        let formData;
        if (itemData.image) {
          formData = new FormData();
          
          // Add all fields to FormData
          Object.keys(itemData).forEach(key => {
            if (key === 'image') {
              formData.append('image', itemData.image);
            } else {
              formData.append(key, itemData[key]);
            }
          });
        }
        
        const response = await apiClient.post(
          '/clothing-items', 
          formData || itemData,
          formData ? {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          } : {}
        );
        
        return response.data;
      } catch (error) {
        this.error = 'Failed to create item';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateItem(id, itemData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Handle FormData for file uploads
        let formData;
        if (itemData.image) {
          formData = new FormData();
          
          // Add method override for Laravel
          formData.append('_method', 'PUT');
          
          // Add all fields to FormData
          Object.keys(itemData).forEach(key => {
            if (key === 'image') {
              formData.append('image', itemData.image);
            } else {
              formData.append(key, itemData[key]);
            }
          });
        }
        
        const response = await apiClient.post(
          `/clothing-items/${id}`, 
          formData || itemData,
          formData ? {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          } : {}
        );
        
        return response.data;
      } catch (error) {
        this.error = `Failed to update item #${id}`;
        console.error(error);
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
        this.items = this.items.filter(item => item.id !== id);
        return true;
      } catch (error) {
        this.error = `Failed to delete item #${id}`;
        console.error(error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async toggleFavorite(id, isFavorite) {
      try {
        const response = await apiClient.patch(`/clothing-items/${id}`, {
          favorite: isFavorite
        });
        
        // Update in local state
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
          this.items[index].favorite = isFavorite;
        }
        
        if (this.currentItem && this.currentItem.id === id) {
          this.currentItem.favorite = isFavorite;
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to toggle favorite status:', error);
        throw error;
      }
    }
  }
});