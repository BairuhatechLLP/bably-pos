import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {Store, PersistedStore} from './redux/store';
import Navigation from './navigation';
import Network from './components/alertBox/network';
import StoreDropdown from './utils/storeDropdown';

function App() {
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={PersistedStore}>
        <Network/>
        <StoreDropdown show={true} />
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

export default App;
