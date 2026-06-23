import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { ImgcompressService } from './image_compress.service';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';
import { Public } from '../shared/decorators/public.decorator';

@Controller('img_compress')
@ApiTags('img_compress')
@Public()
@UseInterceptors(ErrorsInterceptor)
export class ImgcompressController {
  constructor(private readonly imgcompressService: ImgcompressService) {}

  private isImageFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  }

  @Post('/compress')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (this.isImageFile(file.originalname)) {
      return await this.imgcompressService.imgCompressAndUpload(file.buffer);
    } else {
      // return await this.imgcompressService.uploadToS3(file);
      throw new Error(
        'Invalid image format. Please upload a valid image file.',
      );
    }
  }
  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToS3(@UploadedFile() file: Express.Multer.File) {
    return await this.imgcompressService.uploadToS3(file);
  }
}