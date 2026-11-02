import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types/recipe';

const STORAGE_KEY = '@recipe_box_recipes_v1';

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: Recipe[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load recipes from storage', err);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getAllRecipes();
  return recipes.find(r => r.id === id) || null;
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getAllRecipes();
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);

  const updatedRecipe: Recipe = {
    ...recipe,
    updatedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    recipes[existingIndex] = updatedRecipe;
  } else {
    recipes.unshift(updatedRecipe);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getAllRecipes();
  const filtered = recipes.filter(r => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function getAllTags(): Promise<string[]> {
  const recipes = await getAllRecipes();
  const tagSet = new Set<string>();
  for (const recipe of recipes) {
    if (recipe.tags && Array.isArray(recipe.tags)) {
      recipe.tags.forEach(t => {
        if (t && t.trim()) tagSet.add(t.trim());
      });
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

export async function exportRecipesJSON(): Promise<string> {
  const recipes = await getAllRecipes();
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    version: 1,
    recipes,
  }, null, 2);
}

export async function importRecipesJSON(jsonStr: string): Promise<{ added: number; updated: number }> {
  const parsed = JSON.parse(jsonStr);
  const incoming: Recipe[] = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.recipes) ? parsed.recipes : []);

  if (!incoming || incoming.length === 0) {
    throw new Error('No valid recipes found in imported JSON.');
  }

  const existing = await getAllRecipes();
  const existingMap = new Map(existing.map(r => [r.id, r]));

  let added = 0;
  let updated = 0;

  for (const item of incoming) {
    if (!item.id || !item.title) continue;
    if (existingMap.has(item.id)) {
      existingMap.set(item.id, { ...item, updatedAt: Date.now() });
      updated++;
    } else {
      existingMap.set(item.id, { ...item, createdAt: item.createdAt || Date.now(), updatedAt: Date.now() });
      added++;
    }
  }

  const merged = Array.from(existingMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  return { added, updated };
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
