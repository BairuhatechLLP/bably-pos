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
import { UnitService } from './unit.services';
import { unit } from './unit.entity';
import { CreateUnit } from './dto/unit.create';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { UnitDto } from './dto/unit.dto';
import { UpdateUnitDto } from './dto/unit.update';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';
@Controller('unit')
@ApiTags('unit')
@UseInterceptors(ErrorsInterceptor)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}
  @Get()
  @ApiOkResponse({ type: [unit] })
  findAll(): Promise<any> {
    return this.unitService.findAll();
  }
  @Get('byId/:id')
  @ApiOkResponse({ type: [UnitDto] })
  @ApiParam({ name: 'id' })
  findOne(@Param('id', new ParseIntPipe()) id: Number): Promise<any> {
    return this.unitService.findOne(id);
  }
  @Get('user/:adminId')
  @ApiOkResponse({ type: [unit] })
  findAllUser(@Param('adminId') adminId: any): Promise<any> {
    return this.unitService.findAllForUser(adminId);
  }

  @Get('list/:adminid/:companyid')
  @ApiOkResponse({ type: [unit] })
  findListByCompany(
    @Param('adminid') adminid: any,
    @Param('companyid') companyid: any
    ): Promise<any> {
    return this.unitService.findListByCompany(adminid,companyid);
  }

  @Post('/add')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(@Body() CreateUnitsList: CreateUnit): Promise<CommonResponseDto> {
    return this.unitService.create(CreateUnitsList);
  }

  @Put('/update/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateUnitsList: UpdateUnitDto,
  ): Promise<CommonResponseDto> {
    return this.unitService.update(updateUnitsList, id);
  }

  @Get("/delete/:id")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  softDelete(@Param("id", new ParseIntPipe()) id: number): Promise<CommonResponseDto> {
    return this.unitService.softDelete(id);
  }

  @Delete('/hardDelete/:id')
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  delete(@Param('id', new ParseIntPipe()) id: number): Promise<Object> {
    return this.unitService.delete(id);
  }
}
