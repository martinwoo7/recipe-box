import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstructionStep, Recipe } from '../types/recipe';
import { colors } from '../theme/colors';
import { fetchAndParseRecipe, getDomain } from '../services/parser';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
  existingTags: string[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onClose,
  onSave,
  initialRecipe,
  existingTags,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceDomain, setSourceDomain] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<InstructionStep[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // New item inputs
  const [newIngredient, setNewIngredient] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (initialRecipe) {
      setTitle(initialRecipe.title || '');
      setImageUrl(initialRecipe.imageUrl || '');
      setSourceUrl(initialRecipe.sourceUrl || '');
      setSourceDomain(initialRecipe.sourceDomain || '');
      setDescription(initialRecipe.description || '');
      setPrepTime(initialRecipe.prepTime || '');
      setCookTime(initialRecipe.cookTime || '');
      setServings(initialRecipe.servings || '');
      setIngredients(initialRecipe.ingredients || []);
      setInstructions(initialRecipe.instructions || []);
      setTags(initialRecipe.tags || []);
      setNotes(initialRecipe.notes || '');
      setUrlInput(initialRecipe.sourceUrl || '');
    } else {
      resetForm();
    }
  }, [initialRecipe, visible]);

  const resetForm = () => {
    setUrlInput('');
    setTitle('');
    setImageUrl('');
    setSourceUrl('');
    setSourceDomain('');
    setDescription('');
    setPrepTime('');
    setCookTime('');
    setServings('');
    setIngredients([]);
    setInstructions([]);
    setTags([]);
    setNotes('');
    setNewIngredient('');
    setNewInstruction('');
    setNewTagInput('');
  };

  const handleExtractFromUrl = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Please enter a URL', 'Paste a link to any recipe website or blog.');
      return;
    }

    setIsExtracting(true);
    try {
      const parsed = await fetchAndParseRecipe(urlInput.trim());

      setTitle(parsed.title || '');
      setImageUrl(parsed.imageUrl || '');
      setSourceUrl(parsed.sourceUrl || urlInput.trim());
      setSourceDomain(parsed.sourceDomain || getDomain(urlInput.trim()));
      setDescription(parsed.description || '');
      setPrepTime(parsed.prepTime || '');
      setCookTime(parsed.cookTime || '');
      setServings(parsed.servings || '');
      setIngredients(parsed.ingredients || []);
      setInstructions(parsed.instructions || []);
      setTags(parsed.tags || []);

      if (parsed.ingredients.length === 0 && parsed.instructions.length === 0) {
        Alert.alert(
          'Notice',
          'We fetched the webpage title and image, but could not detect standard recipe schema. You can add ingredients and steps manually below.'
        );
      }
    } catch (err: any) {
      console.warn('Extraction failed', err);
      Alert.alert(
        'Parsing Error',
        `Could not automatically extract recipe: ${err.message || 'Please check the URL or your internet connection.'}\n\nYou can still fill in the recipe details manually.`
      );
      setSourceUrl(urlInput.trim());
      setSourceDomain(getDomain(urlInput.trim()));
    } finally {
      setIsExtracting(false);
    }
  };

  // Ingredient helpers
  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (text: string, index: number) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  };

  // Instruction helpers
  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions(prev => [
        ...prev,
        {
          stepNumber: prev.length + 1,
          text: newInstruction.trim(),
        },
      ]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    });
  };

  const updateInstruction = (text: string, index: number) => {
    setInstructions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text };
      return updated;
    });
  };

  // Tag helpers
  const addTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags(prev => [...prev, cleaned]);
    }
    setNewTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please provide a title for the recipe.');
      return;
    }

    const recipeToSave: Recipe = {
      id: initialRecipe ? initialRecipe.id : `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      sourceDomain: sourceDomain.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
      prepTime: prepTime.trim() || undefined,
      cookTime: cookTime.trim() || undefined,
      servings: servings.trim() || undefined,
      ingredients,
      instructions,
      tags,
      notes: notes.trim() || undefined,
      createdAt: initialRecipe ? initialRecipe.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(recipeToSave);
  };

  const isEditing = Boolean(initialRecipe);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Modal Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Recipe' : 'Add Recipe'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent}>
          {/* URL Extract Section (Shown prominently when adding new) */}
          {!isEditing && (
            <View style={styles.urlCard}>
              <View style={styles.urlHeader}>
                <Ionicons name="link-outline" size={20} color={colors.primary} />
                <Text style={styles.urlCardTitle}>Extract from Webpage</Text>
              </View>
              <Text style={styles.urlCardSubtitle}>
                Paste any recipe URL (e.g. Serious Eats, NYT, Allrecipes, food blogs)
              </Text>
              <View style={styles.urlInputRow}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/recipe..."
                  placeholderTextColor={colors.textSubtle}
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <TouchableOpacity
                  style={[styles.extractBtn, isExtracting && styles.extractBtnDisabled]}
                  onPress={handleExtractFromUrl}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="flash" size={16} color="#FFFFFF" />
                      <Text style={styles.extractBtnText}>Parse</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recipe Details Form */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Recipe Information</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Grandma's Apple Pie"
                placeholderTextColor={colors.textSubtle}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Hero Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={colors.textSubtle}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
              {imageUrl ? (
                <View style={styles.imagePreviewBox}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                </View>
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Prep Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15 mins"
                  placeholderTextColor={colors.textSubtle}
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Cook Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30 mins"
                  placeholderTextColor={colors.textSubtle}
                  value={cookTime}
                  onChangeText={setCookTime}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  style={styles.input}
                  placeholder="4 servings"
                  placeholderTextColor={colors.textSubtle}
                  value={servings}
                  onChangeText={setServings}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description / Overview</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief summary of the dish..."
                placeholderTextColor={colors.textSubtle}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Tags & Categories</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag (e.g. Dinner, Quick, Italian)..."
                placeholderTextColor={colors.textSubtle}
                value={newTagInput}
                onChangeText={setNewTagInput}
                onSubmitEditing={() => addTag(newTagInput)}
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={() => addTag(newTagInput)}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Existing tags to quickly tap and add */}
            {existingTags.length > 0 && (
              <View style={styles.suggestionsRow}>
                <Text style={styles.suggestionsLabel}>Existing:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {existingTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.suggestionChip, tags.includes(tag) && styles.suggestionChipSelected]}
                      onPress={() => (tags.includes(tag) ? removeTag(tag) : addTag(tag))}
                    >
                      <Text
                        style={[
                          styles.suggestionText,
                          tags.includes(tag) && styles.suggestionTextSelected,
                        ]}
                      >
                        {tags.includes(tag) ? `✓ #${tag}` : `+ #${tag}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Current Tags Chips */}
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Ingredients ({ingredients.length})</Text>
            </View>

            <View style={styles.addItemRow}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add ingredient (e.g. 2 cups flour)..."
                placeholderTextColor={colors.textSubtle}
                value={newIngredient}
                onChangeText={setNewIngredient}
                onSubmitEditing={addIngredient}
              />
              <TouchableOpacity style={styles.addItemBtn} onPress={addIngredient}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.itemsList}>
              {ingredients.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemIndex}>•</Text>
                  <TextInput
                    style={styles.itemTextInput}
                    value={item}
                    onChangeText={text => updateIngredient(text, index)}
                    multiline
                  />
                  <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Instructions ({instructions.length})</Text>
            </View>

            <View style={styles.addItemRow}>
              <TextInput
                style={[styles.addItemInput, { height: 60 }]}
                placeholder="Add instruction step..."
                placeholderTextColor={colors.textSubtle}
                value={newInstruction}
                onChangeText={setNewInstruction}
                multiline
              />
              <TouchableOpacity
                style={[styles.addItemBtn, { height: 60 }]}
                onPress={addInstruction}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.itemsList}>
              {instructions.map((step, index) => (
                <View key={index} style={styles.stepItemRow}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.stepTextInput}
                    value={step.text}
                    onChangeText={text => updateInstruction(text, index)}
                    multiline
                  />
                  <TouchableOpacity onPress={() => removeInstruction(index)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Personal Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal Notes / Tips</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Bake 5 mins less in convection oven, double the garlic..."
              placeholderTextColor={colors.textSubtle}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  urlCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
  },
  urlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urlCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  urlCardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  urlInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 14,
    color: colors.text,
  },
  extractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  extractBtnDisabled: {
    opacity: 0.6,
  },
  extractBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  imagePreviewBox: {
    marginTop: 8,
    width: '100%',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 14,
  },
  addTagBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  suggestionChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  suggestionChipSelected: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  suggestionTextSelected: {
    color: colors.secondary,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipDefault,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  tagBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.chipDefaultText,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    minHeight: 42,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 14,
  },
  addItemBtn: {
    width: 44,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    gap: 8,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 8,
  },
  itemIndex: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '900',
  },
  itemTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    minHeight: 40,
  },
  removeBtn: {
    padding: 6,
  },
});
