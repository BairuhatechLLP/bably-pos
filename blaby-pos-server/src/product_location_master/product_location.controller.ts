import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Query,
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
import { PageDto, PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { ProductLocationMasterService } from "./product_location.service";
import { ProductLocationMasterDto } from "./dto/product_location.dto";
import { CreateProductLocationDto } from "./dto/create_product_location.dto";
import { UpdateProductLocationDto } from "./dto/update_product_master.dto";
import { ProductLocationMaster } from "./product_location.entity";

@Controller("ProductLocationMaster")
@ApiTags("ProductLocationMaster")
@UseInterceptors(ErrorsInterceptor)
export class ProductLocationMasterController {
  constructor(
    private readonly productLocationService: ProductLocationMasterService
  ) {}

  @Get()
  @ApiOkResponse({ type: [ProductLocationMasterDto] })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<ProductLocationMasterDto>> {
    return this.productLocationService.findAll(pageOptionsDto);
  }

  @Get("/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.productLocationService.findOne(id);
  }

  @Get("/getProductsByLocation/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findProductsByLocation(
    @Param("id", new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.productLocationService.findProductsByLocation(id);
  }

  @Get("/getOneProductByLocation/:productId/:locationId")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "productId", required: true })
  @ApiParam({ name: "locationId", required: true })
  getProductByLocation(
    @Param("productId", new ParseIntPipe()) productId: number,
    @Param("locationId", new ParseIntPipe()) locationId: number,
  ): Promise<CommonResponseDto> {
    return this.productLocationService.getProductByLocation(productId,locationId);
  }

  @Post("/add")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() createProductMasterDto: CreateProductLocationDto
  ): Promise<CommonResponseDto> {
    return this.productLocationService.create(createProductMasterDto);
  }

  @Put("/update/:id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateProductMasterDto: UpdateProductLocationDto
  ): Promise<CommonResponseDto> {
    return this.productLocationService.update(id, updateProductMasterDto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: ProductLocationMaster })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<ProductLocationMaster> {
    return this.productLocationService.delete(id);
  }
}
