import { PermissionsAndroid, Platform } from 'react-native';

export const checkStorageAndCameraPermissions = async () => {
  try {
    if (Platform.OS === 'ios') {
      // No need to explicitly request permissions on iOS; handle it via the app's Info.plist file.
      return true;
    } else {
      // Request all required permissions
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      // Check if all permissions are granted
      const allPermissionsGranted = Object.values(granted).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );

      return allPermissionsGranted;
    }
  } catch (error) {
    return false;
  }
};
