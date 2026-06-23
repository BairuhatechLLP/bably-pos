import {OpenDB} from '../db';
const TableName = 'counters';
const Counters = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TableName} (
            id INTEGER PRIMARY KEY,
            adminid INTEGER,
            companyid INTEGER,
            name TEXT,
            balance TEXT,
            sdate TEXT,
            shiftlist TEXT,
            denomination TEXT,
            location INTEGER,
            created_at TEXT,
            updated_at TEXT,
            locationDetails TEXT
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
      console.error('Error in Counters:', err);
      resolve(false);
    }
  });
};

export default Counters;
