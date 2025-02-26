<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <h2>Wardrobe Dashboard</h2>
    
    <div v-if="loading" class="loading">
      Loading dashboard data...
    </div>
    
    <div v-else class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Items</h3>
          <div class="stat-value">{{ totalItems }}</div>
        </div>
        
        <div class="stat-card">
          <h3>Categories</h3>
          <div class="stat-value">{{ categoriesCount }}</div>
        </div>
        
        <div class="stat-card">
          <h3>Favorite Items</h3>
          <div class="stat-value">{{ favoriteItems }}</div>
        </div>
      </div>
      
      <div class="dashboard-actions">
        <button class="btn primary" @click="navigateTo('/items/new')">
          Add New Item
        </button>
        <button class="btn secondary" @click="navigateTo('/items')">
          View All Items
        </button>
      </div>
      
      <div v-if="recentItems.length > 0" class="recent-items">
        <h3>Recent Items</h3>
        <div class="items-grid">
          <div v-for="item in recentItems" :key="item.id" class="item-card">
            <div class="item-image" :style="getItemImageStyle(item)"></div>
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p v-if="item.category">{{ item.category.name }}</p>
              <div class="item-actions">
                <router-link :to="`/items/${item.id}`" class="btn small">View</router-link>
                <button 
                  class="btn small" 
                  :class="{ 'favorite': item.favorite }" 
                  @click="toggleFavorite(item)"
                >
                  {{ item.favorite ? '★' : '☆' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClothingStore } from '../stores/clothing';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const clothingStore = useClothingStore();
const categoryStore = useCategoryStore();

const loading = ref(true);
const totalItems = ref(0);
const categoriesCount = ref(0);
const favoriteItems = ref(0);
const recentItems = ref([]);

onMounted(async () => {
  try {
    // Load categories
    await categoryStore.fetchCategories();
    
    // Load items with pagination
    const response = await clothingStore.fetchItems(1, { per_page: 20 });
    
    // Calculate statistics
    totalItems.value = clothingStore.pagination.total;
    categoriesCount.value = categoryStore.categories.length;
    favoriteItems.value = clothingStore.items.filter(item => item.favorite).length;
    
    // Get recent items (latest 6)
    recentItems.value = clothingStore.items.slice(0, 6);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
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
      backgroundColor: '#f1f1f1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
  }
}

async function toggleFavorite(item) {
  try {
    await clothingStore.toggleFavorite(item.id, !item.favorite);
    // Update local favoriteItems count
    favoriteItems.value = item.favorite ? favoriteItems.value - 1 : favoriteItems.value + 1;
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin-bottom: 10px;
  color: #666;
  font-size: 16px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #42b983;
}

.dashboard-actions {
  display: flex;
  gap: 15px;
  margin: 30px 0;
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

.primary {
  background: #42b983;
  color: white;
}

.secondary {
  background: #e7f5ef;
  color: #42b983;
  border: 1px solid #42b983;
}

.primary:hover {
  background: #3aa876;
}

.secondary:hover {
  background: #d7efe7;
}

.recent-items h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
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
  height: 180px;
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-details {
  padding: 15px;
}

.item-details h4 {
  margin-bottom: 5px;
  color: #2c3e50;
}

.item-details p {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.item-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.btn.small {
  padding: 5px 10px;
  font-size: 14px;
}

.btn.favorite {
  background: #fff3cd;
  color: #ffc107;
  border: 1px solid #ffc107;
}

.btn.favorite:hover {
  background: #ffe69c;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>