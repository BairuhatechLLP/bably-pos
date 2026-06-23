import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly skip: number;

  @ApiProperty()
  readonly total_pages: number;

  @ApiProperty()
  readonly next_page: number;

  @ApiProperty()
  readonly statusCode: number;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty()
  readonly message: string;

  @ApiProperty()
  readonly data: any;

  constructor(pageOptionsDto: any, data: any, status: any, message: any) {
    this.total = pageOptionsDto.total;
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.skip = pageOptionsDto.skip;
    this.total_pages = pageOptionsDto.total_pages;
    this.next_page = pageOptionsDto.next_page;
    this.statusCode = status ? 200 : 400;
    this.status = status;
    this.message = message;
    this.data = status ? data : null;
  }
}
