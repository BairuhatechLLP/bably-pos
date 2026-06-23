import { LocationMaster } from './location.entity';

export const locationProvider = [{ provide: 'locationRepository', useValue: LocationMaster }];
