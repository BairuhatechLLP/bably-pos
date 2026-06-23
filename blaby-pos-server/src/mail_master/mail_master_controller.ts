import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMailMasterDto } from './dto/mail_master_create';
import { MailMasterService } from './mail_master_service';
import { MailMaster as MailMaster } from './mail_master_entity';
import { MailMasterDto } from './dto/mail_master_dto';
import { Public } from '../shared/decorators/public.decorator';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('mailmaster')
@Public()
@ApiTags('mailmaster')
@UseInterceptors(ErrorsInterceptor)
export class controllerMailMaster {
  constructor(private readonly MailMasterService: MailMasterService) {}

  @Get('get')
  @ApiOkResponse({ type: [MailMasterDto] })
  findAll() {
    return this.MailMasterService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: MailMasterDto })
  @ApiParam({ name: 'id', required: true })
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.MailMasterService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: MailMaster })
  create(
    @Body() CreateMailMasterDto: CreateMailMasterDto,
  ): Promise<MailMaster> {
    return this.MailMasterService.create(CreateMailMasterDto);
  }

  
}
