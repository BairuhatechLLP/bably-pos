import {
  Body,
  Controller,
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

// import { PageOptionsDto } from '../shared/dto';
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateProposalDto } from "./dto/proposal_create_dto";
import { ProposalDto } from "./dto/proposal_dto";
import { UpdateProposalDto } from "./dto/update_proposal_dto";
import { Proposal } from "./proposal_model";
import { ProposalService } from "./proposal_service";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("proposal")
@ApiTags("Proposal")
@UseInterceptors(ErrorsInterceptor)
export class ProposalController {
  constructor(private readonly service: ProposalService) {}

  @Get("/list/:id/:companyid")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiParam({ name: "companyid", required: true })
  @ApiOkResponse({ type: [CommonResponseDto] })
  getAll(
    @Param("id", new ParseIntPipe()) id: number,
    @Param("companyid", new ParseIntPipe()) companyid: number
  ): Promise<CommonResponseDto> {
    return this.service.findAll(id, companyid);
  }

  @Get("/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  async getProposal(
    @Req() request,
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.service.findById(id);
  }

  @Post("/add")
  @ApiCreatedResponse({ type: Proposal })
  @ApiBearerAuth()
  create(
    @Body() createDto: CreateProposalDto,
    @Req() request
  ): Promise<CommonResponseDto> {
    return this.service.create(createDto);
  }

  @Put("/update/:id")
  @ApiBearerAuth()
  @ApiParam({ name: "id", required: true })
  @ApiOkResponse({ type: CommonResponseDto })
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() updateDto: UpdateProposalDto
  ): Promise<CommonResponseDto> {
    return this.service.update(id, updateDto);
  }

  // soft delete
  @Get("/delete/:id")
  @ApiBearerAuth()
  @ApiOkResponse({ type: ProposalDto })
  @ApiParam({ name: "id", required: true })
  Delete(@Param("id", new ParseIntPipe()) id: number): Promise<any> {
    return this.service.Delete(id);
  }
}
