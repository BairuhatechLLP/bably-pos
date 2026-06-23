import {createSlice} from '@reduxjs/toolkit';

const BluetoothSlice = createSlice({
  name: 'Bluetooth',
  initialState: {
    connected:{},
  },
  reducers: {
    saveConnected: (state, action) => {
      state.connected = action.payload;
    },
    clearBluetooth: state => {
      state.connected = {};
    },
  },
});
export const {saveConnected, clearBluetooth} = BluetoothSlice.actions;
export default BluetoothSlice.reducer;
