<!-- src/views/Register.vue -->
<template>
  <div class="register-page">
    <div class="register-container">
      <h2>Create an Account</h2>
      
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required
            class="form-control"
          />
        </div>
        
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
            minlength="8"
            class="form-control"
          />
          <small class="form-text">Password must be at least 8 characters</small>
        </div>
        
        <div class="form-group">
          <label for="password_confirmation">Confirm Password</label>
          <input 
            type="password" 
            id="password_confirmation" 
            v-model="passwordConfirmation" 
            required
            class="form-control"
          />
        </div>
        
        <div class="form-action">
          <button type="submit" class="btn primary" :disabled="authStore.loading || !isFormValid">
            {{ authStore.loading ? 'Registering...' : 'Register' }}
          </button>
        </div>
        
        <div class="form-footer">
          <p>Already have an account? <router-link to="/login">Login</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const isFormValid = computed(() => {
  return name.value && 
         email.value && 
         password.value.length >= 8 && 
         password.value === passwordConfirmation.value;
});

async function handleRegister() {
  if (!isFormValid.value) return;
  
  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value
  });
  
  if (success) {
    router.push('/dashboard');
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.register-container {
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

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
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