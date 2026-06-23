import {OpenDB} from '../db';
const TableName = 'tables';
const Tables = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TableName} (
            id INTEGER PRIMARY KEY,
            adminid INTEGER,
            capacity INTEGER,
            companyid INTEGER,
            createdAt TEXT,
            deletedAt TEXT,
            section TEXT,
            status TEXT,
            table_number TEXT,
            updatedAt TEXT
          )`,
          [],
          () => {
            resolve(true);
          },
          (error: any) => {
            console.error('Error creating table:', error);
            resolve(false);
          },
        );
      });
    } catch (err: any) {
      console.error('Error in Tables:', err);
      resolve(false);
    }
  });
};

export default Tables;
