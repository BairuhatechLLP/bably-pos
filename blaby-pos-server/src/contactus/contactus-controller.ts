import {
  Controller,
  Req,
  Body,
  Post,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { ContactusDto } from './dto/contactus.dto';
import { PageOptionsDto } from '../shared/dto';
import { ContactusService } from './contactus-service';
import { Contactus } from './contactus-model';
import { Public } from '../shared/decorators/public.decorator';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('contactus')
@Public()
@ApiTags('contactus')
@UseInterceptors(ErrorsInterceptor)
export class ContactusController {
  constructor(private readonly contactusService: ContactusService) {}

  @Get()
  @ApiOkResponse({ type: [ContactusDto] })
  findAllPages(@Query() pageOptionsDto: PageOptionsDto) {
    return this.contactusService.findAllPages(pageOptionsDto);
  }

  @Post('/add')
  @ApiCreatedResponse({ type: Contactus })
  create(@Body() createDto: any, @Req() request): Promise<CommonResponseDto> {
    return this.contactusService.create(createDto);
  }
}
