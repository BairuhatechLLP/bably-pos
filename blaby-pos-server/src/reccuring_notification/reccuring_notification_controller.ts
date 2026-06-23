import { Controller, Post, Get, Param, Put, Body, ParseIntPipe, Delete, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ReccuringNotificationService } from './reccuring_notification_service';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('reccuringnotification')
@ApiTags('reccuringnotification')
@UseInterceptors(ErrorsInterceptor)
export class ReccuringNotificationController {
  constructor(private readonly service: ReccuringNotificationService) {}

  //create a new entry to sales invoice table
  @Get('/all/:adminid')
  @ApiBearerAuth()
  create(@Param('adminid') adminid: number) {
    return this.service.list(adminid);
  }

  @Get('/list/:companyid')
  @ApiBearerAuth()
  listByCompany(@Param('companyid') companyid: number) {
    return this.service.listByCompany(companyid);
  }

  @Get('/get/:id')
  @ApiBearerAuth()
  get(@Param('id') id: number) {
    return this.service.get(id);
  }

  @Put('/update/:id')
  @ApiOkResponse()
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateReccuringNotification,
  ) {
    return this.service.update(id, updateReccuringNotification);
  }

  @Delete('/delete/:id')
  @ApiOkResponse()
  @ApiParam({ name: 'id', required: true })
  delete(
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return this.service.delete(id);
  }

  @Post('createReccuringInvoice/:invoiceId')
  @ApiBearerAuth()
  @ApiParam({ name: 'invoiceId', required: true })
  createReccuringInvoice(@Param('invoiceId') invoiceId: number) {
    return this.service.createReccuringInvoice(invoiceId);
  }
}
