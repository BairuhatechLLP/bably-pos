import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { BomMasterService } from "./bom_master.service";
import { BomMaster } from "./bom_master.entity";
import { UserId } from "../shared/decorators/userId_decorator";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateBomDto } from "./dto/createBomMaster.dto";
import { PageOptionsDto } from "../shared/dto";
import { getBomListQueryDto } from "./dto/BomMasterQuery.dto";
import { UpdateBomMasterDto } from "./dto/updateBomMaster.dto";
import { PageOptionsForTableDto } from "./dto/pageOptionsTable.dto";

@Controller("bom_master")
@ApiTags("bom_master")
@UseInterceptors(ErrorsInterceptor)
export class BomMasterController {
  constructor(private readonly bomMasterService: BomMasterService) {}

  @Post("/create")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiCreatedResponse({ type: BomMaster })
  @HttpCode(201)
  @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  create(
    @UserId() userId: number,
    @Body() create: CreateBomDto
  ): Promise<CommonResponseDto> {
    return this.bomMasterService.create(create, userId);
  }

  @Get("getAllBomByCompany")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findAllOrderCompany(
    @UserId() userId: number,
    @Query() queryData: getBomListQueryDto,
    @Query() pageOptions: PageOptionsForTableDto
  ): Promise<CommonResponseDto> {
    return this.bomMasterService.findAllBomByCompany(
      userId,
      queryData,
      pageOptions
    );
  }

  // to get Bom as Main and quantity as Batch for Production Selector
  @Get("getListForProduction")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findAllBomForProduction(
    @UserId() userId: number,
    @Query() queryData: getBomListQueryDto,
    @Query() pageOptions: PageOptionsDto
  ): Promise<CommonResponseDto> {
    return this.bomMasterService.findAllBomForProduction(
      userId,
      queryData,
      pageOptions
    );
  }
  @Get(":id")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findOne(
    @UserId() userId: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Query("companyId") companyId: number
  ): Promise<CommonResponseDto> {
    return this.bomMasterService.findOne(id, userId, companyId);
  }

  @Put("update")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: BomMaster })
  @HttpCode(201)
  update(
    @Body() update: UpdateBomMasterDto,
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.bomMasterService.update(update, userId);
  }

  @Delete(":id")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  deleteOne(
    @UserId() userId: number,
    @Param("id", new ParseIntPipe()) id: number,
    @Query("companyId") companyId: number
  ): Promise<CommonResponseDto> {
    return this.bomMasterService.deleteOne(id, userId, companyId);
  }
}
