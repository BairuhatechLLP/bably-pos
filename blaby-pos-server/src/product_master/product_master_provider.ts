import { ProductMaster  } from './product_master';

export const ProductMasterProviders = [{ provide: 'ProductMasterRepository', useValue: ProductMaster }];
