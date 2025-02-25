<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Tops',
                'description' => 'Shirts, t-shirts, blouses, and other upper body garments'
            ],
            [
                'name' => 'Bottoms',
                'description' => 'Pants, shorts, skirts, and other lower body garments'
            ],
            [
                'name' => 'Dresses',
                'description' => 'Full-body garments including dresses and jumpsuits'
            ],
            [
                'name' => 'Outerwear',
                'description' => 'Jackets, coats, sweaters, and other outer layers'
            ],
            [
                'name' => 'Footwear',
                'description' => 'Shoes, boots, sandals, and other foot coverings'
            ],
            [
                'name' => 'Accessories',
                'description' => 'Hats, scarves, jewelry, bags, and other accessories'
            ],
            [
                'name' => 'Sportswear',
                'description' => 'Athletic and workout clothing'
            ],
            [
                'name' => 'Sleepwear',
                'description' => 'Pajamas, nightgowns, and other sleeping attire'
            ],
            [
                'name' => 'Underwear',
                'description' => 'Undergarments and lingerie'
            ],
            [
                'name' => 'Formal',
                'description' => 'Formal attire for special occasions'
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}