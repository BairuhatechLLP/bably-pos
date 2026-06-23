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
  UseInterceptors
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
  
  import { UserId } from "../shared/decorators/userId_decorator";
import { PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { CreateKitchenDisplayDto, GetKitchenDisplayQueryDto, UpdateKitchenDisplayDto } from "./dto/display.dto";
import { KitchenDisplay } from "./kitchen_display.entity";
import { KitchenDisplayService } from "./kitchen_display.service";
  
  @Controller("kitchen-display")
  @ApiTags("Kitchen Display")
  @UseInterceptors(ErrorsInterceptor)
  export class KitchenDisplayController {
    constructor(private readonly kitchenDisplayService: KitchenDisplayService) {}
  
    @Post()
    @ApiCreatedResponse({ type: KitchenDisplay })
    @HttpCode(201)
    @ApiBearerAuth()
    create(
      @UserId() userId: number,
      @Body() create: CreateKitchenDisplayDto
    ): Promise<CommonResponseDto> {
      return this.kitchenDisplayService.create(create, userId);
    }
  
    @Get()
    @ApiBearerAuth()
    @ApiOkResponse()
    findAllByCompany(
      @UserId() userId: number,
      @Query() queryData: GetKitchenDisplayQueryDto,
      @Query() pageOptions: PageOptionsDto
    ): Promise<CommonResponseDto> {
      return this.kitchenDisplayService.findAllByCompany(
        userId,
        queryData,
        pageOptions
      );
    }
  
    @Get(":id")
    @ApiBearerAuth()
    @ApiOkResponse()
    findOne(
      @UserId() userId: number,
      @Param("id", new ParseIntPipe()) id: number,
      @Query("companyId") companyId: number
    ): Promise<CommonResponseDto> {
      return this.kitchenDisplayService.findOne(id, userId, companyId);
    }
  
    @Put()
    @ApiBearerAuth()
    @ApiCreatedResponse({ type: KitchenDisplay })
    @HttpCode(201)
    update(
      @Body() update: UpdateKitchenDisplayDto,
      @UserId() userId: number
    ): Promise<CommonResponseDto> {
      return this.kitchenDisplayService.update(update, userId);
    }
  
    @Delete(":id")
    @ApiBearerAuth()
    @ApiOkResponse()
    deleteOne(
      @UserId() userId: number,
      @Param("id", new ParseIntPipe()) id: number,
      @Query("companyId") companyId: number
    ): Promise<CommonResponseDto> {
      return this.kitchenDisplayService.deleteOne(id, userId, companyId);
    }
  }