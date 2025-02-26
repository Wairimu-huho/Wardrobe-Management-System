<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Wardrobe Management System</h1>
      <nav v-if="!isLoadingAuth">
        <template v-if="isAuthenticated">
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
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
    
    <footer class="app-footer">
      <p>© 2025 Wardrobe Management System</p>
    </footer>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'App',
  setup() {
    const router = useRouter();
    const isLoadingAuth = ref(true);
    const isAuthenticated = ref(false);
    
    onMounted(() => {
      // Check if token exists for initial auth state
      const token = localStorage.getItem('token');
      isAuthenticated.value = !!token;
      isLoadingAuth.value = false;
      
      // If you're using Pinia in this component, uncomment this
      // if (token) {
      //   authStore.fetchUser();
      // }
    });
    
    const logout = () => {
      localStorage.removeItem('token');
      isAuthenticated.value = false;
      router.push('/login');
    };
    
    return {
      isLoadingAuth,
      isAuthenticated,
      logout
    };
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 15px 20px;
}

.app-header h1 {
  color: #42b983;
  margin-bottom: 10px;
}

nav {
  margin-top: 15px;
}

nav a {
  color: #42b983;
  text-decoration: none;
  margin-right: 10px;
}

nav a.router-link-active {
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  padding: 15px 20px;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
}
</style>