import {OpenDB} from '../db';

const TableName = 'productCategory';
const ProductCategory_Insert = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql('DELETE FROM ' + TableName);
        for (let i = 0; i < body?.data?.length; i++) {
          const item = body?.data[i];
          await tx.executeSql(
            'INSERT INTO ' +
              TableName +
              ' (id,category,userid,companyid,categoryType) VALUES (?,?,?,?,?)',
            [
              item?.id,
              item?.category,
              item?.userid,
              item?.companyid,
              item?.categoryType,
            ],
          );
        }
        resolve({data: [], status: true, message: 'Successfully Created'});
      });
    } catch (err) {
      console.log(err);
      resolve({
        data: [],
        status: false,
        message: 'Something Went Wrong.......',
      });
    }
  });
};

const ProductCategory_FindAll = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        let query = 'SELECT * FROM ' + TableName;
        query += ` ORDER BY category COLLATE NOCASE ASC`;
        tx.executeSql(
          query,
          [],
          (_: any, results: any) => {
            const categories = results.rows.raw();
            resolve({
              data: categories,
              status: true,
              message: 'Categories fetched successfully',
            });
          },
          (error: any) => {
            console.error('Error fetching categories:', error);
            resolve({
              data: [],
              status: false,
              message: 'Error fetching categories',
            });
          },
        );
      });
    } catch (err: any) {
      console.log('Error in findAllCategories:', err);
      resolve({
        data: [],
        status: false,
        message: err.message || 'Error in finding categories',
      });
    }
  });
};

const ProductCategory_DropTable = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql('DROP TABLE ' + TableName);
        resolve(true);
      });
    } catch (err) {
      console.log('Error deleting table:', err);
      resolve(false);
    }
  });
};

export {
  ProductCategory_Insert,
  ProductCategory_FindAll,
  ProductCategory_DropTable,
};
