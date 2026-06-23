import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { ConfigService } from '../shared/config/config.service';

@Injectable()
export class DatabaseService {

  private sequalize;
  constructor(
    private readonly configService: ConfigService,
  ) {
    this.sequalize = new Sequelize(configService.sequelizeOrmConfig);
  }
  get getSequelize() {
    return this.sequalize;
  }
}
