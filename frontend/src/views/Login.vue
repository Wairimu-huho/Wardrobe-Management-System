<!-- src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Login to Wardrobe Manager</h2>
      
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            class="form-control"
          />
        </div>
        
        <div class="form-action">
          <button type="submit" class="btn primary" :disabled="authStore.loading">
            {{ authStore.loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
        
        <div class="form-footer">
          <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

async function handleLogin() {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  });
  
  if (success) {
    router.push('/dashboard');
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.login-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
}

.error-message {
  background-color: #ffeaea;
  color: #e74c3c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-action {
  margin-top: 30px;
}

.btn {
  width: 100%;
  padding: 12px;
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

.primary:hover:not(:disabled) {
  background: #3aa876;
}

.primary:disabled {
  background: #a8d5c2;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.form-footer a {
  color: #42b983;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>