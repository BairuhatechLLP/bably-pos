import {combineReducers} from '@reduxjs/toolkit';
import authSlice from './userSlice';
import DatasyncSlice from "./datasyncSlice";
import BluetoothSlice from "./bluetoothSlice";
import SettingsSlice from "./settingsSlice";

const Slices = combineReducers({
  Auth: authSlice,
  Datasync:DatasyncSlice,
  Bluetooth:BluetoothSlice,
  Settings:SettingsSlice
});
export default Slices;
