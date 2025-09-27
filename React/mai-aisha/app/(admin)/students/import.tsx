import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import Papa from 'papaparse';
import { createStudent } from '@/lib/students';
import { listClasses } from '@/lib/classes';

// Simple CSV import skeleton with mapping for: name,email,class,admissionNo,parentName,parentEmail,parentPhone
export default function AdminStudentsImport() {
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    listClasses().then(cls => setClasses(cls.map(c => ({ id: c.id, name: c.name }))));
  }, []);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      if (res.type !== 'success') return;
      const fileUri = res.assets?.[0]?.uri || res.uri;
      if (!fileUri) return;

      setParsing(true);
      const csvText = await fetch(fileUri).then(r => r.text());
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as any[];
          setRows(data);
          setHeaders(results.meta.fields || []);
          setParsing(false);
        },
        error: (err) => {
          setParsing(false);
          Alert.alert('Parse error', err.message);
        }
      });
    } catch (e: any) {
      setParsing(false);
      Alert.alert('Error', e.message || 'Could not read CSV');
    }
  };

  const importAll = async () => {
    if (!rows.length) { Alert.alert('No data', 'Please choose a CSV first'); return; }
    let success = 0;
    let fail = 0;
    for (const r of rows) {
      try {
        const name = (r.name || r.fullname || r.full_name || '').toString().trim();
        if (!name) { fail++; continue; }
        const email = (r.email || '').toString().trim();
        const admissionNo = (r.admissionNo || r.admission_no || '').toString().trim();
        const className = (r.class || r.class_name || '').toString().trim();
        const cls = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
        await createStudent({
          name,
          email: email || null,
          employeeId: admissionNo || null,
          classes: cls?.id || null,
          parentName: (r.parentName || '').toString().trim() || null,
          parentEmail: (r.parentEmail || '').toString().trim() || null,
          parentContactNumber: (r.parentPhone || r.parentContact || '').toString().trim() || null,
        });
        success++;
      } catch {
        fail++;
      }
    }
    Alert.alert('Import finished', `Imported: ${success}\nFailed: ${fail}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Import Students (CSV)</Text>
      <Text style={styles.subtitle}>Expected columns: name, email, class, admissionNo, parentName, parentEmail, parentPhone</Text>

      <TouchableOpacity onPress={pickFile} style={styles.pickBtn} disabled={parsing}>
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.pickBtnText}>{parsing ? 'Parsing...' : 'Choose CSV'}</Text>
      </TouchableOpacity>

      {!!headers.length && (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Preview ({rows.length} rows)</Text>
          {rows.slice(0, 5).map((r, idx) => (
            <Text key={idx} style={styles.previewRow}>{headers.map(h => r[h]).join(' | ')}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={importAll} style={[styles.pickBtn, { backgroundColor: '#16a34a' }]} disabled={!rows.length}>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        <Text style={styles.pickBtnText}>Import</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitle: { color: '#475569', marginBottom: 12 },
  pickBtn: { marginTop: 10, backgroundColor: '#1E90FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  pickBtnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
  previewBox: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', marginTop: 12 },
  previewTitle: { fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  previewRow: { color: '#334155', marginBottom: 4 },
});
