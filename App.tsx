import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from '@app/Navigation';
import { StoreProvider } from '@app/StoreProvider';

function App() {
  return (
    <StoreProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <Navigation />
      </SafeAreaProvider>
    </StoreProvider>
  );
}

export default App;
