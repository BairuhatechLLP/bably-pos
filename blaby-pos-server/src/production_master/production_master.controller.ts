import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
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
import { ProductionMasterService } from "./production_master.service";
import { ProductionMaster } from "./production_master.entity";
import { UserId } from "../shared/decorators/userId_decorator";
import { CreateProductionMasterDto } from "./dto/createProductionMaster.dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { getProductionListQueryDto } from "./dto/ProductionMasterQuery.dto";
import { PageOptionsDto } from "../shared/dto";
import { PageOptionsForTableDto } from "./dto/pageOptionsTable.dto";

@Controller("production_master")
@ApiTags("production_master")
@UseInterceptors(ErrorsInterceptor)
export class ProductionMasterController {
  constructor(
    private readonly productionMasterService: ProductionMasterService
  ) {}
  @Post("/create")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiCreatedResponse({ type: ProductionMaster })
  @HttpCode(201)
  @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  create(
    @UserId() userId: number,
    @Body() create: CreateProductionMasterDto
  ): Promise<CommonResponseDto> {
    return this.productionMasterService.create(create, userId);
  }

  @Get("getAllProductionByCompany")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOkResponse()
  findAllProductionCompany(
    @UserId() userId: number,
    @Query() queryData: getProductionListQueryDto,
    @Query() pageOptions: PageOptionsForTableDto
  ): Promise<CommonResponseDto> {
    return this.productionMasterService.findAllProductionCompany(
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
    return this.productionMasterService.findOne(id, userId, companyId);
  }
}
