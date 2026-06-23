import { Contactus } from './contactus-model';

export const contactusProviders = [
  { provide: 'ContactusRepository', useValue: Contactus },
];
