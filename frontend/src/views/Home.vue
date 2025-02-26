<template>
  <div class="home">
    <h2>Welcome to Your Wardrobe Management System</h2>
    <p>This application helps you organize and manage your clothing items.</p>
    
    <div class="features">
      <div class="feature-card">
        <h3>Organize Your Clothes</h3>
        <p>Categorize your wardrobe items for easy access</p>
      </div>
      
      <div class="feature-card">
        <h3>Upload Images</h3>
        <p>Add photos of your clothing items</p>
      </div>
      
      <div class="feature-card">
        <h3>Search & Filter</h3>
        <p>Quickly find what you're looking for</p>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="btn primary" @click="$router.push('/login')">Login</button>
      <button class="btn secondary" @click="$router.push('/login')">Register</button>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}

h2 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 40px 0;
  gap: 20px;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.feature-card h3 {
  color: #42b983;
  margin-bottom: 10px;
}

.action-buttons {
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  margin: 0 10px;
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

.primary:hover {
  background: #3aa876;
}

.secondary:hover {
  background: #d7efe7;
}
</style>