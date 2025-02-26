<!-- src/App.vue -->
<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Wardrobe Management System</h1>
      <nav>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/dashboard">Dashboard</router-link> |
          <router-link to="/items">My Wardrobe</router-link> |
          <router-link to="/categories">Categories</router-link> |
          <a href="#" @click.prevent="logout">Logout</a>
        </template>
        <template v-else>
          <router-link to="/">Home</router-link> |
          <router-link to="/login">Login</router-link> |
          <router-link to="/register">Register</router-link>
        </template>
      </nav>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>© 2025 Wardrobe Management System</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  // Check authentication status on app start
  if (authStore.token && !authStore.user) {
    authStore.fetchUser();
  }
});

async function logout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<style>
/* Keep your existing styles */
</style>