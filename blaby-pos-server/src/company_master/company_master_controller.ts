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
import { CreateDto } from "./dto/create_company_master_dto";
import { CompanyMasterService } from "./company_master_service";
import { CompanyMaster as PostEntity } from "./company_master_entity";
import { CompanyMasterDto } from "./dto/company_master_dto";
import { UpdateDto } from "./dto/update_company_master_dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateCompanyInterceptor } from "../shared/interceptor/createComapny.interceptor";
import { Public } from "../shared/decorators/public.decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { SubscriptionFree } from "../shared/decorators/subscriptionFree.decorator";
import { UserId } from "../shared/decorators/userId_decorator";

@Controller("company_master")
@ApiTags("Company Master")
@UseInterceptors(ErrorsInterceptor)
export class CompanyMasterController {
  constructor(private readonly service: CompanyMasterService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CompanyMasterDto] })
  findAll(): Promise<CompanyMasterDto[]> {
    return this.service.findAll();
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CompanyMasterDto })
  @ApiParam({ name: "id", required: true })
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CompanyMasterDto> {
    return this.service.findOne(id);
  }

  @Get("list/:adminid")
  @SubscriptionFree()
  @ApiBearerAuth()
  @ApiOkResponse({ type: CompanyMasterDto })
  findAllByAdminId(
    @UserId() userId: number
  ): Promise<CommonResponseDto> {
    return this.service.findAllByAdminId(userId);
  }

  @Post("add")
  @ApiCreatedResponse({ type: PostEntity })
  @ApiBearerAuth()
  create(@Body() createDto: CreateDto, @Req() request): Promise<PostEntity> {
    return this.service.create(createDto);
  }

  //this interceptor will check if the user has reached the company limit based on his subscription
  @UseInterceptors(CreateCompanyInterceptor)
  @Post("/createNew")
  @ApiCreatedResponse({ type: PostEntity })
  @ApiBearerAuth()
  createNewCompany(@Body() createDto: CreateDto): Promise<any> {
    return this.service.createNewCompany(createDto);
  }

  @Post("/createCompany")
  @Public()
  @ApiCreatedResponse({ type: PostEntity })
  createCompany(@Body() createDto: CreateDto): Promise<any> {
    return this.service.createNewCompany(createDto);
  }

  @Put(":id")
  @ApiOkResponse({ type: PostEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request,
    @Body() updateDto: UpdateDto
  ): Promise<PostEntity> {
    return this.service.update(id, updateDto);
  }

  @Delete(":id")
  @SubscriptionFree()
  @ApiOkResponse({ type: PostEntity })
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  delete(
    @Param("id", new ParseIntPipe()) id: number,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.delete(id);
  }
}
