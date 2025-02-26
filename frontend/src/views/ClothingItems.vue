<!-- src/views/ClothingItems.vue -->
<template>
  <div class="items-page">
    <div class="page-header">
      <h2>My Wardrobe</h2>
      <button class="btn primary" @click="navigateTo('/items/new')">
        Add New Item
      </button>
    </div>
    
    <div class="filters-section">
      <div class="search-container">
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Search items..." 
          class="search-input"
          @keyup.enter="applyFilters"
        />
        <button class="btn secondary" @click="applyFilters">Search</button>
      </div>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label>Category</label>
          <select v-model="filters.category_id" @change="applyFilters">
            <option :value="null">All Categories</option>
            <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Color</label>
          <select v-model="filters.color" @change="applyFilters">
            <option :value="null">All Colors</option>
            <option v-for="color in clothingStore.filterOptions.colors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Size</label>
          <select v-model="filters.size" @change="applyFilters">
            <option :value="null">All Sizes</option>
            <option v-for="size in clothingStore.filterOptions.sizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Favorites</label>
          <select v-model="filters.favorite" @change="applyFilters">
            <option :value="null">All Items</option>
            <option :value="true">Favorites Only</option>
          </select>
        </div>
      </div>
      
      <button class="btn tertiary" @click="resetFilters">Reset Filters</button>
    </div>
    
    <div v-if="clothingStore.loading" class="loading">
      Loading items...
    </div>
    
    <div v-else-if="clothingStore.items.length === 0" class="no-items">
      <p>No clothing items found. Try changing your filters or add a new item.</p>
    </div>
    
    <div v-else class="items-grid">
      <div v-for="item in clothingStore.items" :key="item.id" class="item-card">
        <div class="item-image" :style="getItemImageStyle(item)"></div>
        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <div v-if="item.category" class="item-category">{{ item.category.name }}</div>
          <div class="item-meta">
            <span v-if="item.color" class="color-tag" :style="{ backgroundColor: item.color }"></span>
            <span v-if="item.size" class="size-tag">{{ item.size }}</span>
            <span v-if="item.brand" class="brand-tag">{{ item.brand }}</span>
          </div>
          <div class="item-actions">
            <router-link :to="`/items/${item.id}`" class="btn small">View</router-link>
            <router-link :to="`/items/${item.id}/edit`" class="btn small secondary">Edit</router-link>
            <button 
              class="btn small icon-btn" 
              :class="{ 'favorite': item.favorite }" 
              @click="toggleFavorite(item)"
            >
              {{ item.favorite ? '★' : '☆' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="clothingStore.pagination.lastPage > 1" class="pagination">
      <button 
        class="btn page-btn"
        :disabled="clothingStore.pagination.currentPage === 1"
        @click="changePage(clothingStore.pagination.currentPage - 1)"
      >
        Previous
      </button>
      
      <span class="page-info">
        Page {{ clothingStore.pagination.currentPage }} of {{ clothingStore.pagination.lastPage }}
      </span>
      
      <button 
        class="btn page-btn"
        :disabled="clothingStore.pagination.currentPage === clothingStore.pagination.lastPage"
        @click="changePage(clothingStore.pagination.currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClothingStore } from '../stores/clothing';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const clothingStore = useClothingStore();
const categoryStore = useCategoryStore();

const filters = reactive({
  search: '',
  category_id: null,
  color: null,
  size: null,
  favorite: null
});

onMounted(async () => {
  // Load categories
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
  
  // Load filter options
  await clothingStore.fetchFilterOptions();
  
  // Load items
  await clothingStore.fetchItems();
});

function navigateTo(path) {
  router.push(path);
}

function getItemImageStyle(item) {
  if (item.image_path) {
    return {
      backgroundImage: `url(http://localhost:8000/storage/${item.image_path})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else {
    return {
      backgroundColor: '#f1f1f1'
    };
  }
}

async function applyFilters() {
  await clothingStore.fetchItems(1, filters);
}

function resetFilters() {
  filters.search = '';
  filters.category_id = null;
  filters.color = null;
  filters.size = null;
  filters.favorite = null;
  
  applyFilters();
}

async function changePage(page) {
  await clothingStore.fetchItems(page);
}

async function toggleFavorite(item) {
  await clothingStore.toggleFavorite(item.id, !item.favorite);
}
</script>

<style scoped>
.items-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h2 {
  margin: 0;
  color: #2c3e50;
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-container {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.search-container .btn {
  border-radius: 0 4px 4px 0;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading, .no-items {
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.item-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.item-card:hover {
  transform: translateY(-5px);
}

.item-image {
  height: 200px;
  background-color: #f1f1f1;
}

.item-details {
  padding: 15px;
}

.item-details h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #2c3e50;
}

.item-category {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.item-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.color-tag {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.size-tag, .brand-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f1f1f1;
  border-radius: 4px;
  font-size: 12px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  text-decoration: none;
}

.small {
  padding: 5px 10px;
  font-size: 14px;
}

.primary {
  background: #42b983;
  color: white;
}

.secondary {
  background: #e7f5ef;
  color: #42b983;
  border: 1px solid #42b983;
}

.tertiary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.icon-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  width: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite {
  background: #fff3cd;
  color: #ffc107;
  border: 1px solid #ffc107;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.page-info {
  color: #666;
}

.page-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>