import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ShareService } from './share.service';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@Controller('share')
@ApiTags('share')
@UseInterceptors(ErrorsInterceptor)
export class ShareController {

  constructor(private readonly shareService: ShareService) { }

  @Get('/invoice/:type/:id')
  @ApiOkResponse({ type: [CommonResponseDto] })
  @ApiParam({ name: 'type', required: true })
  @ApiParam({ name: 'id', required: true })
  findOneByType(
    @Param('type') type: string,
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.shareService.invoiceDetails(id, type);
  }

}
