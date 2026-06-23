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
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateProductMasterDto } from "./dto/product_master_create";
import { ProductMasterService } from "./product_master_service";
import { ProductMaster as ProductMasterEntity } from "./product_master";
import { ProductMasterDto } from "./dto/product_master_dto";
import { PageDto, PageOptionsDto } from "../shared/dto";
import {
  UpdateProductMasterDto,
  UpdateStockDto,
} from "./dto/product_master_update";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
@Controller("ProductMaster")
@ApiTags("ProductMaster")
@UseInterceptors(ErrorsInterceptor)
export class ProductMasterController {
  constructor(private readonly productService: ProductMasterService) {}
  @Get("/list")
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ProductMasterDto] })
  findAllProductMaster(): Promise<ProductMasterDto[]> {
    return this.productService.findAllList();
  }
  @Get()
  @ApiOkResponse({ type: [ProductMasterDto] })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<ProductMasterDto>> {
    return this.productService.findAll(pageOptionsDto);
  }

  @Get("/getProductById/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.productService.findOne(id);
  }

  @Get("/getProductHsnCode/:companyid/:hsnCode")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "hsnCode", required: true })
  findByHsnCode(
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("hsnCode") hsnCode: string
  ): Promise<CommonResponseDto> {
    return this.productService.findByHsnCode(companyid, hsnCode);
  }

  @Get("/user/:id/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  findByAdminId(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.productService.findAllByAdminId(id, companyid);
  }

  @Get("/lists/:companyid/:type")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "type", required: true })
  findByCompanyId(
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string
  ): Promise<CommonResponseDto> {
    return this.productService.findByCompanyId(companyid, type);
  }

  //new api=========
  @Get("/user/s/type/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  findByAdminIdtype(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.productService.findAllStockAndnonstock(id);
  }
  @Get("/user/type/:id/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  findAllStockAndnonstockvalue(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.productService.findAllStockAndnonstockvalue(id, companyid);
  }

  @Get("/user/:type/:id/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "type", required: true })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  findByAdminIdAndType(
    @Param("type") type: string,
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.productService.findAllByAdminIdAndType(type, id, companyid);
  }

  @Get("/user/list/:type/:id/:companyid")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto, ...[ProductMasterDto] })
  @ApiParam({ name: "type", required: true })
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  findByAdminIdAndTypeList(
    @Param("type") type: string,
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Query() pageOptionsDto: PageOptionsDto
  ) {
    return this.productService.findAllByAdminIdAndTypeList(
      type,
      id,
      companyid,
      pageOptionsDto
    );
  }
  @Get("/user/list/:type/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto, ...[ProductMasterDto] })
  @ApiParam({ name: "type", required: true })
  @ApiParam({ name: "id", required: true })
  findByProductList(
    @Param("type") type: string,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.productService.findByProductList(type, id);
  }
  @Post("/add")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() createProductMasterDto: CreateProductMasterDto
  ): Promise<CommonResponseDto> {
    return this.productService.create(createProductMasterDto);
  }

  @Post("/addFromExcel")
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth()
  async createFromExcel(
    @UploadedFile() file,
    @Body("reqObj") reqObj: any,
    @UserId() userId: number,
  ): Promise<any> {
    if (!file) {
      throw new Error("No file uploaded");
    }
    return this.productService.createFromExcel(file, reqObj,userId);
  }

  @Put("/update/:id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateProductMasterDto: UpdateProductMasterDto
  ): Promise<CommonResponseDto> {
    return this.productService.update(id, updateProductMasterDto);
  }

  @Put("/adjustStockLevel/:id")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  updateStock(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateStockDto: UpdateStockDto
  ): Promise<CommonResponseDto> {
    return this.productService.updateStock(id, updateStockDto);
  }

  @Delete(":id")
  @ApiOkResponse({ type: ProductMasterEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<ProductMasterEntity> {
    return this.productService.delete(id);
  }

  @Get("/delete/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "id", required: true })
  Delete(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.productService.Delete(id);
  }

  @Get("/checkifExist/:adminid/:companyid/:type/:item")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  checkifExist(
    @Param("type") type: string,
    @Param("item") item: string,
    @Param("adminid") adminid: string,
    @Param("companyid") companyid: number
  ): Promise<any> {
    return this.productService.checkifItemExist(adminid, companyid, type, item);
  }

  @Get("/saccount/:adminid/:saccount")
  @ApiOkResponse({ type: CommonResponseDto })
  checkSaccountList(
    @Param("adminid") adminid: number,
    @Param("saccount") saccount: number
  ): Promise<any> {
    return this.productService.checkSaccountList(adminid, saccount);
  }

  @Post("updateProductImage")
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOkResponse({ type: CommonResponseDto })
  @UseInterceptors(FileInterceptor("file"))
  updateProductImage(@UploadedFile() file, @Body() body) {
    let productid = "" + body.productid.toString();
    return this.productService.updateProductImage(productid, file);
  }

  @Post("/ProductListWithOrder")
  @ApiBearerAuth()
  findAllByKitchenOrder(
    @Body() body: any,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<any> {
    return this.productService.findAllByKitchenOrder(body, pageOptionsDto);
  }
}
