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
import { EmployeeCategoryDto } from './dto/employeeCategory.dto';
import { CreateEmployeeCategoryDto } from './dto/employeeCategorycreate';
import { EmployeeCategoryService } from './employeeCategoryServices';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('employeeCategory')
@ApiTags('PayrollEmployeeCategory')
@UseInterceptors(ErrorsInterceptor)
export class EmployeeCategoryController {
  constructor(private readonly employeeCategory: EmployeeCategoryService) {}
  @Get()
  @ApiOkResponse({ type: [EmployeeCategoryDto] })
  findAll(): Promise<any> {
    return this.employeeCategory.findAll();
  }
  @Get('byId/:id')
  @ApiOkResponse({ type: [EmployeeCategoryDto] })
  @ApiParam({ name: 'id' })
  findOne(@Param('id', new ParseIntPipe()) id: Number): Promise<any> {
    return this.employeeCategory.findOne(id);
  }
  @Get('/user/:id')
  @ApiOkResponse({ type: [EmployeeCategoryDto] })
  findAllByUser(@Param('id') id: any): Promise<any> {
    return this.employeeCategory.findAllUser(id);
  }

  @Get('/list/:adminid/:companyid')
  @ApiOkResponse({ type: [EmployeeCategoryDto] })
  findListByCompany(
    @Param('adminid', new ParseIntPipe()) adminid:number,
    @Param('companyid', new ParseIntPipe()) companyid: number
    ): Promise<any> {
    return this.employeeCategory.findListByCompany(adminid,companyid);
  }


  @Post('/add')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() CreateProductCategoryDto: CreateEmployeeCategoryDto,
  ): Promise<CommonResponseDto> {
    return this.employeeCategory.create(CreateProductCategoryDto);
  }
  @Put('/update/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() CreateProductCategoryDto: any,
  ): Promise<CommonResponseDto> {
    return this.employeeCategory.update(CreateProductCategoryDto, id);
  }

  @Get('/category/:id')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  findAllPurchaseInvoice(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Object> {
    return this.employeeCategory.findCategory(id);
  }
  @Delete('/delete/:id')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  delete(@Param('id', new ParseIntPipe()) id: number): Promise<Object> {
    return this.employeeCategory.delete(id);
  }
}
