import {OpenDB} from '../db';
const TableName = 'productMaster';
const ProductMaster_Insert = async (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        tx.executeSql(`DELETE FROM ${TableName}`, [], () => {
          console.log('Cleared existing data');
        });
        data.forEach((product: any) => {
          tx.executeSql(
            `INSERT INTO ${TableName} (
                  id, userid, itemtype, icode, idescription, barcode, notes,
                  pimage, date, trade_price, rate, quantity, vatamt, includevat,
                  price, costprice, sp_price, stock, c_price, saccount, adminid,
                  vat, location, createdBy, companyid, hsn_code, is_deleted,
                  is_direct_billing, parcel_charge, unit, product_category,
                  created_at, updated_at, remainingStock, unitDetails
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product?.id,
              product?.userid,
              product?.itemtype,
              product?.icode,
              product?.idescription,
              product?.barcode,
              product?.notes,
              product?.pimage,
              product?.date,
              product?.trade_price,
              product?.rate,
              product?.quantity,
              product?.vatamt,
              product?.includevat,
              product?.price,
              product?.costprice,
              product?.sp_price,
              product?.stock,
              product?.c_price,
              product?.saccount,
              product?.adminid,
              product?.vat,
              product?.location,
              product?.createdBy,
              product?.companyid,
              product?.hsn_code,
              product?.is_deleted || false,
              product?.is_direct_billing || false,
              product?.parcel_charge,
              product?.unit,
              product?.product_category,
              product?.created_at,
              product?.updated_at,
              product?.remainingStock,
              JSON.stringify(product?.unitDetails),
            ],
            () => {},
            (error: any) => {
              console.error('Error inserting product:', product?.icode, error);
            },
          );
        });

        resolve(true);
      });
    } catch (err: any) {
      console.error('Error in insertProducts:', err);
      resolve(false);
    }
  });
};

const ProductMaster_FindAll = async (body: any) => {
  return new Promise((resolve, reject) => {
    OpenDB()
      .then((connect: any) => {
        connect.transaction((tx: any) => {
          let query = `
            SELECT * FROM ${TableName} 
            WHERE adminid = ? 
            AND itemtype = ? 
            AND companyid = ?
          `;

          const params: any[] = [body.id, body.type, body.companyid];

          if (body.name && body.name.trim() !== '') {
            query += ` AND idescription LIKE ?`;
            params.push(`%${body.name}%`);
          }

          if (body.category !== 0) {
            query += ` AND product_category = ?`;
            params.push(body.category);
          }

          // Simple alphabetical sorting - strict dictionary order
          // This ensures "AA" comes before "AB", "AC", etc.
          query += ` ORDER BY idescription COLLATE NOCASE ASC`;

          tx.executeSql(
            query,
            params,
            (_: any, results: any) => {
              const products = results?.rows?.raw().map((product: any) => ({
                ...product,
                unitDetails: JSON.parse(product?.unitDetails),
              }));
              resolve({
                data: products,
                status: true,
                message: 'success',
              });
            },
            (error: any) => {
              console.error('Error fetching products:', error);
              resolve({
                data: [],
                status: false,
                message: 'Error fetching products',
              });
            },
          );
        });
      })
      .catch((err: any) => {
        console.log('Error in findAllData:', err);
        resolve({
          data: [],
          status: false,
          message: err?.message || 'Error in findAllData',
        });
      });
  });
};

const ProductMaster_DropTable = async () => {
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

export {ProductMaster_Insert, ProductMaster_FindAll, ProductMaster_DropTable};
