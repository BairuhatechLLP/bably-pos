import {
  Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
import { DiningTableService } from "./dining_table.service";
import { UserId } from "../shared/decorators/userId_decorator";
import { CreateDiningTableDto } from "./dto/create.dto";
  @Controller("dining-tables")
  @ApiTags("Dining Table")
  @UseInterceptors(ErrorsInterceptor)
  export class DiningTableController {
    constructor(private readonly service: DiningTableService) {}

    @Get("/lists/:companyid")
    @ApiBearerAuth()
    @ApiParam({ name: "companyid", required: true })
    findListByCompanyId(
      @Param("companyid", new ParseIntPipe()) companyid: number
    ): Promise<any> {
      return this.service.findListByCompanyId(companyid);
    }

    @Post("/create")
    @UsePipes(new ValidationPipe({ transform: true }))
    @HttpCode(201)
    @ApiBearerAuth()
    create(
      @UserId() userId: number,
      @Body() createDto: CreateDiningTableDto
    ) {
      return this.service.create(createDto, userId);
    }
  
  }  