import {
  Controller,
  HttpCode,
  UseInterceptors,
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { PlanService } from "./plan.service";
import { CreatePlanDto } from "./dto/plan.create.dto";
import { UpdatePlanDto } from "./dto/plan.update.dto";
import { PageOptionsDto } from "../shared/dto/Page-Options-Dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";

@Controller("plan")
@ApiTags("plan")
@UseInterceptors(ErrorsInterceptor)
export class PlanController {
  constructor(private readonly PlanService: PlanService) {}
  @Get("pgn")
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(200)
  findWithPagination(
    @Query() pageOptions: PageOptionsDto
  ): Promise<CommonResponseDto> {
    return this.PlanService.findWithPagination(pageOptions);
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true })
  @HttpCode(200)
  findOne(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.PlanService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @HttpCode(201)
  create(@Body() create: CreatePlanDto): Promise<CommonResponseDto> {
    return this.PlanService.create(create);
  }

  @Put(":id")
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  @HttpCode(200)
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() update: UpdatePlanDto
  ): Promise<CommonResponseDto> {
    return this.PlanService.update(id, update);
  }

  @Delete(":id")
  @ApiParam({ name: "id", required: true })
  @ApiBearerAuth()
  @HttpCode(200)
  delete(
    @Param("id", new ParseIntPipe()) id: number
  ): Promise<CommonResponseDto> {
    return this.PlanService.delete(id);
  }
}
