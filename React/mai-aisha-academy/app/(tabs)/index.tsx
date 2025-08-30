
import React from 'react';
import { Text, View } from 'react-native';

export default function TabIndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, marginBottom: 20, color: 'black' }}>Welcome to Mai Aisha Academy</Text>
      <Text style={{ color: 'black' }}>You are logged in!</Text>
    </View>
  );
}
