import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types/recipe';
import { colors } from '../theme/colors';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const [imageError, setImageError] = useState(false);

  const displayTime = recipe.totalTime || recipe.cookTime || recipe.prepTime;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`Recipe: ${recipe.title}`}
    >
      <View style={styles.imageContainer}>
        {recipe.imageUrl && !imageError ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={38} color={colors.primary} />
          </View>
        )}
        {recipe.sourceDomain ? (
          <View style={styles.domainBadge}>
            <Ionicons name="globe-outline" size={11} color="#FFFFFF" />
            <Text style={styles.domainBadgeText} numberOfLines={1}>
              {recipe.sourceDomain}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        <View style={styles.metaRow}>
          {displayTime ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>{displayTime}</Text>
            </View>
          ) : null}

          {recipe.servings ? (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>{recipe.servings}</Text>
            </View>
          ) : null}

          <View style={styles.metaItem}>
            <Ionicons name="basket-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{recipe.ingredients.length} items</Text>
          </View>
        </View>

        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {recipe.tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
              </View>
            ))}
            {recipe.tags.length > 3 && (
              <View style={[styles.tagChip, styles.tagChipMore]}>
                <Text style={styles.tagChipMoreText}>+{recipe.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  domainBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  domainBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagChip: {
    backgroundColor: colors.chipDefault,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.chipDefaultText,
  },
  tagChipMore: {
    backgroundColor: colors.surfaceAlt,
  },
  tagChipMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
