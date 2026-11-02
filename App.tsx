import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Recipe, SortOption } from './src/types/recipe';
import { colors } from './src/theme/colors';
import { getAllRecipes, getAllTags, saveRecipe, deleteRecipe } from './src/services/storage';
import { SAMPLE_RECIPES } from './src/services/sampleRecipes';

import { Header } from './src/components/Header';
import { TagFilter } from './src/components/TagFilter';
import { SearchSortBar } from './src/components/SearchSortBar';
import { RecipeCard } from './src/components/RecipeCard';
import { CookModeView } from './src/components/CookModeView';
import { ImportModal } from './src/components/ImportModal';
import { SettingsModal } from './src/components/SettingsModal';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Navigation states
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Load recipes from storage
  const loadData = useCallback(async () => {
    try {
      let stored = await getAllRecipes();
      if (stored.length === 0) {
        // First run: Seed with starter recipes
        for (const sample of SAMPLE_RECIPES) {
          await saveRecipe(sample);
        }
        stored = await getAllRecipes();
      }
      setRecipes(stored);
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (err) {
      console.error('Failed to load recipe data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle recipe save (new or edit)
  const handleSaveRecipe = async (recipe: Recipe) => {
    await saveRecipe(recipe);
    await loadData();
    setIsImportModalOpen(false);
    setEditingRecipe(null);
    setActiveRecipeId(recipe.id); // Navigate to the saved recipe
  };

  // Handle recipe delete
  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id);
    await loadData();
    setActiveRecipeId(null);
  };

  // Open edit modal for active recipe
  const handleEditActiveRecipe = () => {
    const active = recipes.find(r => r.id === activeRecipeId);
    if (active) {
      setEditingRecipe(active);
      setIsImportModalOpen(true);
    }
  };

  // Filter & Sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    return recipes
      .filter(recipe => {
        // Tag filter
        if (selectedTag && (!recipe.tags || !recipe.tags.includes(selectedTag))) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = recipe.title.toLowerCase().includes(q);
          const matchesIngredients = recipe.ingredients.some(ing => ing.toLowerCase().includes(q));
          const matchesTags = recipe.tags.some(tag => tag.toLowerCase().includes(q));
          const matchesDomain = recipe.sourceDomain?.toLowerCase().includes(q);
          const matchesNotes = recipe.notes?.toLowerCase().includes(q);
          return matchesTitle || matchesIngredients || matchesTags || matchesDomain || matchesNotes;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortOption === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
        if (sortOption === 'title_asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [recipes, selectedTag, searchQuery, sortOption]);

  const activeRecipe = useMemo(() => {
    return recipes.find(r => r.id === activeRecipeId) || null;
  }, [recipes, activeRecipeId]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        {/* Recipe Detail / Cook View Screen */}
        {activeRecipe ? (
          <CookModeView
            recipe={activeRecipe}
            onBack={() => setActiveRecipeId(null)}
            onEdit={handleEditActiveRecipe}
            onDelete={() => handleDeleteRecipe(activeRecipe.id)}
          />
        ) : (
          /* Main Library / Home View */
          <View style={styles.container}>
            <Header
              title="Recipe Box"
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onOpenAdd={() => {
                setEditingRecipe(null);
                setIsImportModalOpen(true);
              }}
              isSearchVisible={isSearchVisible}
              onToggleSearch={() => {
                setIsSearchVisible(prev => !prev);
                if (isSearchVisible) setSearchQuery('');
              }}
            />

            <SearchSortBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
              isExpanded={isSearchVisible}
            />

            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              totalCount={recipes.length}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading recipes...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredAndSortedRecipes}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <RecipeCard recipe={item} onPress={() => setActiveRecipeId(item.id)} />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                      <Ionicons name="receipt-outline" size={44} color={colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>
                      {searchQuery || selectedTag ? 'No matching recipes found' : 'Your Recipe Box is empty'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery || selectedTag
                        ? 'Try clearing filters or search terms.'
                        : 'Import your favorite recipes by pasting any webpage link.'}
                    </Text>
                    {searchQuery || selectedTag ? (
                      <TouchableOpacity
                        style={styles.emptyBtn}
                        onPress={() => {
                          setSearchQuery('');
                          setSelectedTag(null);
                        }}
                      >
                        <Text style={styles.emptyBtnText}>Clear Filters</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptyBtn}
                        onPress={() => {
                          setEditingRecipe(null);
                          setIsImportModalOpen(true);
                        }}
                      >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.emptyBtnText}>Import a Recipe</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
              />
            )}
          </View>
        )}

        {/* Import & Edit Modal */}
        <ImportModal
          visible={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            setEditingRecipe(null);
          }}
          onSave={handleSaveRecipe}
          initialRecipe={editingRecipe}
          existingTags={tags}
        />

        {/* Settings & Backup Modal */}
        <SettingsModal
          visible={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onDataChanged={loadData}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
