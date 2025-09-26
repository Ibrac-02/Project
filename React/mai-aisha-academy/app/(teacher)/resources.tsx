import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, ProgressBarAndroid, ProgressViewIOS, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { createResource, deleteResource, getResources, updateResource } from '../../lib/resources';
import { UploadedDocument } from '../../lib/types';

export default function TeacherResourcesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<UploadedDocument[]>([]);
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentResource, setCurrentResource] = useState<UploadedDocument | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const fetchResources = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedResources = await getResources(user.uid); // Assuming getResources can filter by uploaderId
      setResources(fetchedResources);
    } catch (err: any) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!authLoading) {
      fetchResources();
    }
  }, [authLoading, fetchResources]);

  const resetForm = () => {
    setFileName('');
    setFileType('');
    setSelectedFileUri(null);
    setDescription('');
    setCurrentResource(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleAddResource = () => {
    resetForm();
    setUploadModalVisible(true);
  };

  const handleEditResource = (resource: UploadedDocument) => {
    setCurrentResource(resource);
    setFileName(resource.fileName);
    setFileType(resource.fileType);
    setSelectedFileUri(resource.downloadUrl); // For editing, display current file
    setDescription(resource.description || '');
    setUploadModalVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        setFileName(asset.name);
        // Attempt to derive file type from URI or name, or keep as generic
        const parts = asset.name.split('.');
        setFileType(parts.length > 1 ? parts[parts.length - 1] : 'unknown');
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const handleSaveResource = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    if (!fileName.trim() || !selectedFileUri) {
      Alert.alert("Error", "Please select a file and provide a file name.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      if (currentResource) {
        // Update existing resource (potentially replace file)
        const updatedResource = await updateResource(currentResource.id, user.uid, selectedFileUri, fileName, description, setUploadProgress);
        if (updatedResource) {
          Alert.alert("Success", "Resource updated successfully!");
          setUploadModalVisible(false);
          fetchResources();
        }
      } else {
        // Create new resource
        const newResource = await createResource(user.uid, selectedFileUri, fileName, description, setUploadProgress);
        if (newResource) {
          Alert.alert("Success", "Resource uploaded successfully!");
          setUploadModalVisible(false);
          fetchResources();
        }
      }
    } catch (err: any) {
      console.error("Error saving resource:", err);
      setError(`Failed to save resource: ${err.message}`);
      Alert.alert("Error", `Failed to save resource: ${err.message}`);
    } finally {
      setUploading(false);
      resetForm();
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    Alert.alert(
      "Delete Resource",
      "Are you sure you want to delete this resource? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteResource(resourceId);
              Alert.alert("Success", "Resource deleted.");
              fetchResources();
            } catch (err: any) {
              console.error("Error deleting resource:", err);
              Alert.alert("Error", `Failed to delete resource: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderProgressBar = () => {
    if (!uploading) return null;
    return (
      <View style={styles.progressBarContainer}>
        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={uploadProgress}
            color="#1E90FF"
            style={styles.progressBar}
          />
        ) : (
          <ProgressViewIOS
            progress={uploadProgress}
            progressTintColor="#1E90FF"
            style={styles.progressBar}
          />
        )}
        <Text style={styles.progressText}>{Math.round(uploadProgress * 100)}%</Text>
      </View>
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading resources...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchResources} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resource Management</Text>
      </View>

      <TouchableOpacity onPress={handleAddResource} style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Upload New Resource</Text>
      </TouchableOpacity>

      {resources.length === 0 ? (
        <Text style={styles.noDataText}>No resources uploaded yet.</Text>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.resourceCard}>
              <View style={styles.resourceInfo}>
                <Ionicons name="document-text-outline" size={24} color="#1E90FF" />
                <View style={styles.resourceTextContent}>
                  <Text style={styles.resourceFileName}>{item.fileName}</Text>
                  {item.description && <Text style={styles.resourceDescription}>{item.description}</Text>}
                  <Text style={styles.resourceMeta}>Type: {item.fileType.toUpperCase()} | Size: {(item.fileSize / 1024).toFixed(2)} KB</Text>
                  <Text style={styles.resourceMeta}>Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={styles.resourceActions}>
                <TouchableOpacity onPress={() => handleEditResource(item)} style={styles.actionButton}>
                  <Ionicons name="pencil-outline" size={20} color="#1E90FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteResource(item.id)} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { /* Implement file download/view */ }} style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Upload/Edit Resource Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUploadModalVisible}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentResource ? 'Edit Resource' : 'Upload New Resource'}</Text>
            
            <TouchableOpacity onPress={pickDocument} style={styles.pickFileButton}>
              <Ionicons name="folder-open-outline" size={24} color="#fff" />
              <Text style={styles.pickFileButtonText}>{selectedFileUri ? fileName : 'Pick a Document'}</Text>
            </TouchableOpacity>
            {selectedFileUri && <Text style={styles.selectedFileName}>Selected: {fileName}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Resource Name (e.g., Lesson Plan, Assignment)"
              value={fileName}
              onChangeText={setFileName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {renderProgressBar()}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setUploadModalVisible(false)} disabled={uploading}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveResource} disabled={uploading || !selectedFileUri}>
                <Text style={styles.buttonText}>{uploading ? 'Uploading...' : (currentResource ? 'Update' : 'Upload')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  header: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceTextContent: {
    marginLeft: 10,
    flex: 1,
  },
  resourceFileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resourceDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  resourceMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  resourceActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  pickFileButton: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  pickFileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  selectedFileName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
  },
  progressBar: {
    width: '100%',
    height: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    color: '#555',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

