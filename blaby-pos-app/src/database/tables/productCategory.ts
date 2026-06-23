import { OpenDB } from "../db";

const TableName = 'productCategory';
const ProductCategory = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const connect: any = await OpenDB();
        connect.transaction(async (tx: any) => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS ' +
              TableName +
              '(id INTEGER PRIMARY KEY AUTOINCREMENT, category VARCHAR,userid INTEGER,companyid INTEGER,categoryType VARCHAR)',
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
        resolve(false);
      }
    });
  };
  export default ProductCategory;