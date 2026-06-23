import {PermissionsAndroid} from 'react-native';

const CheckBtPermission = async () => {
  try {
    const permissions = {
      title: 'HSD bluetooth request permission to access bluetooth',
      message:
        'HSD bluetooth requires access to bluetooth for the connection process to bluetooth printer',
      buttonNeutral: 'Another time',
      buttonNegative: 'Not',
      buttonPositive: 'Yes',
    };
    const BTCONNECTION = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      permissions,
    );
    const BTSCAN = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      permissions,
    );
    console.log("BTCONNECTION",BTCONNECTION)
      console.log("BTSCAN",BTSCAN)
  } catch (err) {
    console.log("CheckBtPermission",err);
    return false;
  }
};

export default CheckBtPermission;
