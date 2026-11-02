import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  totalCount: number;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  totalCount,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.pill, selectedTag === null && styles.pillActive]}
          onPress={() => onSelectTag(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, selectedTag === null && styles.pillTextActive]}>
            All ({totalCount})
          </Text>
        </TouchableOpacity>

        {tags.map(tag => {
          const isActive = selectedTag === tag;
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onSelectTag(isActive ? null : tag)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.chipDefault,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.chipDefaultText,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
