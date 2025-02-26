<!-- src/views/CategoryDetail.vue -->
<template>
  <div class="category-detail-page">
    <div class="page-header">
      <button class="btn back-btn" @click="router.back()">
        ← Back
      </button>
      <h2 v-if="category">{{ category.name }}</h2>
      <div class="header-actions">
        <button @click="editCategory" class="btn secondary">Edit</button>
        <button @click="confirmDelete" class="btn delete-btn">Delete</button>
      </div>
    </div>
    
    <div v-if="categoryStore.loading" class="loading">
      Loading category...
    </div>
    
    <div v-else-if="categoryStore.error" class="error-message">
      {{ categoryStore.error }}
    </div>
    
    <div v-else-if="!category" class="empty-state">
      Category not found.
    </div>
    
    <template v-else>
      <div class="category-info">
        <div v-if="category.description" class="description">
          {{ category.description }}
        </div>
        
        <div v-if="category.color || category.icon" class="category-attributes">
          <div v-if="category.color" class="attribute">
            <span class="attribute-label">Color:</span>
            <span class="color-preview" :style="{ backgroundColor: category.color }"></span>
            {{ category.color }}
          </div>
          
          <div v-if="category.icon" class="attribute">
            <span class="attribute-label">Icon:</span>
            {{ category.icon }}
          </div>
        </div>
      </div>
      
      <div class="items-section">
        <h3>Items in this Category ({{ categoryItems.length }})</h3>
        
        <div v-if="clothingStore.loading" class="loading">
          Loading items...
        </div>
        
        <div v-else-if="categoryItems.length === 0" class="empty-state">
          <p>No items found in this category.</p>
          <button @click="navigateTo(`/items/new?category_id=${category.id}`)" class="btn primary">
            Add Item in This Category
          </button>
        </div>
        
        <div v-else class="items-grid">
          <div v-for="item in categoryItems" :key="item.id" class="item-card">
            <div class="item-image" :style="getItemImageStyle(item)"></div>
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <div class="item-meta">
                <span v-if="item.color" class="color-tag" :style="{ backgroundColor: item.color }"></span>
                <span v-if="item.size" class="size-tag">{{ item.size }}</span>
                <span v-if="item.brand" class="brand-tag">{{ item.brand }}</span>
              </div>
              <div class="item-actions">
                <router-link :to="`/items/${item.id}`" class="btn small">View</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Edit Category</h3>
          <button @click="showEditModal = false" class="btn close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div v-if="formError" class="error-message">
              {{ formError }}
            </div>
            
            <div class="form-group">
              <label for="name">Category Name *</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                v-model="formData.description"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="icon">Icon (Optional)</label>
              <input 
                type="text" 
                id="icon" 
                v-model="formData.icon"
                class="form-control"
                placeholder="e.g., shirt, pants, dress"
              />
            </div>
            
            <div class="form-group">
              <label for="color">Color (Optional)</label>
              <input 
                type="text" 
                id="color" 
                v-model="formData.color"
                class="form-control"
                placeholder="e.g., #FF5733, blue, etc."
              />
              <div v-if="formData.color" class="color-preview" :style="{ backgroundColor: formData.color }"></div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn secondary">
                Cancel
              </button>
              <button type="submit" class="btn primary" :disabled="categoryStore.loading">
                Update Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Delete Category</h3>
          <button @click="showDeleteModal = false" class="btn close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>
            Are you sure you want to delete the category <strong>{{ category?.name }}</strong>?
          </p>
          
          <p v-if="categoryItems.length > 0" class="warning-text">
            This category contains {{ categoryItems.length }} items. Deleting this category may affect these items.
          </p>
          
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn secondary">
              Cancel
            </button>
            <button @click="deleteCategory" class="btn delete-btn" :disabled="categoryStore.loading">
              {{ categoryStore.loading ? 'Deleting...' : 'Delete Category' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from '../stores/category';
import { useClothingStore } from '../stores/clothing';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const clothingStore = useClothingStore();

// State variables
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const formError = ref(null);

// Form data
const formData = reactive({
  name: '',
  description: '',
  icon: '',
  color: ''
});

// Computed properties
const category = computed(() => categoryStore.currentCategory);
const categoryItems = computed(() => 
  clothingStore.items.filter(item => item.category_id === parseInt(route.params.id))
);

// Load data
onMounted(async () => {
  try {
    await categoryStore.fetchCategory(route.params.id);
    
    // Load items if needed
    if (clothingStore.items.length === 0) {
      await clothingStore.fetchItems(1, { 
        category_id: route.params.id,
        per_page: 100
      });
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

// Methods
function editCategory() {
  if (!category.value) return;
  
  formData.name = category.value.name;
  formData.description = category.value.description || '';
  formData.icon = category.value.icon || '';
  formData.color = category.value.color || '';
  
  showEditModal.value = true;
}

async function saveCategory() {
  formError.value = null;
  
  try {
    await categoryStore.updateCategory(category.value.id, formData);
    showEditModal.value = false;
  } catch (error) {
    formError.value = error.response?.data?.message || 'Failed to update category';
  }
}

function confirmDelete() {
  showDeleteModal.value = true;
}

async function deleteCategory() {
  try {
    await categoryStore.deleteCategory(category.value.id);
    showDeleteModal.value = false;
    router.push('/categories');
  } catch (error) {
    formError.value = error.response?.data?.message || 'Failed to delete category';
  }
}

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
</script>

<style scoped>
.category-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

h2 {
  margin: 0;
  color: #2c3e50;
}

.back-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.loading, .empty-state, .error-message {
  padding: 30px;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #dc3545;
}

.category-info {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.description {
  margin-bottom: 20px;
}

.category-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.attribute {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attribute-label {
  font-weight: 500;
  color: #666;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.items-section h3 {
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
}

.item-details {
  padding: 15px;
}

.item-details h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
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

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  text-decoration: none;
}

.btn.small {
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
.modal-overlay {
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

.modal-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea.form-control {
  resize: vertical;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>