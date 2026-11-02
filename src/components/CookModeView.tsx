import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Recipe } from '../types/recipe';
import { colors } from '../theme/colors';

interface CookModeViewProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const CookModeView: React.FC<CookModeViewProps> = ({
  recipe,
  onBack,
  onEdit,
  onDelete,
}) => {
  // Track checked ingredients (by index)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  // Track completed steps (by index)
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  // Keep awake toggle state
  const [isKeepAwake, setIsKeepAwake] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Manage keep awake state
  useEffect(() => {
    if (isKeepAwake) {
      activateKeepAwakeAsync('COOK_MODE_TAG').catch(() => {});
    } else {
      deactivateKeepAwake('COOK_MODE_TAG').catch(() => {});
    }
    return () => {
      deactivateKeepAwake('COOK_MODE_TAG').catch(() => {});
    };
  }, [isKeepAwake]);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const resetAllChecks = () => {
    setCheckedIngredients({});
    setCompletedSteps({});
  };

  const handleOpenSource = async () => {
    if (recipe.sourceUrl) {
      const canOpen = await Linking.canOpenURL(recipe.sourceUrl);
      if (canOpen) {
        await Linking.openURL(recipe.sourceUrl);
      } else {
        Alert.alert('Cannot open link', recipe.sourceUrl);
      }
    }
  };

  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
        onDelete();
      }
    } else {
      Alert.alert(
        'Delete Recipe',
        `Are you sure you want to delete "${recipe.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ]
      );
    }
  };

  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={onBack} accessibilityLabel="Back to recipes">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.navActions}>
          {recipe.sourceUrl ? (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleOpenSource}
              accessibilityLabel="Open original source recipe"
            >
              <Ionicons name="open-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.navBtn}
            onPress={onEdit}
            accessibilityLabel="Edit recipe"
          >
            <Ionicons name="create-outline" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, styles.deleteNavBtn]}
            onPress={confirmDelete}
            accessibilityLabel="Delete recipe"
          >
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        {recipe.imageUrl && !imageError && (
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.heroImage}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Title & Metadata Card */}
        <View style={styles.headerSection}>
          {recipe.sourceDomain ? (
            <TouchableOpacity onPress={handleOpenSource} style={styles.domainPill}>
              <Ionicons name="globe-outline" size={13} color={colors.primaryDark} />
              <Text style={styles.domainText}>{recipe.sourceDomain}</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.primaryDark} />
            </TouchableOpacity>
          ) : null}

          <Text style={styles.title}>{recipe.title}</Text>

          {recipe.description ? (
            <Text style={styles.description}>{recipe.description}</Text>
          ) : null}

          {/* Quick stats */}
          <View style={styles.statsRow}>
            {recipe.prepTime ? (
              <View style={styles.statBox}>
                <Ionicons name="timer-outline" size={16} color={colors.primary} />
                <Text style={styles.statLabel}>Prep</Text>
                <Text style={styles.statVal}>{recipe.prepTime}</Text>
              </View>
            ) : null}

            {recipe.cookTime ? (
              <View style={styles.statBox}>
                <Ionicons name="flame-outline" size={16} color={colors.primary} />
                <Text style={styles.statLabel}>Cook</Text>
                <Text style={styles.statVal}>{recipe.cookTime}</Text>
              </View>
            ) : null}

            {recipe.servings ? (
              <View style={styles.statBox}>
                <Ionicons name="people-outline" size={16} color={colors.primary} />
                <Text style={styles.statLabel}>Yield</Text>
                <Text style={styles.statVal}>{recipe.servings}</Text>
              </View>
            ) : null}
          </View>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {recipe.tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Keep Screen On Cook Bar */}
          <View style={styles.cookBar}>
            <View style={styles.cookBarLeft}>
              <Ionicons
                name={isKeepAwake ? 'sunny' : 'sunny-outline'}
                size={22}
                color={isKeepAwake ? colors.accent : colors.textMuted}
              />
              <View>
                <Text style={styles.cookBarTitle}>Keep Screen On</Text>
                <Text style={styles.cookBarSubtitle}>
                  {isKeepAwake ? 'Screen will stay awake while cooking' : 'Device will sleep normally'}
                </Text>
              </View>
            </View>
            <Switch
              value={isKeepAwake}
              onValueChange={setIsKeepAwake}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="basket-outline" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.counterBadge}>
                {checkedCount}/{recipe.ingredients.length}
              </Text>
            </View>
            {checkedCount > 0 && (
              <TouchableOpacity onPress={resetAllChecks} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((item, idx) => {
              const isChecked = !!checkedIngredients[idx];
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.ingredientRow, isChecked && styles.ingredientRowChecked]}
                  onPress={() => toggleIngredient(idx)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
                  </View>
                  <Text
                    style={[styles.ingredientText, isChecked && styles.ingredientTextChecked]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Instructions / Steps Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="restaurant-outline" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.counterBadge}>
                {completedStepsCount}/{recipe.instructions.length}
              </Text>
            </View>
          </View>

          <View style={styles.stepsList}>
            {recipe.instructions.map((step, idx) => {
              const isDone = !!completedSteps[idx];
              return (
                <View key={idx}>
                  {step.section && (
                    <View style={styles.stepSectionHeader}>
                      <Ionicons name="pricetag-outline" size={14} color={colors.secondary} />
                      <Text style={styles.stepSectionTitle}>{step.section}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.stepCard, isDone && styles.stepCardDone]}
                    onPress={() => toggleStep(idx)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.stepHeaderRow}>
                      <View style={[styles.stepNumberBadge, isDone && styles.stepNumberBadgeDone]}>
                        <Text style={[styles.stepNumberText, isDone && styles.stepNumberTextDone]}>
                          {step.stepNumber || idx + 1}
                        </Text>
                      </View>
                      <View style={[styles.stepDonePill, isDone && styles.stepDonePillActive]}>
                        <Ionicons
                          name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                          size={18}
                          color={isDone ? colors.success : colors.textSubtle}
                        />
                        <Text style={[styles.stepDonePillText, isDone && styles.stepDonePillTextActive]}>
                          {isDone ? 'Done' : 'Tap when done'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.stepText, isDone && styles.stepTextDone]}>
                      {step.text}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Personal Notes Section */}
        {recipe.notes ? (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.accent} />
              <Text style={styles.notesTitle}>My Cooking Notes</Text>
            </View>
            <Text style={styles.notesText}>{recipe.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteNavBtn: {
    backgroundColor: colors.dangerLight,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: colors.surfaceAlt,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerSection: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  domainPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  domainText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    backgroundColor: colors.chipDefault,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.chipDefaultText,
  },
  cookBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 6,
  },
  cookBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cookBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  cookBarSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
  },
  counterBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    gap: 12,
  },
  ingredientRowChecked: {
    backgroundColor: '#F3F5F3',
    opacity: 0.65,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    fontWeight: '500',
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  stepsList: {
    gap: 12,
  },
  stepSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
  },
  stepCardDone: {
    backgroundColor: '#F3F5F3',
    borderColor: colors.secondaryLight,
    opacity: 0.75,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberBadgeDone: {
    backgroundColor: colors.secondary,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stepNumberTextDone: {
    color: '#FFFFFF',
  },
  stepDonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  stepDonePillActive: {
    backgroundColor: colors.secondaryLight,
  },
  stepDonePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepDonePillTextActive: {
    color: colors.secondary,
  },
  stepText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
  },
  stepTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  notesCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFDF6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F6E6C2',
    gap: 6,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9E6E18',
  },
  notesText: {
    fontSize: 14,
    color: '#654B1E',
    lineHeight: 20,
  },
});
