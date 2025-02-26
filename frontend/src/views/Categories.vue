<!-- src/views/Categories.vue -->
<template>
  <div class="categories-page">
    <div class="page-header">
      <h2>Categories</h2>
      <button @click="showAddModal = true" class="btn primary">
        Add New Category
      </button>
    </div>
    
    <div v-if="categoryStore.loading" class="loading">
      Loading categories...
    </div>
    
    <div v-else-if="categoryStore.error" class="error-message">
      {{ categoryStore.error }}
    </div>
    
    <div v-else-if="categoryStore.categories.length === 0" class="empty-state">
      <p>No categories found. Click the button above to add your first category.</p>
    </div>
    
    <div v-else class="categories-grid">
      <div v-for="category in categoryStore.categories" :key="category.id" class="category-card">
        <div class="card-header">
          <h3>{{ category.name }}</h3>
          <div class="category-actions">
            <button @click="editCategory(category)" class="btn icon-btn">
              ✏️
            </button>
            <button @click="confirmDelete(category)" class="btn icon-btn">
              🗑️
            </button>
          </div>
        </div>
        
        <p v-if="category.description" class="description">
          {{ category.description }}
        </p>
        
        <div class="category-meta">
          <div class="meta-item">
            <span class="meta-label">Items:</span>
            <span class="meta-value">{{ getCategoryItemCount(category.id) }}</span>
          </div>
          
          <button @click="viewCategory(category)" class="btn small">
            View Items
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Add New Category</h3>
          <button @click="showAddModal = false" class="btn close-btn">&times;</button>
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
              <button type="button" @click="showAddModal = false" class="btn secondary">
                Cancel
              </button>
              <button type="submit" class="btn primary" :disabled="categoryStore.loading">
                {{ editMode ? 'Update Category' : 'Add Category' }}
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
            Are you sure you want to delete the category <strong>{{ categoryToDelete?.name }}</strong>?
          </p>
          
          <p v-if="categoryItemCount > 0" class="warning-text">
            This category contains {{ categoryItemCount }} items. Deleting this category may affect these items.
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
import { useRouter } from 'vue-router';
import { useCategoryStore } from '../stores/category';
import { useClothingStore } from '../stores/clothing';

const router = useRouter();
const categoryStore = useCategoryStore();
const clothingStore = useClothingStore();

// Modal states
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const categoryToDelete = ref(null);
const formError = ref(null);
const categoryItemCount = ref(0);
const editingCategoryId = ref(null);


// Form data
const formData = reactive({
  name: '',
  description: '',
  icon: '',
  color: ''
});

// Reset form data
function resetForm() {
  formData.name = '';
  formData.description = '';
  formData.icon = '';
  formData.color = '';
  editMode.value = false;
  formError.value = null;
}

// Edit category
function editCategory(category) {
  editMode.value = true;
  formData.name = category.name;
  formData.description = category.description || '';
  formData.icon = category.icon || '';
  formData.color = category.color || '';
  showAddModal.value = true;
  editingCategoryId.value = category.id;
}

// View category items
function viewCategory(category) {
  router.push(`/items?category_id=${category.id}`);
}

// Save new or updated category
async function saveCategory() {
  formError.value = null;
  
  try {
    if (editMode.value) {
      await categoryStore.updateCategory(editingCategoryId.value, formData);
    } else {
      await categoryStore.createCategory(formData);
    }
    
    showAddModal.value = false;
    resetForm();
  } catch (error) {
    formError.value = error.response?.data?.message || 'Failed to save category';
  }
}

// Confirm delete
function confirmDelete(category) {
  categoryToDelete.value = category;
  categoryItemCount.value = getCategoryItemCount(category.id);
  showDeleteModal.value = true;
}

// Delete category
async function deleteCategory() {
  try {
    await categoryStore.deleteCategory(categoryToDelete.value.id);
    showDeleteModal.value = false;
    categoryToDelete.value = null;
  } catch (error) {
    formError.value = error.response?.data?.message || 'Failed to delete category';
  }
}

// Get category item count
function getCategoryItemCount(categoryId) {
  return clothingStore.items.filter(item => item.category_id === categoryId).length;
}

// Load data
onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
  
  if (clothingStore.items.length === 0) {
    await clothingStore.fetchItems(1, { per_page: 1000 });  // Get all items for counts
  }
});
</script>

<style scoped>
.categories-page {
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

.loading, .empty-state, .error-message {
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.error-message {
  background-color: #f8d7da;
  color: #dc3545;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
}

.category-actions {
  display: flex;
  gap: 5px;
}

.description {
  margin-bottom: 20px;
  color: #666;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-label {
  color: #666;
  font-size: 14px;
}

.meta-value {
  font-weight: bold;
  color: #42b983;
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

.icon-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
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

.color-preview {
  width: 100%;
  height: 20px;
  border-radius: 4px;
  margin-top: 5px;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>