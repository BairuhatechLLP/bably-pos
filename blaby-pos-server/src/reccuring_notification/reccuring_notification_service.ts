import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ReccuringNotification } from './reccuring_notfication_entity';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { SalesInvoiceService } from '../sale_invoice/sale_invoice_service';
import { UserSettingsService } from '../user_settings/user_settings_service';
import { LedgerCategoryGroup } from '../ledger_category_group/ledger_category_group_model';
import { LedgerCategory } from '../ledger_category/ledger_category_model';
import moment from 'moment';
import { SaleInvoice } from '../sale_invoice/sale_invoice';
import { Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail_service';
import { UserService } from '../users/user.services';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ReccuringNotificationService {
  constructor(
    @Inject('ReccuringNotificationRepository')
    private readonly NotificationRepository: typeof ReccuringNotification,
    @Inject(forwardRef(() => SalesInvoiceService))
    private readonly saleInvoiceService: SalesInvoiceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserSettingsService))
    private readonly userSettings: UserSettingsService,
    @Inject(MailService)
    private readonly mailService: MailService,
    private readonly httpService: HttpService
  ) {}



  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT,{timeZone:'Asia/Kolkata'})
  private async CheckForInvoices() {
    try {
      const currentDate = moment()
      const todaysDate = moment().startOf('day');
      const endDate = moment().endOf('day');
      const data =
        await this.NotificationRepository.findAll<ReccuringNotification>({
          where:{
            nextdate: {
              [Op.between]: [todaysDate.toDate(), endDate.toDate()],
          }
          }
        });
  
        for (const notification of data) {
          const dateAfterOneDay = moment(currentDate).add(1, 'day');
        const dateAfterOneWeek = moment(currentDate).add(1, 'week');
        const dateAfterOneMonth = moment(currentDate).add(1, 'month');
        const dateAfterOneYear = moment(currentDate).add(1,'year');
        let nextdate
        
        if(notification.period ==='daily'){
            nextdate = dateAfterOneDay
  
        }else if(notification.period==='weekly'){
          nextdate = dateAfterOneWeek
        }
        else if(notification.period === 'monthly'){
          nextdate = dateAfterOneMonth
        }
        else if(notification.period === 'yearly'){
          nextdate = dateAfterOneYear
        }
          
         const noti =  await this.NotificationRepository.findByPk(notification.id)
         noti.nextdate = nextdate
         noti.save()
      }
      
      const uniqueInvoiceIds = Array.from(
        new Set(data.map((notification) => notification.invoice_id)),
      );
  
      for (const invoiceId of uniqueInvoiceIds) {
        const salesData = await this.saleInvoiceService.findByCustomer(invoiceId,'sales')
        const date = moment()
        const formattedDate = date.format('YYYY-MM-DD')
        const invoicenumber = await this.userSettings.getInvoiceNo(salesData?.data?.invoiceDetails?.adminid,salesData?.data?.invoiceDetails?.companyid,salesData?.data?.invoiceDetails?.seriesNo,"sales")
        const users = await this.userService.getUser(salesData?.data?.invoiceDetails?.userid)
        
        let newInvoiceNo = invoicenumber.data;
        const columns = []
        for(let i=0;i<salesData?.data?.invoiceItems.length;i++){
          const product = salesData?.data?.invoiceItems[i]
          let column = {
            id:product?.product?.id,
            discount:product?.discount,
            discountamt:product?.discount_amount,
            productId:product?.product?.id,
            product:product?.product,
            idescription:product?.product?.idescription,
            description:product?.description,
            vat:product?.vat,
            includevat:product?.includevat,
            incomeTax:product?.incomeTax,
            percentage:product?.percentage,
            costprice:product?.costprice,
            ledgerDetails:{
              category:product?.ledgerDetails?.category,
              id:product?.ledgerDetails?.id,
              laccount:product?.ledgerDetails?.laccount,
              nominalcode:product?.ledgerDetails?.nominalcode
            },
            ledger:{
              category:product?.ledgerDetails?.category,
              id:product?.ledgerDetails?.id,
              laccount:product?.ledgerDetails?.laccount,
              nominalcode:product?.ledgerDetails?.nominalcode
            },
            quantity:product?.quantity,
            total:product?.total,
            vatamt:product?.vat,
            vatamount:product?.vatamt,
            incomeTaxAmount:product?.incomeTaxAmount,
            itemorder:product?.itemorder
          }
          columns.push(column)
        }
  
        let ledgerDetails = salesData?.data?.invoiceItems[0].ledgerDetails
        let invoiceItem = salesData?.data?.invoiceItems[0]
  
        const ledger = {
          id:ledgerDetails?.id,
          nominalcode:ledgerDetails?.nominalcode,
          laccount:ledgerDetails?.laccount,
          category:ledgerDetails?.category,
          categorygroup:ledgerDetails?.categorygroup,
          acctype:ledgerDetails?.acctype,
          userid:ledgerDetails?.userid,
          accnum:ledgerDetails?.accnum,
          cardnum:ledgerDetails?.cardnum,
          paidmethod:ledgerDetails?.paidmethod,
          sortcode1:ledgerDetails?.sortcode1,
          sortcode2:ledgerDetails?.sortcode2,
          sortcode3:ledgerDetails?.sortcode3,
          ibannum:ledgerDetails?.ibannum,
          bicnum:ledgerDetails?.bicnum,
          opening:ledgerDetails?.opening,
          total:ledgerDetails?.total,
          userdate:ledgerDetails?.userdate,
          type:ledgerDetails?.type,
          adminid:ledgerDetails?.adminid,
          visiblestatus:ledgerDetails?.visiblestatus,
          visbank:ledgerDetails?.visbank,
          vissinvoice:ledgerDetails?.vissinvoice,
          vispinvoice:ledgerDetails?.vispinvoice,
          visotherreceipt:ledgerDetails?.visotherreceipt,
          vispayroll:ledgerDetails?.visotherpayment,
          visotherpayment:ledgerDetails?.visotherpayment,
          visjournal:ledgerDetails?.visjournal,
          visreport:ledgerDetails?.visreport,
          showVatRate:ledgerDetails?.showVatRate,
          payheadType:ledgerDetails?.payheadType,
          journals:ledgerDetails?.journals,
          Purchase:ledgerDetails?.purchase,
          Sales:ledgerDetails?.sales,
          calculationPeriod:ledgerDetails?.calculationPeriod,
          created_at:ledgerDetails?.createdAt,
          updated_at:ledgerDetails?.updatedAt,
           createdBy:ledgerDetails?.createdBy,
          companyid:ledgerDetails?.companyid,
          categoryDetails:{
            id:ledgerDetails?.category,
            category:ledgerDetails?.sales,
            adminid:ledgerDetails?.userid,
            categorygroup:ledgerDetails?.categorygroup,
            createdat:ledgerDetails?.createdAt,
            updatedat:ledgerDetails?.updatedAt,
          },
          groupDetails:{
            id:ledgerDetails?.categorygroup,
            categorygroup:"income",
            createdAt:ledgerDetails?.createdAt,
            updatedAt:ledgerDetails?.updatedAt
          }
        }
        let paymentInfo
        if(invoiceItem?.bankid){
           paymentInfo={
            id:invoiceItem?.bankid,
            bankid:invoiceItem?.bankid,
            outstanding:salesData?.data?.invoiceDetails?.outstanding,
            amount:invoiceItem?.amount,
            date:salesData?.data?.invoiceDetails?.sdate,
            type:invoiceItem?.product?.ptype,
            paidmethod:ledgerDetails?.paidmethod,
            running_total:invoiceItem?.amount
          }
        }
        else{
          paymentInfo = false
        }
        let payload = {
          cname:salesData?.data?.invoiceDetails?.cname,
          customerid:salesData?.data?.invoiceDetails?.customerid,
          columns:columns,
          invoiceno:newInvoiceNo,
          sdate:formattedDate,
          ldate:salesData?.data?.invoiceDetails?.ldate,
          inaddress:salesData?.data?.invoiceDetails?.inaddress,
          deladdress:salesData?.data?.invoiceDetails?.deladdress,
          terms:salesData?.data?.invoiceDetails?.terms,
          quotes:salesData?.data?.invoiceDetails?.quotes,
          status:salesData?.data?.invoiceDetails?.status,
          issued: "yes",
          type: salesData?.data?.invoiceDetails?.type,
          pagetype: "1",
          total:Number(salesData?.data?.invoiceDetails?.total),
          userid:salesData?.data?.invoiceDetails?.adminid,
          adminid:salesData?.data?.invoiceDetails?.adminid,
          userdate:salesData?.data?.invoiceDetails?.userdate,
          reference:salesData?.data?.invoiceDetails?.reference,
          paymentdate:salesData?.data?.invoiceDetails?.paymentdate,
          paymentInfo:paymentInfo,
          salesType: "",
          ledger:ledger,
          email:users.data.email,
          roundOff:salesData?.data?.invoiceDetails?.roundOff,
          total_vat:salesData?.data?.invoiceDetails?.total_vat,
          overall_discount: salesData?.data?.invoiceDetails?.overall_discount,
          taxable_value: salesData?.data?.invoiceDetails?.taxable_value,
        };
        const newInvoice = payload
        const newInvoices = await this.saleInvoiceService.created(newInvoice);
        const customerData = await this.saleInvoiceService.findByCustomer(salesData?.data?.invoiceDetails?.id,'sales')
        const emailData = customerData.data.invoiceDetails.dataValues
        const userId = emailData.userid
        const customersData = customerData.data.invoiceDetails.dataValues.customer.dataValues
        const user = await this.userService.getUser(salesData?.data?.invoiceDetails?.userid)
        const userData = user.data
        const companyData = user.data.companyInfo.dataValues
        const invoiceItems = customerData.data.invoiceItems
        const countryInfo = user.data.countryInfo.dataValues
        const email = customersData?.email
        const emailContent = await this.mailService.reccuringMail(emailData,customersData,userData,companyData,invoiceItems,countryInfo,newInvoiceNo,formattedDate);
        await this.sendMailPdf(emailContent,email,newInvoiceNo)
      } 
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async sendMailPdf(templates: any,email:string,newInvoiceNo:string) {
  
    try {
      let templateContent = templates.replace('\r\n', '');
      templateContent = templateContent.replace('\\"', '"');
      const encodedString = btoa(templateContent);
      const pdf_url = `https://pdf.taxgoglobal.com/getPdf`;
      const emailTemplate = {
        to: [email],
        cc: [],
        subject: `Sales Invoice ${newInvoiceNo}`,
        content: '', 
        attachementName: `SalesInvoice ${moment()}.pdf`,
        bcc: []
    };
      const pdfData = {
        email: emailTemplate,
        filename: "Sales Invoice.pdf",
        html: encodedString,
        isDownload: false,
        sendEmail: true,
        type: "",
        userid: "",
      };
      
      const response = await this.httpService.post(pdf_url, pdfData, {
          headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
          },
      }).toPromise();
  } catch (error) {
      console.error("Error sending mail:", error);
      throw error; 
  }
  }

 

  async list(adminid: any) {
      try {
        const data =
          await this.NotificationRepository.findAll<ReccuringNotification>({
            where: { userid: adminid },
            order: [['created_at', 'DESC']],
            raw: true,
          });
          if(!data){
            return new CommonResponseDto(null,false,'reccuring invoice is not found')
          }
        return new CommonResponseDto(data, true, 'reccuring list fetched successfully');
      } catch (error) {
        console.error( error);
        throw error; 
      }
  }

  async listByCompany(companyid: number) {
      try {
        const data =
          await this.NotificationRepository.findAll<ReccuringNotification>({
            where: { companyid: companyid },
            order: [['created_at', 'DESC']],
            raw: true,
          });
          if(!data){
            return new CommonResponseDto(null,false,'reccuring invoice is not found')
          }
        return new CommonResponseDto(data, true, 'reccuring list fetched successfully');

      } catch (error) {
        console.error( error);
        throw error; 
      }
  }

  async get(id:number){
      try {
        const data = await this.NotificationRepository.findOne<ReccuringNotification>({
          where:{invoice_id:id},
          include: [{ model: SaleInvoice }],
        })
        if(!data){
          return new CommonResponseDto(null,false,'reccuring invoice is not found')
        }
        return new CommonResponseDto(data, true, 'Reccuring invoice fetched successfully');
      } catch (error) {
        console.error( error);
        throw error; 
      }
  }

  async update(id:number,updateReccuringNotification:any){
    try {
      const notification = await this.NotificationRepository.findByPk(id);
      if(!notification){
        return new CommonResponseDto(null,false,'reccuring invoice is not found')
      }
      notification.userid = updateReccuringNotification?.userid || notification?.userid;
      notification.invoice_id = updateReccuringNotification?.invoice_id || notification?.invoice_id;
      notification.invoice_number = updateReccuringNotification?.invoice_number || notification?.invoice_number;
      notification.period = updateReccuringNotification?.period || notification?.period;
      notification.date = updateReccuringNotification?.date || notification?.date;
      notification.nextdate = updateReccuringNotification?.nextdate || notification?.nextdate;
      notification.companyid = updateReccuringNotification?.companyid || notification?.companyid;

      let notify:any = await notification.save();

      return new CommonResponseDto(notify,true,'Reccuring invoice updated succesfully')
    } catch (error) {
      console.error( error);
      throw error; 
    }
  }

  async delete(id:number){
    try {
      const notification = await this.NotificationRepository.findByPk(id);
      if(!notification){
        return new CommonResponseDto(null,false,'reccuring invoice is not found')
      }
      await notification.destroy();
      return new CommonResponseDto(notification,true,'reccuring invoice deleted successfully')
    } catch (error) {
      console.error(error);
      throw error; 
    }
  }

  async create(createDto: any, invoiceData: any, transaction?: any) {
      try {
        let notification = new ReccuringNotification();
        notification.userid = invoiceData?.userid;
        notification.invoice_id = invoiceData?.id;
        notification.invoice_number = createDto?.invoiceNo;
        notification.period = createDto?.period;
        notification.date = createDto?.date;
        notification.nextdate = createDto?.nextdate;
        notification.companyid = invoiceData?.companyid;
        notification.status = true;
        let notify: any = await notification.save();
        return new CommonResponseDto(notify,true,'Reccuring invoice created successfully')
      } catch (error) {
        console.error(error);
        throw error; 
      }
  }

  async createReccuringInvoice(id: number) {
      try {
        const invoiceRow: any = await this.saleInvoiceService.findByCustomer(
          id,
          'sales',
        );
        const invoiceDetails: any = invoiceRow?.data?.invoiceDetails;
        const invoiceItems: any = invoiceRow?.data?.invoiceItems;
        const ledgerDetails: any = invoiceRow?.data?.invoiceItems?.length
          ? invoiceRow?.data?.invoiceItems[0]?.ledgerDetails
          : [];
        const startDate = moment(invoiceDetails?.ldate);
        const daysDiff = moment(startDate).diff(invoiceDetails?.sdate, 'days');
        const endDate = moment(startDate, 'day')?.add(daysDiff, 'days');

        const categoryGroup: any = await LedgerCategoryGroup.findOne(
          ledgerDetails?.categorygroup,
        );

        const categoryMaster: any = await LedgerCategory.findOne(
          ledgerDetails?.category,
        );

        const invoiceNum: any = await this.userSettings.getInvoiceNo(
          invoiceDetails?.adminid,
          invoiceDetails?.companyid,
          invoiceDetails?.seriesNo,
          'sales',
        );

        let columns: any = await invoiceItems?.map((details: any) => {
          return {
            id: details?.id,
            discount: details?.discount,
            discountamt: details?.discount_amount,
            productId: details?.product?.id,

            product: {
              id: details?.product?.id,
              itemtype: details?.product?.itemtype,
              icode: details?.product?.icode,
              idescription: details?.product?.idescription,
              spname: details?.product?.spname,
              ledgercategory: details?.product?.ledgercategory,
              svrate: details?.product?.svrate,
              sicode: details?.product?.sicode,
              pdescription: details?.product?.pdescription,
              pvrate: details?.product?.pvrate,
              paccount: details?.product?.paccount,
              location: details?.product?.location,
              barcode: details?.product?.barcode,
              weight: details?.product?.weight,
              notes: details?.product?.notes,
              userid: details?.product?.userid,
              name: details?.product?.name,
              ptype: details?.product?.ptype,
              reason: details?.product?.reason,
              userdate: details?.product?.userdate,
              pimage: details?.product?.pimage,
              qdate: details?.product?.qdate,
              date: details?.product?.date,
              expiredate: details?.product?.expiredate,
              trade_price: details?.product?.trade_price,
              wholesale: details?.product?.wholesale,
              rate: details?.product?.rate,
              quantity: details?.product?.quantity,
              stockquantity: details?.product?.stockquantity,
              qtype: details?.product?.qtype,
              vatamt: details?.product?.vatamt,
              includevat: details?.product?.includevat,
              price: details?.product?.price,
              costprice: details?.product?.costprice,
              rlevel: details?.product?.rlevel,
              rquantity: details?.product?.rquantity,
              sp_price: details?.product?.sp_price,
              stock: details?.product?.stock,
              cquantity: details?.product?.cquantity,
              c_price: details?.product?.c_price,
              saccount: details?.product?.saccount,
              increase: details?.product?.increase,
              decrease: details?.product?.decrease,
              netquantity: details?.product?.netquantity,
              adminid: details?.product?.adminid,
              vat: details?.product?.vat,
              supplier: null,
              product_category: details?.product?.product_category,
              unit: details?.product?.unit,
              is_deleted: details?.product?.is_deleted,
              createdAt: details?.product?.createdAt,
              updatedAt: details?.product?.updatedAt,
              stockvalue: details?.product?.stockvalue,
            },

            idescription: details?.product?.idescription,
            description: details?.product?.description,
            vat: details?.product?.vat,
            includevat: details?.includevat,
            incomeTax: details?.includevat,
            percentage: details?.percentage,
            costprice: details?.costprice,

            ledgerDetails: {
              category: details?.ledgerDetails?.category,
              id: details?.ledgerDetails?.id,
              laccount: details?.ledgerDetails?.laccount,
              nominalcode: details?.ledgerDetails?.nominalcode,
            },

            ledger: {
              category: details?.ledgerDetails?.category,
              id: details?.ledgerDetails?.id,
              laccount: details?.ledgerDetails?.laccount,
              nominalcode: details?.ledgerDetails?.nominalcode,
            },

            quantity: details?.quantity,
            total: details?.total,
            vatamt: details?.vat,
            vatamount: details?.vatamt,
            incomeTaxAmount: details?.incomeTaxAmount,
            itemorder: details?.itemorder,
          };
        });

        let payload = {
          cname: invoiceDetails?.cname,
          customerid: invoiceDetails?.customerid,

          columns: columns,

          invoiceno: invoiceNum?.data,
          sdate: startDate,
          ldate: endDate,
          inaddress: invoiceDetails?.inaddress,
          deladdress: invoiceDetails?.deladdress,
          terms: invoiceDetails?.terms,
          quotes: invoiceDetails?.quotes,
          status: invoiceDetails?.status,
          issued: invoiceDetails?.issued,
          type: invoiceDetails?.type,
          pagetype: '1',
          total: invoiceDetails?.total,
          userid: invoiceDetails?.userid,
          adminid: invoiceDetails?.adminid,
          userdate: invoiceDetails?.userdate,
          paymentInfo: false,
          reference: invoiceDetails?.reference,
          salesType: invoiceDetails?.salesType,

          ledger: {
            id: ledgerDetails?.id,
            nominalcode: ledgerDetails?.nominalcode,
            laccount: ledgerDetails?.laccount,
            category: ledgerDetails?.category,
            categorygroup: ledgerDetails?.categorygroup,
            acctype: ledgerDetails?.acctype,
            userid: ledgerDetails?.userid,
            accnum: ledgerDetails?.accnum,
            cardnum: ledgerDetails?.cardnum,
            paidmethod: ledgerDetails?.paidmethod,
            sortcode1: ledgerDetails?.sortcode1,
            sortcode2: ledgerDetails?.sortcode2,
            sortcode3: ledgerDetails?.sortcode3,
            ibannum: ledgerDetails?.ibannum,
            bicnum: ledgerDetails?.bicnum,
            opening: ledgerDetails?.opening,
            total: ledgerDetails?.total,
            userdate: ledgerDetails?.userdate,
            type: ledgerDetails?.type,
            adminid: ledgerDetails?.adminid,
            visiblestatus: ledgerDetails?.visiblestatus,
            visbank: ledgerDetails?.visbank,
            vissinvoice: ledgerDetails?.vissinvoice,
            vispinvoice: ledgerDetails?.vispinvoice,
            visotherreceipt: ledgerDetails?.visotherreceipt,
            vispayroll: null,
            visotherpayment: ledgerDetails?.visotherpayment,
            visjournal: ledgerDetails?.visjournal,
            visreport: ledgerDetails?.visreport,
            showVatRate: ledgerDetails?.showVatRate,
            payheadType: ledgerDetails?.payheadType,
            journals: ledgerDetails?.journals,
            Purchase: ledgerDetails?.purchase,
            Sales: ledgerDetails?.sales,
            created_at: ledgerDetails?.createdAt,
            updated_at: ledgerDetails?.updatedAt,

            categoryDetails: {
              id: ledgerDetails?.category,
              category: categoryMaster?.category,
              adminid: ledgerDetails?.adminid,
              categorygroup: ledgerDetails?.categorygroup,
              createdat: ledgerDetails?.createdAt,
              updatedat: ledgerDetails?.updatedAt,
            },
            groupDetails: {
              id: ledgerDetails?.categorygroup,
              categorygroup: categoryGroup?.categorygroup,
              createdat: ledgerDetails?.createdAt,
              updatedat: ledgerDetails?.updatedAt,
            },
          },
          email: '',
          reccObj: {},
          roundOff: invoiceDetails?.roundOff,
          total_vat: invoiceDetails?.total_vat,
          overall_discount: invoiceDetails?.overall_discount,
          taxable_value: invoiceDetails?.taxable_value,
          companyid:invoiceDetails?.companyid
        };

        const createInvoice: any = await this.saleInvoiceService.create(
          payload,
        );
        let response: any;
        if (createInvoice?.status) {
          response = new CommonResponseDto(
            createInvoice,
            true,
            'Reccuring Invoice Created Successfully',
          );
        } else {
          response = new CommonResponseDto(
            [],
            false,
            'Something went wrong..!',
          );
        }
        return response;
      } catch (error) {
        console.error(error);
        throw error; 
      }
  }

}
