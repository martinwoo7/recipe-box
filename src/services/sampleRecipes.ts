import { Recipe } from '../types/recipe';

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'sample-margherita-pizza',
    title: 'Artisan Neapolitan Margherita Pizza',
    sourceUrl: 'https://www.seriouseats.com/basic-neapolitan-pizza-dough-recipe',
    sourceDomain: 'seriouseats.com',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp, blistered crust topped with crushed San Marzano tomatoes, fresh buffalo mozzarella, fragrant basil leaves, and extra-virgin olive oil.',
    prepTime: '20 mins',
    cookTime: '10 mins',
    totalTime: '30 mins',
    servings: '2 pizzas',
    tags: ['Dinner', 'Italian', 'Pizza', 'Vegetarian'],
    ingredients: [
      '500g (3 3/4 cups) "00" pizza flour',
      '325ml lukewarm water (65% hydration)',
      '10g kosher salt',
      '3g (1 tsp) active dry yeast',
      '1 can (14 oz) whole peeled San Marzano tomatoes, crushed by hand',
      '200g fresh mozzarella or fior di latte, torn into chunks',
      '1 bunch fresh basil leaves',
      '2 tbsp extra-virgin olive oil',
      'Coarse semolina for dusting the peel'
    ],
    instructions: [
      {
        stepNumber: 1,
        section: 'Dough Prep',
        text: 'Dissolve yeast in lukewarm water. In a large bowl, whisk flour and salt. Add the yeasted water and stir until a shaggy dough forms.'
      },
      {
        stepNumber: 2,
        section: 'Dough Prep',
        text: 'Knead on a lightly floured surface for 8 to 10 minutes until smooth and elastic. Divide into two balls, cover tightly, and let ferment at room temp for 2-3 hours.'
      },
      {
        stepNumber: 3,
        section: 'Baking',
        text: 'Preheat oven to 500°F (260°C) with a pizza stone or baking steel on the top rack for at least 45 minutes.'
      },
      {
        stepNumber: 4,
        section: 'Baking',
        text: 'Stretch dough into a 12-inch round on a semolina-dusted peel, leaving a 1/2-inch rim for the cornicione.'
      },
      {
        stepNumber: 5,
        section: 'Baking',
        text: 'Spread 3 tablespoons of crushed tomatoes evenly over the base. Scatter torn mozzarella and a few basil leaves. Drizzle lightly with olive oil.'
      },
      {
        stepNumber: 6,
        section: 'Baking',
        text: 'Slide onto the hot stone and bake for 7-9 minutes until crust is charred in spots and cheese is bubbling.'
      }
    ],
    notes: 'For optimal blistered crust, turn on the top broiler for the last 2 minutes of baking.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'sample-tuscan-chicken',
    title: 'Creamy Tuscan Garlic Butter Chicken',
    sourceUrl: 'https://cafedelites.com/creamy-tuscan-chicken/',
    sourceDomain: 'cafedelites.com',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    description: 'Tender pan-seared chicken breasts smothered in a rich, creamy garlic sauce with sun-dried tomatoes and fresh baby spinach.',
    prepTime: '10 mins',
    cookTime: '20 mins',
    totalTime: '30 mins',
    servings: '4 servings',
    tags: ['Dinner', 'Chicken', 'Quick', 'Keto'],
    ingredients: [
      '2 large chicken breasts, halved horizontally into 4 thin cutlets',
      '1 tbsp olive oil + 1 tbsp butter',
      '6 cloves garlic, finely minced',
      '1 cup heavy whipping cream',
      '1/2 cup chicken broth',
      '1/2 cup sun-dried tomatoes in oil, drained and sliced',
      '3 cups baby spinach leaves',
      '1/2 cup freshly grated Parmesan cheese',
      '1 tsp Italian herb seasoning',
      'Salt and freshly cracked black pepper to taste'
    ],
    instructions: [
      {
        stepNumber: 1,
        section: 'Chicken',
        text: 'Season chicken cutlets generously on both sides with salt, pepper, and 1/2 tsp of Italian seasoning.'
      },
      {
        stepNumber: 2,
        section: 'Chicken',
        text: 'Heat olive oil and butter in a large skillet over medium-high heat. Sear chicken for 5-6 minutes per side until golden brown and cooked through (165°F). Transfer to a plate.'
      },
      {
        stepNumber: 3,
        section: 'Sauce',
        text: 'In the same skillet, reduce heat to medium. Add minced garlic and sauté for 1 minute until fragrant.'
      },
      {
        stepNumber: 4,
        section: 'Sauce',
        text: 'Pour in chicken broth and heavy cream, bringing to a gentle simmer. Whisk in grated Parmesan cheese until melted and creamy.'
      },
      {
        stepNumber: 5,
        section: 'Sauce',
        text: 'Add sliced sun-dried tomatoes and baby spinach. Simmer for 2 minutes until spinach wilts and sauce thickens slightly.'
      },
      {
        stepNumber: 6,
        section: 'Finishing',
        text: 'Return seared chicken back into the skillet, spooning sauce over each piece. Serve hot over pasta or steamed veggies.'
      }
    ],
    notes: 'Goes wonderfully with warm crusty bread to soak up the sauce.',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'sample-blueberry-pancakes',
    title: 'Fluffy Golden Blueberry Buttermilk Pancakes',
    sourceUrl: 'https://smittenkitchen.com/2018/06/fluffy-blueberry-pancakes/',
    sourceDomain: 'smittenkitchen.com',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    description: 'Thick, fluffy diner-style buttermilk pancakes bursting with sweet fresh blueberries and served with warm maple syrup.',
    prepTime: '10 mins',
    cookTime: '15 mins',
    totalTime: '25 mins',
    servings: '4 servings (8-10 pancakes)',
    tags: ['Breakfast', 'Quick', 'Dessert', 'Vegetarian'],
    ingredients: [
      '2 cups (250g) all-purpose flour',
      '2 tbsp granulated sugar',
      '2 tsp baking powder',
      '1/2 tsp baking soda',
      '1/2 tsp fine sea salt',
      '1 3/4 cups buttermilk (or milk + 1 tbsp vinegar)',
      '2 large eggs, room temperature',
      '4 tbsp (55g) unsalted butter, melted and slightly cooled',
      '1 tsp pure vanilla extract',
      '1 1/2 cups fresh blueberries',
      'Butter for griddle and warm maple syrup for serving'
    ],
    instructions: [
      {
        stepNumber: 1,
        section: 'Batter',
        text: 'In a large bowl, whisk together flour, sugar, baking powder, baking soda, and salt.'
      },
      {
        stepNumber: 2,
        section: 'Batter',
        text: 'In a separate medium bowl, whisk buttermilk, eggs, melted butter, and vanilla extract until blended.'
      },
      {
        stepNumber: 3,
        section: 'Batter',
        text: 'Pour the wet ingredients into the dry ingredients. Gently fold with a rubber spatula just until combined; small lumps are completely fine (do not overmix).'
      },
      {
        stepNumber: 4,
        section: 'Griddle',
        text: 'Heat a nonstick skillet or griddle over medium heat (approx 350°F). Brush with a small knob of butter.'
      },
      {
        stepNumber: 5,
        section: 'Griddle',
        text: 'Pour 1/3 cup of batter per pancake. Immediately scatter 1-2 tablespoons of fresh blueberries directly on top of each pancake.'
      },
      {
        stepNumber: 6,
        section: 'Griddle',
        text: 'Cook for 2-3 minutes until bubbles burst on the surface and edges look set. Flip carefully and cook another 1-2 minutes until golden brown.'
      }
    ],
    notes: 'Do not stir blueberries into the batter directly, otherwise the batter turns purple! Dropping them onto each pancake on the griddle keeps them intact.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];
