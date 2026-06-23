import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsString } from "class-validator";
import { PageMetaDto } from "./page-meta.dto";

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @IsBoolean()
  readonly status: boolean;

  @IsString()
  readonly message: string;

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: T[],meta: PageMetaDto, status?:boolean, message?: string, ) {
    this.data = data;
    this.status = status ;
    this.message = message;
    this.meta = meta;
  }
}