import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface AutoCompleteProps<T> {
  value: string;
  placeholder?: string;
  data: T[]; // suggestion source
  labelExtractor: (item: T) => string;
  onChangeText: (text: string) => void;
  onSelectItem: (item: T) => void;
  maxSuggestions?: number;
  disabled?: boolean;
}

export default function AutoComplete<T>(props: AutoCompleteProps<T>) {
  const { value, placeholder, data, labelExtractor, onChangeText, onSelectItem, maxSuggestions = 8, disabled } = props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  const suggestions = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return data.slice(0, maxSuggestions);
    return data.filter((it) => labelExtractor(it).toLowerCase().includes(q)).slice(0, maxSuggestions);
  }, [data, query, labelExtractor, maxSuggestions]);

  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={inputRef}
        value={query}
        placeholder={placeholder}
        editable={!disabled}
        onChangeText={(t) => { setQuery(t); onChangeText(t); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={styles.input}
      />
      {open && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions as any[]}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onSelectItem(item as T);
                  setQuery(labelExtractor(item as T));
                  setOpen(false);
                }}
              >
                <Text style={styles.itemText}>{labelExtractor(item as T)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  dropdown: { position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, zIndex: 20, maxHeight: 220, overflow: 'hidden' },
  item: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemText: { color: '#333' },
});
