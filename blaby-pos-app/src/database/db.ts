import SQLite, {enablePromise} from 'react-native-sqlite-storage';

const OpenDB = async () => {
  return new Promise((resolve, reject) => {
    try {
      const db = SQLite.openDatabase(
        {
          name: 'blabywestfieldpos',
          location: 'default',
        },
        () => {
          resolve(db);
        },
        error => {
          console.error('Error opening database:', error);
          reject(error);
        },
      );
    } catch (err) {
      console.error('Error opening database:', err);
      reject(err);
    }
  });
};

export {OpenDB};
