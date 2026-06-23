import { ReccuringNotification } from './reccuring_notfication_entity';

export const ReccuringNotificationProvider = [
  {
    provide: 'ReccuringNotificationRepository',
    useValue: ReccuringNotification,
  },
];
