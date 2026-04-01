import React from 'react';
import {StatusBar} from 'react-native';
import {RootNavigator} from './src/navigation';
import {ErrorBoundary} from './src/components';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      <RootNavigator />
    </ErrorBoundary>
  );
};

export default App;
