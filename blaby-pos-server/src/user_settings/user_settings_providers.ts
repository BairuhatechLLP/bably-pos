import { UserSettings } from './user_settings_entity';

export const UserSettingsProviders = [{ provide: 'UserSettingsRepository', useValue: UserSettings }];
