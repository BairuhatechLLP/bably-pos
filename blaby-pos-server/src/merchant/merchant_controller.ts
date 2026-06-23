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
  HttpCode,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MerchantService } from './merchant_service';
import { MerchantDto } from './dto/merchant_dto';
import { Merchant } from './merchant_entity';
import { UpdateMerchantDto } from './dto/merchant_update';
import { CreateMerchantDto } from './dto/merchant_create';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('Merchant')
@ApiTags('Merchant')
@UseInterceptors(ErrorsInterceptor)
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  @ApiOkResponse({ type: [MerchantDto] })
  @HttpCode(200)
  findAll(): any {
    return this.merchantService.findAll();
  }
  @Get(':id') // Define the route for finding by ID, using a route parameter :id
  @ApiOkResponse({ type: MerchantDto }) // Define the response type
  async findById(@Param('id') id: number): Promise<MerchantDto> {
    const data = await this.merchantService.findById(id);
    if (!data) {
      throw new HttpException('No ID found', HttpStatus.NOT_FOUND);
    }
    return data;
  }
  @Post()
  @ApiCreatedResponse({ type: [Merchant] })
  @HttpCode(200)
  @ApiBearerAuth()
  create(@Body() createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    return this.merchantService.create(createMerchantDto);
  }
  @Put(':id')
  @ApiOkResponse({ type: Merchant })
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ): Promise<Merchant> {
    return this.merchantService.update(id, updateMerchantDto);
  }
  @Delete(':id')
  @ApiOkResponse({ type: Merchant })
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  delete(@Param('id', new ParseIntPipe()) id: number): Promise<Merchant> {
    return this.merchantService.delete(id);
  }
}
