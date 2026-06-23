import {OpenDB} from '../db';
const TableName = 'productMaster';
const ProductMaster = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const connect: any = await OpenDB();
      connect.transaction((tx: any) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TableName} (
            id INTEGER PRIMARY KEY,
            userid INTEGER,
            itemtype TEXT,
            icode TEXT,
            idescription TEXT,
            barcode TEXT,
            notes TEXT,
            pimage TEXT,
            date TEXT,
            trade_price REAL,
            rate REAL,
            quantity REAL,
            vatamt REAL,
            includevat REAL,
            price REAL,
            costprice REAL,
            sp_price REAL,
            stock INTEGER,
            c_price REAL,
            saccount INTEGER,
            adminid INTEGER,
            vat INTEGER,
            location TEXT,
            createdBy INTEGER,
            companyid INTEGER,
            hsn_code TEXT,
            is_deleted BOOLEAN DEFAULT false,
            is_direct_billing BOOLEAN DEFAULT false,
            parcel_charge REAL,
            unit INTEGER,
            product_category INTEGER,
            created_at TEXT,
            updated_at TEXT,
            remainingStock TEXT,
            unitDetails TEXT,
            parcel_option TEXT DEFAULT 'dine-in',
            sugar_option TEXT DEFAULT 'normal',
            ice_option TEXT DEFAULT 'normal'
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
      console.error('Error in ProductMaster_Init:', err);
      resolve(false);
    }
  });
};

export default ProductMaster;
