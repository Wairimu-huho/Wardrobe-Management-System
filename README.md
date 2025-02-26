# Wardrobe-Management-System


A full-stack web application that allows users to digitally organize and manage their wardrobe. Built with Laravel 11 for the backend API and Vue 3 for the frontend interface.



## Features

- **User Authentication**
  - Secure registration and login
  - Token-based authentication with Laravel Sanctum

- **Clothing Items Management**
  - Add, view, edit, and delete clothing items
  - Upload and manage clothing images
  - Mark favorite items
  - Track item details (color, size, brand, etc.)

- **Category Management**
  - Create and manage clothing categories
  - Assign items to specific categories
  - View items by category

- **Advanced Search & Filtering**
  - Search by item name, description, brand
  - Filter by category, color, size, favorite status
  - Sort by different attributes

- **Responsive User Interface**
  - Mobile-friendly design
  - Clean and intuitive dashboard
  - Visual wardrobe display

## Technologies Used

### Backend
- **Laravel 11** - PHP framework
- **MySQL** - Database
- **Laravel Sanctum** - API authentication
- **Intervention Image** (optional) - Image optimization

### Frontend
- **Vue 3** - JavaScript framework
- **Vue Router** - Navigation and routing
- **Pinia** - State management
- **Axios** - HTTP client
- **CSS** - Custom styling

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js and npm
- MySQL

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/wardrobe-management-system.git
   cd wardrobe-management-system/backend
   ```

2. Install PHP dependencies
   ```bash
   composer install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Configure your database in the `.env` file
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=wardrobe_db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. Run migrations and seed the database
   ```bash
   php artisan migrate
   php artisan db:seed --class=CategorySeeder
   ```

6. Create a symbolic link for storage
   ```bash
   php artisan storage:link
   ```

7. Configure CORS to allow requests from the frontend
   ```php
   // In config/cors.php, ensure your frontend URL is allowed
   'allowed_origins' => ['http://localhost:5173'],
   ```

8. Start the Laravel development server
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install JavaScript dependencies
   ```bash
   npm install
   ```

3. Configure API URL
   Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. Start the Vue development server
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## Usage

### User Registration and Login
1. Navigate to the registration page
2. Create an account with your email and password
3. Log in with your credentials

### Managing Clothing Items
1. Navigate to "My Wardrobe" to see all clothing items
2. Click "Add New Item" to create a new clothing item
3. Fill in the item details and upload an image
4. View, edit, or delete items from the list

### Working with Categories
1. Go to the "Categories" section
2. Create new categories or edit existing ones
3. View all items within a specific category

### Searching and Filtering
1. Use the search bar to find specific items
2. Apply filters to narrow down results by category, color, size, etc.
3. Sort the results by different criteria

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in a user
- `POST /api/logout` - Log out the current user
- `GET /api/user` - Get the authenticated user's data

### Clothing Items
- `GET /api/clothing-items` - Get all clothing items
- `POST /api/clothing-items` - Create a new clothing item
- `GET /api/clothing-items/{id}` - Get a specific clothing item
- `PUT /api/clothing-items/{id}` - Update a clothing item
- `DELETE /api/clothing-items/{id}` - Delete a clothing item
- `GET /api/clothing-items/filter-metadata` - Get metadata for filtering

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/{id}` - Get a specific category
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Images
- `POST /api/images/upload/{clothingItem?}` - Upload an image for a clothing item
- `DELETE /api/images/{clothingItem}` - Delete an image
- `POST /api/images/bulk-upload` - Upload multiple images

## Project Structure

### Backend
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── API/
│   │   │       ├── AuthController.php
│   │   │       ├── CategoryController.php
│   │   │       ├── ClothingItemController.php
│   │   │       └── ImageUploadController.php
│   │   └── Middleware/
│   └── Models/
│       ├── User.php
│       ├── ClothingItem.php
│       └── Category.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── CategorySeeder.php
├── routes/
│   └── api.php
└── storage/
    └── app/
        └── public/
            └── clothing_images/
```

### Frontend
```
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   └── api.js
│   ├── stores/
│   │   ├── auth.js
│   │   ├── clothing.js
│   │   └── category.js
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Dashboard.vue
│   │   ├── ClothingItems.vue
│   │   ├── ClothingItemDetail.vue
│   │   ├── ClothingItemForm.vue
│   │   ├── Categories.vue
│   │   └── CategoryDetail.vue
│   ├── App.vue
│   └── main.js
└── package.json
```



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Laravel](https://laravel.com/)
- [Vue.js](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Axios](https://axios-http.com/)
- [Intervention Image](https://image.intervention.io/v2)