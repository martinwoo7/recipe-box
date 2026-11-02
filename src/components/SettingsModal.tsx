import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { colors } from '../theme/colors';
import {
  exportRecipesJSON,
  importRecipesJSON,
  clearAllData,
  saveRecipe,
  getAllRecipes,
} from '../services/storage';
import { SAMPLE_RECIPES } from '../services/sampleRecipes';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onDataChanged,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const jsonString = await exportRecipesJSON();
      const filename = `recipe_box_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (Platform.OS === 'web') {
        // Web browser download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Export Complete', 'Recipe collection downloaded.');
      } else {
        // Native mobile export
        const file = new File(Paths.cache, filename);
        await file.write(jsonString);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Recipe Box Backup',
            UTI: 'public.json',
          });
        } else {
          Alert.alert('Export Successful', `Saved backup to: ${file.uri}`);
        }
      }
    } catch (err: any) {
      console.error('Export error', err);
      Alert.alert('Export Failed', err.message || 'Could not export recipes.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false);
        return;
      }

      const fileAsset = result.assets[0];
      let jsonContent = '';

      if (Platform.OS === 'web' && (fileAsset as any).file) {
        const fileObj = (fileAsset as any).file as Blob;
        jsonContent = await fileObj.text();
      } else {
        const file = new File(fileAsset.uri);
        jsonContent = await file.text();
      }

      const { added, updated } = await importRecipesJSON(jsonContent);
      Alert.alert(
        'Import Successful',
        `Successfully imported ${added} new recipe(s) and updated ${updated} existing recipe(s).`
      );
      onDataChanged();
      onClose();
    } catch (err: any) {
      console.error('Import error', err);
      Alert.alert('Import Failed', err.message || 'Invalid JSON file.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSamples = async () => {
    try {
      setLoading(true);
      const existing = await getAllRecipes();
      const existingIds = new Set(existing.map(r => r.id));

      let added = 0;
      for (const sample of SAMPLE_RECIPES) {
        if (!existingIds.has(sample.id)) {
          await saveRecipe(sample);
          added++;
        }
      }

      Alert.alert(
        'Starter Recipes Loaded',
        added > 0
          ? `Added ${added} starter recipes to your collection!`
          : 'Starter recipes are already in your collection.'
      );
      onDataChanged();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load sample recipes.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    const performClear = async () => {
      await clearAllData();
      Alert.alert('Cleared', 'All recipes have been removed.');
      onDataChanged();
      onClose();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete all saved recipes? This cannot be undone.')) {
        performClear();
      }
    } else {
      Alert.alert(
        'Clear All Data',
        'Are you sure you want to delete all saved recipes? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: performClear },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="settings-outline" size={22} color={colors.text} />
              <Text style={styles.dialogTitle}>Settings & Backup</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.dialogContent}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            ) : (
              <>
                {/* Backup / Export */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Data Portability</Text>
                  <Text style={styles.sectionSubtitle}>
                    Keep your recipe collection safe and transfer it between devices.
                  </Text>

                  <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="download-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Export Recipes to JSON</Text>
                      <Text style={styles.actionDesc}>Download a backup file of your entire library</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} onPress={handleImport}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight }]}>
                      <Ionicons name="cloud-upload-outline" size={20} color={colors.secondary} />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Import Recipes from JSON</Text>
                      <Text style={styles.actionDesc}>Restore or merge recipes from a backup file</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                  </TouchableOpacity>
                </View>

                {/* Starter content */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Starter Content</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleLoadSamples}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF4E5' }]}>
                      <Ionicons name="restaurant-outline" size={20} color="#D97706" />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Load Starter Recipes</Text>
                      <Text style={styles.actionDesc}>
                        Add 3 delicious sample recipes (Pizza, Chicken, Pancakes)
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                  </TouchableOpacity>
                </View>

                {/* Danger zone */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger Zone</Text>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.dangerBtn]}
                    onPress={handleClearData}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={[styles.actionTitle, { color: colors.danger }]}>
                        Delete All Recipes
                      </Text>
                      <Text style={styles.actionDesc}>Erase all stored recipes and custom tags</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  dialogContent: {
    padding: 20,
    gap: 20,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dangerBtn: {
    borderColor: colors.dangerLight,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actionDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
