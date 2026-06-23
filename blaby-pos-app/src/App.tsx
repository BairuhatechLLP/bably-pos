import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Navigation from './navigation';
import {PersistedStore, Store} from './redux/store';
import Network from './components/alertBox/network';

const App = () => {
  return (
    <Provider store={Store}>
        <PersistGate loading={null} persistor={PersistedStore}>
          <NavigationContainer>
            <Network/>
              <Navigation />
          </NavigationContainer>
        </PersistGate>
    </Provider>
  );
};

export default App;
