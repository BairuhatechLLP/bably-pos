import { ProductLocationMaster } from "./product_location.entity";

export const ProductLocationMasterProviders = [{ provide: 'ProductLocationMasterRepository', useValue: ProductLocationMaster }];
