export class CommonResponseDto {
  constructor(
    public data: any,
    public success: boolean,
    public message: string,
  ) {}
}
