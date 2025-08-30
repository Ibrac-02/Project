import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TeacherProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Profile</Text>
      <Text style={styles.text}>Name: Joe Smith</Text>
      <Text style={styles.text}>Email: joe.smith@example.com</Text>
      {/* Add more profile details here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  text: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
});
