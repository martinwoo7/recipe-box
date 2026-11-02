import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  onOpenSettings: () => void;
  onOpenAdd: () => void;
  isSearchVisible: boolean;
  onToggleSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Recipe Box',
  onOpenSettings,
  onOpenAdd,
  isSearchVisible,
  onToggleSearch,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoBadge}>
          <Ionicons name="restaurant" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconButton, isSearchVisible && styles.iconButtonActive]}
          onPress={onToggleSearch}
          accessibilityLabel="Search recipes"
        >
          <Ionicons
            name={isSearchVisible ? 'close-outline' : 'search-outline'}
            size={22}
            color={isSearchVisible ? colors.primary : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenSettings}
          accessibilityLabel="Settings and backup"
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={onOpenAdd}
          accessibilityLabel="Add new recipe"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  iconButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
