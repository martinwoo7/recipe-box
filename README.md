# Recipe Box 🍳

A personal, local-first React Native & Expo app to parse, save, organize, and cook recipes from any food blog or website.

---

## Features

- **🌐 Smart Recipe Extraction**: Enter any recipe URL (from Serious Eats, NYT Cooking, Allrecipes, BBC Good Food, food blogs, etc.). The app extracts the title, hero image, cook/prep times, servings, ingredients list, and numbered steps using Schema.org JSON-LD and HTML parsing.
- **✏️ Preview & Edit**: Review and customize parsed ingredients, steps, or metadata before saving.
- **🏷️ Tag Organization & Multi-Filter**: Label recipes with custom tags (`#Dinner`, `#Italian`, `#Dessert`, `#Quick`, etc.). Filter by tag chips or full-text search across titles, ingredients, and notes.
- **⏱️ Sorting**: Sort recipes by Newest, Oldest, or Alphabetical (A-Z).
- **🧑‍🍳 Interactive Cook Mode**:
  - Check off ingredients as you prep (with strike-through styling and reset option).
  - Numbered instruction step cards with tap-to-complete.
  - **Keep Screen On** switch toggle (`expo-keep-awake`) so your phone screen never dims while your hands are messy.
  - Direct link to open the original source webpage.
- **💾 Data Portability**: Export your entire collection to a backup JSON file or import/restore recipes on any device.
- **✨ Starter Recipes**: Includes 3 curated starter recipes (Margherita Pizza, Tuscan Chicken, Blueberry Buttermilk Pancakes) out of the box.

---

## How to Run

Navigate into the project folder:
```bash
cd recipe-box
```

### 1. Web Browser (Quickest for instant preview)
```bash
npm run web
```
Opens in your default browser at `http://localhost:8081`.

### 2. iOS or Android via Expo Go
```bash
npm start
```
- Scan the QR code with the **Expo Go** app on Android, or the **Camera** app on iOS.
