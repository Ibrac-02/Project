import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { saveDocumentMetadata } from '../../lib/documents'; // Make sure lib/documents.ts exists
import { uploadDocument } from '../../lib/firebase'; // Your existing upload function

export default function UploadDocumentScreen() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });

      if (result.canceled) {
        console.log('Document picking cancelled');
        setSelectedDocument(null);
      } else {
        setSelectedDocument(result.assets[0]);
        console.log('Selected document:', result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleUpload = async () => {
    if (!selectedDocument) {
      Alert.alert('No document selected', 'Please select a document to upload.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Authentication Error', 'You must be logged in to upload documents.');
      return;
    }

    setIsUploading(true);
    try {
      const storagePath = `uploads/${user.uid}/${selectedDocument.name}`;
      const { downloadUrl } = await uploadDocument(selectedDocument.uri, storagePath);

      const documentMetadata = {
        uploaderId: user.uid,
        fileName: selectedDocument.name,
        fileType: selectedDocument.mimeType || 'application/octet-stream',
        fileSize: selectedDocument.size ?? 0,
        downloadUrl: downloadUrl,
        storagePath: storagePath,
      };

      await saveDocumentMetadata(documentMetadata);

      Alert.alert('Upload Successful', `Document uploaded and metadata saved.`);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'There was an error uploading your document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Stack.Screen options={{ title: 'Upload Document' }} />
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Document Upload</Text>
      <Button title="Select Document" onPress={pickDocument} disabled={isUploading} />
      
      {selectedDocument && (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text>Selected File: {selectedDocument.name}</Text>
          <Text>Size: {((selectedDocument.size ?? 0) / 1024).toFixed(2)} KB</Text>

          <View style={{ marginTop: 10 }}>
            <Button
              title={isUploading ? "Uploading..." : "Upload Document"}
              onPress={handleUpload}
              disabled={isUploading}
              color="#1E90FF"
            />
          </View>

          {isUploading && <ActivityIndicator size="small" color="#1E90FF" style={{ marginTop: 10 }} />}
        </View>
      )}
    </View>
  );
}
