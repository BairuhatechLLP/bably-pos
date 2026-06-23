import { Type } from "class-transformer";

export class CommonResponseDto {

  data: any;

  @Type(() => Boolean)
  status: boolean;

  @Type(() => String)
  message: string;

  constructor(data: any, status: boolean, message: string) {
    this.data = data;
    this.status = status;
    this.message = message;
  }
}