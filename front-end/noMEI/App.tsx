
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation';
import { ProfileProvider } from './src/context/ProfileContext';
import { initAuth } from './src/services/authService';

export default function App(): React.JSX.Element {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    initAuth().finally(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1A2B5E" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ProfileProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="light" backgroundColor="#1A2B5E" />
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
