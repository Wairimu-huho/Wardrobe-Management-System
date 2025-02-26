<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-page">
    <h2>Welcome to Your Dashboard</h2>
    
    <div v-if="authStore.loading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="authStore.user" class="user-welcome">
      <h3>Hello, {{ authStore.user.name }}!</h3>
      <p>Email: {{ authStore.user.email }}</p>
    </div>
    
    <div class="dashboard-actions">
      <button class="btn primary" @click="navigateTo('/items')">
        View My Wardrobe
      </button>
      <button class="btn secondary" @click="navigateTo('/categories')">
        Manage Categories
      </button>
      <button class="btn danger" @click="handleLogout">
        Logout
      </button>
    </div>
    
    <div class="dashboard-stats">
      <h3>Your Wardrobe Stats</h3>
      <p>Coming soon...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  // Make sure user data is loaded
  if (!authStore.user) {
    authStore.fetchUser();
  }
});

function navigateTo(path) {
  router.push(path);
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.dashboard-page {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}

.user-welcome {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.dashboard-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
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

.danger {
  background: #f8d7da;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.primary:hover {
  background: #3aa876;
}

.secondary:hover {
  background: #d7efe7;
}

.danger:hover {
  background: #f5c6cb;
}

.dashboard-stats {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
</style>