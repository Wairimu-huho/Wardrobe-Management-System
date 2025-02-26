<!-- src/views/ClothingItemDetail.vue -->
<template>
  <div class="item-detail-page">
    <div class="page-header">
      <button class="btn back-btn" @click="router.back()">
        ← Back
      </button>
      <div class="header-actions">
        <router-link :to="`/items/${item.id}/edit`" class="btn secondary">Edit</router-link>
        <button class="btn delete-btn" @click="confirmDelete">Delete</button>
      </div>
    </div>
    
    <div v-if="clothingStore.loading" class="loading">
      Loading item details...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="item" class="item-detail-container">
      <div class="item-image-section">
        <div 
          class="item-image" 
          :style="item.image_path ? { backgroundImage: `url(http://localhost:8000/storage/${item.image_path})` } : {}"
        >
          <div v-if="!item.image_path" class="no-image">No image</div>
        </div>
        <button 
          class="favorite-button" 
          :class="{ active: item.favorite }"
          @click="toggleFavorite"
        >
          {{ item.favorite ? '★ Favorite' : '☆ Add to favorites' }}
        </button>
      </div>
      
      <div class="item-info-section">
        <h2>{{ item.name }}</h2>
        
        <div class="info-group">
          <h3>Category</h3>
          <p>{{ item.category ? item.category.name : 'None' }}</p>
        </div>
        
        <div class="info-group" v-if="item.description">
          <h3>Description</h3>
          <p>{{ item.description }}</p>
        </div>
        
        <div class="item-attributes">
          <div class="attribute" v-if="item.color">
            <h3>Color</h3>
            <div class="attribute-value">
              <span class="color-preview" :style="{ backgroundColor: item.color }"></span>
              {{ item.color }}
            </div>
          </div>
          
          <div class="attribute" v-if="item.size">
            <h3>Size</h3>
            <div class="attribute-value">{{ item.size }}</div>
          </div>
          
          <div class="attribute" v-if="item.brand">
            <h3>Brand</h3>
            <div class="attribute-value">{{ item.brand }}</div>
          </div>
        </div>
        
        <div class="date-info">
          <p>Added: {{ formatDate(item.created_at) }}</p>
          <p v-if="item.created_at !== item.updated_at">Last updated: {{ formatDate(item.updated_at) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <h3>Delete Item</h3>
        <p>Are you sure you want to delete "{{ item.name }}"? This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn delete-btn" @click="deleteItem">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClothingStore } from '../stores/clothing';

const route = useRoute();
const router = useRouter();
const clothingStore = useClothingStore();

const error = ref(null);
const showDeleteModal = ref(false);

const item = computed(() => clothingStore.currentItem || {});

onMounted(async () => {
  const itemId = route.params.id;
  try {
    await clothingStore.fetchItem(itemId);
    if (!clothingStore.currentItem) {
      error.value = 'Item not found';
    }
  } catch (err) {
    error.value = 'Error loading item';
    console.error(err);
  }
});

function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

async function toggleFavorite() {
  try {
    await clothingStore.toggleFavorite(item.value.id, !item.value.favorite);
  } catch (err) {
    console.error('Error toggling favorite status:', err);
  }
}

function confirmDelete() {
  showDeleteModal.value = true;
}

async function deleteItem() {
  try {
    await clothingStore.deleteItem(item.value.id);
    showDeleteModal.value = false;
    router.push('/items');
  } catch (err) {
    console.error('Error deleting item:', err);
  }
}
</script>

<style scoped>
.item-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.back-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.loading, .error-message {
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.error-message {
  color: #dc3545;
}

.item-detail-container {
  display: flex;
  gap: 30px;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.item-image-section {
  flex: 1;
  max-width: 400px;
}

.item-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  background-color: #f1f1f1;
  background-size: cover;
  background-position: center;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image {
  color: #999;
  font-style: italic;
}

.favorite-button {
  width: 100%;
  padding: 10px;
  border: 1px solid #ffc107;
  background: #fff3cd;
  color: #ffc107;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-button.active {
  background: #ffc107;
  color: white;
}

.favorite-button:hover {
  background: #ffc107;
  color: white;
}

.item-info-section {
  flex: 2;
}

.item-info-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.info-group {
  margin-bottom: 20px;
}

.info-group h3 {
  margin-bottom: 5px;
  color: #666;
  font-size: 16px;
}

.info-group p {
  margin: 0;
  color: #333;
}

.item-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.attribute {
  min-width: 100px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

.attribute h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
}

.attribute-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.date-info {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #999;
}

.date-info p {
  margin: 5px 0;
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

.secondary {
  background: #e7f5ef;
  color: #42b983;
  border: 1px solid #42b983;
}

.delete-btn {
  background: #f8d7da;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
}

.modal h3 {
  margin-top: 0;
  color: #dc3545;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .item-detail-container {
    flex-direction: column;
  }
  
  .item-image-section {
    max-width: 100%;
  }
}
</style>