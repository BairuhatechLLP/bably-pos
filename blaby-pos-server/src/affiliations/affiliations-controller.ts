import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "../shared/decorators/public.decorator";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { Affiliations } from "./affiliations-model";
import { AffiliationsService } from "./affiliations-service";
import { UpdateAffiliationsDto } from "./dto/affiliations-update-dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { CreateAffiliationsDto } from "./dto/affiliations-create-dto";

@Controller("affiliations")
@ApiTags("affiliations")
@UseInterceptors(ErrorsInterceptor)
@Public()
export class AffiliationsController {
  constructor(private readonly affiliationsService: AffiliationsService) {}

  @Post("/list")
  @ApiOkResponse({ type: [CommonResponseDto] })
  findAllPages(@Body() response: any): Promise<any> {
    return this.affiliationsService.findAllPages(response);
  }

  @Get("/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  async getSupplierDetails(
    @Req() request,
    @Param("id", new ParseIntPipe()) customerid: number
  ): Promise<CommonResponseDto> {
    return this.affiliationsService.getOne(customerid);
  }

  @Get("/getByCode/:code")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  async getOneByCode(
    @Req() request,
    @Param("code") code: string
  ): Promise<CommonResponseDto> {
    return this.affiliationsService.getOneByCode(code);
  }

  @Post("/add")
  @ApiCreatedResponse({ type: Affiliations })
  create(
    @Body() createDto: CreateAffiliationsDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.affiliationsService.create(createDto);
  }

  @Put("/update/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateAffiliationsDto
  ): Promise<CommonResponseDto> {
    return this.affiliationsService.update(id, updateDto);
  }

  @Delete("/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: CommonResponseDto })
  delete(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.affiliationsService.delete(id);
  }
}
