import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CategoryType, CreateProductCategoryDto } from "./dto/product_category_create";
import { ProductCategoryDto } from "./dto/product_category_dto";
import { UpdateProductCategoryDto } from "./dto/product_category_update";
import { ProductCategoryService } from "./product_category_services";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("ProductCategory")
@ApiTags("productCategory")
@UseInterceptors(ErrorsInterceptor)
export class ProductCategoryController {
  constructor(private readonly productCategory: ProductCategoryService) {}
  @Get()
  @ApiOkResponse({ type: [ProductCategoryDto] })
  findAll(): Promise<any> {
    return this.productCategory.findAll();
  }

  @Get("byId/:id")
  @ApiOkResponse({ type: [ProductCategoryDto] })
  @ApiParam({ name: "id" })
  findOne(@Param("id", new ParseIntPipe()) id: Number): Promise<any> {
    return this.productCategory.findOne(id);
  }
  
  @Get("category/:companyid/:categoryType")
  @ApiOkResponse({ type: [ProductCategoryDto] })
  @ApiParam({ name: "id" })
  findByCategoryType(
    @Param("categoryType") categoryType: CategoryType,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<any> {
    return this.productCategory.findByCategoryType(companyid, categoryType);
  }

  @Get("byName/:companyid/:category")
  @ApiOkResponse({ type: [ProductCategoryDto] })
  @ApiParam({ name: "category" })
  findByCategoryName(
    @Param("category") category: string,
    @Param("companyid") companyid: any,
    @Query("isExact") isExact: string,
  ): Promise<any> {
    return this.productCategory.findByCategoryName(companyid, category,isExact);
  }

  @Get("/user/:id/:companyid")
  @ApiOkResponse({ type: [ProductCategoryDto] })
  findAllByUser(
    @Param("id") id: any,
    @Param("companyid") companyid: any
  ): Promise<any> {
    return this.productCategory.findAllUser(id, companyid);
  }

  @Post("/add")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() CreateProductCategoryDto: CreateProductCategoryDto
  ): Promise<CommonResponseDto> {
    return this.productCategory.create(CreateProductCategoryDto);
  }
  @Put("/update/:id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateLocationDto: UpdateProductCategoryDto
  ): Promise<CommonResponseDto> {
    return this.productCategory.update(updateLocationDto, id);
  }

  @Get("/category/:id")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  findAllPurchaseInvoice(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<Object> {
    return this.productCategory.findCategory(id);
  }

  @Get("/:companyId/values")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "companyId", required: true })
  findIdShorts(
    @Param("companyId", new ParseIntPipe()) companyId: number
  ): Promise<Object> {
    return this.productCategory.findIdShorts(companyId);
  }

  @Get("/delete/:id")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  softDelete(@Param("id", new ParseIntPipe()) id: number): Promise<CommonResponseDto> {
    return this.productCategory.softDelete(id);
  }

  @Delete("/hardDelete/:id")
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  delete(@Param("id", new ParseIntPipe()) id: number): Promise<Object> {
    return this.productCategory.delete(id);
  }


}
