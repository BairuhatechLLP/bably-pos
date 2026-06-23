
import {
    Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';
import { ExcelUpdateService } from './excel_update.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkPriceUpdateDto } from './dto/excel_export.dto';

@Controller('excel-export')
@ApiTags('excel-export')
@UseInterceptors(ErrorsInterceptor)
@ApiBearerAuth()
export class ExcelUpdateController {
  constructor(private readonly excelExportService: ExcelUpdateService) {}

  @Get('products/:companyId')
  @ApiOkResponse({ description: 'Excel file download' })
  @ApiParam({ name: 'companyId', description: 'Company ID', type: 'number' })
  @ApiQuery({ name: 'userId', description: 'User ID (optional)', required: false, type: 'number' })
  async downloadProductsExcel(
    @Param('companyId', new ParseIntPipe()) companyId: number,
    @Query('userId') userId?: number,
    @Res() res?: Response,
  ): Promise<void> {
    try {
      const excelData = await this.excelExportService.generateProductExcel(
        companyId,
        userId,
      );

      if (!excelData.buffer) {
        res.status(404).json({
          success: false,
          message: 'No data found to export',
        });
        return;
      }

      // Set headers for file download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${excelData.filename}"`,
      );
      res.setHeader('Content-Length', excelData.buffer.length);

      // Send the Excel file
      res.send(excelData.buffer);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating Excel file',
        error: error.message,
      });
    }
  }

  

   @Post('products/bulk-price-update')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel file with price updates and company details',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file containing product price updates',
        },
        companyId: {
          type: 'number',
          description: 'Company ID',
          example: 1,
        },
      },
      required: ['file', 'companyId'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpdatePrices(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BulkPriceUpdateDto,
  ): Promise<CommonResponseDto> {
    try {
      if (!file) {
        return new CommonResponseDto(
          null,
          false,
          'Excel file is required',
        );
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return new CommonResponseDto(
          null,
          false,
          'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
        );
      }

      return await this.excelExportService.bulkUpdatePrices(
        file,
        body.companyId
      );
    } catch (error) {
      console.error('Error in bulk price update:', error);
      return new CommonResponseDto(
        null,
        false,
        `Error updating prices: ${error.message}`,
      );
    }
  }
}