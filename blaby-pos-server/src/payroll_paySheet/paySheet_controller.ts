import {
  Body,
  Controller,
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
import { PayrollPaySheetDTO } from './dto/paySheet.dto';
import { CreatePaySheetDto } from './dto/paySheet.create';
import { PaySheetService } from './paySheetServices';
import { UpdatePaySheetDto } from './dto/paySheet.update';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('paySheet')
@ApiTags('PayrollPaySheet')
@UseInterceptors(ErrorsInterceptor)
export class PaySheetController {
  constructor(private readonly paySheetService: PaySheetService) {}

  @Get('/user/:id')
  @ApiOkResponse({ type: [PayrollPaySheetDTO] })
  @ApiParam({ name: 'id', type: String })
  findAllByUser(@Param('id') id: any): Promise<any> {
    return this.paySheetService.findAllUser(id);
  }

  @Get(':id')
  @ApiOkResponse({ type: [PayrollPaySheetDTO] })
  @ApiParam({ name: 'id', type: String })
  getById(@Param('id') id: any): Promise<any> {
    return this.paySheetService.getById(id);
  }

  @Post('/add')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() CreateProductCategoryDto: CreatePaySheetDto,
  ): Promise<CommonResponseDto> {
    return this.paySheetService.create(CreateProductCategoryDto);
  }


  
  @Post('/sendPayment/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  sendPayment(
    @Param('id') id: any,
    @Body() req:any,
  ): Promise<CommonResponseDto> {
    return this.paySheetService.sendPayment(id,req);
  }


  @Put('/update/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() UpdatePaySheetDto:UpdatePaySheetDto ,
  ): Promise<CommonResponseDto> {
    return this.paySheetService.update(id, UpdatePaySheetDto);
  }
}
