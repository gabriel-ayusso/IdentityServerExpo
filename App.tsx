import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AuthProvider from './src/contexts/AuthProvider';
import Login from './src/screens/Login';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Login/>
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
