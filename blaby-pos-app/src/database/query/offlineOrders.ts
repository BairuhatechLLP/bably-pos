import {OpenDB} from '../db';

const TableName = 'offlineOrders';
const Orders_Insert = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql(
          `INSERT INTO ${TableName} (
              id,
              orderId,
              userId,
              companyId,
              staffId,
              shift_id,
              utcOffset,
              total,
              ac_room,
              table_details,
              cooking_instructions,
              tokenNo,
              paymentMethod,
              orderItems
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            body?.id,
            body?.orderId,
            body?.userId,
            body?.companyId,
            body?.staffId,
            body?.shift_id,
            body?.utcOffset,
            body?.total,
            body?.ac_room ?? false,
            JSON.stringify(body?.table_details),
            body?.cooking_instructions ?? '',
            body?.tokenNo ?? '',
            body?.paymentMethod ?? null,
            JSON.stringify(body?.orderItems ?? []),
          ],
        );
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

const Orders_update = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql(
          `UPDATE ${TableName} SET
            orderId = ?,
            userId = ?,
            companyId = ?,
            staffId = ?,
            shift_id = ?,
            utcOffset = ?,
            total = ?,
            ac_room = ?,
            table_details = ?,
            cooking_instructions = ?,
            tokenNo = ?,
            paymentMethod = ?,
            orderItems = ?
          WHERE id = ?`,
          [
            body?.orderId,
            body?.userId,
            body?.companyId,
            body?.staffId,
            body?.shift_id,
            body?.utcOffset,
            body?.total,
            body?.ac_room ?? false,
            JSON.stringify(body?.table_details),
            body?.cooking_instructions ?? '',
            body?.tokenNo ?? '',
            body?.paymentMethod ?? null,
            JSON.stringify(body?.orderItems ?? []),
            body?.id,
          ],
        );
      });
      resolve({data: [], status: true, message: 'Successfully updated'});
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

const Orders_status = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql(
          `UPDATE ${TableName} SET
            orderStatus = ?
            WHERE id = ?`,
          [body?.status, body?.id]
        );
      });
      resolve({
        data: [],
        status: true,
        message: 'Order successfully cancelled',
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

const Orders_FindAll = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction(async (tx: any) => {
        let query = 'SELECT * FROM ' + TableName;
        let whereClauses: string[] = [];
        let params: any[] = [];

        if (body?.search) {
          whereClauses.push(`tokenNo LIKE ?`);
          params.push(`%${body.search}%`);
        }

        if (body?.status !== 'all') {
          whereClauses.push(`orderStatus LIKE ?`);
          params.push(`%${body.status}%`);
        }

        if (whereClauses.length > 0) {
          query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ' ORDER BY id DESC';
        
        tx.executeSql(
          query,
          params,
          (_: any, results: any) => {
            const data = results.rows.raw();
            const orders = data?.map((orders: any) => ({
              ...orders,
              orderItems: JSON.parse(orders?.orderItems),
              table_details: JSON.parse(orders?.table_details),
            }));
            resolve({
              data: orders,
              status: true,
              message: 'Orders fetched successfully',
            });
          },
          (error: any) => {
            console.log('Error fetching orders:', error);
            resolve({
              data: [],
              status: false,
              message: 'Error fetching orders',
            });
          },
        );
      });
    } catch (err: any) {
      console.log('Error in orders:', err);
      resolve({
        data: [],
        status: false,
        message: err.message || 'Error in finding orders',
      });
    }
  });
};

const Orders_updatePaymentMethod = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql(
          `UPDATE ${TableName} SET paymentMethod = ? WHERE id = ?`,
          [body?.paymentMethod ?? null, body?.id],
        );
      });
      resolve({data: [], status: true, message: 'Payment method updated'});
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

const Orders_delete = async (id:number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      await connect.transaction(async (tx: any) => {
        await tx.executeSql(
          `DELETE FROM ${TableName} WHERE id = ?`,
          [id]
        );
      });
      resolve({
        data: [],
        status: true,
        message: 'Order successfully cancelled',
      });
    } catch (err) {
      console.log('Error deleting table:', err);
      resolve({
        data: [],
        status: false,
        message: 'Error delete orders',
      });
    }
  });
};

const Orders_DropTable = async () => {
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
  Orders_Insert,
  Orders_update,
  Orders_status,
  Orders_updatePaymentMethod,
  Orders_FindAll,
  Orders_delete,
  Orders_DropTable,
};
