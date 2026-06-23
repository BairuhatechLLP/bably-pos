import {OpenDB} from '../db';

const TableName = 'counters';
const Counters_Insert = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql('DELETE FROM ' + TableName);
        for (let i = 0; i < body?.datas?.length; i++) {
          const item = body?.datas[i];
          await tx.executeSql(
            'INSERT INTO ' +
              TableName +
              ' (id, adminid, companyid, name, balance, sdate, shiftlist, denomination, location, created_at, updated_at, locationDetails) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [
              item?.id,
              item?.adminid,
              item?.companyid,
              item?.name,
              item?.balance,
              item?.sdate,
              JSON.stringify(item?.shiftlist),
              JSON.stringify(item?.denomination),
              item?.location,
              item?.created_at,
              item?.updated_at,
              JSON.stringify(item?.locationDetails),
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

const Counters_FindAll = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        let query = 'SELECT * FROM ' + TableName;
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
      console.error('Error in findAllCategories:', err);
      resolve({
        data: [],
        status: false,
        message: err.message || 'Error in finding categories',
      });
    }
  });
};

const Counters_DropTable = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql('DROP TABLE ' + TableName);
        resolve(true);
      });
    } catch (err) {
      console.error('Error deleting table:', err);
      resolve(false);
    }
  });
};

export {Counters_Insert, Counters_FindAll, Counters_DropTable};
