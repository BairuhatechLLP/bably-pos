import {OpenDB} from '../db';
const TableName = 'offlineOrders';
const OfflineOrders = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TableName} (
            id INTEGER PRIMARY KEY,
            orderId INTEGER,
            userId INTEGER,
            companyId INTEGER,
            staffId INTEGER,
            shift_id INTEGER,
            utcOffset INTEGER,
            total REAL,
            ac_room BOOLEAN DEFAULT false,
            table_details TEXT,
            cooking_instructions TEXT,
            tokenNo TEXT,
            paymentMethod TEXT,
            orderStatus TEXT DEFAULT 'pending',
            orderItems TEXT,
            offline BOOLEAN DEFAULT true
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

export default OfflineOrders;
