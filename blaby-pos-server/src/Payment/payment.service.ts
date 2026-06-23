import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { MailService } from "../mail/mail_service";
import { ShareService } from "../share/share.service";
import Stripe from "stripe";
import { paymentTemplate } from "./template";
import { CompanyMasterService } from "../company_master/company_master_service";
import { StripeLog } from "../stripe_log/stripe_log.entity";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { UserService } from "../users/user.services";
import axios from "axios";
@Injectable()
export class PaymentService {
  private stripe: any = new Stripe(process.env.STRIPE_SECRET_KEY);
  constructor(
    @Inject(MailService)
    private readonly mailService: MailService,
    @Inject(forwardRef(() => ShareService))
    private readonly shareService: ShareService,
    @Inject(CompanyMasterService)
    private readonly companyMasterService: CompanyMasterService,
    @Inject(SubscriptionsService)
    private readonly SubscriptionsService: SubscriptionsService,
    @Inject(forwardRef(() => UserService))
    private readonly UserService: UserService
  ) {}

  async payStackPayment(request: any) {
    try {
      const company = await this.companyMasterService.findOne(
        request?.companyid
      );
      let url = "https://api.paystack.co/transaction/initialize";
      let response = await axios.post(
        url,
        {
          email: request?.email,
          amount: Number(request?.amount),
        },
        {
          headers: {
            Authorization: `Bearer ${company.payStackKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log();
      return {
        status: true,
        data: response?.data?.data,
        message: response.data.message,
      };
    } catch (error) {
      throw error;
    }
  }

  async stripeTest(request: any): Promise<any> {
    try {
      let payment = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      if (payment.id) {
        const paymentLog = new StripeLog();
        paymentLog.stripeId = payment.id;
        paymentLog.amount = request.amount / 100;
        paymentLog.paymentFor = "subscription";
        await paymentLog.save();
        return payment;
      } else {
        throw new Error(`Couldnt create payment`);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async getPaymentId(paymentId: string) {
    const payment = await StripeLog.findOne({
      where: { stripeId: paymentId },
    });
    if (!payment) {
      throw new HttpException("No Payment Id found", HttpStatus.NOT_FOUND);
    }
    return payment;
  }

  async confirmPayment(UpdatePaymentsDto: any): Promise<any> {
    try {
      // Retrieve payment data
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        UpdatePaymentsDto.paymentId
      );

      if (paymentIntent.status === "succeeded") {
        const subscriptionObj = {
          company: UpdatePaymentsDto.company,
          period: UpdatePaymentsDto.period,
          counter: UpdatePaymentsDto.counter,
          retailExpress: UpdatePaymentsDto.retailXpress,
          userId: UpdatePaymentsDto.adminid,
          price: paymentIntent.amount / 100,
          //soleTrader:UpdatePaymentsDto.soleTrader
        };
        const subscriptionData = await this.SubscriptionsService.upgradePlan(
          subscriptionObj
        );
      }

      // update payment table with paymentIntent
      const payment = await this.getPaymentId(UpdatePaymentsDto.paymentId);
      payment.adminid = UpdatePaymentsDto.adminid;
      payment.status = paymentIntent.status;
      payment.subscriptionPlan = UpdatePaymentsDto.period;
      // payment.paymentIntent = JSON.stringify(paymentIntent);
      await payment.save();

      const tokenData = await this.UserService.getToken(
        UpdatePaymentsDto.adminid
      );
      let obj = {
        token: tokenData.data,
        paymentStatus: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      };
      return new CommonResponseDto(obj, true, "Payment process successfull");
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  async sendInvoiceEmail(
    salesId: number,
    email: string,
    amount: number,
    currency: string
  ): Promise<any> {
    try {
      // Create line item for the invoice
      const salesDetails = await this.shareService.invoiceDetails(
        salesId,
        "sales"
      );

      const response = await this.companyMasterService.findOne(
        salesDetails.data.invoiceDetails.companyid
      );

      let stripe = new Stripe(
        response.stripeKey || process.env.STRIPE_SECRET_KEY
      );
      const lineItems = [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Invoice amount",
            },
            unit_amount: Math.floor(amount),
          },
          quantity: 1,
        },
      ];
      let updateSales = {
        amount: salesDetails.data.invoiceDetails.total,
        userid: salesDetails.data.invoiceDetails.adminid, //number
        customerid: salesDetails.data.invoiceDetails.customerid, //number
        bankid: salesDetails.data.userInfo.data.bankInfo.id,
        saleId: salesId,
        adminid: salesDetails.data.invoiceDetails.adminid, //number
      };
      function encodeParams(obj: any) {
        const params = new URLSearchParams();
        for (const key in obj) {
          params.append(key, obj[key]);
        }
        return params.toString();
      }
      // Constructing the URL with parameters
      const hostUrl =
        process.env.HOSTEDURL || "https://taxgov2-server.taxgoglobal.com";
      const baseURL = hostUrl + "/taxgov2/SaleInvoice/stripe/succes";
      const failURL = hostUrl + "/taxgov2/SaleInvoice/stripe/fail";
      const queryParams = encodeParams(updateSales);
      const successURL = `${baseURL}?${queryParams}`;
      const invoice = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        currency: currency,
        mode: "payment",
        success_url: successURL,
        cancel_url: failURL,
        line_items: lineItems,
      });
      let obj = {
        user: salesDetails.data?.userInfo.data,
        customer: salesDetails.data?.invoiceDetails?.customer,
        sale: salesDetails.data?.invoiceDetails,
        productlist: salesDetails.data?.invoiceItems,
        bankList: salesDetails.data?.banking,
        vatTotal: Number(salesDetails.data?.invoiceDetails.total_vat),
        netTotal: Number(salesDetails.data?.invoiceDetails.taxable_value),
        total: salesDetails.data?.invoiceDetails?.total,
        isPaymentInfo: false,
        pagetype: "Invoice",
        payHref: invoice?.url || "",
      };
      const template = paymentTemplate(obj);
      const emailParams = {
        email: email,
        html: template,
      };
      await this.mailService.sentPaymentEmail(emailParams);
      return {
        message: "Email sent successfully!",
        id: invoice.id,
        url: invoice.url,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
  async sendPaymentLink(
    amount: number,
    companyid: number,
    currency: string
  ): Promise<any> {
    try {
      const response = await this.companyMasterService.findOne(companyid);
      if (!response) {
        return { status: false, message: "No company found" };
      }
      if (!response.stripeKey) {
        return {
          status: false,
          message: "Stripe key is not provided for this company",
        };
      }
      let stripe = new Stripe(
        response.stripeKey || process.env.STRIPE_SECRET_KEY
      );
      const lineItems = [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Invoice amount",
            },
            unit_amount: Math.floor(amount),
          },
          quantity: 1,
        },
      ];
      let updateSales = {
        amount,
        companyid: companyid,
      };
      function encodeParams(obj: any) {
        const params = new URLSearchParams();
        for (const key in obj) {
          params.append(key, obj[key]);
        }
        return params.toString();
      }
      // Constructing the URL with parameters
      const hostUrl =
        process.env.HOSTEDURL || "https://taxgov2-server.taxgoglobal.com";
      const successUrl = hostUrl + "/taxgov2/payment/success";
      const failURL = hostUrl + "/taxgov2/payment/fail";
      const invoice = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        currency: currency,
        mode: "payment",
        success_url: successUrl,
        cancel_url: failURL,
        line_items: lineItems,
      });
      return {
        status: true,
        message: "Link sent successfully!",
        id: invoice.id,
        url: invoice.url,
        invoice,
      };
    } catch (error) {
      console.error("Error =====>:", error);
      throw error;
    }
  }

  async paymentSuccess() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;600&display=swap" rel="stylesheet">
    <title>Payment Success</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      
      .container {
        text-align: center;
      }
      
      .tick {
        width: 20vw; 
        height: 20vw;
        max-width: 80px; 
        max-height: 80px;
        border: 2px solid #4CAF50;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        animation: tick 0.6s;
        background-color:#4CAF50;
      }
      
      .tick::before {
        content: '';
        position: absolute;
        top: 25%;
        left: 38%;
        width: 18%;
        height: 38%;
        border-right: 5px solid #ffffff;
        border-bottom: 5px solid #ffffff;
        transform: rotate(45deg);
      }
      
      .message {
        font-size: 3vw;
        margin-top: 20px;
        font-weight:600;
        color: #333;
         font-family: 'Roboto', sans-serif; 
      }
      
      @keyframes tick {
        0% {
          transform: scale(0);
        }
        50% {
          transform: scale(1.2);
        }
        100% {
          transform: scale(1);
        }
      }
    
      @media only screen and (max-width: 600px) {
        .tick {
          width: 40vw;
          height: 40vw;
        }
        
        .message {
          font-size: 6vw; 
        }
      }
    </style>
    </head>
    <body>
    <div class="container">
      <div class="tick"></div>
      <p class="message">Payment Successfull!</p>
    </div>
    </body>
    </html>          
  `;
  }

  async paymentFail() {
    return ` <!DOCTYPE html>
   <html lang="en">
   <head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;600&display=swap" rel="stylesheet">
   <title>Payment Failed</title>
   <style>
     body {
       font-family: Arial, sans-serif;
       background-color: #f4f4f4;
       display: flex;
       justify-content: center;
       align-items: center;
       height: 100vh;
       margin: 0;
     }
     
     .container {
       text-align: center;
     }
 .tick {
 width: 20vw; 
 height: 20vw;
 max-width: 80px; 
 max-height: 80px;
 border: 2px solid #FF5733;
 border-radius:  50%;
 display: inline-block;
 position: relative;
 animation: cross 0.6s; 
 background-color: #FF5733;
 
}

.tick::before,
.tick::after {
 content: '';
 position: absolute;
 top: 45%;
 left: 11%;
 width: 80%;
 height: 8px; 
 background-color: #ffffff; 
 

}

.tick::before {
 transform: rotate(45deg);
}

.tick::after {
 transform: rotate(-45deg);
}
     
     .message {
       font-size: 3vw;
       margin-top: 20px;
       font-weight:600;
       color: #333;
        font-family: 'Roboto', sans-serif; 
     }
   
   
     @media only screen and (max-width: 600px) {
       .message {
         font-size: 6vw; 
       }
     }
   </style>
   </head>
   <body>
   <div class="container">
     <div class="tick"></div>
     <p class="message">Payment Failed!</p>
   </div>
   </body>
   </html>      
 `;
  }
  async paySubscription(request: any): Promise<any> {
    try {
      let payment = await this.stripe.paymentIntents.create({
        amount: request?.amount,
        currency: request?.currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      if (payment.id) {
        return { status: true, message: "payment success", data: payment };
      } else {
        return { status: false, message: "payment failed", data: [] };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
  async initializePaystackPayment(request: any): Promise<any> {
    try {
      const hostUrl =
        process.env.HOSTEDURL || "https://taxgov2-server.taxgoglobal.com";
      let successUrl = request?.callback_url;
      let failUrl = request?.callback_url;
  
      const paystackKey:any = process.env.PAYSTACK_PUBLICK_KEY;
      if (!paystackKey) {
        throw new Error("Paystack public key not found");
      }
      const url = "https://api.paystack.co/transaction/initialize";
      const response = await axios.post(
        url,
        {
          email: request?.email,
          amount: Number(request?.amount) * 100, 
          currency: request?.currency || "NGN",
          callback_url: successUrl, 
          metadata: {
            cancel_url: failUrl, 
          },
        },
        {
          headers: {
            Authorization: `Bearer ${paystackKey}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Paystack Response:", response.data);
  

      return {
        status: true,
        data: response?.data?.data,
        message: response.data.message || "Payment initialized successfully",
      };
    } catch (error) {
      console.error("Error initializing Paystack payment:", error);
      throw new HttpException(
        error.response?.data?.message || "Error initializing payment",
        HttpStatus.BAD_REQUEST
      );
    }
  }
  







}
