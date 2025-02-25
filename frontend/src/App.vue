<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Wardrobe Management System</h1>
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/login">Login</router-link>
      </nav>
    </header>
    
    <main class="main-content">
      <router-view></router-view>
    </main>
    
    <footer class="app-footer">
      <p>© 2025 Wardrobe Management System</p>
    </footer>
  </div>
</template>

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
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.main-content {
  flex: 1;
}

.app-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
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
</style>