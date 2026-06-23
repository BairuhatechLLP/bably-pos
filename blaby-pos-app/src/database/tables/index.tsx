import {OpenDB} from '../db';
import ProductMaster from "./productMaster";
import ProductCategory from "./productCategory";
import Tables from "./tables";
import Counters from "./counters";
import OfflineOrders from "./offlineOrders";

const RunMigrations = async () => {
  try {
    const connect: any = await OpenDB();
    await connect.transaction(async (tx: any) => {
      tx.executeSql(
        `ALTER TABLE offlineOrders ADD COLUMN paymentMethod TEXT`,
        [],
        () => {},
        () => {},
      );
    });
  } catch (err) {
    // Column already exists, ignore
  }
};

const CreateTables = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await ProductMaster();
        await ProductCategory();
        await Tables();
        await Counters();
        await OfflineOrders();
        await RunMigrations();
        resolve(true);
      } catch (err) {
        resolve(false);
      }
    });
  };
  export {CreateTables};