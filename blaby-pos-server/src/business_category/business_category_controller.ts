import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { CreateBusinessCategoryDto } from "./dto/create_business_category.dto";
import { BusinessCategoryService } from "./business_category_service";
import { BusinessCategory as BusinessCategoryEntity } from "./business_category_entity";
import { BusinessCategoryDto } from "./dto/business_category_dto";
import { UpdateBusinessCategoryDto } from "./dto/update_business_category";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";

@Controller("business_category")
@ApiTags("Business Category")
@UseInterceptors(ErrorsInterceptor)
@SubscriptionFree()
export class BusinessCategoryController {
  constructor(
    private readonly businessCategoryService: BusinessCategoryService
  ) {}

  @Get()
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(): Promise<CommonResponseDto> {
    return this.businessCategoryService.findAll();
  }

  @Get(":adminid")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "adminid", required: true })
  findByAdminid(
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.businessCategoryService.findByAdminid(adminid);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: BusinessCategoryDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<BusinessCategoryDto> {
    return this.businessCategoryService.findOneCategory(id);
  }

  @Post("/add")
  @ApiCreatedResponse({ type: BusinessCategoryEntity })
  @ApiBearerAuth()
  create(
    @Body() CreateBusinessCategoryDto: CreateBusinessCategoryDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.businessCategoryService.create(CreateBusinessCategoryDto);
  }

  @Put(":id")
  @ApiOkResponse({ type: BusinessCategoryEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request,
    @Body() UpdateBusinessCategoryDto: UpdateBusinessCategoryDto
  ): Promise<CommonResponseDto> {
    return this.businessCategoryService.update(id, UpdateBusinessCategoryDto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: BusinessCategoryEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request
  ): Promise<BusinessCategoryEntity> {
    return this.businessCategoryService.delete(id);
  }
}
