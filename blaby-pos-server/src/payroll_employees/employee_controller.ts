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
import { CreateEmployeeDto } from './dto/employeecreate';
import { EmployeesService } from './employeeServices';
import { UpdateEmployeeCategoryDto } from './dto/employee.update';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('employees')
@ApiTags('PayrollEmployees')
@UseInterceptors(ErrorsInterceptor)
export class EmployeesController {
  constructor(private readonly employeeCategory: EmployeesService) {}

  @Get('/user/:adminid/:companyid')
  @ApiOkResponse()
  findAllByCompany(
    @Param('adminid',new ParseIntPipe()) adminid: number,
    @Param('companyid',new ParseIntPipe()) companyid: number,
    ): Promise<any> {
    return this.employeeCategory.findAllByCompany(adminid,companyid);
  }

  @Get('/byCompany/:companyid/:id')
  @ApiOkResponse()
  @ApiParam({ name: 'id', required: true })
  @ApiParam({ name: 'companyid', required: true })
  async findEmployeeById(
    @Param('companyid',new ParseIntPipe()) companyid: number,
    @Param('id',new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return await this.employeeCategory.findEmployeeById(companyid, id);
  }

  @Post('/add')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() CreateProductCategoryDto: CreateEmployeeDto,
  ): Promise<CommonResponseDto> {
    return this.employeeCategory.create(CreateProductCategoryDto);
  }
  @Put('/update/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  update(
    @Param('id') id: any,
    @Body() UpdateEmployeeCategoryDto: UpdateEmployeeCategoryDto,
  ): Promise<CommonResponseDto> {
    return this.employeeCategory.update(UpdateEmployeeCategoryDto, Number(id));
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
