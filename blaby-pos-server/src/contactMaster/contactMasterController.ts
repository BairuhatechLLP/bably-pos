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
  Req,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ContactMasterService } from "./contactMasterService";
import { ContactMasterDto } from "./dto/contactMaster_dto";
import { UpdateSupplierDto } from "./dto/contactMaster_update_dto";
import { CreateSupplierDto } from "./dto/contactMastercreate_dto";
import { Public } from "../shared/decorators/public.decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import {
  StaffChangePasswordDto,
  StaffChangePasswordOtpDto,
  StaffChangePasswordOtpVerifyDto,
  StaffForgotPasswordDto,
} from "./dto/forgotPasswordDto";

@Controller("contactMaster")
@ApiTags("ContactMaster")
@UseInterceptors(ErrorsInterceptor)
export class ContactMasterController {
  constructor(private readonly service: ContactMasterService) {}

  @Get("/list/:type/:id/:createdBy/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "createdBy", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  findAllAirline(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("createdBy", new ParseIntPipe()) createdBy: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string,
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<CommonResponseDto> {
    return this.service.findAll(id, createdBy, companyid, type, pageOptionsDto);
  }

  @Post("/stafflist")
  @Public()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Body() dto: any
  ): Promise<any> {
    return this.service.findAllStaff(dto, pageOptionsDto);
  }

  @Get("/searchList/:type/:id/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiQuery({ name: "name", required: false })
  @ApiQuery({ name: "companyid", required: false })
  @ApiOkResponse({ type: CommonResponseDto })
  findAllAirlinee(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: string,
    @Query("name") name: string
  ): Promise<CommonResponseDto> {
    return this.service.findAlll(id, companyid, type, name);
  }

  @Get("/search/custnSup/:id/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiQuery({ name: "name", required: false })
  @ApiOkResponse({ type: CommonResponseDto })
  findAllCustomersAndSuppliers(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Query("name") name: string
  ): Promise<CommonResponseDto> {
    return this.service.findAllCustomersAndSuppliers(id, companyid, name);
  }

  @Get("/allList/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiQuery({ name: "name", required: false })
  @ApiOkResponse({ type: CommonResponseDto })
  findAllList(
    @Param("id", new ParseIntPipe()) id: number,
    @Query("name") name: string
  ): Promise<CommonResponseDto> {
    return this.service.findAllList(id, name);
  }

  @Get("/all/list/:id/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiQuery({ name: "name", required: false })
  @ApiOkResponse({ type: CommonResponseDto })
  findAllAre(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Query("name") name: string
  ): Promise<{ data: any }> {
    return this.service.findAllAre(id, companyid, name);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ContactMasterDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.service.findAllPages(pageOptionsDto);
  }
  @Get(":id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getUser(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.getOne(id);
  }

  @Get("details/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  async getSupplierDetails(
    @Req() request,
    @Param("id", new ParseIntPipe()) customerid: number
  ): Promise<CommonResponseDto> {
    return this.service.getOne(customerid);
  }
  @Get("statementListByContact/:adminid/:contactid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "customerid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async salesListByCustomer(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("contactid", new ParseIntPipe()) contactid: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any
  ): Promise<CommonResponseDto> {
    return this.service.statementListByContact(
      adminid,
      contactid,
      sdate,
      ldate
    );
  }

  @Get("/checkifVatNumberExist/:adminid/:vat")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  checkifExist(
    @Param("adminid") adminid: string,
    @Param("vat") vat: string
  ): Promise<any> {
    return this.service.checkifVatNumberExist(adminid, vat);
  }

  //create
  @Post("/add")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  create(
    @Body() createDto: CreateSupplierDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.create(createDto);
  }
  //update
  @Put("/update/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateSupplierDto
  ): Promise<CommonResponseDto> {
    return this.service.update(id, updateDto);
  }
  //delete
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: ContactMasterDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.delete(id);
  }

  @Get("getalldata/:adminid/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "adminid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getAllData(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number,
    @Param("adminid", new ParseIntPipe()) adminid: number
  ): Promise<CommonResponseDto> {
    return this.service.getAllData(id, adminid);
  }
  //get all contacts for current month
  @Get("/:adminid/:companyid/:type")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "type", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async findAllContactsDateRange(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("type") type: any
  ): Promise<CommonResponseDto> {
    return this.service.findAllContactsDateRange(adminid, type, companyid);
  }
  // soft delete
  @Get("/delete/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: ContactMasterDto })
  @ApiParam({ name: "id", required: true })
  Delete(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.service.Delete(id);
  }

  //create staff
  @Post("staff/create")
  @ApiCreatedResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  createStaff(
    @Body() createDto: CreateSupplierDto
  ): Promise<CommonResponseDto> {
    return this.service.createStaff(createDto);
  }

  //create staff
  @Post("defaultStaff/create")
  @Public()
  @ApiCreatedResponse({ type: CommonResponseDto })
  createDefaultStaff(@Body() createDto: any): Promise<CommonResponseDto> {
    return this.service.createDefaultStaff(createDto);
  }

  // update staff
  @Put("/updateStaff/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  updateStaff(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: any
  ): Promise<CommonResponseDto> {
    return this.service.updateStaff(id, updateDto);
  }

  // staff statement
  @Get("staffStatement/:adminid/:staffid/:sdate/:ldate")
  @ApiBearerAuth()
  @ApiParam({ name: "adminid", required: true })
  @ApiParam({ name: "customerid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getStaffStatement(
    @Req() request,
    @Param("adminid", new ParseIntPipe()) adminid: number,
    @Param("staffid", new ParseIntPipe()) staffid: number,
    @Param("sdate") sdate: any,
    @Param("ldate") ldate: any
  ): Promise<CommonResponseDto> {
    return this.service.getStaffStatement(adminid, staffid, sdate, ldate);
  }
  @Post("forgotPassword")
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  forgot(@Body() forgotPasswordReq: StaffForgotPasswordDto) {
    return this.service.forgotPassword(forgotPasswordReq);
  }

  @Post("changePassword")
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  Change(@Body() ChangePasswordReq: StaffChangePasswordDto) {
    return this.service.changePassword(ChangePasswordReq);
  }

  @Post("forgot-password/otp")
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  forgotOtp(@Body() dto: StaffChangePasswordOtpDto) {
    return this.service.forgotOtp(dto);
  }
  @Post("forgot-password/verify-otp")
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  forgotVerifyOtp(@Body() dto: StaffChangePasswordOtpVerifyDto) {
    return this.service.forgotVerifyOtp(dto);
  }
}
