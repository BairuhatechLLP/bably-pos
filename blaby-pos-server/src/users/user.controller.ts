import { UserLoginRequestDto } from "./dto/user-login-request.dto";
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Delete,
  Query,
  Req,
  Put,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.services";
import { UserDto } from "./dto/user.dto";
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { UserLoginResponseDto } from "./dto/user-login-response.dto";
import { PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { FileInterceptor } from "@nestjs/platform-express/multer";
import { Public } from "../shared/decorators/public.decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { UserId } from "../shared/decorators/userId_decorator";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";

@Controller("user")
@ApiTags("User")
@SubscriptionFree()
@UseInterceptors(ErrorsInterceptor)
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post("register")
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserLoginResponseDto })
  register(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserLoginResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Post("login")
  @HttpCode(200)
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  login(
    @Body() userLoginRequestDto: UserLoginRequestDto
  ): Promise<CommonResponseDto> {
    console.log("userLoginRequestDto");
    return this.usersService.login(userLoginRequestDto);
  }

  @Post("verifyEmailAddress")
  @HttpCode(200)
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  verifyEmailAddress(
    @Body() verifyEmailReqDto: any
  ): Promise<CommonResponseDto> {
    return this.usersService.verifyEmailAddress(verifyEmailReqDto?.verifyData);
  }

  
  @Post("updateEmailAddress")
  @Public()
  @HttpCode(200)
  @ApiOkResponse({ type: CommonResponseDto })
  updateEmail(
    @Body() emailReqDto: any
  ): Promise<CommonResponseDto> {
    return this.usersService.updateEmail(emailReqDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [UserDto] })
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.usersService.findAll(pageOptionsDto, {});
  }
  @Post("all")
  @Public()
  @ApiOkResponse()
  findlistAll(@Query() pageOptionsDto: PageOptionsDto, @Body() dto: any) {
    return this.usersService.findAll(pageOptionsDto, dto);
  }

  @Get("/viewProfile")
  @ApiBearerAuth()
  @ApiBody({ type: CommonResponseDto })
  async getUserProfile(
    @UserId() userId:any
  ): Promise<CommonResponseDto> {
    return this.usersService.getUser(userId);
  }

  @Put("/updateProfile/:id/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Body() updateUserDto: any
  ): Promise<CommonResponseDto> {
    return this.usersService.update(id, companyid, updateUserDto);
  }

  @Put("/updateUserInfo")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  updateUser(
    @UserId() userId:number,
    @Body() updateUserDto: any
  ): Promise<CommonResponseDto> {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Get("/checkEmail/:email/")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  @Public()
  async checkEmail(@Param("email") email: string) {
    return this.usersService.checkEmailExist({ email });
  }

  @Get("/checkPhone/:phone/")
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  @Public()
  async checkPhone(@Param("phone") phonenumber: string) {
    return this.usersService.checkPhoneExist({ phonenumber });
  }
  @Get("/updateInvoiceTemplate/:id/:companyid/:templateid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiParam({ name: "templateid", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  updateInvoiceTemplate(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number,
    @Param("templateid") templateid: string
  ): Promise<CommonResponseDto> {
    return this.usersService.updateInvoice(id, companyid, templateid);
  }

  @Put("updateProfilePicture/:id")
  @HttpCode(200)
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  updateProfilePicture(@Param("id") id: string, @Body() imageUrl) {
    return this.usersService.updateProfilePicture(id, imageUrl);
  }

  @Post("updateLogoPicture/:companyid")
  @HttpCode(200)
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiParam({ name: "companyid", required: true })
  @UseInterceptors(FileInterceptor("file"))
  updateLogoPicture(
    @UploadedFile() file,
    @Body() body,
    @Param("companyid") companyid
  ) {
    let userid = "" + body.userid.toString();
    return this.usersService.updateLogoPicture(userid, companyid, file);
  }

  @Delete("me")
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  delete(@Req() request): Promise<UserDto> {
    return this.usersService.delete(request.user.id);
  }

  @Get("/resetPassword/:email")
  @ApiBody({ type: CommonResponseDto })
  @ApiParam({ name: "email", required: true })
  @Public()
  async resetPassword(
    @Param("email") email: string
  ): Promise<CommonResponseDto> {
    return this.usersService.resetPassword(email);
  }

  @Post("forgotPassword")
  @Public()
  @HttpCode(200)
  @ApiOkResponse({ type: CommonResponseDto })
  forgotPassword(@Body() forgotPassReq: any): Promise<CommonResponseDto> {
    return this.usersService.forgotPassword(forgotPassReq);
  }

  @Post("updatePassword")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  updatePassword(@Body() updatePasswordReq: any): Promise<CommonResponseDto> {
    return this.usersService.updatePassword(updatePasswordReq);
  }

  @Get("/clear-data/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  ClearUserData(@Param("id",new ParseIntPipe()) id: number,
  @UserId() userId:number,
): Promise<any> {
    return this.usersService.ClearUserData(id,userId);
  }

  @Get("/user-data/:id")
  @Public()
  @ApiParam({ name: "id", required: true })
  DeleteUser(@Param("id") id: number): Promise<any> {
    return this.usersService.deleteUser(id);
  }

  @Get('/refreshToken/:id')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  async getToken(
    @Param("id") userId: number,
  ) {
    return this.usersService.getToken(userId);
  }

  @Get("/usage-report/:id")
  @Public()
  @ApiParam({ name: "id", required: true })
  userUsageReport(
    @Query() query: any,
    @Param("id") id: number): Promise<any> {
    return this.usersService.userUsageReport(id,query);
  }
}

