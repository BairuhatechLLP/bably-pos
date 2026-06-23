import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PageDto, PageOptionsDto } from '../shared/dto';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import {
  AccountMaster as customersEntity
} from './account_master';
import { AccountMasterService } from './account_master_service';
import { UpdateAccountMasterDto } from './dto/accont_master_update';
import { AccountMasterDto } from './dto/account_masrter_dto';
import { ListAccountMasterDto } from './dto/account_master_list';
import { CreateAccountDto } from './dto/create_account_dto';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';
import { SubscriptionFree } from '../shared/decorators/subscriptionFree.decorator';
import { UserId } from '../shared/decorators/userId_decorator';

@Controller('account_master')
@UseInterceptors(ErrorsInterceptor)
@ApiTags('Account Master')
export class AccountMasterController {
  constructor(private readonly service: AccountMasterService) {}
  
  @Get('/getBankList/:id/:companyid')
  @ApiOkResponse({ type: CommonResponseDto })
  @SubscriptionFree()
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  getBankList(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('companyid', new ParseIntPipe()) companyid: number,
  ): Promise<CommonResponseDto> {
    return this.service.getBankList(id,companyid);
  }

  @Get('/getCashList/:id/:companyid')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  getCashList(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('companyid', new ParseIntPipe()) companyid: number,
  ): Promise<CommonResponseDto> {
    return this.service.getCashList(id,companyid);
  }

  @Post('addBank')
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  createBank(@Body() createAccountMasterDto: any): Promise<CommonResponseDto> {
    return this.service.addBankAccount(createAccountMasterDto);
  }

  @Post('updateBank')
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  updateBank(@Body() updateBank: any): Promise<CommonResponseDto> {
    return this.service.updateBankAccount(updateBank);
  }

  @Get('/list/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  findAllLedger(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.service.findAllList(id);
  }

  @Get('/list')
  @ApiOkResponse({ type: CommonResponseDto })
  defaultLedger(): Promise<CommonResponseDto> {
    return this.service.defaultLedgers();
  }

  @Get('/expenseLedgers/:companyid')
  @ApiOkResponse({ type: CommonResponseDto })
  findExpenseLedgers(
    @UserId() adminid: number,
    @Param('companyid', new ParseIntPipe()) companyid: number,
  ): Promise<CommonResponseDto> {
    return this.service.findExpenseLedgers(adminid,companyid);
  }

  @Post("/list-page-by")
  @ApiOkResponse({ type: [ListAccountMasterDto] })
  @ApiBearerAuth()
  list(@Body() body: ListAccountMasterDto): Promise<any> {
    return this.service.listAccountMaster(body);
  }

  @Get('/getMyLedgers/:id/:companyid')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: 'id', required: true })
  @ApiParam({ name: 'companyid', required: true })
  getMyLedgers(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('companyid', new ParseIntPipe()) companyid: number,
  ): Promise<CommonResponseDto> {
    return this.service.getMyLedgers(id,companyid);
  }

  @Get('/getLedgerById/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: 'id', required: true })
  getLedgerById(@Param('id') id: any): Promise<CommonResponseDto> {
    return this.service.findOne(id);
  }

  @Get('/sale/list/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: 'id', required: true })
  findAllSaleList(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.service.findAllSaleList(id);
  }

  @Get('/purchase/ledger/list/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: 'id', required: true })
  findAllPurchaseLedger(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.service.findAllPurchaseList(id);
  }
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [AccountMasterDto] })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<AccountMasterDto>> {
    return this.service.findAll(pageOptionsDto);
  }
  @Get('/getPayHead/:companyid')
  @ApiBearerAuth()
  getPayHead(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query("name") name: string,
    @Param('companyid', new ParseIntPipe()) companyid: number,
  ): Promise<PageDto<any>> {
    return this.service.getPayHead(pageOptionsDto, companyid,name);
  }

  @Get('/getPayHeadByCompany/:companyid')
  @ApiBearerAuth()
  getAllPayheads(
    @Query("name") name: string,
    @Param('companyid', new ParseIntPipe()) companyid: number,
  ): Promise<CommonResponseDto> {
    return this.service.getAllPayheads( companyid);
  }

  @Post('/add')
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() createAccountMasterDto: CreateAccountDto,
  ): Promise<CommonResponseDto> {
    return this.service.create(createAccountMasterDto);
  }

  @Put('/update/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateAccountMasterDto: UpdateAccountMasterDto,
  ): Promise<CommonResponseDto> {
    return this.service.update(id, updateAccountMasterDto);
  }

  @Post('/update-visibility')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  updateVisibility(
    @Body() createAccountMasterDto: any,
  ): Promise<CommonResponseDto> {
    return this.service.updateVisibility(createAccountMasterDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: customersEntity })
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<customersEntity> {
    return this.service.delete(id);
  }
  @Get('/defualt-ledger/:type/:id')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiParam({ name: 'type', required: true })
  findAllPurchaseInvoice(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('type') type: string,
  ): Promise<Object> {
    return this.service.findAllListType(id, type);
  }
  @Get('/fixed-assets/:adminid')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'adminid', required: true })
  findAllFixedAssets(
    @Param('adminid', new ParseIntPipe()) adminid: number,
  ): Promise<Object> {
    return this.service.findAllFixedAssets(adminid);
  }

}
