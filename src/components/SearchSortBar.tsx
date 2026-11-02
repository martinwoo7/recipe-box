import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SortOption } from '../types/recipe';

interface SearchSortBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  isExpanded: boolean;
}

export const SearchSortBar: React.FC<SearchSortBarProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  isExpanded,
}) => {
  if (!isExpanded && !searchQuery) return null;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search by title, ingredient, or tag..."
          placeholderTextColor={colors.textSubtle}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoFocus={isExpanded && !searchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortPill, sortOption === 'newest' && styles.sortPillActive]}
          onPress={() => onSortChange('newest')}
        >
          <Text style={[styles.sortText, sortOption === 'newest' && styles.sortTextActive]}>Newest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortPill, sortOption === 'oldest' && styles.sortPillActive]}
          onPress={() => onSortChange('oldest')}
        >
          <Text style={[styles.sortText, sortOption === 'oldest' && styles.sortTextActive]}>Oldest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortPill, sortOption === 'title_asc' && styles.sortPillActive]}
          onPress={() => onSortChange('title_asc')}
        >
          <Text style={[styles.sortText, sortOption === 'title_asc' && styles.sortTextActive]}>A-Z</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  sortPillActive: {
    backgroundColor: colors.primaryLight,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sortTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
