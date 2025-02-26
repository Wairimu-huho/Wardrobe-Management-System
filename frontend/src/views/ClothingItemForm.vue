<!-- src/views/ClothingItemForm.vue -->
<template>
  <div class="item-form-page">
    <div class="page-header">
      <button class="btn back-btn" @click="router.back()">
        ← Back
      </button>
      <h2>{{ isEditMode ? 'Edit Clothing Item' : 'Add New Clothing Item' }}</h2>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="saveSuccess" class="success-message">
        Item saved successfully!
        <div class="success-actions">
            <button @click="router.push('/items')" class="btn primary">
            View All Items
            </button>
        </div>
    </div>
    
    <form @submit.prevent="saveItem" class="item-form">
      <div class="form-columns">
        <div class="form-column">
          <div class="form-group">
            <label for="name">Item Name *</label>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name" 
              required
              class="form-control"
              :class="{ 'is-invalid': validationErrors.name }"
            />
            <div v-if="validationErrors.name" class="invalid-feedback">
              {{ validationErrors.name }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="category_id">Category *</label>
            <select 
              id="category_id" 
              v-model="formData.category_id" 
              required
              class="form-control"
              :class="{ 'is-invalid': validationErrors.category_id }"
            >
              <option :value="null" disabled>Select a category</option>
              <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <div v-if="validationErrors.category_id" class="invalid-feedback">
              {{ validationErrors.category_id }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              v-model="formData.description"
              class="form-control"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="color">Color</label>
              <input 
                type="text" 
                id="color" 
                v-model="formData.color"
                class="form-control"
              />
            </div>
            
            <div class="form-group half">
              <label for="size">Size</label>
              <input 
                type="text" 
                id="size" 
                v-model="formData.size"
                class="form-control"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="brand">Brand</label>
            <input 
              type="text" 
              id="brand" 
              v-model="formData.brand"
              class="form-control"
            />
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.favorite">
              Mark as favorite
            </label>
          </div>
        </div>
        
        <div class="form-column">
          <div class="form-group">
            <label>Item Image</label>
            <div 
              class="image-preview" 
              :class="{ 'has-image': imagePreview }"
              @click="triggerImageUpload"
            >
              <img v-if="imagePreview" :src="imagePreview" alt="Image preview" />
              <div v-else class="upload-placeholder">
                <span>Click to upload image</span>
              </div>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleImageChange" 
              accept="image/*"
              class="hidden-file-input"
            />
            <div class="image-actions" v-if="imagePreview">
              <button type="button" class="btn small" @click="triggerImageUpload">Change</button>
              <button type="button" class="btn small delete-btn" @click="removeImage">Remove</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn secondary" @click="router.back()">Cancel</button>
        <button type="submit" class="btn primary" :disabled="clothingStore.loading">
          {{ clothingStore.loading ? 'Saving...' : 'Save Item' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClothingStore } from '../stores/clothing';
import { useCategoryStore } from '../stores/category';

const route = useRoute();
const router = useRouter();
const clothingStore = useClothingStore();
const categoryStore = useCategoryStore();

const saveSuccess = ref(false);
const fileInput = ref(null);
const imagePreview = ref(null);
const error = ref(null);
const validationErrors = reactive({});

const isEditMode = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

const formData = reactive({
  name: '',
  description: '',
  category_id: null,
  color: '',
  size: '',
  brand: '',
  favorite: false,
  image: null
});

onMounted(async () => {
  // Load categories if not already loaded
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
  
  // If edit mode, fetch the item
  if (isEditMode.value) {
    try {
      const item = await clothingStore.fetchItem(route.params.id);
      if (item) {
        formData.name = item.name || '';
        formData.description = item.description || '';
        formData.category_id = item.category_id || null;
        formData.color = item.color || '';
        formData.size = item.size || '';
        formData.brand = item.brand || '';
        formData.favorite = item.favorite || false;
        
        // Set image preview if available
        if (item.image_path) {
          imagePreview.value = `http://localhost:8000/storage/${item.image_path}`;
        }
      }
    } catch (err) {
      error.value = 'Failed to load item data';
      console.error(err);
    }
  }
});

function triggerImageUpload() {
  fileInput.value.click();
}

function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file type
  if (!file.type.match('image.*')) {
    error.value = 'Please select an image file';
    return;
  }
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Image size should not exceed 2MB';
    return;
  }
  
  formData.image = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  formData.image = null;
  imagePreview.value = null;
  fileInput.value.value = '';
}

async function saveItem() {
  error.value = null;
  Object.keys(validationErrors).forEach(key => delete validationErrors[key]);
  
  console.log("Form data being submitted:", JSON.stringify(formData));
  
  try {
    let result;
    
    if (isEditMode.value) {
      console.log("Updating existing item");
      result = await clothingStore.updateItem(route.params.id, formData);
    } else {
      console.log("Creating new item");
      result = await clothingStore.createItem(formData);
    }
    
    console.log("API response:", result);
    
    if (result && result.id) {
      console.log("Navigation to:", `/items/${result.id}`);
      router.push(`/items/${result.id}`);
    } else {
      console.error("Invalid result from API:", result);
      error.value = "Received invalid response from server";
    }
  } catch (err) {
    console.error("Full error object:", err);
    console.log("Error response data:", err.response?.data);
    
    if (err.response?.data?.errors) {
      // Validation errors
      Object.assign(validationErrors, err.response.data.errors);
      console.log("Validation errors:", validationErrors);
    } else {
      error.value = err.response?.data?.message || 'Failed to save item';
    }
  }
}
</script>

<style scoped>
.item-form-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

h2 {
  margin: 0;
  color: #2c3e50;
}

.error-message {
  background-color: #f8d7da;
  color: #dc3545;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.item-form {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-columns {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.form-column {
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

textarea.form-control {
  resize: vertical;
}

.checkbox-group {
  margin-top: 30px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.image-preview {
  width: 100%;
  height: 300px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 10px;
  overflow: hidden;
}

.image-preview.has-image {
  border: none;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  color: #999;
  text-align: center;
  padding: 20px;
}

.hidden-file-input {
  display: none;
}

.image-actions {
  display: flex;
  gap: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
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

.back-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.delete-btn {
  background: #f8d7da;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.primary:hover {
  background: #3aa876;
}

.primary:disabled {
  background: #a8d5c2;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-columns {
    flex-direction: column;
  }
}
</style>