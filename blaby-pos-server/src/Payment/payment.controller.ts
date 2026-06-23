import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "../shared/decorators/public.decorator";
import { ErrorsInterceptor } from "../shared/interceptor/error.interceptor";
@Controller("payment")
@ApiTags("payment")
@Public()
@UseInterceptors(ErrorsInterceptor)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("stripe")
  @HttpCode(200)
  @ApiBearerAuth()
  create(@Body() request: any): Promise<any> {
    return this.paymentService.stripeTest(request);
  }
  
  @Post("retrievePayment")
  @HttpCode(200)
  confirm(@Body() request: any) {
    return this.paymentService.confirmPayment(request);
  }

  @Post("send-invoice-email")
  async sendInvoiceEmail(
    @Body()
    data: {
      saleId: number;
      email: string;
      amount: number;
      currency: string;
    }
  ): Promise<any> {
    return await this.paymentService.sendInvoiceEmail(
      data.saleId,
      data.email,
      data.amount,
      data.currency
    );
  }
  @Post("send-payment-link")
  async sendPaymentLink(
    @Body()
    data: {
      amount: number;
      currency: string;
      companyid: number;
    }
  ): Promise<any> {
    return await this.paymentService.sendPaymentLink(
      data.amount,
      data.companyid,
      data.currency
    );
  }

  @Post("subscription")
  @HttpCode(200)
  @ApiBearerAuth()
  paySubscription(@Body() request: any): Promise<any> {
    return this.paymentService.paySubscription(request);
  }

  @Get("success")
  paymentSuccess(): Promise<any> {
    return this.paymentService.paymentSuccess();
  }

  @Get("fail")
  paymentFail(): Promise<any> {
    return this.paymentService.paymentFail();
  }
  @Post("paystack")
  @HttpCode(200)
  @Public()
  createPaystack(@Body() request: any): Promise<any> {
    return this.paymentService.payStackPayment(request);
  }

  @Post("paystack-initialize")
  @HttpCode(200)
  @Public()
  async initializePaystackPayment(@Body() request: any): Promise<any> {
    return await this.paymentService.initializePaystackPayment(request);
  }





}
