import {combineReducers} from '@reduxjs/toolkit';
import AuthSlice from './AuthSlice';
import DropdownSlice from './dropdownSlice';
const Slices = combineReducers({
  Auth: AuthSlice,
  Dropdown: DropdownSlice,
});
export default Slices;
