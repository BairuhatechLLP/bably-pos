import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { PayrollPaySHeetItemDTO } from './dto/paysheetItems.dto';
import { CreatePaysheetItemsDto } from './dto/paysheetItemscreate';
import { PaySheetItemsService } from './paysheetItemsServices';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('paySheetItems')
@ApiTags('PayrollPaySheetItems')
@UseInterceptors(ErrorsInterceptor)
export class PaySheetItemsController {
  constructor(private readonly paysheetItemsCategory: PaySheetItemsService) {}
  @Get()
  @ApiOkResponse({ type: [PayrollPaySHeetItemDTO] })
  findAll(): Promise<any> {
    return this.paysheetItemsCategory.findAll();
  }
  @Get('/user/:id')
  @ApiOkResponse({ type: [PayrollPaySHeetItemDTO] })
  findAllByUser(@Param('id') id: any): Promise<any> {
    return this.paysheetItemsCategory.findAllUser(id);
  }

  @Post('/add')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() CreateProductCategoryDto: CreatePaysheetItemsDto,
  ): Promise<CommonResponseDto> {
    return this.paysheetItemsCategory.create(CreateProductCategoryDto);
  }
  @Put('/update/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: any,
    @Body() CreatePaysheetItemsDto: CreatePaysheetItemsDto,
  ): Promise<CommonResponseDto> {
    return this.paysheetItemsCategory.update(CreatePaysheetItemsDto, Number(id));
  }

  @Get('/category/:id')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  findAllPurchaseInvoice(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Object> {
    return this.paysheetItemsCategory.findCategory(id);
  }
  @Delete('/delete/:id')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  delete(@Param('id', new ParseIntPipe()) id: number): Promise<Object> {
    return this.paysheetItemsCategory.delete(id);
  }
}
