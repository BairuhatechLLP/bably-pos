import { DatabaseModule } from '../database/database.module';
import { Module } from '@nestjs/common';
import { CountriesController } from './countries_controller';
import { CountriesService } from './countries_service';
import { countries_model } from './countries_provider';

@Module({
    imports: [DatabaseModule],
    controllers: [CountriesController],
    providers: [CountriesService, ...countries_model],
    exports: [CountriesService, DatabaseModule]
})
export class CountriesModule {}
