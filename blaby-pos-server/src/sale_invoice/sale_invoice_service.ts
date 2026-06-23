import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import S3 from "aws-sdk/clients/s3";
import { Op } from "sequelize";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { AccountMasterService } from "../account_master/account_master_service";
import { BankService } from "../bank/bank_service";
import { DatabaseService } from "../database/database.service";
import { InvoiceItemsService } from "../invoice_item/invoice_item_service";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { MailService } from "../mail/mail_service";
import { ProductMasterService } from "../product_master/product_master_service";
import { ReccuringNotificationService } from "../reccuring_notification/reccuring_notification_service";
import { ConfigService } from "../shared/config/config.service";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { User } from "../users/user.entity";
import { SalesInvoiceDto } from "./dto/sale_invoice_dto";
import { UpdateSalesInvoiceDto } from "./dto/sale_invoice_update";
import { SaleInvoice } from "./sale_invoice";
import { SalesInvoiceHelperService } from "./sale_invoice_helper_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import { PaymentService } from "../Payment/payment.service";
import { StripeLogService } from "../stripe_log/stripe_log.service";
import { RetailCustomerService } from "../retailCustomers/retail_customer_service";
import { CompanyMaster } from "../company_master/company_master_entity";
import { OtherMasterService } from "../other_master/other_master.service";
import { ProductLocationMasterService } from "../product_location_master/product_location.service";
import { LocationMaster } from "../locations/location.entity";
const moment = require("moment");
import { unit } from "../units/unit.entity";
import { OrderMasterService } from "../order_master/order_master.service";
import { Transaction } from "sequelize";
import { OrderItems } from "../order_items/order_items.entity";
import { OrderMaster } from "../order_master/order_master.entity";
import { ProductMaster } from "../product_master/product_master";
import { StaffTransactions } from "../staff_transactions/staff_transactions_entity";
import { CloseShiftDto } from "./dto/sales_invoice_create_new.dto";

@Injectable()
export class SalesInvoiceService {
  @Inject(forwardRef(() => LedgerDetailsService))
  private readonly ledger_details: LedgerDetailsService;

  @Inject(ProductMasterService)
  private readonly product_service: ProductMasterService;

  @Inject(forwardRef(() => AccountMasterService))
  private readonly account_master: AccountMasterService;
  @Inject(forwardRef(() => PaymentService))
  private readonly stripePayment: PaymentService;

  @Inject(MailService)
  private readonly mailService: MailService;

  @Inject(StripeLogService)
  private readonly stripeLogService: StripeLogService;

  @Inject(UserSettingsService)
  private readonly userSettings: UserSettingsService;

  @Inject(InvoiceItemsService)
  private readonly invoiceItemsService: InvoiceItemsService;

  @Inject(SalesInvoiceHelperService)
  private readonly invoiceItemsHelperService: SalesInvoiceHelperService;

  @Inject(ReccuringNotificationService)
  private readonly reccNotService: ReccuringNotificationService;

  @Inject(BankService)
  private readonly BankService: BankService;

  @Inject(RetailCustomerService)
  private readonly retailCustomerService: RetailCustomerService;

  @Inject(forwardRef(() => ContactMasterService))
  private readonly ContactMasterService: ContactMasterService;

  @Inject(forwardRef(() => StaffTransactionsService))
  private readonly StaffTransactionsService: StaffTransactionsService;

  @Inject(OtherMasterService)
  private readonly otherMasterService: OtherMasterService;

  @Inject(ProductLocationMasterService)
  private readonly productLocationMasterService: ProductLocationMasterService;

  @Inject(OrderMasterService)
  private readonly orderMasterService: OrderMasterService;

  constructor(
    @Inject("SalesInvoiceRepository")
    private readonly SalesInvoiceRepository: typeof SaleInvoice,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService
  ) {}
  async findAllList(id, companyid, type) {
    try {
      const results = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
        include: [
          {
            model: ContactMaster,
            as: "customer",
          },
          {
            model: LocationMaster,
            as: "locationDetails",
          },
        ],
        where: { adminid: id, type: type, companyid },
        order: [
          ["sdate", "DESC"],
          ["id", "DESC"],
        ],
      });

      return {
        status: true,
        message:
          type === "proforma" ? "Proforma Invoice List" : "Sale Invoice List",
        data: results,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllListByUser(
    id: number,
    staffId: number,
    companyid: number,
    type: any,
    pageOptionsDto: PageOptionsDto
  ) {
    try {
      let whereCase = {
        adminid: id,
        type,
        companyid,
      };
      if (staffId != id) {
        whereCase["createdBy"] = staffId;
      }
      let page = Number(pageOptionsDto?.page) || 1;
      let take = Number(pageOptionsDto?.take) || 10;
      const skip = (page - 1) * take;
      const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
        where: whereCase,
        include: [{ model: LocationMaster, as: "locationDetails" }],
        limit: take,
        offset: skip,
        order: [["id", pageOptionsDto?.order]],
      });
      return new CommonResponseDto(data, true, "Sales invoice details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByDate(id: any, sdate: string, ldate: string) {
    try {
      const startDate = moment(sdate).startOf("day").toISOString();
      const endDate = moment(ldate).endOf("day").toISOString();
      const results = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
        include: [
          {
            model: ContactMaster,
            as: "customer",
          },
          {
            model: LocationMaster,
            as: "locationDetails",
          },
        ],
        where: {
          adminid: id,
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        order: [["id", "DESC"]],
      });
      return new CommonResponseDto(results, true, "Successfully Listed");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllListRetail(id, type) {
    try {
      const results = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
        attributes: [
          "id",
          "cname",
          "userid",
          "customerid",
          "issued",
          "invoiceno",
          "type",
          "reference",
          "total",
          "status",
          "adminid",
          "taxable_value",
          "overall_discount",
          "total_vat",
          "createdAt",
          "updatedAt",
          "roundOff",
          "salesType",
        ],
        include: [
          {
            model: ContactMaster,
            as: "customer",
          },
        ],
        where: { adminid: id, type: type },
        order: [["id", "DESC"]],
      });

      let res = results.map((tmp) => new SalesInvoiceDto(tmp));
      return {
        status: true,
        message:
          type === "proforma" ? "Proforma Invoice List" : "Sale Invoice List",
        data: res,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sum(field: any, query: any) {
    try {
      const data = await this.SalesInvoiceRepository.sum(field, query);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllListBySupplier(
    companyid: number,
    customerid: number,
    locationId: number,
    type: string
  ) {
    try {
      const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
        where: {
          companyid: companyid,
          customerid: customerid,
          type,
          seriesNo: locationId,
        },
        order: [["id", "DESC"]],
      });
      return new CommonResponseDto(
        data.map((tmp) => new SalesInvoiceDto(tmp)),
        true,
        "Invoices fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp =
        await this.SalesInvoiceRepository.findAndCountAll<SaleInvoice>({
          include: [
            {
              model: User,
              attributes: ["id", "name", "email", "mobile"],
            },
          ],
          where: {},
          limit: pageOptionsDto.take,
          offset: skip,
          order: [["userid", pageOptionsDto.order]],
        });

      const entities = exp.rows.map((ctry) => new SalesInvoiceDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const inv = await this.SalesInvoiceRepository.findByPk<SaleInvoice>(
        id,
        {}
      );
      if (!inv) {
        throw new HttpException("No awb invomer found", HttpStatus.NOT_FOUND);
      }
      return new SalesInvoiceDto(inv);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByAllSales(id: number) {
    try {
      let response: CommonResponseDto = {
        status: false,
        message: null,
        data: null,
      };

      const invoiceDetails =
        await this.SalesInvoiceRepository.findByPk<SaleInvoice>(id, {
          include: [
            {
              model: ContactMaster,
              as: "customer",
            },
          ],
        });

      if (!invoiceDetails) {
        throw new HttpException("No invoic eDetails", HttpStatus.NOT_FOUND);
      }
      const columns: any = await this.invoiceItemsService.findAllByQuery({
        where: {
          adminid: invoiceDetails.adminid,
          saleid: id,
        },
        order: [["id", "DESC"]],
        raw: true,
      });
      let invoiceItem: any = [];
      if (columns && columns.length > 0) {
        for (let i = 0; i < columns.length; i++) {
          let element = columns[i];
          let itemDetail: any = { ...element };
          const productInfo = await this.product_service.findOneByQuery(
            Number(element.idescription),
            {}
          );
          itemDetail.product = productInfo;
          const ledgerInfo = await this.account_master.findQuery(
            Number(element.ledger),
            {
              where: {
                userid: {
                  [Op.or]: ["-2"],
                },
                adminid: invoiceDetails.adminid,
              },
            }
          );
          itemDetail.ledgerDetails = ledgerInfo;
          invoiceItem.push(itemDetail);
          if (invoiceItem.length === columns.length) {
            response = {
              status: true,
              message: "Invoice Details",
              data: {
                invoiceDetails: invoiceDetails,
                invoiceItems: invoiceItem,
              },
            };
          }
        }
      } else {
        response = {
          status: true,
          message: "Invoice Details Not Found",
          data: {
            invoiceDetails,
            invoiceItems: [],
          },
        };
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByCustomer(id: number, type: string) {
    try {
      let response: CommonResponseDto = {
        status: false,
        message: null,
        data: null,
      };
      const invoiceDetails =
        await this.SalesInvoiceRepository.findByPk<SaleInvoice>(id, {
          include: [
            {
              model: ContactMaster,
              as: "customer",
            },
            {
              model: LocationMaster,
              as: "locationDetails",
            },
          ],
        });
      if (!invoiceDetails) {
        throw new HttpException("No invoice Details", HttpStatus.NOT_FOUND);
      }
      const invoiceTotal = invoiceDetails.total;
      let banking: any = [];
      let bankList: any = [];
      if (type == "sales" || type == "qsales") {
        bankList = await this.ledger_details.findAllByQuery({
          where: {
            adminid: invoiceDetails.adminid,
            saleid: id,
            type: {
              [Op.or]: [
                "Customer Payment",
                "Customer Receipt",
                "Customer Reciept",
              ],
            },
            ledgercategory: 1,
            [Op.or]: [
              {
                discount_status: null,
              },
              {
                discount_status: {
                  [Op.ne]: 1,
                },
              },
            ],
          },
          order: [["id", "DESC"]],
        });
        let invoiceOutstanding = invoiceTotal;
        for (var i = 0; i < bankList.length; i++) {
          let element = bankList[i];
          let type = "Record Payment";
          if (element.type === "Customer Payment") {
            if (element.booleantype == "3") {
              type = "Record Payment";
            } else {
              type = "Live Payment";
            }

            const bankInfo = await this.account_master.findById(element.ledger);

            let resList = {
              bankInf: bankInfo,
              paidmethod: element.paidmethod,
              amount: element.total,
              date: element.sdate,
              type: type,
              total: invoiceTotal,
              outstanding: Number(invoiceOutstanding) - Number(element.total),
              invoicePayment:
                invoiceOutstanding === 0 ? "Full Paid" : "Part Paid",
            };
            invoiceOutstanding =
              Number(invoiceOutstanding) - Number(element.total);
            banking.push(resList);
          } else {
            const bankInfo = await this.account_master.findById(element.ledger);
            let resList = {
              bankInf: bankInfo,
              paidmethod: element.paidmethod,
              amount: element.total,
              date: element.sdate,
              type: type,
            };
            banking.push(resList);
          }
        }
      } else {
        bankList = await this.ledger_details.findAllByQuery({
          where: {
            adminid: invoiceDetails.adminid,
            saleid: id,
            type: {
              [Op.or]: ["Customer Refund", "Customer Receipt"],
            },
            discount_status: {
              [Op.ne]: "1",
            },
          },
          order: [["id", "DESC"]],
        });
        if (bankList) {
          for (var i = 0; i < bankList.length; i++) {
            let element = bankList[i];
            let amount = 0;
            if (element.type == "Customer Refund") {
              amount = element.total;
            } else {
              amount = element.usedamount;
            }
            const bankInfo = await this.account_master.findById(element.bankid);

            let resList = {
              bankInf: bankInfo,
              paidmethod: element.paidmethod,
              amount,
              date: element.sdate,
              type: type,
            };
            banking.push(resList);
          }
        }
      }

      const columns: any = await this.invoiceItemsService.findAllByQuery({
        where: {
          adminid: invoiceDetails.adminid,
          saleid: id,
        },
        order: [["id", "DESC"]],
        raw: true,
      });

      let invoiceItem: any = [];
      if (columns && columns.length > 0) {
        for (let i = 0; i < columns.length; i++) {
          let element = columns[i];
          let itemDetail: any = { ...element };
          const productInfo = await this.product_service.findOneByQuery(
            Number(element.idescription),
            {
              include: [
                {
                  model: unit,
                  as: "unitDetails",
                },
              ],
            }
          );
          itemDetail.product = productInfo;
          const ledgerInfo = await this.account_master.findQuery(
            Number(element.ledger),
            {
              where: {
                userid: {
                  [Op.or]: ["-2"],
                },
                adminid: invoiceDetails.adminid,
              },
            }
          );
          itemDetail.ledgerDetails = ledgerInfo;
          invoiceItem.push(itemDetail);
          if (invoiceItem.length === columns.length) {
            response = {
              status: true,
              message: "Invoice Details",
              data: {
                invoiceDetails: invoiceDetails,
                invoiceItems: invoiceItem,
                banking: banking,
              },
            };
          }
        }
      } else {
        response = {
          status: true,
          message: "Invoice Details Not Found",
          data: {
            invoiceDetails,
            invoiceItems: [],
          },
        };
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findByCustomerRetail(id: number, type: string) {
    try {
      let response: CommonResponseDto = {
        status: false,
        message: null,
        data: null,
      };
      const invoiceDetails =
        await this.SalesInvoiceRepository.findByPk<SaleInvoice>(id, {
          attributes: [
            "id",
            "userid",
            "cname",
            "customerid",
            "issued",
            "invoiceno",
            "type",
            "reference",
            "total",
            "status",
            "adminid",
            "roundOff",
            "overall_discount",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: ContactMaster,
              as: "customer",
            },
          ],
        });
      if (!invoiceDetails) {
        throw new HttpException("No invoic eDetails", HttpStatus.NOT_FOUND);
      }
      const invoiceTotal = invoiceDetails.total;
      let banking: any = [];
      let bankList: any = [];
      if (type == "sales" || type == "qsales") {
        bankList = await this.ledger_details.findAllByQuery({
          where: {
            adminid: invoiceDetails.adminid,
            saleid: id,
            type: {
              [Op.or]: [
                "Customer Payment",
                "Customer Receipt",
                "Customer Reciept",
              ],
            },
            ledgercategory: 1,
            [Op.or]: [
              {
                discount_status: null,
              },
              {
                discount_status: {
                  [Op.ne]: 1,
                },
              },
            ],
          },
          order: [["id", "DESC"]],
        });
        let invoiceOutstanding = invoiceTotal;
        for (var i = 0; i < bankList.length; i++) {
          let element = bankList[i];
          let type = "Record Payment";
          if (element.type === "Customer Payment") {
            if (element.booleantype == "3") {
              type = "Record Payment";
            } else {
              type = "Live Payment";
            }

            const bankInfo = await this.account_master.findById(element.ledger);

            let resList = {
              bankInf: bankInfo,
              paidmethod: element.paidmethod,
              amount: element.total,
              date: element.sdate,
              type: type,
              total: invoiceTotal,
              outstanding: Number(invoiceOutstanding) - Number(element.total),
              invoicePayment:
                invoiceOutstanding === 0 ? "Full Paid" : "Part Paid",
            };
            invoiceOutstanding =
              Number(invoiceOutstanding) - Number(element.total);
            banking.push(resList);
          } else {
            const bankInfo = await this.account_master.findById(element.ledger);
            let resList = {
              bankInf: bankInfo,
              paidmethod: element.paidmethod,
              amount: element.total,
              date: element.sdate,
              type: type,
            };
            banking.push(resList);
          }
        }
      } else {
        bankList = await this.ledger_details.findAllByQuery({
          where: {
            adminid: invoiceDetails.adminid,
            saleid: id,
            type: {
              [Op.or]: ["Customer Refund", "Customer Receipt"],
            },
            discount_status: {
              [Op.ne]: "1",
            },
          },
          order: [["id", "DESC"]],
        });
        if (bankList) {
          for (var i = 0; i < bankList.length; i++) {
            let element = bankList[i];
            let amount = 0;
            if (element.type == "Customer Refund") {
              amount = element.total;
            } else {
              amount = element.usedamount;
            }
            const bankInfo = await this.account_master.findById(element.bankid);

            let resList = {
              bankInf: bankInfo,
              paidmethod: element.paidmethod,
              amount,
              date: element.sdate,
              type: type,
            };
            banking.push(resList);
          }
        }
      }

      const columns: any = await this.invoiceItemsService.findAllByQuery({
        attributes: [
          "id",
          "userid",
          "adminid",
          "total",
          "invoiceno",
          "cname",
          "idescription",
          "discount",
          "discount_amount",
          "description",
          "costprice",
          "quantity",
          "percentage",
          "vat",
          "includevat",
          "itemorder",
          "created_at",
          "updated_at",
        ],
        where: {
          adminid: invoiceDetails.adminid,
          saleid: id,
        },
        order: [["id", "DESC"]],
        raw: true,
      });

      let invoiceItem: any = [];
      if (columns && columns.length > 0) {
        for (let i = 0; i < columns.length; i++) {
          let element = columns[i];
          let itemDetail: any = { ...element };
          const productInfo = await this.product_service.findOneByQuery(
            Number(element.idescription),
            {
              attributes: [
                "id",
                "itemtype",
                "icode",
                "idescription",
                "userid",
                "quantity",
                "vatamt",
                "includevat",
                "costprice",
                "adminid",
                "vat",
                "is_deleted",
                "createdAt",
                "updatedAt",
              ],
              where: {
                adminid: invoiceDetails.adminid,
              },
            }
          );
          itemDetail.product = productInfo;
          // const ledgerInfo = await this.account_master.findQuery(
          //   Number(element.ledger),
          //   {
          //     where: {
          //       userid: {
          //         [Op.or]: ['-2'],
          //       },
          //       adminid: invoiceDetails.adminid,
          //     },
          //   },
          // );
          // itemDetail.ledgerDetails = ledgerInfo;
          invoiceItem.push(itemDetail);
          if (invoiceItem.length === columns.length) {
            response = {
              status: true,
              message: "Invoice Details",
              data: {
                invoiceDetails: invoiceDetails,
                invoiceItems: invoiceItem,
                banking: banking,
              },
            };
          }
        }
      } else {
        response = {
          status: true,
          message: "Invoice Details Not Found",
          data: {
            invoiceDetails,
            invoiceItems: [],
          },
        };
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const inv = await this.SalesInvoiceRepository.findByPk<SaleInvoice>(
        id,
        {}
      );
      if (!inv) {
        throw new HttpException("No sale invoice found", HttpStatus.NOT_FOUND);
      }
      return inv;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getSalesList(adminid, sdate, ldate, type) {
    try {
      let response = await this.findAllByQuery({
        where: {
          adminid: adminid,
          type: type,
          sdate: {
            [Op.gte]: sdate,
            [Op.lte]: ldate,
          },
        },
        include: [{ model: ContactMaster }],
      });
      return new CommonResponseDto(response, true, "Sales List");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByQuery(query: any) {
    try {
      const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>(
        query
      );
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createSalesInvoiceDto: any) {
    let response: CommonResponseDto;
    try {
      let proformaInvNo = createSalesInvoiceDto?.proformaInvNo;
      let oldProformaId = createSalesInvoiceDto?.oldProformaId;
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = new SaleInvoice();
          inv.cname = createSalesInvoiceDto.cname;
          inv.inaddress = createSalesInvoiceDto.inaddress;
          inv.deladdress = createSalesInvoiceDto.deladdress;
          inv.userid = createSalesInvoiceDto.userid;
          inv.customerid = createSalesInvoiceDto.customerid;
          inv.issued = createSalesInvoiceDto.issued;
          inv.invoiceno = createSalesInvoiceDto.invoiceno;
          inv.type = createSalesInvoiceDto.type;
          inv.attachment = createSalesInvoiceDto.attachment;
          inv.quotes = createSalesInvoiceDto.quotes;
          inv.terms = createSalesInvoiceDto.terms;
          inv.reference = createSalesInvoiceDto.reference;
          inv.roundOff = createSalesInvoiceDto?.roundOff || 0;
          inv.total_vat = createSalesInvoiceDto?.total_vat;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value;
          inv.userdate = createSalesInvoiceDto.paymentInfo
            ? createSalesInvoiceDto.paymentInfo.date
            : createSalesInvoiceDto.userdate;
          inv.paymentdate = createSalesInvoiceDto.paymentInfo
            ? createSalesInvoiceDto.paymentInfo.date
            : null;
          inv.sdate = createSalesInvoiceDto.sdate;
          inv.ldate = createSalesInvoiceDto.ldate;
          inv.total = createSalesInvoiceDto.total;
          inv.outstanding = createSalesInvoiceDto.total;
          inv.usertype = createSalesInvoiceDto.usertype;
          if (
            createSalesInvoiceDto.type === "proforma" &&
            createSalesInvoiceDto.pagetype !== "4"
          ) {
            inv.status = 5; // setting proforma status pending when creating a proforma
          } else if (createSalesInvoiceDto.pagetype == "4") {
            inv.status = 0;
          } else {
            inv.status = Number(createSalesInvoiceDto.status);
          }
          inv.adminid = createSalesInvoiceDto.adminid;
          inv.share = createSalesInvoiceDto.share;
          inv.refid = createSalesInvoiceDto.refid;
          inv.sales_ref = createSalesInvoiceDto.sales_ref;
          inv.roundOff = createSalesInvoiceDto.roundOff || 0;
          inv.total_vat = createSalesInvoiceDto?.total_vat;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value;
          inv.salesType = createSalesInvoiceDto.salesType;
          inv.salestock = createSalesInvoiceDto?.columns[0]?.quantity;
          inv.stockid = createSalesInvoiceDto?.columns[0]?.id;
          inv.ledger = createSalesInvoiceDto?.ledger?.id;
          inv.createdBy = createSalesInvoiceDto.createdBy;
          inv.companyid = createSalesInvoiceDto.companyid;
          inv.seriesNo = createSalesInvoiceDto.seriesNo;

          if (createSalesInvoiceDto?.claimedPoint) {
            inv.loyaltyDiscountAmount =
              createSalesInvoiceDto.type === "sales"
                ? Number(createSalesInvoiceDto?.claimedPoint)
                : createSalesInvoiceDto.type === "scredit"
                ? Number(createSalesInvoiceDto?.claimedPoint) * -1
                : 0;
          }

          let invoice: any = await inv.save();

          if (createSalesInvoiceDto?.reccObj?.period) {
            const postToRecc = await this.reccNotService.create(
              createSalesInvoiceDto.reccObj,
              invoice,
              transaction
            );
          }
          const isProforma = createSalesInvoiceDto.type === "proforma";
          if (!isProforma) {
            // creating invoice other than proforma
            response = await this.saveInvoiceToledger(
              invoice,
              createSalesInvoiceDto,
              transaction
            );
            // generating proforma inv is = create new sale inv  + update current proforma status
            // if generate > update current proforma
            if (createSalesInvoiceDto?.pagetype == "4") {
              createSalesInvoiceDto.invoiceno = proformaInvNo;
              createSalesInvoiceDto.type = "proforma";
              createSalesInvoiceDto.id = oldProformaId;
              const proformaUpdate = await this.update(
                createSalesInvoiceDto.id,
                createSalesInvoiceDto
              );
            }
            let amount = createSalesInvoiceDto.total * 100;
            if (createSalesInvoiceDto.stripeReqest) {
              await this.stripePayment.sendInvoiceEmail(
                invoice.id,
                createSalesInvoiceDto.cusmail,
                amount,
                createSalesInvoiceDto.currency
              );
            }
          } else {
            const lineitems =
              await this.invoiceItemsHelperService.createInvoiceLineItem(
                invoice,
                createSalesInvoiceDto
              );
            const saveInvoiceItem =
              await this.invoiceItemsService.createInvoiceItems(lineitems);
            await this.userSettings.updateLastInvoiceNo(
              createSalesInvoiceDto.adminid,
              createSalesInvoiceDto.companyid,
              createSalesInvoiceDto.seriesNo,
              createSalesInvoiceDto.type
            );

            response = {
              status: true,
              message: `Created ${
                isProforma ? "Proforma" : "Sales Credit"
              } Invoice`,
              data: invoice,
            };
          }
        }
      );
    } catch (error) {
      console.log("catch | error : ", error);
      throw error;
    }
    for (let i = 0; i < createSalesInvoiceDto?.columns?.length; i++) {
      if (createSalesInvoiceDto.columns[i].product.itemtype != "Service") {
        let stockMail = await this.product_service.findStockSendMail(
          createSalesInvoiceDto.columns[i].id,
          createSalesInvoiceDto.email
        );
      }
    }
    return response;
  }

  async createRetail(createSalesInvoiceDto: any) {
    let response: CommonResponseDto;
    try {
      const todaysDate = moment();
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = new SaleInvoice();
          inv.cname = createSalesInvoiceDto.cname;
          inv.inaddress = "";
          inv.deladdress = "";
          inv.userid = createSalesInvoiceDto.userid;
          inv.customerid = createSalesInvoiceDto.customerid;
          inv.issued = "yes";
          inv.invoiceno = createSalesInvoiceDto.invoiceno;
          inv.type = "sales";
          inv.attachment = "";
          inv.quotes = "";
          inv.terms = "";
          inv.reference = "";
          inv.roundOff = createSalesInvoiceDto.roundOff || "0.00";
          inv.total_vat = createSalesInvoiceDto?.total_vat || 0;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount || 0;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value || 0;
          inv.userdate = todaysDate;
          inv.paymentdate = todaysDate;
          inv.sdate = createSalesInvoiceDto.sdate || todaysDate;
          inv.ldate = createSalesInvoiceDto.ldate || todaysDate;
          inv.total = createSalesInvoiceDto.total;
          inv.outstanding = createSalesInvoiceDto.total;
          inv.status = Number(createSalesInvoiceDto.status);
          inv.adminid = createSalesInvoiceDto.adminid;
          inv.share = 0;
          inv.refid = 0;
          inv.sales_ref = "";
          inv.roundOff = createSalesInvoiceDto.roundOff || "0.00";
          inv.total_vat = createSalesInvoiceDto?.total_vat || 0;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount || 0;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value || 0;
          inv.salesType = createSalesInvoiceDto.salesType || "";
          inv.salestock = createSalesInvoiceDto?.columns[0]?.quantity;
          inv.stockid = createSalesInvoiceDto?.columns[0]?.id;
          inv.ledger = 1;
          let invoice: any = await inv.save();

          // creating invoice other than proforma
          response = await this.saveInvoiceToledgerRetail(
            invoice,
            createSalesInvoiceDto,
            transaction
          );
        }
      );
    } catch (error) {
      console.log("catch | error : ", error);
      throw error;
    }
    for (let i = 0; i < createSalesInvoiceDto?.columns?.length; i++) {
      if (createSalesInvoiceDto.columns[i].product.itemtype != "Service") {
        let stockMail = await this.product_service.findStockSendMail(
          createSalesInvoiceDto.columns[i].id,
          createSalesInvoiceDto.email
        );
      }
    }

    return response;
  }

  async created(createSalesInvoiceDto: any) {
    let response: CommonResponseDto;
    try {
      let proformaInvNo = createSalesInvoiceDto?.proformaInvNo;
      let oldProformaId = createSalesInvoiceDto?.oldProformaId;
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = new SaleInvoice();
          inv.cname = createSalesInvoiceDto.cname;
          inv.inaddress = createSalesInvoiceDto.inaddress;
          inv.deladdress = createSalesInvoiceDto.deladdress;
          inv.userid = createSalesInvoiceDto.userid;
          inv.customerid = createSalesInvoiceDto.customerid;
          inv.issued = createSalesInvoiceDto.issued;
          inv.invoiceno = createSalesInvoiceDto.invoiceno;
          inv.type = createSalesInvoiceDto.type;
          inv.attachment = createSalesInvoiceDto.attachment;
          inv.quotes = createSalesInvoiceDto.quotes;
          inv.terms = createSalesInvoiceDto.terms;
          inv.reference = createSalesInvoiceDto.reference;
          inv.roundOff = createSalesInvoiceDto.roundOff || 0;
          inv.total_vat = createSalesInvoiceDto?.total_vat;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value;
          inv.userdate = createSalesInvoiceDto.paymentdate;
          inv.paymentdate = createSalesInvoiceDto.paymentdate;
          inv.sdate = createSalesInvoiceDto.sdate;
          inv.ldate = createSalesInvoiceDto.ldate;
          inv.total = createSalesInvoiceDto.total;
          inv.outstanding = createSalesInvoiceDto.total;
          inv.status = 0;
          inv.adminid = createSalesInvoiceDto.adminid;
          inv.share = createSalesInvoiceDto.share;
          inv.refid = createSalesInvoiceDto.refid;
          inv.sales_ref = createSalesInvoiceDto?.sales_ref;
          inv.roundOff = createSalesInvoiceDto?.roundOff || 0;
          inv.total_vat = createSalesInvoiceDto?.total_vat;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value;
          inv.salesType = createSalesInvoiceDto.salesType;
          inv.salestock = createSalesInvoiceDto?.salestock;
          inv.stockid = createSalesInvoiceDto?.columns[0]?.id;
          inv.ledger = createSalesInvoiceDto?.ledger?.id;
          inv.companyid = createSalesInvoiceDto?.companyid;
          let invoice: any = await inv.save();

          const isProforma = createSalesInvoiceDto.type === "proforma";

          if (!isProforma) {
            // creating invoice other than proforma
            response = await this.saveInvoiceToledger(
              invoice,
              createSalesInvoiceDto,
              transaction
            );
            // generating proforma inv is = create new sale inv  + update current proforma status
            // if generate > update current proforma
            if (createSalesInvoiceDto?.pagetype == "4") {
              createSalesInvoiceDto.invoiceno = proformaInvNo;
              createSalesInvoiceDto.type = "proforma";
              createSalesInvoiceDto.id = oldProformaId;
              const proformaUpdate = await this.update(
                createSalesInvoiceDto.id,
                createSalesInvoiceDto
              );
            }
          } else {
            const lineitems =
              await this.invoiceItemsHelperService.createInvoiceLineItem(
                invoice,
                createSalesInvoiceDto
              );
            const saveInvoiceItem =
              await this.invoiceItemsService.createInvoiceItems(lineitems);
            await this.userSettings.updateLastInvoiceNo(
              createSalesInvoiceDto.adminid,
              createSalesInvoiceDto?.companyid,
              createSalesInvoiceDto?.seriesNo,
              createSalesInvoiceDto.type
            );

            response = {
              status: true,
              message: `Created ${
                isProforma ? "Proforma" : "Sales Credit"
              } Invoice`,
              data: invoice,
            };
          }
        }
      );
    } catch (error) {
      console.log("catch | error : ", error);
      throw error;
    }
    for (let i = 0; i < createSalesInvoiceDto?.columns?.length; i++) {
      if (createSalesInvoiceDto.columns[i].product.itemtype != "Service") {
        let stockMail = await this.product_service.findStockSendMail(
          createSalesInvoiceDto.columns[i].id,
          createSalesInvoiceDto.email
        );
      }
    }
    return response;
  }

  async createCreditNew(createSalesInvoiceDto: any) {
    let response: CommonResponseDto;
    try {
      let proformaInvNo = createSalesInvoiceDto?.proformaInvNo;
      let oldProformaId = createSalesInvoiceDto?.oldProformaId;
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = new SaleInvoice();
          inv.cname = createSalesInvoiceDto.cname;
          inv.inaddress = createSalesInvoiceDto.inaddress;
          inv.deladdress = createSalesInvoiceDto.deladdress;
          inv.userid = createSalesInvoiceDto.userid;
          inv.customerid = createSalesInvoiceDto.customerid;
          inv.issued = createSalesInvoiceDto.issued;
          inv.invoiceno = createSalesInvoiceDto.invoiceno;
          inv.type = createSalesInvoiceDto.type;
          inv.attachment = createSalesInvoiceDto.attachment;
          inv.quotes = createSalesInvoiceDto.quotes;
          inv.terms = createSalesInvoiceDto.terms;
          inv.reference = createSalesInvoiceDto.reference;
          inv.userdate = createSalesInvoiceDto.paymentInfo
            ? createSalesInvoiceDto.paymentInfo.date
            : createSalesInvoiceDto.userdate;
          inv.paymentdate = createSalesInvoiceDto.paymentInfo
            ? createSalesInvoiceDto.paymentInfo.date
            : null;
          inv.sdate = createSalesInvoiceDto.sdate;
          inv.ldate = createSalesInvoiceDto.ldate;
          inv.total = createSalesInvoiceDto.total;
          inv.outstanding = createSalesInvoiceDto.total;
          if (
            createSalesInvoiceDto.type === "proforma" &&
            createSalesInvoiceDto.pagetype !== "4"
          ) {
            inv.status = 5;
          } else if (createSalesInvoiceDto.pagetype == "4") {
            inv.status = 0;
          } else {
            inv.status = Number(createSalesInvoiceDto.status);
          }
          inv.adminid = createSalesInvoiceDto.adminid;
          inv.companyid = createSalesInvoiceDto.companyid;
          inv.seriesNo = createSalesInvoiceDto.seriesNo;
          inv.share = createSalesInvoiceDto.share;
          inv.refid = createSalesInvoiceDto.refid;
          inv.salesType = createSalesInvoiceDto.salesType;
          inv.salestock = createSalesInvoiceDto.columns[0].quantity;
          inv.ledger = createSalesInvoiceDto?.ledger?.id;
          inv.stockid = createSalesInvoiceDto.columns[0].id;
          let invoice: any = await inv.save();
          const isProforma = createSalesInvoiceDto.type === "proforma";
          if (!isProforma) {
            let salesCreditData: any = {
              saleid: createSalesInvoiceDto.id,
              sdate: createSalesInvoiceDto.sdate,
              ldate: createSalesInvoiceDto.ldate,
              ledger: createSalesInvoiceDto?.ledger?.id,
              cname: createSalesInvoiceDto.customerid,
              total: createSalesInvoiceDto.total,
              userid: createSalesInvoiceDto.userid,
              ledgercategory: createSalesInvoiceDto?.ledger?.category,
              adminid: createSalesInvoiceDto.adminid || 0,
              companyid: createSalesInvoiceDto.companyid,
              userdate: createSalesInvoiceDto.userdate,
              type:
                createSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : "Sales Credit Notes",
              credit:
                createSalesInvoiceDto.type == "sales"
                  ? createSalesInvoiceDto.total
                  : 0,
              debit:
                createSalesInvoiceDto.type == "sales"
                  ? 0
                  : createSalesInvoiceDto.total,
              booleantype: "1",
              usertype: "customer",
              used: "group",
              invoiceno: createSalesInvoiceDto.invoiceno,
              baseid: null,
              seriesNo: createSalesInvoiceDto.seriesNo,
            };
            const salesCredit = await this.ledger_details.create(
              salesCreditData,
              transaction
            );

            let salesDebitData: any = {
              saleid: createSalesInvoiceDto.id,
              sdate: createSalesInvoiceDto.sdate,
              ldate: createSalesInvoiceDto.ldate,
              ledger: "47",
              cname: createSalesInvoiceDto.customerid,
              total: createSalesInvoiceDto.total,
              userid: createSalesInvoiceDto.userid,
              ledgercategory: "3",
              adminid: createSalesInvoiceDto.adminid || 0,
              userdate: createSalesInvoiceDto.userdate,
              type:
                createSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : "Sales Credit Notes",
              credit:
                createSalesInvoiceDto.type == "sales"
                  ? 0
                  : createSalesInvoiceDto.total,
              debit:
                createSalesInvoiceDto.type == "sales"
                  ? createSalesInvoiceDto.total
                  : 0,
              booleantype: "1",
              usertype: "customer",
              used: "group",
              invoiceno: createSalesInvoiceDto.invoiceno,
              baseid: salesCredit.id,
              seriesNo: createSalesInvoiceDto.seriesNo,
            };
            const salesDebit = await this.ledger_details.create(
              salesDebitData,
              transaction
            );

            await this.userSettings.updateLastInvoiceNo(
              createSalesInvoiceDto.adminid,
              createSalesInvoiceDto.companyid,
              createSalesInvoiceDto.seriesNo,
              createSalesInvoiceDto.type
            );

            response = {
              status: true,
              message: `Created ${
                isProforma ? "Proforma" : "Sales Credit"
              } Invoice`,
              data: invoice,
            };
          }
        }
      );
    } catch (error) {
      console.log("catch | error : ", error);
      throw error;
    }

    return response;
  }

  async updateCreditNoteWithoutStockReversal(
    id: any,
    updateSalesInvoiceDto: any
  ) {
    let response;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = await this.findById(id);
          inv.cname = updateSalesInvoiceDto.cname || inv.cname;
          inv.inaddress = updateSalesInvoiceDto.inaddress || inv.inaddress;
          inv.deladdress = updateSalesInvoiceDto.deladdress || inv.deladdress;
          inv.userid = updateSalesInvoiceDto.userid || inv.userid;
          inv.customerid = updateSalesInvoiceDto.customerid || inv.customerid;
          inv.issued = updateSalesInvoiceDto.issued || inv.issued;
          inv.invoiceno = updateSalesInvoiceDto.invoiceno || inv.invoiceno;
          inv.type = updateSalesInvoiceDto.type || inv.type;
          inv.attachment = updateSalesInvoiceDto.attachment || inv.attachment;
          inv.quotes = updateSalesInvoiceDto.quotes || inv.quotes;
          inv.terms = updateSalesInvoiceDto.terms || inv.terms;
          inv.reference = updateSalesInvoiceDto.reference || inv.reference;
          inv.userdate = updateSalesInvoiceDto.paymentInfo
            ? updateSalesInvoiceDto.paymentInfo.date
            : updateSalesInvoiceDto.userdate;
          inv.paymentdate = updateSalesInvoiceDto.paymentInfo
            ? updateSalesInvoiceDto.paymentInfo.date
            : null;
          inv.sdate = updateSalesInvoiceDto.sdate || inv.sdate;
          inv.ldate = updateSalesInvoiceDto.ldate || inv.ldate;
          inv.total = updateSalesInvoiceDto.total || inv.total;
          inv.seriesNo = updateSalesInvoiceDto.seriesNo || inv.seriesNo;
          inv.outstanding =
            updateSalesInvoiceDto.outstanding || inv.outstanding;
          if (
            updateSalesInvoiceDto.type === "proforma" &&
            updateSalesInvoiceDto.pagetype !== "4"
          ) {
            inv.status = 5;
          } else if (updateSalesInvoiceDto.pagetype == "4") {
            inv.status = 0;
          } else {
            inv.status = Number(updateSalesInvoiceDto.status);
          }
          inv.adminid = updateSalesInvoiceDto.adminid || inv.adminid;
          inv.companyid = updateSalesInvoiceDto.companyid || inv.companyid;
          inv.share = updateSalesInvoiceDto.share || inv.share;
          inv.refid = updateSalesInvoiceDto.refid || inv.refid;
          inv.salesType = updateSalesInvoiceDto.salesType || inv.salesType;
          inv.salestock =
            updateSalesInvoiceDto.columns[0].quantity || inv.salestock;
          inv.ledger = updateSalesInvoiceDto?.ledger?.id || inv.ledger;
          inv.stockid = updateSalesInvoiceDto.columns[0].id || inv.stockid;
          let invoice: any = await inv.save();

          const deleteingLedgerDetails =
            await this.ledger_details.findAllByQuery({
              where: {
                adminid: updateSalesInvoiceDto.adminid,
                invoiceno: updateSalesInvoiceDto.invoiceno,
                type: {
                  [Op.notIn]: [
                    "Customer Payment",
                    "Customer Receipt",
                    "Customer Reciept",
                  ],
                },
              },
            });

          for (let i = 0; i < deleteingLedgerDetails.length; i++) {
            let element = deleteingLedgerDetails[i];
            const deletedLedger = await this.ledger_details.delete(element.id);
          }

          const isProforma = updateSalesInvoiceDto.type === "proforma";
          if (!isProforma) {
            let salesCreditData: any = {
              saleid: updateSalesInvoiceDto.id,
              sdate: updateSalesInvoiceDto.sdate,
              ldate: updateSalesInvoiceDto.ldate,
              ledger: updateSalesInvoiceDto?.ledger?.id,
              cname: updateSalesInvoiceDto.customerid,
              total: updateSalesInvoiceDto.total,
              userid: updateSalesInvoiceDto.userid,
              ledgercategory: updateSalesInvoiceDto?.ledger?.category,
              adminid: updateSalesInvoiceDto.adminid || 0,
              userdate: updateSalesInvoiceDto.userdate,
              companyid: updateSalesInvoiceDto.companyid,
              type:
                updateSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : "Sales Credit Notes",
              credit:
                updateSalesInvoiceDto.type == "sales"
                  ? updateSalesInvoiceDto.total
                  : 0,
              debit:
                updateSalesInvoiceDto.type == "sales"
                  ? 0
                  : updateSalesInvoiceDto.total,
              booleantype: "1",
              usertype: "customer",
              used: "group",
              invoiceno: updateSalesInvoiceDto.invoiceno,
              seriesNo: updateSalesInvoiceDto.seriesNo,
              baseid: null,
            };
            const salesCredit = await this.ledger_details.create(
              salesCreditData,
              transaction
            );

            let salesDebitData: any = {
              saleid: updateSalesInvoiceDto.id,
              sdate: updateSalesInvoiceDto.sdate,
              ldate: updateSalesInvoiceDto.ldate,
              ledger: "47",
              cname: updateSalesInvoiceDto.customerid,
              total: updateSalesInvoiceDto.total,
              userid: updateSalesInvoiceDto.userid,
              ledgercategory: "3",
              adminid: updateSalesInvoiceDto.adminid || 0,
              companyid: updateSalesInvoiceDto.companyid,
              userdate: updateSalesInvoiceDto.userdate,
              type:
                updateSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : "Sales Credit Notes",
              credit:
                updateSalesInvoiceDto.type == "sales"
                  ? 0
                  : updateSalesInvoiceDto.total,
              debit:
                updateSalesInvoiceDto.type == "sales"
                  ? updateSalesInvoiceDto.total
                  : 0,
              booleantype: "1",
              usertype: "customer",
              used: "group",
              invoiceno: updateSalesInvoiceDto.invoiceno,
              seriesNo: updateSalesInvoiceDto.seriesNo,
              baseid: null,
            };
            const salesDebit = await this.ledger_details.create(
              salesDebitData,
              transaction
            );

            await this.userSettings.updateLastInvoiceNo(
              updateSalesInvoiceDto.adminid,
              updateSalesInvoiceDto.companyid,
              updateSalesInvoiceDto.seriesNo,
              updateSalesInvoiceDto.type
            );

            response = {
              status: true,
              message: `Created ${
                isProforma ? "Proforma" : "Sales Credit"
              } Invoice`,
              data: invoice,
            };
          }
        }
      );
    } catch (error) {
      console.log("catch | error : ", error);
      throw error;
    }
    return response;
  }

  async saveInvoiceToledger(
    createInvoice: any,
    createSalesInvoiceDto: any,
    transaction: any
  ) {
    let response: CommonResponseDto = {
      data: null,
      status: false,
      message: null,
    };
    try {
      let totalVat = 0;
      let totalNet = 0;
      let totalDiscount = 0;
      let uniqueVat = [];
      let index = 0;

      const ledgerAcc: any = createSalesInvoiceDto.ledger;

      const lineitems =
        await this.invoiceItemsHelperService.createInvoiceLineItem(
          createInvoice,
          createSalesInvoiceDto
        );
      const saveInvoiceItem = await this.invoiceItemsService.createInvoiceItems(
        lineitems
      );

      // update the loyalty points of the customer
      if (createSalesInvoiceDto.loyaltyPoints) {
        const contactDetails = await this.ContactMasterService.getOneById(
          createSalesInvoiceDto.customerid
        );
        console.log("contactDetails");
        let oldBalncePoint = Number(contactDetails?.loyaltyPoints);
        let currentSalePoint = Number(createSalesInvoiceDto.loyaltyPoints);

        let remainingPoints = oldBalncePoint;
        if (createSalesInvoiceDto.type == "sales") {
          remainingPoints += currentSalePoint;
        } else {
          remainingPoints -= currentSalePoint;
        }

        //if cliam
        if (createSalesInvoiceDto?.claimedPoint > 0) {
          ///
          remainingPoints =
            Number(remainingPoints) -
            Number(createSalesInvoiceDto.claimedPoint);
          let usedPoints = Number(createSalesInvoiceDto.claimedPoint);

          let loyaltyCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: 6, //loyaltyLedger[0]?.id,
            cname: createSalesInvoiceDto.customerid,
            total: Number(usedPoints),
            userid: createSalesInvoiceDto.userid,
            ledgercategory: 12,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit:
              createSalesInvoiceDto.type == "sales" ? Number(usedPoints) : 0,
            debit:
              createSalesInvoiceDto.type == "sales" ? 0 : Number(usedPoints),
            booleantype: "99",
            usertype: "customer",
            used: "group",
            invoiceno: createInvoice.invoiceno,
            baseid: null,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const loyaltyCredit = await this.ledger_details.create(
            loyaltyCreditData,
            transaction
          );
          let loyaltyDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: Number(usedPoints),
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            totalamount: Number(usedPoints),
            credit:
              createSalesInvoiceDto.type == "sales" ? 0 : Number(usedPoints),
            debit:
              createSalesInvoiceDto.type == "sales" ? Number(usedPoints) : 0,
            booleantype: "99",
            usertype: "customer",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: loyaltyCredit.id,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const loyaltyDebit = await this.ledger_details.create(
            loyaltyDebitData,
            transaction
          );
        }

        const updatePointsOfCustomer =
          await this.ContactMasterService.updateData(
            createSalesInvoiceDto.customerid,
            { loyaltyPoints: Number(remainingPoints) }
          );
      }

      let isService = false;

      for (let i = 0; i < createSalesInvoiceDto.columns.length; i++) {
        let element = createSalesInvoiceDto.columns[i];
        const costprice = element.costprice;
        const quantity = Number(element.quantity);
        if (element.product?.itemtype === "Service") {
          isService = true;
        }

        let totalamount = Number(element.costprice) * Number(element.quantity);
        const discount = element.discountamt ? Number(element.discountamt) : 0;
        if (discount && discount > 0) {
          totalamount = totalamount - discount;
        }
        const incomeTaxAmount = Number(element.vatamount);
        if (element.includevat) {
          totalamount = totalamount - incomeTaxAmount;
        }
        totalVat += incomeTaxAmount;
        totalNet += totalamount;

        totalDiscount += Number(element.discountamt);
        uniqueVat.push(element.incomeTax);
        if (
          element.product?.itemtype === "Stock" ||
          element.product?.itemtype === "Nonstock"
        ) {
          const stockData = await this.product_service.findOne(
            Number(element.product.id)
          );
          const productLocationStock: any =
            await this.productLocationMasterService.findOne(
              element?.productLocationRef?element?.productLocationRef:6
            );

          let existingStock = stockData.data.stock;
          let existingLocationStock = productLocationStock.data.stock;

          let inStock = Number(existingStock) - Number(quantity);
          let inLocationStock =
            Number(existingLocationStock) - Number(quantity);

          if (createSalesInvoiceDto.type === "sales") {
            inStock = Number(existingStock) - Number(quantity);
            inLocationStock = Number(existingLocationStock) - Number(quantity);
          } else if (createSalesInvoiceDto.type === "scredit") {
            inStock = Number(existingStock) + Number(quantity);
            inLocationStock = Number(existingLocationStock) + Number(quantity);
          }
          const updateStock = await this.product_service.updateStock(
            element.product.id,
            {
              quantity: null,
              stock: inStock,
            },
            transaction
          );

          const updateLocationStock =
            await this.productLocationMasterService.update(
              element?.productLocationRef?element?.productLocationRef:6,
              {
                stock: Number(inLocationStock),
                quantity: Number(inLocationStock),
              }
            );
        }
      }

      if (Number(createSalesInvoiceDto?.roundOff || 0) !== Number(0)) {
        let roundCreditData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: "5",
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: ledgerAcc?.category,
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          credit:
            createSalesInvoiceDto.roundOff > 0
              ? createSalesInvoiceDto.roundOff
              : 0,
          debit:
            createSalesInvoiceDto.roundOff > 0
              ? 0
              : createSalesInvoiceDto.roundOff,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          baseid: null,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
        };
        const roundCredit = await this.ledger_details.create(
          roundCreditData,
          transaction
        );
        let roundDebitData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: "47",
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: "3",
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          totalamount: totalNet,
          credit:
            createSalesInvoiceDto?.roundOff > 0
              ? 0
              : createSalesInvoiceDto?.roundOff,
          debit:
            createSalesInvoiceDto?.roundOff > 0
              ? createSalesInvoiceDto?.roundOff
              : 0,
          booleantype: "1",
          usertype: "customer",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: roundCreditData.id,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
        };
        const roundDebit = await this.ledger_details.create(
          roundDebitData,
          transaction
        );
      }
      if (isService === true) {
        let salesCreditData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: ledgerAcc?.id,
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: ledgerAcc?.category,
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          credit:
            createSalesInvoiceDto.type == "sales"
              ? createSalesInvoiceDto.total
              : 0,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : createSalesInvoiceDto.total,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          baseid: null,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
        };
        const salesCredit = await this.ledger_details.create(
          salesCreditData,
          transaction
        );
        let salesDebitData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: "47",
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: "3",
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          totalamount: totalNet,
          credit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : createSalesInvoiceDto.total,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? createSalesInvoiceDto.total
              : 0,
          booleantype: "1",
          usertype: "customer",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: salesCredit.id,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
        };
        const salesDebit = await this.ledger_details.create(
          salesDebitData,
          transaction
        );
      } else {
        let salesCreditData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: ledgerAcc?.id,
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: ledgerAcc?.category,
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          credit:
            createSalesInvoiceDto.type == "sales"
              ? totalNet + totalDiscount
              : 0,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : totalNet + totalDiscount,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          baseid: null,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
        };
        const salesCredit = await this.ledger_details.create(
          salesCreditData,
          transaction
        );
        let salesDebitData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: "47",
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: "3",
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          totalamount: totalNet,
          credit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : totalNet + totalDiscount,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? totalNet + totalDiscount
              : 0,
          booleantype: "1",
          usertype: "customer",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: salesCredit.id,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
        };
        const salesDebit = await this.ledger_details.create(
          salesDebitData,
          transaction
        );

        if (totalDiscount > 0) {
          let discountDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: 13,
            cname: createSalesInvoiceDto.customerid,
            total: -totalDiscount,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: 13,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit: createSalesInvoiceDto.type == "sales" ? 0 : totalDiscount,
            debit: createSalesInvoiceDto.type == "sales" ? totalDiscount : 0,
            booleantype: createSalesInvoiceDto.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "discount",
            invoiceno: createSalesInvoiceDto.invoiceno,
            discount_status: "1",
            baseid: null,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const discountDebit = await this.ledger_details.create(
            discountDebitData,
            transaction
          );
          let discountCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: -totalDiscount,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            debit: createInvoice.type == "sales" ? 0 : totalDiscount,
            credit: createInvoice.type == "sales" ? totalDiscount : 0,
            booleantype: createInvoice.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "discount",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: discountDebit.id,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const discountCredit = await this.ledger_details.create(
            discountCreditData,
            transaction
          );
        }
        if (totalVat > 0) {
          let taxDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: 54,
            cname: createSalesInvoiceDto.customerid,
            total: totalVat,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: 4,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit: createInvoice.type == "sales" ? totalVat : 0,
            debit: createInvoice.type == "sales" ? 0 : totalVat,
            booleantype: createInvoice.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "incometax",
            discount_status: "0",
            invoiceno: createInvoice.invoiceno,
            baseid: null,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const taxDebit = await this.ledger_details.create(
            taxDebitData,
            transaction
          );
          let taxCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: totalVat,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createInvoice.adminid || 0,
            userdate: createInvoice.userdate,
            type:
              createInvoice.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit: createInvoice.type == "sales" ? 0 : totalVat,
            debit: createInvoice.type == "sales" ? totalVat : 0,
            booleantype: createInvoice.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "incometax",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: taxDebit.id,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const taxCredit = await this.ledger_details.create(
            taxCreditData,
            transaction
          );

          // update vat ledger total account master
          // const vatLedger = await this.account_master.findAllByQuery({
          //   attributes: ["id", "total"],
          //   where: {
          //     nominalcode: 2202,
          //     userid: createSalesInvoiceDto.userid,
          //   },
          // });
          // if (vatLedger) {
          //   let total = createInvoice.type == "sales" ? totalVat : -totalVat;
          //   let accountData = {
          //     total: Number(vatLedger[0]?.total) + Number(total),
          //   };
          //   const updateVatLedger = await this.account_master.update(
          //     vatLedger[0]?.id,
          //     accountData,
          //     transaction
          //   );
          // }
        }
      }

      if (createInvoice) {
        createInvoice.outstanding = createSalesInvoiceDto.paymentInfo
          ? createSalesInvoiceDto.paymentInfo.outstanding
          : Number(createInvoice.total) -
            (Number(createInvoice.outstanding) || 0);

        if (createSalesInvoiceDto.paymentInfo) {
          let payDebitData = {
            total: createSalesInvoiceDto.paymentInfo.amount,
            paidmethod: createSalesInvoiceDto.paymentInfo.paidmethod,
            sdate: createSalesInvoiceDto.paymentInfo.date,
            userid: createInvoice.userid,
            cname: createInvoice.customerid,
            ledger: createSalesInvoiceDto.paymentInfo.bankid,
            ledgercategory: "1",
            saleid: createInvoice.id,
            type: "Customer Receipt",
            userdate: createInvoice.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: createInvoice.adminid,
            debit: createSalesInvoiceDto.paymentInfo.amount,
            credit: 0,
            booleantype: "3",
            usertype: "customer",
            bankid: createSalesInvoiceDto.paymentInfo.bankid,
            referenceid: createInvoice.id,
            discount_status: "0",
            running_total: createSalesInvoiceDto.paymentInfo.running_total,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          const payDebit = await this.ledger_details.create(
            payDebitData,
            transaction
          );

          let payCreditData: any = {
            total: createSalesInvoiceDto.paymentInfo.amount,
            paidmethod: createSalesInvoiceDto.paymentInfo.paidmethod,
            sdate: createSalesInvoiceDto.paymentInfo.date,
            userid: createInvoice.userid,
            cname: createSalesInvoiceDto.customerid,
            ledger: "47",
            ledgercategory: "3",
            saleid: createInvoice.id,
            type: "Customer Receipt",
            userdate: createSalesInvoiceDto.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: createSalesInvoiceDto.adminid,
            debit: 0,
            credit: createSalesInvoiceDto.paymentInfo.amount,
            booleantype: "3",
            discount_status: "1",
            usertype: "customer",
            transferid: payDebit.id,
            baseid: payDebit.id,
            referenceid: createInvoice.id,
            bankid: createSalesInvoiceDto.paymentInfo.bankid,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            seriesNo: createSalesInvoiceDto.seriesNo,
          };
          let status = createInvoice.status;
          if (createSalesInvoiceDto.paymentInfo.outstanding <= 0) {
            status = "2"; //paid
          } else if (
            createSalesInvoiceDto.paymentInfo.outstanding <
            createSalesInvoiceDto.paymentInfo.totalPayable
          ) {
            status = "1"; //part Paid
          } else if (
            createSalesInvoiceDto.paymentInfo.outstanding >=
            createSalesInvoiceDto.paymentInfo.totalPayable
          ) {
            status = "0"; //unpaid
          }

          createInvoice.status = status;
          const payCredit = await this.ledger_details.create(
            payCreditData,
            transaction
          );
          createInvoice.outstanding =
            createSalesInvoiceDto.paymentInfo.outstanding;
          createInvoice.status = status;

          const updateSale = await this.updateOutstandingAmount(
            createInvoice.id,
            createInvoice,
            transaction
          );
          let ledgerView = await this.account_master.findOne(
            createSalesInvoiceDto.paymentInfo.bankid
          );

          if (ledgerView.status) {
            let totalamount = ledgerView.data.total;
            let totalAmountPlus =
              Number(totalamount) +
              Number(createSalesInvoiceDto.paymentInfo.amount);
            let salesData_3: any = {
              total: totalAmountPlus,
              userdate: createInvoice.userdate,
              updatedAt: new Date(),
            };
            const updateLedger = await this.account_master.update(
              createSalesInvoiceDto.paymentInfo.bankid,
              salesData_3,
              transaction
            );
            if (updateLedger) {
              response = {
                status: true,
                message: "Sales Invoice Created and Completed Payment",
                data: createInvoice,
              };
            } else {
              response = {
                status: false,
                message: "Invoice Created but Failed to Update Payment",
                data: createInvoice,
              };
            }
            await this.invoiceItemsService.updateSalePaymentDate(
              createSalesInvoiceDto.adminid,
              createSalesInvoiceDto.userid,
              createInvoice.id,
              createSalesInvoiceDto.paymentInfo.date
            );
          } else {
            response = {
              status: false,
              message: "Invoice Created but Failed to Update Bank",
              data: createInvoice,
            };
          }
        } else {
          response = {
            status: true,
            message: "Sales Invoice Created Successfully",
            data: createInvoice,
          };
        }
        await this.userSettings.updateLastInvoiceNo(
          createSalesInvoiceDto.adminid,
          createSalesInvoiceDto.companyid,
          createSalesInvoiceDto.seriesNo,
          createSalesInvoiceDto.type
        );
      } else {
        response = {
          data: null,
          status: false,
          message: "Failed to create supplier",
        };
      }
    } catch (error) {
      console.log("catch | error : ", error);
      throw error;
    }
    return response;
  }
  async saveInvoiceToledgerRetail(
    createInvoice: any,
    createSalesInvoiceDto: any,
    transaction: any
  ) {
    let response: CommonResponseDto = {
      data: null,
      status: false,
      message: null,
    };
    try {
      const todaysDate = moment();
      let totalVat = 0;
      let totalNet = 0;
      let totalDiscount = 0;
      let uniqueVat = [];
      const lineitems =
        await this.invoiceItemsHelperService.createInvoiceLineItems(
          createInvoice,
          createSalesInvoiceDto
        );
      const saveInvoiceItem = await this.invoiceItemsService.createInvoiceItems(
        lineitems
      );
      for (let i = 0; i < createSalesInvoiceDto.columns.length; i++) {
        let element = createSalesInvoiceDto.columns[i];
        const costprice = element.costprice;
        const quantity = element.quantity;
        let totalamount = Number(costprice) * Number(quantity);
        const discount = element.discountamt ? Number(element.discountamt) : 0;
        if (discount && discount > 0) {
          totalamount = totalamount - discount;
        }
        const incomeTaxAmount = element.vatamount || 0;
        if (element.includevat) {
          totalamount = totalamount - incomeTaxAmount;
        }
        totalVat += incomeTaxAmount;
        totalNet += totalamount;

        totalDiscount += Number(element.discountamt);
        uniqueVat.push(element.incomeTax);
        if (
          element.product?.itemtype === "Stock" ||
          element.product?.itemtype === "Nonstock"
        ) {
          const stockData = await this.product_service.findOne(
            element.product.id
          );
          let existingStock = stockData.data.stock;
          let inStock = Number(existingStock) - Number(quantity);
          if (createSalesInvoiceDto.type === "sales") {
            inStock = Number(existingStock) - Number(quantity);
          }
          const updateStock = await this.product_service.updateStock(
            element.product.id,
            {
              quantity: null,
              stock: inStock,
            },
            transaction
          );
        }
      }
      let salesCreditData: any = {
        saleid: createInvoice.id,
        sdate: todaysDate,
        ldate: todaysDate,
        ledger: 1,
        cname: createSalesInvoiceDto.customerid,
        total: totalNet,
        userid: createSalesInvoiceDto.userid,
        ledgercategory: 13,
        adminid: createSalesInvoiceDto.adminid,
        companyid: createSalesInvoiceDto.companyid,
        userdate: todaysDate,
        type: "Sales Invoice",
        credit: totalNet,
        debit: 0,
        booleantype: "1",
        usertype: "customer",
        used: "group",
        invoiceno: createInvoice.invoiceno,
        baseid: null,
      };
      const salesCredit = await this.ledger_details.create(
        salesCreditData,
        transaction
      );
      let salesDebitData: any = {
        saleid: createInvoice.id,
        sdate: todaysDate,
        ldate: todaysDate,
        ledger: "47",
        cname: createSalesInvoiceDto.customerid,
        total: totalNet,
        userid: createSalesInvoiceDto.userid,
        ledgercategory: "3",
        adminid: createSalesInvoiceDto.adminid,
        companyid: createSalesInvoiceDto.companyid,
        userdate: todaysDate,
        type: "Sales Invoice",
        totalamount: totalNet,
        credit: 0,
        debit: totalNet,
        booleantype: "1",
        usertype: "customer",
        discount_status: "1",
        invoiceno: createInvoice.invoiceno,
        baseid: salesCredit.id,
      };
      const salesDebit = await this.ledger_details.create(
        salesDebitData,
        transaction
      );
      // if (totalDiscount > 0) {
      //   let discountDebitData: any = {
      //     saleid: createInvoice.id,
      //     sdate: createSalesInvoiceDto.sdate,
      //     ldate: createSalesInvoiceDto.ldate,
      //     ledger: 13,
      //     cname: createSalesInvoiceDto.customerid,
      //     total: -totalDiscount,
      //     userid: createSalesInvoiceDto.userid,
      //     ledgercategory: 13,
      //     adminid: createSalesInvoiceDto.adminid || 0,
      //     userdate: createSalesInvoiceDto.userdate,
      //     type:
      //       createSalesInvoiceDto.type == 'sales'
      //         ? 'Sales Invoice'
      //         : 'Sales Credit Notes',
      //     credit: createSalesInvoiceDto.type == 'sales' ? 0 : totalDiscount,
      //     debit: createSalesInvoiceDto.type == 'sales' ? totalDiscount : 0,
      //     booleantype: createSalesInvoiceDto.type == 'sales' ? '1' : '24',
      //     usertype: 'customer',
      //     used: 'discount',
      //     invoiceno: createSalesInvoiceDto.invoiceno,
      //     discount_status: '1',
      //     baseid: '',
      //   };
      //   const discountDebit = await this.ledger_details.create(
      //     discountDebitData,
      //     transaction,
      //   );
      //   let discountCreditData: any = {
      //     saleid: createInvoice.id,
      //     sdate: createSalesInvoiceDto.sdate,
      //     ldate: createSalesInvoiceDto.ldate,
      //     ledger: '47',
      //     cname: createSalesInvoiceDto.customerid,
      //     total: -totalDiscount,
      //     userid: createSalesInvoiceDto.userid,
      //     ledgercategory: '3',
      //     adminid: createSalesInvoiceDto.adminid || 0,
      //     userdate: createSalesInvoiceDto.userdate,
      //     type:
      //       createSalesInvoiceDto.type == 'sales'
      //         ? 'Sales Invoice'
      //         : 'Sales Credit Notes',
      //     debit: createInvoice.type == 'sales' ? 0 : totalDiscount,
      //     credit: createInvoice.type == 'sales' ? totalDiscount : 0,
      //     booleantype: createInvoice.type == 'sales' ? '1' : '24',
      //     usertype: 'customer',
      //     used: 'discount',
      //     discount_status: '1',
      //     invoiceno: createInvoice.invoiceno,
      //     baseid: discountDebit.id,
      //   };
      //   const discountCredit = await this.ledger_details.create(
      //     discountCreditData,
      //     transaction,
      //   );
      // }
      if (totalVat > 0) {
        let taxDebitData: any = {
          saleid: createInvoice.id,
          sdate: todaysDate,
          ldate: todaysDate,
          ledger: 54,
          cname: createSalesInvoiceDto.customerid,
          total: totalVat,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: 4,
          adminid: createSalesInvoiceDto.adminid || 0,
          companyid: createSalesInvoiceDto.companyid,
          userdate: todaysDate,
          type: "Sales Invoice",
          credit: totalVat,
          debit: 0,
          booleantype: createInvoice.type == "sales" ? "1" : "24",
          usertype: "customer",
          used: "incometax",
          discount_status: "0",
          invoiceno: createInvoice.invoiceno,
          baseid: null,
        };
        const taxDebit = await this.ledger_details.create(
          taxDebitData,
          transaction
        );
        let taxCreditData: any = {
          saleid: createInvoice.id,
          sdate: todaysDate,
          ldate: todaysDate,
          ledger: "47",
          cname: createSalesInvoiceDto.customerid,
          total: totalVat,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: "3",
          adminid: createInvoice.adminid || 0,
          companyid: createSalesInvoiceDto.companyid,
          userdate: todaysDate,
          type: "Sales Invoice",
          credit: 0,
          debit: totalVat,
          booleantype: "1",
          usertype: "customer",
          used: "incometax",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: taxDebit.id,
        };
        const taxCredit = await this.ledger_details.create(
          taxCreditData,
          transaction
        );
      }

      if (createInvoice) {
        createInvoice.outstanding = createSalesInvoiceDto.paymentInfo
          ? createSalesInvoiceDto.paymentInfo.outstanding
          : Number(createInvoice.total) -
            (Number(createInvoice.outstanding) || 0);

        if (createSalesInvoiceDto?.paymentInfo) {
          let payDebitData = {
            total: createSalesInvoiceDto.paymentInfo.amount,
            paidmethod: createSalesInvoiceDto.paymentInfo.paidmethod,
            sdate: createSalesInvoiceDto.paymentInfo.date,
            userid: createInvoice.userid,
            cname: createInvoice.customerid,
            ledger: createSalesInvoiceDto.paymentInfo.bankid,
            ledgercategory: "1",
            saleid: createInvoice.id,
            type: "Customer Receipt",
            userdate: createInvoice.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: createInvoice.adminid,
            companyid: createSalesInvoiceDto.companyid,
            debit: createSalesInvoiceDto.paymentInfo.amount,
            credit: 0,
            booleantype: "3",
            usertype: "customer",
            bankid: createSalesInvoiceDto.paymentInfo.bankid,
            referenceid: createInvoice.id,
            discount_status: "0",
            running_total: createSalesInvoiceDto.paymentInfo.running_total,
          };
          const payDebit = await this.ledger_details.create(
            payDebitData,
            transaction
          );

          let payCreditData: any = {
            total: createSalesInvoiceDto.paymentInfo.amount,
            paidmethod: createSalesInvoiceDto.paymentInfo.paidmethod,
            sdate: createSalesInvoiceDto.paymentInfo.date,
            userid: createInvoice.userid,
            cname: createSalesInvoiceDto.customerid,
            ledger: "47",
            ledgercategory: "3",
            saleid: createInvoice.id,
            type: "Customer Receipt",
            userdate: createSalesInvoiceDto.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: createSalesInvoiceDto.adminid,
            companyid: createSalesInvoiceDto.companyid,
            debit: 0,
            credit: createSalesInvoiceDto.paymentInfo.amount,
            booleantype: "3",
            discount_status: "1",
            usertype: "customer",
            transferid: payDebit.id,
            baseid: payDebit.id,
            referenceid: createInvoice.id,
            bankid: createSalesInvoiceDto.paymentInfo.bankid,
          };
          let status = createInvoice.status;
          if (createSalesInvoiceDto.paymentInfo.outstanding <= 0) {
            status = "2"; //paid
          } else if (
            createSalesInvoiceDto.paymentInfo.outstanding <
            createSalesInvoiceDto.paymentInfo.totalPayable
          ) {
            status = "1"; //part Paid
          } else if (
            createSalesInvoiceDto.paymentInfo.outstanding >=
            createSalesInvoiceDto.paymentInfo.totalPayable
          ) {
            status = "0"; //unpaid
          }

          createInvoice.status = status;
          const payCredit = await this.ledger_details.create(
            payCreditData,
            transaction
          );
          createInvoice.outstanding =
            createSalesInvoiceDto.paymentInfo.outstanding;
          createInvoice.status = status;

          const updateSale = await this.updateOutstandingAmount(
            createInvoice.id,
            createInvoice,
            transaction
          );
          let ledgerView = await this.account_master.findOne(
            createSalesInvoiceDto.paymentInfo.bankid
          );

          if (ledgerView.status) {
            let totalamount = ledgerView.data.total;
            let totalAmountPlus =
              Number(totalamount) +
              Number(createSalesInvoiceDto.paymentInfo.amount);
            let salesData_3: any = {
              total: totalAmountPlus,
              userdate: createInvoice.userdate,
              updatedAt: new Date(),
            };
            const updateLedger = await this.account_master.update(
              createSalesInvoiceDto.paymentInfo.bankid,
              salesData_3,
              transaction
            );
            if (updateLedger) {
              response = {
                status: true,
                message: "Sales Invoice Created and Completed Payment",
                data: createInvoice,
              };
            } else {
              response = {
                status: false,
                message: "Invoice Created but Failed to Update Payment",
                data: createInvoice,
              };
            }
            await this.invoiceItemsService.updateSalePaymentDate(
              createSalesInvoiceDto.adminid,
              createSalesInvoiceDto.userid,
              createInvoice.id,
              createSalesInvoiceDto.paymentInfo.date
            );
          } else {
            response = {
              status: false,
              message: "Invoice Created but Failed to Update Bank",
              data: createInvoice,
            };
          }
        } else {
          response = {
            status: true,
            message: "Sales Invoice Created Successfully",
            data: createInvoice,
          };
        }
        await this.userSettings.updateLastInvoiceNo(
          createSalesInvoiceDto.adminid,
          createSalesInvoiceDto.companyid,
          createSalesInvoiceDto.seriesNo,
          "sales"
        );
      } else {
        response = {
          data: null,
          status: false,
          message: "Failed to create supplier",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async updateData(
    id: number,
    updateSalesInvoiceDto: UpdateSalesInvoiceDto,
    transaction: any
  ) {
    try {
      const inv = await this.findById(id);
      inv.cname = updateSalesInvoiceDto.cname || inv.cname;
      inv.inaddress = updateSalesInvoiceDto.inaddress || inv.inaddress;
      inv.deladdress = updateSalesInvoiceDto.deladdress || inv.deladdress;
      inv.userid = updateSalesInvoiceDto.userid || inv.userid;
      inv.customerid = updateSalesInvoiceDto.customerid || inv.customerid;
      inv.issued = updateSalesInvoiceDto.issued || inv.issued;
      inv.invoiceno = updateSalesInvoiceDto.invoiceno || inv.invoiceno;
      inv.type = updateSalesInvoiceDto.type || inv.type;
      inv.attachment = updateSalesInvoiceDto.attachment || inv.attachment;
      inv.quotes = updateSalesInvoiceDto.quotes || inv.quotes;
      inv.terms = updateSalesInvoiceDto.terms || inv.terms;
      inv.reference = updateSalesInvoiceDto.reference || inv.reference;

      inv.userdate = updateSalesInvoiceDto.userdate || inv.userdate;
      inv.sdate = updateSalesInvoiceDto.sdate || inv.sdate;
      inv.ldate = updateSalesInvoiceDto.ldate || inv.ldate;
      inv.total = updateSalesInvoiceDto.total || inv.total;
      inv.outstanding =
        updateSalesInvoiceDto.outstanding === 0
          ? 0.0
          : updateSalesInvoiceDto.outstanding || inv.outstanding;
      inv.status = updateSalesInvoiceDto.status || inv.status;
      inv.adminid = updateSalesInvoiceDto.adminid || inv.adminid;
      inv.share = updateSalesInvoiceDto.share || inv.share;
      inv.refid = updateSalesInvoiceDto.refid || inv.refid;
      let invoice: any = await inv.save({ transaction });
      return invoice;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateDataa(id: number, updateSalesInvoiceDto: UpdateSalesInvoiceDto) {
    try {
      const inv = await this.findById(id);
      inv.cname = updateSalesInvoiceDto.cname || inv.cname;
      inv.inaddress = updateSalesInvoiceDto.inaddress || inv.inaddress;
      inv.deladdress = updateSalesInvoiceDto.deladdress || inv.deladdress;
      inv.userid = updateSalesInvoiceDto.userid || inv.userid;
      inv.customerid = updateSalesInvoiceDto.customerid || inv.customerid;
      inv.issued = updateSalesInvoiceDto.issued || inv.issued;
      inv.invoiceno = updateSalesInvoiceDto.invoiceno || inv.invoiceno;
      inv.type = updateSalesInvoiceDto.type || inv.type;
      inv.attachment = updateSalesInvoiceDto.attachment || inv.attachment;
      inv.quotes = updateSalesInvoiceDto.quotes || inv.quotes;
      inv.terms = updateSalesInvoiceDto.terms || inv.terms;
      inv.reference = updateSalesInvoiceDto.reference || inv.reference;

      inv.userdate = updateSalesInvoiceDto.userdate || inv.userdate;
      inv.sdate = updateSalesInvoiceDto.sdate || inv.sdate;
      inv.ldate = updateSalesInvoiceDto.ldate || inv.ldate;
      inv.total = updateSalesInvoiceDto.total || inv.total;
      inv.outstanding =
        updateSalesInvoiceDto.total ||
        updateSalesInvoiceDto.outstanding ||
        inv.outstanding;
      inv.status = updateSalesInvoiceDto.status || inv.status;
      inv.adminid = updateSalesInvoiceDto.adminid || inv.adminid;
      inv.share = updateSalesInvoiceDto.share || inv.share;
      inv.refid = updateSalesInvoiceDto.refid || inv.refid;
      let invoice: any = await inv.save();
      return invoice;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateSalesInvoiceDto: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = await this.findById(id);
          const currentinvoiceClaimedPoints = inv.loyaltyDiscountAmount;
          const oldTotal = inv.total;
          inv.cname = updateSalesInvoiceDto.cname || inv.cname;
          inv.inaddress = updateSalesInvoiceDto.inaddress || inv.inaddress;
          inv.sales_ref = updateSalesInvoiceDto.sales_ref || inv.sales_ref;
          inv.deladdress = updateSalesInvoiceDto.deladdress || inv.deladdress;
          inv.userid = updateSalesInvoiceDto.userid || inv.userid;
          inv.customerid = updateSalesInvoiceDto.customerid || inv.customerid;
          inv.issued = updateSalesInvoiceDto.issued || inv.issued;
          if (updateSalesInvoiceDto.pagetype == "4") {
            inv.status = 4;
          } else {
            inv.status = Number(updateSalesInvoiceDto.status) || inv.status;
          }
          inv.type = updateSalesInvoiceDto.type || inv.type;
          inv.invoiceno = updateSalesInvoiceDto.invoiceno || inv.invoiceno;
          inv.attachment = updateSalesInvoiceDto.attachment || inv.attachment;
          inv.quotes = updateSalesInvoiceDto.quotes || inv.quotes;
          inv.terms = updateSalesInvoiceDto.terms || inv.terms;
          inv.reference = updateSalesInvoiceDto.reference || inv.reference;
          inv.roundOff = updateSalesInvoiceDto?.roundOff || inv.roundOff;
          inv.userdate = updateSalesInvoiceDto.paymentInfo
            ? updateSalesInvoiceDto.paymentInfo.date
            : updateSalesInvoiceDto.userdate || inv.userdate;
          inv.paymentdate = updateSalesInvoiceDto.paymentInfo
            ? updateSalesInvoiceDto.paymentInfo.date
            : updateSalesInvoiceDto.paymentdate || inv.paymentdate;
          inv.sdate = updateSalesInvoiceDto.sdate || inv.sdate;
          inv.ldate = updateSalesInvoiceDto.ldate || inv.ldate;
          inv.ledger = updateSalesInvoiceDto?.ledger?.id || inv.ledger;
          inv.total = updateSalesInvoiceDto.total || inv.total;
          inv.createdBy = updateSalesInvoiceDto.createdBy || inv.createdBy;
          inv.companyid = updateSalesInvoiceDto.companyid || inv.companyid;
          inv.outstanding =
            updateSalesInvoiceDto.outstanding === 0
              ? 0.0
              : updateSalesInvoiceDto.outstanding || inv.outstanding;
          inv.adminid = updateSalesInvoiceDto.adminid || inv.adminid;
          inv.share = updateSalesInvoiceDto.share || inv.share;
          inv.total_vat = updateSalesInvoiceDto?.total_vat || inv.total_vat;
          inv.overall_discount =
            updateSalesInvoiceDto?.overall_discount || inv.overall_discount;
          inv.taxable_value =
            updateSalesInvoiceDto?.taxable_value || inv.taxable_value;
          inv.createdBy = updateSalesInvoiceDto?.createdBy || inv.createdBy;
          inv.companyid = updateSalesInvoiceDto?.companyid || inv.companyid;
          inv.usertype = updateSalesInvoiceDto?.usertype || inv.usertype;
          inv.seriesNo = updateSalesInvoiceDto?.seriesNo || inv.seriesNo;
          inv.loyaltyDiscountAmount = updateSalesInvoiceDto?.claimedPoint || 0;

          let invoice: any = await inv.save();
          const companyDetails = await CompanyMaster.findByPk(
            updateSalesInvoiceDto.companyid
          );
          let lastinvloylty =
            oldTotal * Number(companyDetails.loyaltyDiscountPercentage);
          if (updateSalesInvoiceDto?.reccuring?.period) {
            const postToRecc = await this.reccNotService.create(
              updateSalesInvoiceDto.reccuring,
              invoice,
              transaction
            );
          }

          if (updateSalesInvoiceDto.type !== "proforma") {
            await this.updateInvoiceToledger(
              invoice,
              updateSalesInvoiceDto,
              { currentinvoiceClaimedPoints, oldTotal, lastinvloylty },
              transaction
            );
          } else {
            await this.invoiceItemsService.deleteInvoiceItems({
              where: {
                saleid: invoice.id,
                adminid: invoice.adminid,
                userid: invoice.userid,
              },
            });
            const lineitems =
              await this.invoiceItemsHelperService.createInvoiceLineItem(
                invoice,
                updateSalesInvoiceDto
              );
            const saveInvoiceItem =
              await this.invoiceItemsService.createInvoiceItems(lineitems);

            await this.invoiceItemsService.updateSalePaymentDate(
              updateSalesInvoiceDto.adminid,
              updateSalesInvoiceDto.userid,
              updateSalesInvoiceDto.id,
              updateSalesInvoiceDto.paymentInfo.date
            );
          }
          response = {
            status: true,
            message:
              updateSalesInvoiceDto?.pagetype === "4"
                ? "Generated Proforma as Tax Invoice"
                : "Update success",
            data: invoice,
          };
          return response;
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }

    return response;
  }

  async updateInvoiceToledger(
    checkInvoice: any,
    updateSalesInvoiceDto: any,
    lastinvData: any,
    transaction: any
  ) {
    try {
      let response: CommonResponseDto = {
        data: null,
        status: false,
        message: null,
      };
      if (checkInvoice) {
        const ledgerAcc: any = updateSalesInvoiceDto?.ledger;
        const deleteingLedgerDetails = await this.ledger_details.findAllByQuery(
          {
            where: {
              adminid: updateSalesInvoiceDto.adminid,
              saleid: checkInvoice.id,
              type: {
                [Op.notIn]: [
                  "Customer Payment",
                  "Customer Receipt",
                  "Customer Reciept",
                ],
              },
            },
          }
        );
        const deleteingInvoiceItems =
          await this.invoiceItemsService.findAllByQuery({
            where: {
              adminid: updateSalesInvoiceDto.adminid,
              saleid: checkInvoice.id,
              type: {
                [Op.notIn]: [
                  "Customer Payment",
                  "Customer Receipt",
                  "Customer Reciept",
                ],
              },
            },
          });

        let deleteLedger: boolean = false;
        if (deleteingLedgerDetails && deleteingLedgerDetails?.length > 0) {
          for (let i = 0; i < deleteingLedgerDetails.length; i++) {
            const deleteLedgers = await this.ledger_details.delete(
              deleteingLedgerDetails[i].id
            );
            if (i === deleteingLedgerDetails.length - 1) {
              deleteLedger = true;
            }
          }
          await this.invoiceItemsService.deleteInvoiceItems({
            where: {
              saleid: checkInvoice.id,
              adminid: checkInvoice.adminid,
              userid: checkInvoice.userid,
            },
          });
        }

        const lineitems =
          await this.invoiceItemsHelperService.createInvoiceLineItem(
            checkInvoice,
            updateSalesInvoiceDto
          );
        const saveInvoiceItem =
          await this.invoiceItemsService.createInvoiceItems(lineitems);

        if (deleteLedger) {
          let totalVat: number = 0;
          let totalNet: number = 0;
          let uniqueVat = [];
          let totalDiscount: number = 0;

          let updatedStockData = [];
          let updatedLocationStockData = [];

          for (let i = 0; i < deleteingInvoiceItems.length; i++) {
            const item = deleteingInvoiceItems[i];

            let product: any = await this.product_service.findById(
              Number(item.idescription)
            );

            if (product?.itemtype !== "Service") {
              const productLocationStock: any =
                await this.productLocationMasterService.findOne(
                  item.productLocationRef
                );
              let stock = Number(product.stock);
              let locationStock = Number(productLocationStock.data.stock);

              if (updateSalesInvoiceDto.type === "sales") {
                stock = stock + Number(item.quantity);
                locationStock = Number(locationStock) + Number(item.quantity);
              } else if (updateSalesInvoiceDto.type === "scredit") {
                stock = stock - Number(item.quantity);
                locationStock = Number(locationStock) - Number(item.quantity);
              }
              let stockObj = {
                stock: Number(stock).toFixed(0),
                quantity: stock,
              };

              let updatedData = await this.product_service.updateStock(
                Number(item.idescription),
                stockObj,
                transaction
              );
              const updateLocationStock: any =
                await this.productLocationMasterService.update(
                  Number(item.productLocationRef),
                  {
                    stock: Number(locationStock),
                    quantity: Number(locationStock),
                  }
                );

              const plainUpdateLocationStock = updateLocationStock.data.get({
                plain: true,
              });

              updatedStockData.push(updatedData.data);
              updatedLocationStockData.push(plainUpdateLocationStock);
            }
          }

          // update the loyalty points of the customer
          if (updateSalesInvoiceDto.loyaltyPoints) {
            const contactDetails = await this.ContactMasterService.getOneById(
              updateSalesInvoiceDto.customerid
            );
            let oldBalncePoint = Number(contactDetails.loyaltyPoints);
            //here we remove the old invoce added loyaltypoints
            oldBalncePoint =
              oldBalncePoint -
              Number(lastinvData?.lastinvloylty) +
              Number(lastinvData?.currentinvoiceClaimedPoints);
            let currentSalePoint = Number(updateSalesInvoiceDto.loyaltyPoints);
            let remainingPoints = oldBalncePoint;
            if (updateSalesInvoiceDto.type == "sales") {
              remainingPoints += currentSalePoint;
            } else {
              remainingPoints -= currentSalePoint;
            }

            //if cliam
            if (updateSalesInvoiceDto.claimedPoint > 0) {
              remainingPoints =
                Number(remainingPoints) -
                Number(updateSalesInvoiceDto.claimedPoint);
              let usedPoints = Number(updateSalesInvoiceDto.claimedPoint);

              let loyaltyCreditData: any = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: 6, //loyaltyLedger[0]?.id,
                cname: updateSalesInvoiceDto.customerid,
                total: Number(usedPoints),
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: 12,
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                credit:
                  updateSalesInvoiceDto.type == "sales"
                    ? Number(usedPoints)
                    : 0,
                debit:
                  updateSalesInvoiceDto.type == "sales"
                    ? 0
                    : Number(usedPoints),
                booleantype: "99",
                usertype: "customer",
                used: "group",
                invoiceno: checkInvoice.invoiceno,
                baseid: null,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const loyaltyCredit = await this.ledger_details.create(
                loyaltyCreditData,
                transaction
              );
              let loyaltyDebitData: any = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "47",
                cname: updateSalesInvoiceDto.customerid,
                total: Number(usedPoints),
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: "3",
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                totalamount: Number(usedPoints),
                credit:
                  updateSalesInvoiceDto.type == "sales"
                    ? 0
                    : Number(usedPoints),
                debit:
                  updateSalesInvoiceDto.type == "sales"
                    ? Number(usedPoints)
                    : 0,
                booleantype: "99",
                usertype: "customer",
                discount_status: "1",
                invoiceno: checkInvoice.invoiceno,
                baseid: loyaltyCredit.id,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const loyaltyDebit = await this.ledger_details.create(
                loyaltyDebitData,
                transaction
              );
            } else {
              remainingPoints = oldBalncePoint + currentSalePoint;
            }

            const updatePointsOfCustomer =
              await this.ContactMasterService.updateData(
                updateSalesInvoiceDto.customerid,
                { loyaltyPoints: Number(remainingPoints) }
              );
          }

          let isService = false;
          for (let i = 0; i < updateSalesInvoiceDto.columns.length; i++) {
            let element = updateSalesInvoiceDto.columns[i];

            if (element.product?.itemtype === "Service") {
              isService = true;
            }

            const costprice = element.costprice;
            const quantity = element.quantity;
            let totalamount = Number(costprice) * Number(quantity);
            const discount = element.discountamt
              ? Number(element.discountamt)
              : 0;
            if (discount && discount > 0) {
              totalamount = totalamount - discount;
            }
            const incomeTaxAmount = Number(element.vatamount);
            if (element.includevat) {
              totalamount = totalamount - incomeTaxAmount;
            }
            totalVat += incomeTaxAmount;
            totalNet += totalamount;
            totalDiscount += Number(element.discountamt);
            uniqueVat.push(element.incomeTax);

            if (
              element.product?.itemtype === "Stock" ||
              element.product?.itemtype === "Nonstock"
            ) {
              let oldEntry = updatedStockData.find(
                (item: any) => element.product.id === item.id
              );
              let oldProductLocationEntry = updatedLocationStockData.find(
                (item: any) => element.productLocationRef == item.id
              );

              let newEntry = updateSalesInvoiceDto.columns.find(
                (item: any) =>
                  !deleteingInvoiceItems.some(
                    (deleted) => Number(deleted.idescription) === item.id
                  )
              );
              let newProductLocationEntry = updateSalesInvoiceDto.columns.find(
                (item: any) =>
                  !deleteingInvoiceItems.some(
                    (deleted) =>
                      Number(deleted.productLocationRef) ===
                      item.productLocationRef
                  )
              );

              let stock: number;
              let locationStock: number;

              if (oldEntry) {
                stock = oldEntry.stock;
              }
              if (oldProductLocationEntry) {
                locationStock = oldProductLocationEntry.stock;
              }

              if (newEntry) {
                let productStockData: any = await this.product_service.findById(
                  Number(newEntry.id)
                );
                stock = productStockData.stock;
              }
              if (newProductLocationEntry) {
                let productLocationStockData: any =
                  await this.productLocationMasterService.findOne(
                    newProductLocationEntry.productLocationRef
                  );
                locationStock = productLocationStockData.data.stock;
              }

              if (updateSalesInvoiceDto.type === "sales") {
                stock = Number(stock) - Number(element.quantity);
                locationStock =
                  Number(locationStock) - Number(element.quantity);
              } else if (updateSalesInvoiceDto.type === "scredit") {
                stock = Number(stock) + Number(element.quantity);
                locationStock =
                  Number(locationStock) + Number(element.quantity);
              }

              let stockObj = {
                stock: Number(stock).toFixed(0),
                quantity: stock,
              };
              let updateStock = await this.product_service.updateStock(
                element.product.id,
                stockObj,
                transaction
              );

              const updateLocationStock =
                await this.productLocationMasterService.update(
                  element.productLocationRef,
                  {
                    stock: Number(locationStock),
                    quantity: Number(locationStock),
                  }
                );
            }
          }

          if (isService === true) {
            let salesCreditData = {
              saleid: checkInvoice.id,
              sdate: updateSalesInvoiceDto.sdate,
              ldate: updateSalesInvoiceDto.ldate,
              ledger: ledgerAcc?.id,
              cname: updateSalesInvoiceDto.customerid,
              total: totalNet,
              userid: updateSalesInvoiceDto.userid,
              ledgercategory: ledgerAcc?.category,
              adminid: updateSalesInvoiceDto.adminid || 0,
              userdate: updateSalesInvoiceDto.userdate,
              type:
                updateSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : updateSalesInvoiceDto.type == "scredit"
                  ? "Sales Credit Notes"
                  : "Proforma Invoice",
              credit:
                updateSalesInvoiceDto.type == "sales"
                  ? updateSalesInvoiceDto.total
                  : 0,
              debit:
                updateSalesInvoiceDto.type == "sales"
                  ? 0
                  : updateSalesInvoiceDto.total,
              booleantype: "1",
              usertype: "customer",
              used: "group",
              invoiceno: checkInvoice.invoiceno,
              baseid: null,
              createdBy: updateSalesInvoiceDto.createdBy,
              companyid: updateSalesInvoiceDto.companyid,
              seriesNo: updateSalesInvoiceDto.seriesNo,
            };
            const salesCredit = await this.ledger_details.create(
              salesCreditData,
              transaction
            );

            let salesDebitData = {
              saleid: checkInvoice.id,
              sdate: updateSalesInvoiceDto.sdate,
              ldate: updateSalesInvoiceDto.ldate,
              ledger: "47",
              cname: updateSalesInvoiceDto.customerid,
              total: totalNet,
              userid: updateSalesInvoiceDto.userid,
              ledgercategory: "3",
              adminid: updateSalesInvoiceDto.adminid || 0,
              userdate: updateSalesInvoiceDto.userdate,
              type:
                updateSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : updateSalesInvoiceDto.type == "proforma"
                  ? "Proforma Invoice"
                  : "Sales Credit Notes",
              credit:
                updateSalesInvoiceDto.type == "sales"
                  ? 0
                  : updateSalesInvoiceDto.total,
              debit:
                updateSalesInvoiceDto.type == "sales"
                  ? updateSalesInvoiceDto.total
                  : 0,
              booleantype: "1",
              usertype: "customer",
              discount_status: "1",
              invoiceno: checkInvoice.invoiceno,
              baseid: salesCredit.id,
              createdBy: updateSalesInvoiceDto.createdBy,
              companyid: updateSalesInvoiceDto.companyid,
              seriesNo: updateSalesInvoiceDto.seriesNo,
            };
            const salesDebit = await this.ledger_details.create(
              salesDebitData,
              transaction
            );
            if (Number(updateSalesInvoiceDto.roundOff) !== Number(0)) {
              let roundCreditData: any = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "5",
                cname: updateSalesInvoiceDto.customerid,
                total: totalNet,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: ledgerAcc?.category,
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                credit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? updateSalesInvoiceDto.roundOff
                    : 0,
                debit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? 0
                    : updateSalesInvoiceDto.roundOff,
                booleantype: "1",
                usertype: "customer",
                used: "group",
                invoiceno: checkInvoice.invoiceno,
                baseid: null,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const roundCredit = await this.ledger_details.create(
                roundCreditData,
                transaction
              );
              let roundDebitData: any = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "47",
                cname: updateSalesInvoiceDto.customerid,
                total: totalNet,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: "3",
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                totalamount: totalNet,
                credit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? 0
                    : updateSalesInvoiceDto.roundOff,
                debit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? updateSalesInvoiceDto.roundOff
                    : 0,
                booleantype: "1",
                usertype: "customer",
                discount_status: "1",
                invoiceno: checkInvoice.invoiceno,
                baseid: roundCreditData.id,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const roundDebit = await this.ledger_details.create(
                roundDebitData,
                transaction
              );
            }
          } else {
            let salesCreditData = {
              saleid: checkInvoice.id,
              sdate: updateSalesInvoiceDto.sdate,
              ldate: updateSalesInvoiceDto.ldate,
              ledger: ledgerAcc?.id,
              cname: updateSalesInvoiceDto.customerid,
              total: totalNet,
              userid: updateSalesInvoiceDto.userid,
              ledgercategory: ledgerAcc?.category,
              adminid: updateSalesInvoiceDto.adminid || 0,
              userdate: updateSalesInvoiceDto.userdate,
              type:
                updateSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : updateSalesInvoiceDto.type == "scredit"
                  ? "Sales Credit Notes"
                  : "Proforma Invoice",
              credit:
                updateSalesInvoiceDto.type == "sales"
                  ? totalNet + totalDiscount
                  : 0,
              debit:
                updateSalesInvoiceDto.type == "sales"
                  ? 0
                  : totalNet + totalDiscount,
              booleantype: "1",
              usertype: "customer",
              used: "group",
              invoiceno: checkInvoice.invoiceno,
              baseid: null,
              createdBy: updateSalesInvoiceDto.createdBy,
              companyid: updateSalesInvoiceDto.companyid,
              seriesNo: updateSalesInvoiceDto.seriesNo,
            };
            const salesCredit = await this.ledger_details.create(
              salesCreditData,
              transaction
            );

            let salesDebitData = {
              saleid: checkInvoice.id,
              sdate: updateSalesInvoiceDto.sdate,
              ldate: updateSalesInvoiceDto.ldate,
              ledger: "47",
              cname: updateSalesInvoiceDto.customerid,
              total: totalNet,
              userid: updateSalesInvoiceDto.userid,
              ledgercategory: "3",
              adminid: updateSalesInvoiceDto.adminid || 0,
              userdate: updateSalesInvoiceDto.userdate,
              type:
                updateSalesInvoiceDto.type == "sales"
                  ? "Sales Invoice"
                  : updateSalesInvoiceDto.type == "proforma"
                  ? "Proforma Invoice"
                  : "Sales Credit Notes",
              credit:
                updateSalesInvoiceDto.type == "sales"
                  ? 0
                  : totalNet + totalDiscount,
              debit:
                updateSalesInvoiceDto.type == "sales"
                  ? totalNet + totalDiscount
                  : 0,
              booleantype: "1",
              usertype: "customer",
              discount_status: "1",
              invoiceno: checkInvoice.invoiceno,
              baseid: salesCredit.id,
              createdBy: updateSalesInvoiceDto.createdBy,
              companyid: updateSalesInvoiceDto.companyid,
              seriesNo: updateSalesInvoiceDto.seriesNo,
            };
            const salesDebit = await this.ledger_details.create(
              salesDebitData,
              transaction
            );

            if (totalDiscount > 0) {
              let discountDebitData = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: 13,
                cname: updateSalesInvoiceDto.customerid,
                total: -totalDiscount,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: 13,
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                credit:
                  updateSalesInvoiceDto.type == "sales" ? 0 : totalDiscount,
                debit:
                  updateSalesInvoiceDto.type == "sales" ? totalDiscount : 0,
                booleantype: updateSalesInvoiceDto.type == "sales" ? "1" : "24",
                usertype: "customer",
                used: "discount",
                invoiceno: checkInvoice.invoiceno,
                discount_status: "1",
                baseid: null,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const discountDebit = await this.ledger_details.create(
                discountDebitData,
                transaction
              );
              let discountCreditData = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "47",
                cname: updateSalesInvoiceDto.customerid,
                total: -totalDiscount,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: "3",
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                debit:
                  updateSalesInvoiceDto.type == "sales" ? 0 : totalDiscount,
                credit:
                  updateSalesInvoiceDto.type == "sales" ? totalDiscount : 0,
                booleantype: updateSalesInvoiceDto.type == "sales" ? "1" : "24",
                usertype: "customer",
                used: "discount",
                discount_status: "1",
                invoiceno: checkInvoice.invoiceno,
                baseid: discountDebit.id,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const discountCredit = await this.ledger_details.create(
                discountCreditData,
                transaction
              );
            }

            if (totalVat > 0) {
              let taxDebitData = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: 54,
                cname: updateSalesInvoiceDto.customerid,
                total: totalVat,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: 4,
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                credit: updateSalesInvoiceDto.type == "sales" ? totalVat : 0,
                debit: updateSalesInvoiceDto.type == "sales" ? 0 : totalVat,
                booleantype: updateSalesInvoiceDto.type == "sales" ? "1" : "24",
                usertype: "customer",
                used: "incometax",
                discount_status: "0",
                invoiceno: checkInvoice.invoiceno,
                baseid: null,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const taxDebit = await this.ledger_details.create(
                taxDebitData,
                transaction
              );
              let taxCreditData = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "47",
                cname: updateSalesInvoiceDto.customerid,
                total: totalVat,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: "3",
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                credit: updateSalesInvoiceDto.type == "sales" ? 0 : totalVat,
                debit: updateSalesInvoiceDto.type == "sales" ? totalVat : 0,
                booleantype: updateSalesInvoiceDto.type == "sales" ? "1" : "24",
                usertype: "customer",
                used: "incometax",
                discount_status: "1",
                invoiceno: checkInvoice.invoiceno,
                baseid: taxDebit.id,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const taxCredit = await this.ledger_details.create(
                taxCreditData,
                transaction
              );

              let deletedVatLedger = deleteingLedgerDetails.find(
                (item: any) => item.ledger === 54
              );

              // update vat ledger total account master
              // const vatLedger = await this.account_master.findAllByQuery({
              //   attributes: ["id", "total"],
              //   where: {
              //     nominalcode: 2202,
              //     userid: updateSalesInvoiceDto.userid,
              //   },
              // });
              // if (vatLedger) {
              //   let totalVal;
              //   let previousTotalVat;
              //   if (updateSalesInvoiceDto.type == "sales") {
              //     totalVal = totalVat;
              //     previousTotalVat = -deletedVatLedger?.total;
              //   } else {
              //     totalVal = -totalVat;
              //     previousTotalVat = deletedVatLedger?.total;
              //   }
              //   let accountData = {
              //     total:
              //       Number(vatLedger[0]?.total) +
              //       Number(totalVal) +
              //       Number(previousTotalVat),
              //   };
              //   const updateVatLedger = await this.account_master.update(
              //     vatLedger[0]?.id,
              //     accountData,
              //     transaction
              //   );
              // }
            }

            if (Number(updateSalesInvoiceDto?.roundOff || 0) !== Number(0)) {
              let roundCreditData: any = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "5",
                cname: updateSalesInvoiceDto.customerid,
                total: totalNet,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: ledgerAcc?.category,
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                credit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? updateSalesInvoiceDto.roundOff
                    : 0,
                debit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? 0
                    : updateSalesInvoiceDto.roundOff,
                booleantype: "1",
                usertype: "customer",
                used: "group",
                invoiceno: checkInvoice.invoiceno,
                baseid: null,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const roundCredit = await this.ledger_details.create(
                roundCreditData,
                transaction
              );
              let roundDebitData: any = {
                saleid: checkInvoice.id,
                sdate: updateSalesInvoiceDto.sdate,
                ldate: updateSalesInvoiceDto.ldate,
                ledger: "47",
                cname: updateSalesInvoiceDto.customerid,
                total: totalNet,
                userid: updateSalesInvoiceDto.userid,
                ledgercategory: "3",
                adminid: updateSalesInvoiceDto.adminid || 0,
                userdate: updateSalesInvoiceDto.userdate,
                type:
                  updateSalesInvoiceDto.type == "sales"
                    ? "Sales Invoice"
                    : "Sales Credit Notes",
                totalamount: totalNet,
                credit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? 0
                    : updateSalesInvoiceDto.roundOff,
                debit:
                  updateSalesInvoiceDto.roundOff > 0
                    ? updateSalesInvoiceDto.roundOff
                    : 0,
                booleantype: "1",
                usertype: "customer",
                discount_status: "1",
                invoiceno: checkInvoice.invoiceno,
                baseid: roundCreditData.id,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const roundDebit = await this.ledger_details.create(
                roundDebitData,
                transaction
              );
            }
          }

          if (checkInvoice) {
            checkInvoice.outstanding = updateSalesInvoiceDto.paymentInfo
              ? updateSalesInvoiceDto.paymentInfo.outstanding
              : Number(checkInvoice.total) -
                (Number(checkInvoice.outstanding) || 0);
            if (updateSalesInvoiceDto.paymentInfo) {
              let payDebitData = {
                total: updateSalesInvoiceDto.paymentInfo.amount,
                paidmethod: updateSalesInvoiceDto.paymentInfo.paidmethod,
                sdate: updateSalesInvoiceDto.paymentInfo.date,
                userid: checkInvoice.userid,
                cname: checkInvoice.customerid,
                ledger: updateSalesInvoiceDto.paymentInfo.bankid,
                ledgercategory: "1",
                saleid: checkInvoice.id,
                type: "Customer Receipt",
                userdate: checkInvoice.userdate,
                createdAt: new Date(),
                updatedAt: new Date(),
                adminid: checkInvoice.adminid,
                debit: updateSalesInvoiceDto.paymentInfo.amount,
                credit: 0,
                discount_status: "0",
                booleantype: "3",
                usertype: "customer",
                bankid: updateSalesInvoiceDto?.paymentInfo.bankid,
                referenceid: checkInvoice.id,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              const payDebit = await this.ledger_details.create(
                payDebitData,
                transaction
              );

              let payCreditData = {
                total: updateSalesInvoiceDto.paymentInfo.amount,
                paidmethod: updateSalesInvoiceDto.paymentInfo.paidmethod,
                sdate: updateSalesInvoiceDto.paymentInfo.date,
                userid: checkInvoice.userid,
                cname: checkInvoice.customerid,
                ledger: "47",
                ledgercategory: "3",
                saleid: checkInvoice.id,
                type: "Customer Receipt",
                userdate: checkInvoice.userdate,
                createdAt: new Date(),
                updatedAt: new Date(),
                adminid: checkInvoice.adminid,
                debit: 0,
                credit: updateSalesInvoiceDto.paymentInfo.amount,
                booleantype: "3",
                discount_status: "1",
                usertype: "customer",
                transferid: payDebit.id,
                baseid: payDebit.id,
                referenceid: checkInvoice.id,
                bankid: updateSalesInvoiceDto.paymentInfo.bankid,
                createdBy: updateSalesInvoiceDto.createdBy,
                companyid: updateSalesInvoiceDto.companyid,
                seriesNo: updateSalesInvoiceDto.seriesNo,
              };
              let status = checkInvoice.status;
              if (
                Number(updateSalesInvoiceDto.paymentInfo.amount) ===
                  Number(checkInvoice.total) ||
                Number(updateSalesInvoiceDto.paymentInfo.outstanding) === 0
              ) {
                status = "2";
              } else if (
                Number(updateSalesInvoiceDto.paymentInfo.amount) <
                  Number(checkInvoice.total) &&
                Number(updateSalesInvoiceDto.paymentInfo.outstanding) > 0
              ) {
                status = "1";
              } else if (
                Number(updateSalesInvoiceDto.paymentInfo.amount) == 0
              ) {
                status = "0";
              }
              checkInvoice.status = status;
              const payCredit = await this.ledger_details.create(
                payCreditData,
                transaction
              );
              checkInvoice.outstanding =
                updateSalesInvoiceDto.paymentInfo.outstanding;
              checkInvoice.status = status;
              const updateSale = await this.updateOutstandingAmount(
                checkInvoice.id,
                checkInvoice,
                transaction
              );
              let ledgerView = await this.account_master.findById(
                updateSalesInvoiceDto.paymentInfo.bankid
              );

              if (ledgerView) {
                let totalamount = ledgerView.total;
                let totalAmountPlus =
                  Number(totalamount) +
                  Number(updateSalesInvoiceDto.paymentInfo.amount);
                let salesData_3 = {
                  total: totalAmountPlus,
                  userdate: checkInvoice.userdate,
                  updatedAt: new Date(),
                };
                const updateLedger = await this.account_master.update(
                  updateSalesInvoiceDto.paymentInfo.bankid,
                  salesData_3,
                  transaction
                );
                if (updateLedger) {
                  response = {
                    status: true,
                    message: "Sales Invoice Created and Completed Payment",
                    data: checkInvoice,
                  };
                  response = {
                    status: true,
                    message: "Sales Invoice Updated and Completed Payment",
                    data: {
                      payDebit,
                      payCredit,
                      updateSale,
                      updateLedger,
                      checkInvoice,
                    },
                  };
                } else {
                  response = {
                    status: false,
                    message: "Invoice Updated but Failed to Update Payment",
                    data: checkInvoice,
                  };
                }
              } else {
                response = {
                  status: false,
                  message: "Invoice Updated but Failed to Update Bank",
                  data: checkInvoice,
                };
              }
              await this.invoiceItemsService.updateSalePaymentDate(
                updateSalesInvoiceDto.adminid,
                updateSalesInvoiceDto.userid,
                updateSalesInvoiceDto.id,
                updateSalesInvoiceDto.paymentInfo.date
              );
            } else {
              response = {
                status: true,
                message: "Invoice Updated Successfully",
                data: checkInvoice,
              };
            }
          } else {
            response = {
              data: null,
              status: false,
              message: "Failed to update Invoice",
            };
          }
        } else {
          response = {
            data: null,
            status: false,
            message: "Error Updating Existing Invoice Details",
          };
        }
      } else {
        response = {
          data: null,
          status: false,
          message:
            "Invoice Payment has taken place already, Cancel Payment to Update Invoice",
        };
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const inv = await this.findById(id);
      await inv.destroy();
      return inv;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateOutstandingAmount(id: number, updateData: any, transaction: any) {
    try {
      const saleInv = await this.findById(id);
      saleInv.outstanding = updateData.outstanding;
      saleInv.status = updateData.status;
      if (updateData.userdate) {
        saleInv.userdate = updateData.userdate;
      }
      if (updateData.paymentdate) {
        saleInv.paymentdate = updateData.paymentdate;
      }
      let saveInvoice = await saleInv.save({ transaction });
      return saveInvoice;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listCustomerPay(id, adminid) {
    let response: CommonResponseDto;
    try {
      const ledgerDetailsData = await this.ledger_details.findAllByQuery({
        where: {
          cname: id,
          adminid: adminid,
          booleantype: "5",
          [Op.or]: [
            {
              used: "partused",
            },
            {
              used: "nonused",
            },
          ],
          discount_status: {
            [Op.ne]: "1",
          },
          status: {
            [Op.ne]: "2",
          },
        },
        order: [["id", "DESC"]],
      });
      const salesDetails = await this.findAllByQuery({
        where: {
          customerid: id,
          adminid: adminid,
          status: {
            [Op.ne]: 2,
          },
        },
        order: [["id", "DESC"]],
      });

      let recList = [];

      if (ledgerDetailsData) {
        ledgerDetailsData.forEach((element) => {
          let totalval = element.total;
          let total = -totalval;
          let rout = total - element.usedamount;
          let dataAry = {
            id: element.id,
            cname: element.saleid,
            date: element.sdate,
            reference: "Customer Receipt Invoice",
            total,
            type: element.type,
            duplicateout: rout,
            amountpaid: 0,
            rout,
            checked: 0,
            ledgerid: element.ledger,
            ledgercategory: element.ledgercategory,
            invoiceno: element.invoiceno,
          };
          recList.push(dataAry);
        });
      }

      if (salesDetails) {
        salesDetails.forEach((element) => {
          if (element.type == "sales") {
            let dataAry = {
              cname: element.cname,
              data: element.sdate,
              reference: "Invoice",
              total: element.total,
              type: "Sales Invoice",
              duplicateout: element.outstanding,
              amountpaid: 0,
              rout: element.outstanding,
              checked: 0,
              ledgerid: "",
              ledgercategory: "",
              invoiceno: element.invoiceno,
              id: element.id,
            };
            recList.push(dataAry);
          }

          // else {
          //   let dataAry = {
          //     cname: element.cname,
          //     data: element.sdate,
          //     reference: 'Credit Notes',
          //     total: -element.total,
          //     type: 'Sales Credit Notes',
          //     duplicateout: -element.outstanding,
          //     amountpaid: 0,
          //     rout: element.outstanding,
          //     checked: 0,
          //     ledgerid: '',
          //     ledgercategory: '',
          //     invoiceno: element.invoiceno,
          //     id: element.id,
          //   };
          //   recList.push(dataAry);
          // }
        });
      }
      response = {
        status: true,
        message: "List Customer Pay",
        data: recList,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async customerPayidList(id, adminid) {
    let response: CommonResponseDto;
    try {
      const salesDetails = await this.findAllByQuery({
        where: {
          customerid: id,
          adminid: adminid,
          type: "scredit",
          status: {
            [Op.ne]: [2],
          },
        },
        order: [["sdate", "DESC"]],
      });
      let recList = [];
      if (salesDetails) {
        salesDetails.forEach((element) => {
          let dataAry = {
            cname: element.cname,
            data: element.createdAt,
            reference: "Credit Notes",
            total: element.total,
            type: "Credit Notes",
            duplicateout: element.outstanding,
            amountpaid: element.total,
            rout: element.outstanding,
            checked: 0,
            ledgerid: "",
            ledgercategory: "",
            invoiceno: element.invoiceno,
            id: element.id,
          };
          recList.push(dataAry);
        });
      }
      response = {
        status: true,
        message: "List Customer Payid List",
        data: recList,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async customerRefundidList(id, adminid) {
    let response: CommonResponseDto;
    try {
      const salesDetails = await this.findAllByQuery({
        where: {
          customerid: id,
          adminid: adminid,
          status: {
            [Op.ne]: [2],
          },
        },
        order: [["sdate", "DESC"]],
      });
      let recList = [];
      if (salesDetails) {
        salesDetails.forEach((element) => {
          let dataAry = {
            cname: element.cname,
            data: element.createdAt,
            reference: element.reference,
            total: element.total,
            type: element.type, // sales invoice
            duplicateout: element.outstanding,
            amountpaid: element.total,
            checked: 0,
            ledgerid: "",
            ledgercategory: "",
            invoiceno: element.invoiceno,
            id: element.id,
            outstanding: element.outstanding,
          };
          recList.push(dataAry);
        });
      }
      response = {
        status: true,
        message: "List Customer Payid List",
        data: recList,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async addCustReceipt(req: any) {
    let response: CommonResponseDto;
    let status = "2";
    let used = "fullused";
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let data = {
            ledger: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            customer_name: req.customer_name,
            type: req.receipttype,
            status,
            usedamount: "0",
            credit: req.amount,
            debit: 0,
            booleantype: "5",
            usertype: "customer",
            ledgercategory: "1",
            adminid: req.adminid,
            userdate: req.userdate,
            discount_status: "0",
            outstanding: req.outstanding,
            saleid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
          };
          let returnid = await this.ledger_details.create(data, transaction);
          let cdata = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            customer_name: req.customer_name,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "5",
            baseid: returnid.id,
            usertype: "customer",
            adminid: req.adminid,
            ledger: "47",
            ledgercategory: "3",
            credit: req.amount,
            debit: 0,
            outstanding: req.outstanding,
            saleid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
          };

          const result = await this.ledger_details.create(cdata, transaction);
          const ledgerView = await this.account_master.findById(req.paidto);
          const totalamount = ledgerView.total;
          const totalamountplus = Number(totalamount) + Number(req.amount);

          const data1 = {
            total: totalamountplus,
            userdate: req.userdate,
          };

          const updateLedger = await this.account_master.update(
            req.paidto,
            data1,
            transaction
          );
          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.remainout == 0) {
                status = "2";
                used = "fullused";
              } else {
                status = "1";
                used = "partused";
              }
              if (element.type == "Sales Invoice") {
                const updateOutStanding = await this.update(element?.id, req);
                const data2 = {
                  cname: req.cname,
                  customer_name: req?.customer_name,
                  userid: req?.userid,
                  sdate: req?.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  type: "Customer Payment",
                  outstanding: req.outstanding,
                  used,
                  receiptid: element.id,
                  userdate: req.userdate,
                  saleid: element.id,
                  booleantype: "9",
                  usertype: "customer",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  totalamt: element.total,
                  ledgercategory: "1",
                  ledger: req.paidto,
                  debit: 0, //element.total,
                  credit: 0,
                  discount_status: "1",
                  transferid: returnid.id,
                  invoiceno: element.invoiceno,
                };
                const returnid2 = await this.ledger_details.create(
                  data2,
                  transaction
                );

                const cdata2 = {
                  cname: req.cname,
                  customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  type: "Customer Payment",
                  outstanding: req.outstanding,
                  used,
                  receiptid: element.id,
                  userdate: req.userdate,
                  saleid: element.id,
                  credit: 0, //element.total,
                  debit: 0,
                  baseid: returnid2.id,
                  booleantype: "9",
                  ledger: "47",
                  ledgercategory: "3",
                  discount_status: "1",
                  usertype: "customer",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: returnid.id,
                  invoiceno: element.invoiceno,
                };

                const resultD = await this.ledger_details.create(
                  cdata2,
                  transaction
                );

                const data3: any = {
                  outstanding: req.outstanding,
                  status,
                  userdate: req.userdate,
                };
                const resultSales = await this.updateData(
                  element.id,
                  data3,
                  transaction
                );
              } else if (element.type == "Sales Credit Notes") {
                const cdata = {
                  cname: req.cname,
                  customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  type: req.receipttype,
                  used,
                  receiptid: element.id,
                  userdate: req.userdate,
                  saleid: element.id,
                  booleantype: "26",
                  usertype: "customer",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  debit: -element.total,
                  credit: 0,
                  ledgercategory: "1",
                  ledger: req.paidto,
                  transferid: returnid.id,
                  invoiceno: element.invoiceno,
                };

                const returnid2 = await this.ledger_details.create(
                  cdata,
                  transaction
                );

                const ccdata2 = {
                  cname: req.cname,
                  customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: -element.amountpaid,
                  type: req.receipttype,
                  used,
                  receiptid: element.id,
                  userdate: req.userdate,
                  saleid: element.id,
                  credit: -element.amountpaid,
                  debit: 0,
                  baseid: returnid2.id,
                  booleantype: "26",
                  ledger: "47",
                  ledgercategory: "3",
                  discount_status: "1",
                  usertype: "customer",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: returnid.id,
                  invoiceno: element.invoiceno,
                };
                const returnid3 = await this.ledger_details.create(
                  ccdata2,
                  transaction
                );
                const cdata3: any = {
                  outstanding: -element.remainout,
                  status,
                  userdate: req.userdate,
                };

                const resultSales = await this.updateData(
                  element.id,
                  cdata3,
                  transaction
                );
              } else {
                let data5 = {
                  cname: req.cname,
                  customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: -element.amountpaid,
                  used,
                  type: req.receipttype,
                  receiptid: element.id,
                  userdate: req.userdate,
                  booleantype: "11",
                  usertype: "customer",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  debit: 0,
                  credit: -element.total,
                  ledgercategory: "1",
                  ledger: req.paidto,
                  transferid: returnid.id,
                };
                const returnid5 = await this.ledger_details.create(
                  data5,
                  transaction
                );

                let cdata5 = {
                  cname: req.cname,
                  customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: -element.amountpaid,
                  used,
                  type: req.receipttype,
                  receiptid: element.id,
                  userdate: req.userdate,
                  credit: 0,
                  debit: -element.amountpaid,
                  booleantype: "11",
                  baseid: returnid5.id,
                  ledger: "47",
                  ledgercategory: "3",
                  discount_status: "1",
                  usertype: "customer",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: returnid.id,
                };

                const result = await this.ledger_details.create(
                  cdata5,
                  transaction
                );
                const result5 = await this.ledger_details.findById(element.id);

                const usedamount =
                  (result5.usedamount ? result5.usedamount : 0) +
                  element.amountpaid;

                let data6: any = {
                  status,
                  checked: element.checked,
                  usedamount,
                  userdate: req.userdate,
                  used,
                  usertype: "customer",
                };

                const result6 = await this.ledger_details.update(
                  element.id,
                  data6
                );
              }

              if (count === req.item.length) {
                response = {
                  status: true,
                  message: "Customer Receipt Updated Successfully",
                  data: [],
                };
              }
            }
          } else {
            response = {
              status: true,
              message: "New Customer Receipt Created Successfully",
              data: [],
            };
          }
        }
      );
      let obj: any = {
        custReceipt: "custReceipt",
        cname: req.item[0].cname,
        customer_name: req.customer_name,

        inaddress: null,
        deladdress: null,
        userid: req.adminid,
        customerid: req.cname,
        issued: null,
        invoiceno: req.item[0].invoiceno,
        type: "bank",
        attachment: null,
        quotes: null,
        terms: null,
        reference: req.item[0].reference,
        paymentInfo: null,
        sdate: req.item[0].data,
        ldate: req.item[0].data,
        total: req.item[0].total,
        status: null,
        adminid: req.adminid,
        share: null,
        refid: null,
      };

      await this.create(obj);
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  // addOtherReceipt

  async addCustReceiptCash(req: any) {
    let response: CommonResponseDto;
    let status = "2";
    let used = "fullused";
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );

      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);

      let runningtotal = Number(balance) + Number(req.amount);

      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let data = {
            ledger: req.paidto,
            bankid: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            type: req.receipttype,
            status,
            usedamount: "0",
            credit: 0,
            debit: req.amount,
            booleantype: "5",
            usertype: "customer",
            ledgercategory: "1",
            discount_status: "0",
            adminid: req.adminid,
            userdate: req.userdate,
            saleid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          let returnid = await this.ledger_details.create(data, transaction);
          let cdata = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "5",
            baseid: returnid.id,
            usertype: "customer",
            adminid: req.adminid,
            ledger: "47",
            ledgercategory: "3",
            credit: req.amount,
            debit: 0,
            saleid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };

          const result = await this.ledger_details.create(cdata, transaction);
          const ledgerView = await this.account_master.findById(req.paidto);

          const totalamount = ledgerView.total;
          const totalamountplus = Number(totalamount) + Number(req.amount);

          const data1 = {
            total: totalamountplus,
            userdate: req.userdate,
          };

          const updateLedger = await this.account_master.update(
            req.paidto,
            data1,
            transaction
          );
          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.remainout == 0) {
                status = "2";
                used = "fullused";
              } else {
                status = "1";
                used = "partused";
              }
              if (element.type == "Sales Invoice") {
                // const data2 = {
                //   cname: req.cname,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: returnid.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Customer Payment',
                //   //type: receipttype,
                //   used,
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   saleid: element.id,
                //   booleantype: '9',
                //   usertype: 'customer',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   totalamt: element.total,
                //   ledgercategory: '1',
                //   ledger: req.paidto,
                //   debit: 0, //element.total,
                //   credit: 0,
                //   transferid: returnid.id,
                //   invoiceno: element.invoiceno,
                // };
                // const returnid2 = await this.ledger_details.create(
                //   data2,
                //   transaction,
                // );

                // const cdata2 = {
                //   cname: req.cname,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: returnid.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Customer Payment',
                //   //type: receipttype,
                //   used,
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   saleid: element.id,
                //   credit: 0, //element.total,
                //   debit: 0,
                //   baseid: returnid2.id,
                //   booleantype: '9',
                //   ledger: '47',
                //   ledgercategory: '3',
                //   discount_status: '1',
                //   usertype: 'customer',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: returnid.id,
                //   invoiceno: element.invoiceno,
                // };

                // const resultD = await this.ledger_details.create(
                //   cdata2,
                //   transaction,
                // );
                const data3: any = {
                  outstanding: element.remainout,
                  status,
                  userdate: req.userdate,
                };
                const resultSales = await this.updateData(
                  element.id,
                  data3,
                  transaction
                );
              } else if (element.type == "Sales Credit Notes") {
                // const cdata = {
                //   cname: req.cname,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: returnid.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: req.receipttype,
                //   used,
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   saleid: element.id,
                //   booleantype: '26',
                //   usertype: 'customer',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   debit: -element.total,
                //   credit: 0,
                //   ledgercategory: '1',
                //   ledger: req.paidto,
                //   transferid: returnid.id,
                //   invoiceno: element.invoiceno,
                // };

                // const returnid2 = await this.ledger_details.create(
                //   cdata,
                //   transaction,
                // );

                // const ccdata2 = {
                //   cname: req.cname,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: returnid.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: -element.amountpaid,
                //   type: req.receipttype,
                //   used,
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   saleid: element.id,
                //   credit: -element.amountpaid,
                //   debit: 0,
                //   baseid: returnid2.id,
                //   booleantype: '26',
                //   ledger: '47',
                //   ledgercategory: '3',
                //   discount_status: '1',
                //   usertype: 'customer',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: returnid.id,
                //   invoiceno: element.invoiceno,
                // };
                // const returnid3 = await this.ledger_details.create(
                //   ccdata2,
                //   transaction,
                // );
                const cdata3: any = {
                  outstanding: -element.remainout,
                  status,
                  userdate: req.userdate,
                };

                const resultSales = await this.updateData(
                  element.id,
                  cdata3,
                  transaction
                );
              } else {
                // let data5 = {
                //   cname: req.cname,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: returnid.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: -element.amountpaid,
                //   used,
                //   type: req.receipttype,
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   booleantype: '11',
                //   usertype: 'customer',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   debit: 0,
                //   credit: -element.total,
                //   ledgercategory: '1',
                //   ledger: req.paidto,
                //   transferid: returnid.id,
                // };
                // const returnid5 = await this.ledger_details.create(
                //   data5,
                //   transaction,
                // );

                // let cdata5 = {
                //   cname: req.cname,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: returnid.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: -element.amountpaid,
                //   used,
                //   type: req.receipttype,
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   credit: 0,
                //   debit: -element.amountpaid,
                //   booleantype: '11',
                //   baseid: returnid5.id,
                //   ledger: '47',
                //   ledgercategory: '3',
                //   discount_status: '1',
                //   usertype: 'customer',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: returnid.id,
                // };

                // const result = await this.ledger_details.create(
                //   cdata5,
                //   transaction,
                // );
                const result5 = await this.ledger_details.findById(element.id);

                const usedamount =
                  (result5.usedamount ? result5.usedamount : 0) +
                  element.amountpaid;

                let data6: any = {
                  status,
                  checked: element.checked,
                  usedamount,
                  userdate: req.userdate,
                  used,
                  usertype: "customer",
                };

                const result6 = await this.ledger_details.update(
                  element.id,
                  data6
                );
              }

              if (count === req.item.length) {
                response = {
                  status: true,
                  message: "Customer Receipt Updated Successfully",
                  data: [],
                };
              }
            }
          } else {
            response = {
              status: true,
              message: "New Customer Receipt Created Successfully",
              data: [],
            };
          }
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async sendEmail(req: any) {
    let response: CommonResponseDto;
    try {
      var params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${req.userid}/invoices/sales/${req.filename}`,
      };
      let _s3 = new S3(this.configService.awsConfig);

      const file = await _s3.getObject(params).promise();
      if (req.docUrl) {
        if (!file) {
          response = {
            status: false,
            message: "Email Sending Failed",
            data: null,
          };
        } else {
          let mailOptions = {
            to: !req.sendcopy
              ? [req.toaddress]
              : [req.toaddress, req.clientemail],
            cc: req.ccaddress ? [req.ccaddress] : "",
            subject: req.subject,
            attachments: [
              {
                filename: req.filename,
                path: req.docUrl,
                content: file.Body,
              },
            ],
          };

          let sendMail = await this.mailService.sendInvoiceMail(
            mailOptions,
            req.message,
            req.clientemail
          );
          if (!sendMail) {
            response = {
              status: false,
              message: "Failed to send Email",
              data: [],
            };
          } else {
            // const historyInfo = {
            //   userid: req.userid,
            //   details: `Emailed ${req.filename} to ${req.toaddress}`,
            //   message: "Email Sent Successfully",
            //   action: "Sending Email to Client",
            //   notification: "Email Sent Successfully",
            //   notify: true,
            //   page: "Email Invoice",
            // };
            // const history = await WriteHistory(historyInfo);

            response = {
              status: true,
              message: "Email Sent Successfully",
              data: {
                sendMail,
              },
            };
          }
        }
      } else {
        response = {
          status: false,
          message: "Upload Failed",
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async customerPayment(req: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let payDebitData = {
            total: req.amount,
            paidmethod: req.paidmethod,
            sdate: req.date,
            userid: req.userid,
            cname: req.customerid,
            ledger: req.bankid,
            discount_status: "0",
            ledgercategory: "1",
            saleid: req.sinvoice,
            type: "Customer Receipt",
            userdate: req.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: req.adminid,
            debit: req.amount,
            credit: 0,
            booleantype: "3",
            usertype: "customer",
            bankid: req.bankid,
            referenceid: req.sinvoice,
          };

          const payDebit = await this.ledger_details.create(
            payDebitData,
            transaction
          );

          let payCreditData = {
            total: req.amount,
            paidmethod: req.paidmethod,
            sdate: req.date,
            userid: req.userid,
            cname: req.customerid,
            ledger: "47",
            ledgercategory: "3",
            saleid: req.sinvoice,
            type: "Customer Receipt",
            userdate: req.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: req.adminid,
            debit: 0,
            credit: req.amount,
            booleantype: "3",
            discount_status: "1",
            usertype: "customer",
            transferid: payDebit.id,
            baseid: payDebit.id,
            referenceid: req.sinvoice,
            bankid: req.bankid,
          };

          const payCredit = await this.ledger_details.create(
            payCreditData,
            transaction
          );
          let salesData_2: any = {
            outstanding: Number(req.outstanding),
            status: req.status,
            userdate: req.date || req.userdate,
            paymentdate: req.date || req.userdate,
          };
          const updateSale = await this.updateOutstandingAmount(
            Number(req.sinvoice),
            salesData_2,
            transaction
          );

          await this.invoiceItemsService.updateSalePaymentDate(
            req.adminid,
            req.userid,
            req.sinvoice,
            req.date || req.userdate
          );

          let ledgerView = await this.account_master.findById(req.bankid);

          if (ledgerView) {
            let totalamount = ledgerView.total;
            let totalAmountPlus = Number(totalamount) + Number(req.amount);
            let salesData_3 = {
              total: totalAmountPlus,
              userdate: req.userdate,
              updatedAt: new Date(),
            };
            const updateLedger = await this.account_master.update(
              req.bankid,
              salesData_3,
              transaction
            );
            if (updateLedger) {
              response = {
                status: true,
                message: "Record Payment Succesfull",
                data: {
                  payDebit,
                  payCredit,
                  updateSale,
                  updateLedger,
                },
              };
            } else {
              response = {
                status: false,
                message: "Record Payment UnSuccesfull",
                data: null,
              };
            }
          } else {
            response = {
              status: false,
              message: "Invoice paid but failed to update bank",
              data: [],
            };
          }
        }
      );
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async stripeSuccess(req: any) {
    let response: any;
    let status = "2";
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        Number(req.bankid),
        Number(req.adminid)
      );

      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);

      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let data = {
            ledger: Number(req.bankid),
            bankid: Number(req.bankid),
            paidmethod: "Stripe",
            sdate: new Date(),
            reference: req.reference,
            total: req.amount,
            userid: Number(req.adminid),
            cname: Number(req.customerid),
            type: "Customer Receipt",
            status,
            usedamount: "0",
            credit: 0,
            debit: req.amount,
            booleantype: "5",
            usertype: "customer",
            ledgercategory: "1",
            discount_status: "0",
            adminid: Number(req.adminid),
            userdate: new Date(),
            saleid: Number(req.saleId),
            amount: Number(req.amount),
            totalamt: Number(req.amount),
            createdBy: Number(req.adminid),
            companyid: Number(req.companyid),
          };
          let returnid = await this.ledger_details.create(data, transaction);
          let cdata = {
            paidmethod: "Stripe",
            sdate: new Date(),
            reference: req.reference,
            total: Number(req.amount),
            userid: Number(req.adminid),
            cname: Number(req.customerid),
            type: "Customer Receipt",
            status: "2",
            userdate: new Date(),
            discount_status: "1",
            booleantype: "5",
            baseid: returnid.id,
            usertype: "customer",
            adminid: Number(req.adminid),
            ledger: "47",
            ledgercategory: "3",
            credit: req.amount,
            debit: 0,
            saleid: Number(req.saleId),
            amount: Number(req.amount),
            totalamt: Number(req.amount),
            createdBy: Number(req.adminid),
            companyid: Number(req.companyid),
          };

          const result = await this.ledger_details.create(cdata, transaction);
          const ledgerView = await this.account_master.findById(
            Number(req.bankid)
          );

          const totalamount = ledgerView.total;
          const totalamountplus = Number(totalamount) + Number(req.amount);

          const data1 = {
            total: totalamountplus,
            userdate: req.userdate,
          };

          const updateLedger = await this.account_master.update(
            Number(req.bankid),
            data1,
            transaction
          );

          status = "2";

          const data3: any = {
            outstanding: 0,
            status,
            userdate: new Date(),
          };
          const resultSales = await this.updateData(
            Number(req.saleId),
            data3,
            transaction
          );
          response = `
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
            <p class="message">Payment Successful!</p>
          </div>
          </body>
          </html>          
        `;
        }
      );
    } catch (error) {
      console.log(error);
      response = `
      <html>
      <head>
        <title>Payment Error</title>
      </head>
      <body>
        <h1>Payment Failed</h1>
        <p>Oops! Something went wrong on the server.</p>
        <!-- Add any additional HTML content as needed -->
      </body>
      </html>
    `;
    }
    return response;
  }

  async stripeFail() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;600&display=swap" rel="stylesheet">
    <title>Payment Result</title>
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
      
      .exclamation {
        width: 20vw; 
        height: 20vw;
        max-width: 80px; 
        max-height: 80px;
        border: 2px solid #FF5733; /* Changed border color to orange */
        border-radius: 50%;
        display: inline-block;
        position: relative;
        animation: exclamation 0.6s; /* Changed animation name */
        background-color: #FF5733; /* Changed background color to orange */
      }
      
      .exclamation::before {
        content: '!'; 
        font-size: 4em; 
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); 
        color: #ffffff; /* Changed color to white */
      }
      
      .message {
        font-size: 3vw;
        margin-top: 20px;
        font-weight:600;
        color: #333;
        font-family: 'Roboto', sans-serif; 
      }
      
      @keyframes exclamation { /* Changed animation name */
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
        .exclamation {
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
      <div class="exclamation"></div>
      <p class="message">Payment Failed!</p>
    </div>
    </body>
    </html>    
    `;
  }

  async addOtherReceipt(req: any) {
    let response: CommonResponseDto;
    try {
      let ledgerid = req?.ledger ? req?.ledger : null;
      let contactId = req.sname ? req.sname : null;
      let contactDetails;
      let ledgerCat;
      let ledgerDetails;

      if (ledgerid !== null) {
        const ledger = await this.account_master.findById(ledgerid);
        ledgerDetails = ledger;
        ledgerCat = ledger?.category;
      }
      if (contactId !== null) {
        contactDetails = await this.ContactMasterService.getOneById(contactId);
      }
      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );
      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);

      let runningtotal = Number(balance) + Number(req.amount);

      let result1 = await this.account_master.findById(req.paidto);
      let totalamount = result1.total;
      let totalamountplus = Number(totalamount) + Number(req.amount);
      let data1 = {
        total: totalamountplus,
        userdate: req.userdate,
      };

      let updateLedger = await result1.update(data1);

      if (updateLedger) {
        let otherDataObj = {
          adminId: req.adminid,
          companyId: req.companyid,
          total: req.amount,
          cname: req.sname,
          ledgerId: req?.ledger,
          bankid: req.paidto,
          reference: req.reference,
          createdBy: req.createdBy,
          date: req.sdate,
          type: "Other Receipt",
        };

        const otherData = await this.otherMasterService.create(otherDataObj);

        for (var i = 0; i < req.item.length; i++) {
          let element = req.item[i];
          let odata = {
            idescription: element.details,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            adminid: req.adminid,
            sdate: req.sdate,
            userdate: req.userdate,
            cname: req.cname,
            customer_name: contactDetails?.name || ledgerDetails?.laccount,
            ledger: req.paidto,
            bankid: req.paidto,
            type: req.receipttype,
            otherid: otherData.data.id,
            credit: 0,
            debit: req.amount,
            booleantype: req.booleantype,
            discount_status: "0",
            usertype: "customer",
            ledgercategory: "3",
            amount: req.amount || element.amount,
            vat: element.vat,
            vatamt: element.vatamt,
            includevat: element.includevat,
            incomeTax: element.vat,
            incomeTaxAmount: element.vatamt,
            outstanding: req.outstanding,
            totalamt: req.amount,
            paidmethod: req.paidmethod,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const insertDetails1 = await this.ledger_details.create(odata);
          let odata2 = {
            idescription: element.details,
            reference: req.reference,
            // reference: element.details,
            total: req.amount,
            userid: req.userid,
            adminid: req.adminid,
            sdate: req.sdate,
            userdate: req.userdate,
            cname: req.cname,
            customer_name: contactDetails?.name || ledgerDetails?.laccount,
            type: req.receipttype,
            credit: req.amount,
            debit: 0,
            booleantype: req.booleantype,
            otherid: otherData.data.id,
            discount_status: "1",
            usertype: "customer",
            ledger: req.ledger || 51, //47,
            ledgercategory: ledgerCat || "4", //'3',
            amount: req.amount,
            vat: element.vat,
            vatamt: element.vatamt,
            includevat: element.includevat,
            incomeTax: element.vat,
            incomeTaxAmount: element.vatamt,
            baseid: insertDetails1.id,
            outstanding: req.outstanding,
            totalamt: req.amount,
            paidmethod: req.paidmethod,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const insertDetails2 = await this.ledger_details.create(odata2);
          if (element.vatamt > 0) {
            let taxData = {
              idescription: element.details,
              reference: req.reference,
              // reference: element.details,
              sdate: req.sdate,
              cname: req.cname,
              customer_name: contactDetails?.name || ledgerDetails?.laccount,
              total: req.amount,
              userid: req.userid,
              adminid: req.adminid,
              ledger: element.ledger.id,
              ledgercategory: ledgerCat,
              userdate: req.userdate,
              type: req.receipttype,
              incomeTax: element.vat,
              incomeTaxAmount: element.vatamt,
              totalamount: element.total,
              description: element.details,
              booleantype: req.booleantype,
              otherid: otherData.data.id,
              discount_status: "0",
              usertype: "customer",
              used: "incometax",
              credit: 0,
              debit: req.amount,
              outstanding: req.outstanding,
              totalamt: req.amount,
              paidmethod: req.paidmethod,
              running_total: runningtotal,
              createdBy: req.createdBy,
              companyid: req.companyid,
            };
            const taxInsert1 = await this.ledger_details.create(taxData);
            let taxData2 = {
              idescription: element.details,
              // reference: element.details,
              reference: req.reference,
              sdate: req.sdate,
              cname: req.cname,
              customer_name: contactDetails?.name || ledgerDetails?.laccount,
              total: element.amount,
              userid: req.userid,
              adminid: req.adminid,
              ledger: "44",
              // ledgercategory: '4',
              ledgercategory: ledgerCat,
              userdate: req.userdate,
              type: req.receipttype,
              incomeTax: element.vat,
              incomeTaxAmount: element.vatamt,
              totalamount: element.total,
              otherid: otherData.data.id,
              description: element.details,
              booleantype: req.booleantype,
              discount_status: "1",
              usertype: "customer",
              used: "incometax",
              debit: req.amount,
              credit: element.vatamt,
              baseid: taxInsert1.id,
              outstanding: req.outstanding,
              totalamt: req.amount,
              paidmethod: req.paidmethod,
              running_total: runningtotal,
              createdBy: req.createdBy,
              companyid: req.companyid,
            };
            const taxInsert2 = await this.ledger_details.create(taxData2);
          }
          if (i == req.item.length - 1) {
            const updateLedger = await this.account_master.update(result1.id, {
              userdate: new Date(),
              total: totalamountplus,
            });
            response = {
              status: true,
              data: insertDetails1,
              message: "Other Receipt Added Successfully",
            };
          }
        }
      } else {
        response = {
          status: false,
          data: null,
          message: "Failed to Update the Bank",
        };
      }
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async cancelInvoice(id: number) {
    const saleInv = await this.findById(id);
    saleInv.status = 10;
    let saveInvoice = await saleInv.save();
    return saveInvoice;
  }

  async findSalesInvoicemonth(
    id: any,
    stockid: any,
    type: any,
    targetMonth: string
  ) {
    try {
      const data: any = await this.invoiceItemsService.findAllByQuery({
        where: {
          adminid: id,
          idescription: stockid,
          type: "Sales Invoice",
        },
        order: [["id", "DESC"]],
      });

      const value: any = await this.getDataByMonths(data, targetMonth);

      if (value.error) {
        return {
          status: false,
          message: value.error,
          data: null,
        };
      }

      return {
        status: true,
        message: "Sales Invoice List",
        data: value.result,
      };
    } catch (error) {
      return {
        status: false,
        message: "An error occurred while fetching sales invoices.",
        data: null,
      };
    }
  }

  async getDataByMonths(data: any, targetMonth: string) {
    try {
      const result = {};
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      for (let i = 0; i < data.length; i++) {
        const invoiceDate = new Date(data[i].sdate);
        const monthName = monthNames[invoiceDate.getMonth()];

        if (monthName !== targetMonth) {
          continue;
        }

        if (!result[monthName]) {
          result[monthName] = [];
        }

        result[monthName].push(data[i]);
      }

      if (!result[targetMonth]) {
        return { error: `Data not found for month ${targetMonth}` };
      }

      return { result };
    } catch (error) {
      return { error: "An error occurred while processing data by months." };
    }
  }

  async findSalesInvoice(id: any, stockid: any, type: any) {
    // const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
    //   where: {
    //     adminid: id,
    //     stockid: stockid,
    //     type: 'sales',
    //   },
    //   // where: { adminid: id, type: type, stockid: stockid },
    //   order: [['id', 'DESC']],
    // });
    // let res = data.map((tmp) => new SalesInvoiceDto(tmp));
    const data: any = await this.invoiceItemsService.findAllByQuery({
      where: {
        adminid: id,
        idescription: stockid,
        type: "Sales Invoice",
      },
      order: [["id", "DESC"]],
      // raw: true,
    });
    let value: any = await this.getDataByMonth(data);
    return {
      status: true,
      message: "Sales Invoice List",
      data: value,
    };
  }

  async getDataByMonth(data: any) {
    const result = {};
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    for (let i = 0; i < data.length; i++) {
      const invoiceDate = new Date(data[i].sdate);
      const monthName = monthNames[invoiceDate.getMonth()];
      if (!result[monthName]) {
        result[monthName] = [];
      }
      result[monthName].push(data[i]);
    }
    return result;
  }

  async addCustRefund(req: any) {
    let response: CommonResponseDto;
    let status = "2";
    let used = "fullused";
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );
      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);
      let runningtotal = Number(balance) - Number(req.amount);
      const ledgerData = await this.account_master.findById(req.paidto);

      const totalamount = totalAvailableBalance.data.bankDetails.total;
      let totalamountminus = Number(totalamount) - Number(req.amount);
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let data = {
            //ledger: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.cname,
            type: req.receipttype,
            saleid: req.item[0].id,
            status,
            usedamount: "0",
            // credit: 0,
            // debit: req.amount,
            booleantype: "5",
            usertype: "customer",
            ledgercategory: "1",
            adminid: req.adminid,
            userdate: req.userdate,
            totalamt: req.item[0].total,
            discount_status: "0",
            outstanding: req.item[0].remainout,
            running_total: runningtotal,
          };
          let returnid = await this.ledger_details.create(data, transaction);
          let cdata = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.cname,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "5",
            baseid: returnid.id,
            usertype: "customer",
            adminid: req.adminid,
            totalamt: req.item[0].total,
            //ledger: '47',
            ledgercategory: "3",
            // credit: req.amount,
            saleid: req.item[0].id,
            // debit: 0,
            outstanding: req.item[0].remainout,
            running_total: runningtotal,
          };

          const result = await this.ledger_details.create(cdata, transaction);
          const ledgerView = await this.account_master.findById(req.paidto);

          const totalamount = ledgerView.total;
          const totalamountplus = Number(totalamount) + Number(req.amount);

          const data1 = {
            total: totalamountminus,
            userdate: req.userdate,
          };

          const updateLedger = await this.account_master.update(
            req.paidto,
            data1,
            transaction
          );

          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.remainout == 0) {
                status = "2";
                used = "fullused";
              } else {
                status = "1";
                used = "partused";
              }
              if (element.type == "Credit Notes") {
                const data2 = {
                  cname: req.cname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  type: "Customer Refund",
                  //type: receipttype,
                  used,
                  receiptid: element.id,
                  userdate: req.userdate,
                  saleid: element.id,
                  booleantype: "9",
                  usertype: "customer",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  totalamt: element.total,
                  ledgercategory: "1",
                  ledger: req.paidto,
                  debit: element.amountpaid, //element.total,
                  credit: 0,
                  transferid: returnid.id,
                  invoiceno: element.invoiceno,
                  outstanding: element.remainout,
                  running_total: runningtotal,
                };
                const returnid2 = await this.ledger_details.create(
                  data2,
                  transaction
                );

                const cdata2 = {
                  cname: req.cname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: returnid.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  type: "Customer Refund",
                  //type: receipttype,
                  used,
                  receiptid: element.id,
                  userdate: req.userdate,
                  saleid: element.id,
                  credit: element.amountpaid, //element.total,
                  debit: 0,
                  baseid: returnid2.id,
                  booleantype: "9",
                  ledger: "47",
                  ledgercategory: "3",
                  discount_status: "1",
                  usertype: "customer",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: returnid.id,
                  invoiceno: element.invoiceno,
                  outstanding: element.remainout,
                  running_total: runningtotal,
                };

                const resultD = await this.ledger_details.create(
                  cdata2,
                  transaction
                );

                const data3: any = {
                  outstanding: element.remainout,
                  status,
                  userdate: req.userdate,
                };
                const resultSales = await this.updateData(
                  element.id,
                  data3,
                  transaction
                );
              }
              if (count === req.item.length) {
                response = {
                  status: true,
                  message: "Customer Receipt Updated Successfully",
                  data: [],
                };
              }
            }
          } else {
            response = {
              status: true,
              message: "New Customer Receipt Created Successfully",
              data: [],
            };
          }
        }
      );
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async findAllListBySupplierByRange(
    adminid: any,
    cname: any,
    ldate: any,
    sdate: any
  ) {
    const startDate = new Date(sdate);
    const endDate = new Date(ldate);
    startDate.setDate(startDate.getDate() + 1);
    const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
      where: {
        adminid: Number(adminid),
        customerid: Number(cname),
        created_at: {
          [Op.lte]: startDate,
          [Op.gte]: endDate,
        },
      },
    });
    return data.map((tmp) => new SalesInvoiceDto(tmp));
  }

  async findScreditDataByType(cnameId: number, id: number) {
    const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
      where: {
        userid: id,
        customerid: cnameId,
        type: "scredit",
      },
    });

    // const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({});

    return data.map((tmp) => new SalesInvoiceDto(tmp));
  }

  async addCustRefundCash(req: any) {
    let response: CommonResponseDto;
    let status = "2";
    let used = "fullused";
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let data = {
            ledger: req.paidto,
            bankid: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            type: req.receipttype,
            status,
            usedamount: "0",
            credit: req.amount,
            debit: 0,
            booleantype: "5",
            usertype: "customer",
            ledgercategory: "1",
            adminid: req.adminid,
            userdate: req.userdate,
            discount_status: "0",
            saleid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          let returnid = await this.ledger_details.create(data, transaction);
          let cdata = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "5",
            baseid: returnid.id,
            usertype: "customer",
            adminid: req.adminid,
            ledger: "47",
            ledgercategory: "1",
            credit: 0,
            debit: req.amount,
            saleid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };

          const result = await this.ledger_details.create(cdata, transaction);
          const ledgerView = await this.account_master.findById(req.paidto);

          const totalamount = ledgerView.total;
          const totalamountplus = Number(totalamount) - Number(req.amount);

          const data1 = {
            total: totalamountplus,
            userdate: req.userdate,
          };

          const updateLedger = await this.account_master.update(
            req.paidto,
            data1,
            transaction
          );
          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.remainout == 0) {
                status = "2";
                used = "fullused";
              } else {
                status = "1";
                used = "partused";
              }
              if (element.type == "Credit Notes") {
                const data3: any = {
                  outstanding: element.remainout,
                  status,
                  userdate: req.userdate,
                };
                const resultSales = await this.updateData(
                  element.id,
                  data3,
                  transaction
                );
              }
              if (count === req.item.length) {
                response = {
                  status: true,
                  message: "Customer Receipt Updated Successfully",
                  data: [],
                };
              }
            }
          } else {
            response = {
              status: true,
              message: "New Customer Receipt Created Successfully",
              data: [],
            };
          }
        }
      );
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async getSalesByInvoiceNumber(invoiceno: string) {
    let response: CommonResponseDto;
    try {
      const salesDetails = await this.findAllByQuery({
        where: {
          invoiceno,
        },
      });
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: salesDetails,
      };
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }

  ////////////---------FIND-BY-PAIDTYPE----------//////////////
  async findBypaidTypes(id: number, type: any) {
    try {
      const whereClause = { adminid: id };
      if (type && type !== "both") {
        whereClause["status"] = type;
      }
      const data = await this.SalesInvoiceRepository.findAll({
        where: whereClause,
      });
      return new CommonResponseDto(data, true, "Successfully found");
    } catch (err) {
      console.log(err);
    }
  }

  //////////----------END-----------//////////////

  ////////////---------FIND-BY-SEARCH----------//////////////
  async findInvoiceBySearch(id: number, type: any) {
    try {
      const data = await this.SalesInvoiceRepository.findAll({
        where: {
          adminid: { [Op.eq]: id },
          invoiceno: { [Op.like]: `%${type}%` },
        },
      });
      return new CommonResponseDto(data, true, "Successfully found");
    } catch (err) {
      console.log(err);
    }
  }

  async stafCreateSale(createSalesInvoiceDto: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const inv = new SaleInvoice();
          inv.cname = createSalesInvoiceDto.cname;
          inv.seriesNo = createSalesInvoiceDto.seriesNo;
          inv.inaddress = createSalesInvoiceDto.inaddress;
          inv.deladdress = createSalesInvoiceDto.deladdress;
          inv.userid = createSalesInvoiceDto.userid;
          inv.customerid = createSalesInvoiceDto.customerid;
          inv.issued = createSalesInvoiceDto.issued;
          inv.invoiceno = createSalesInvoiceDto.invoiceno;
          inv.type = "sales";
          inv.attachment = createSalesInvoiceDto.attachment;
          inv.quotes = createSalesInvoiceDto.quotes;
          inv.terms = createSalesInvoiceDto.terms;
          inv.reference = createSalesInvoiceDto.reference;
          inv.roundOff = createSalesInvoiceDto?.roundOff || 0;
          inv.total_vat = createSalesInvoiceDto?.total_vat;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value;
          inv.userdate = createSalesInvoiceDto.userdate;
          inv.paymentdate = null;
          inv.sdate = createSalesInvoiceDto.sdate;
          inv.ldate = createSalesInvoiceDto.ldate;
          inv.total = createSalesInvoiceDto.total;
          inv.outstanding = createSalesInvoiceDto.outstanding;
          inv.status = 0;
          inv.adminid = createSalesInvoiceDto.adminid;
          inv.share = 0;
          inv.refid = 0;
          inv.sales_ref = "";
          inv.roundOff = createSalesInvoiceDto.roundOff || 0;
          inv.total_vat = createSalesInvoiceDto?.total_vat;
          inv.overall_discount = createSalesInvoiceDto?.overall_discount;
          inv.taxable_value = createSalesInvoiceDto?.taxable_value;
          inv.salesType = createSalesInvoiceDto.salesType;
          inv.salestock = createSalesInvoiceDto?.columns[0]?.quantity;
          inv.stockid = createSalesInvoiceDto?.columns[0]?.id;
          inv.ledger = 1;
          inv.createdBy = createSalesInvoiceDto.createdBy;
          inv.companyid = createSalesInvoiceDto.companyid;
          inv.usertype = createSalesInvoiceDto.usertype;
          // inv.overall_parcel_charge = createSalesInvoiceDto.overall_parcel_charge;
          // inv.order_id = createSalesInvoiceDto?.orderId;
          if (createSalesInvoiceDto.creditCustomerid) {
            await this.retailCustomerService.updateLoyaltyPoint(
              createSalesInvoiceDto.creditCustomerid,
              createSalesInvoiceDto.adminid,
              createSalesInvoiceDto.total,
              createSalesInvoiceDto.companyid
            );
          }
          let invoice: any = await inv.save();

          if (createSalesInvoiceDto.credit) {
            let obj = {
              outstanding: createSalesInvoiceDto.outstanding,
              type: createSalesInvoiceDto.credit,
            };
            await this.retailCustomerService.updateOutstanding(
              createSalesInvoiceDto.creditCustomerid,
              createSalesInvoiceDto.adminid,
              obj
            );
          }

          if (createSalesInvoiceDto?.order_id) {
            let obj = {
              id: createSalesInvoiceDto?.order_id,
              orderStatus: "billed",
            };
            await this.orderMasterService.updateOrderByStatus(
              obj,
              createSalesInvoiceDto?.adminid
            );
          }

          response = await this.stafSaveInvoiceToledger(
            invoice,
            createSalesInvoiceDto,
            transaction
          );

          if (createSalesInvoiceDto.isStripe) {
            let dataObj = {
              adminid: createSalesInvoiceDto.adminid,
              stripeId: createSalesInvoiceDto.stripeId,
              invoiceId: invoice.id,
              status: createSalesInvoiceDto.status,
              companyid: createSalesInvoiceDto.companyid,
              amount: createSalesInvoiceDto.total,
              invoiceNo: createSalesInvoiceDto.invoiceno,
              date: new Date(),
              staffTransactionId: response.data.staffTransaction.id,
            };
            let res = await this.stripeLogService.create(dataObj);
          }
        }
      );
    } catch (error) {
      console.log("catch | error : ", error);
      response = {
        status: false,
        message:
          "Server Error: Failed to create sales invoice!! Please try again later",
        data: null,
      };
    }
    for (let i = 0; i < createSalesInvoiceDto?.columns?.length; i++) {
      if (createSalesInvoiceDto.columns[i].product.itemtype != "Service") {
        let stockMail = await this.product_service.findStockSendMail(
          createSalesInvoiceDto.columns[i].id,
          createSalesInvoiceDto.email
        );
      }
    }
    return response;
  }

  async stafSaveInvoiceToledger(
    createInvoice: any,
    createSalesInvoiceDto: any,
    transaction: any
  ) {
    let response: CommonResponseDto = {
      data: null,
      status: false,
      message: null,
    };
    try {
      let totalVat = 0;
      let totalNet = 0;
      let totalDiscount = 0;
      let uniqueVat = [];

      const ledgerAcc: any = createSalesInvoiceDto.ledger;

      const lineitems =
        await this.invoiceItemsHelperService.createInvoiceLineItem(
          createInvoice,
          createSalesInvoiceDto
        );
      const saveInvoiceItem = await this.invoiceItemsService.createInvoiceItems(
        lineitems
      );
      let isService = false;

      for (let i = 0; i < createSalesInvoiceDto.columns.length; i++) {
        let element = createSalesInvoiceDto.columns[i];
        const costprice = element.costprice;
        const quantity = element.quantity;
        if (element.product?.itemtype === "Service") {
          isService = true;
        }

        let totalamount = Number(element.costprice) * Number(element.quantity);
        const discount = element.discountamt ? Number(element.discountamt) : 0;
        if (discount && discount > 0) {
          totalamount = totalamount - discount;
        }
        const incomeTaxAmount = Number(element.vatamount);
        if (element.includevat) {
          totalamount = totalamount - incomeTaxAmount;
        }
        totalVat += incomeTaxAmount;
        totalNet += totalamount;

        totalDiscount += Number(element.discountamt);
        uniqueVat.push(element.incomeTax);
        if (
          element.product?.itemtype === "Stock" ||
          element.product?.itemtype === "Nonstock"
        ) {
          const stockData = await this.product_service.findOne(
            element.product.id
          );
          let existingStock = stockData.data.stock;
          let inStock = Number(existingStock) - Number(quantity);
          if (createSalesInvoiceDto.type === "sales") {
            inStock = Number(existingStock) - Number(quantity);
          } else if (createSalesInvoiceDto.type === "scredit") {
            inStock = Number(existingStock) + Number(quantity);
          }
          const updateStock = await this.product_service.updateStock(
            element.product.id,
            {
              quantity: null,
              stock: inStock,
            },
            transaction
          );
        }
      }

      if (isService === true) {
        let salesCreditData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: ledgerAcc?.id,
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: ledgerAcc?.category,
          companyid: createSalesInvoiceDto.companyid,
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          credit:
            createSalesInvoiceDto.type == "sales"
              ? createSalesInvoiceDto.total
              : 0,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : createSalesInvoiceDto.total,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          baseid: null,
        };
        const salesCredit = await this.ledger_details.create(
          salesCreditData,
          transaction
        );
        let salesDebitData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: "47",
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: "3",
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          totalamount: totalNet,
          credit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : createSalesInvoiceDto.total,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? createSalesInvoiceDto.total
              : 0,
          booleantype: "1",
          usertype: "customer",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: salesCredit.id,
          companyid: createSalesInvoiceDto.companyid,
        };
        if (Number(createSalesInvoiceDto.roundOff) !== Number(0)) {
          let roundCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "5",
            cname: createSalesInvoiceDto.customerid,
            total: totalNet,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: ledgerAcc?.category,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit:
              createSalesInvoiceDto.roundOff > 0
                ? createSalesInvoiceDto.roundOff
                : 0,
            debit:
              createSalesInvoiceDto.roundOff > 0
                ? 0
                : createSalesInvoiceDto.roundOff,
            booleantype: "1",
            usertype: "customer",
            used: "group",
            invoiceno: createInvoice.invoiceno,
            baseid: null,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
          };
          const roundCredit = await this.ledger_details.create(
            roundCreditData,
            transaction
          );
          let roundDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: totalNet,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            totalamount: totalNet,
            credit:
              createSalesInvoiceDto.roundOff > 0
                ? 0
                : createSalesInvoiceDto.roundOff,
            debit:
              createSalesInvoiceDto.roundOff > 0
                ? createSalesInvoiceDto.roundOff
                : 0,
            booleantype: "1",
            usertype: "customer",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: roundCreditData.id,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
          };
          const roundDebit = await this.ledger_details.create(
            roundDebitData,
            transaction
          );
        }
        const salesDebit = await this.ledger_details.create(
          salesDebitData,
          transaction
        );
      } else {
        let salesCreditData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: ledgerAcc?.id,
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: ledgerAcc?.category,
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          credit:
            createSalesInvoiceDto.type == "sales"
              ? totalNet + totalDiscount
              : 0,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : totalNet + totalDiscount,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          baseid: null,
          companyid: createSalesInvoiceDto.companyid,
          // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
        };
        const salesCredit = await this.ledger_details.create(
          salesCreditData,
          transaction
        );
        let salesDebitData: any = {
          saleid: createInvoice.id,
          sdate: createSalesInvoiceDto.sdate,
          ldate: createSalesInvoiceDto.ldate,
          ledger: "47",
          cname: createSalesInvoiceDto.customerid,
          total: totalNet,
          userid: createSalesInvoiceDto.userid,
          ledgercategory: "3",
          adminid: createSalesInvoiceDto.adminid || 0,
          userdate: createSalesInvoiceDto.userdate,
          type:
            createSalesInvoiceDto.type == "sales"
              ? "Sales Invoice"
              : "Sales Credit Notes",
          totalamount: totalNet,
          credit:
            createSalesInvoiceDto.type == "sales"
              ? 0
              : totalNet + totalDiscount,
          debit:
            createSalesInvoiceDto.type == "sales"
              ? totalNet + totalDiscount
              : 0,
          booleantype: "1",
          usertype: "customer",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: salesCredit.id,
          companyid: createSalesInvoiceDto.companyid,
          // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
        };
        const salesDebit = await this.ledger_details.create(
          salesDebitData,
          transaction
        );

        if (totalDiscount > 0) {
          let discountDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: 13,
            cname: createSalesInvoiceDto.customerid,
            total: -totalDiscount,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: 13,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit: createSalesInvoiceDto.type == "sales" ? 0 : totalDiscount,
            debit: createSalesInvoiceDto.type == "sales" ? totalDiscount : 0,
            booleantype: createSalesInvoiceDto.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "discount",
            invoiceno: createSalesInvoiceDto.invoiceno,
            discount_status: "1",
            baseid: null,
            companyid: createSalesInvoiceDto.companyid,
            // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
          };
          const discountDebit = await this.ledger_details.create(
            discountDebitData,
            transaction
          );
          let discountCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: -totalDiscount,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            debit: createInvoice.type == "sales" ? 0 : totalDiscount,
            credit: createInvoice.type == "sales" ? totalDiscount : 0,
            booleantype: createInvoice.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "discount",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: discountDebit.id,
            companyid: createSalesInvoiceDto.companyid,
            // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
          };
          const discountCredit = await this.ledger_details.create(
            discountCreditData,
            transaction
          );
        }
        if (totalVat > 0) {
          let taxDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: 54,
            cname: createSalesInvoiceDto.customerid,
            total: totalVat,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: 4,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit: createInvoice.type == "sales" ? totalVat : 0,
            debit: createInvoice.type == "sales" ? 0 : totalVat,
            booleantype: createInvoice.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "incometax",
            discount_status: "0",
            invoiceno: createInvoice.invoiceno,
            baseid: null,
            companyid: createSalesInvoiceDto.companyid,
            // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
          };
          const taxDebit = await this.ledger_details.create(
            taxDebitData,
            transaction
          );
          let taxCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: totalVat,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createInvoice.adminid || 0,
            userdate: createInvoice.userdate,
            type:
              createInvoice.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit: createInvoice.type == "sales" ? 0 : totalVat,
            debit: createInvoice.type == "sales" ? totalVat : 0,
            booleantype: createInvoice.type == "sales" ? "1" : "24",
            usertype: "customer",
            used: "incometax",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: taxDebit.id,
            companyid: createSalesInvoiceDto.companyid,
            // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
          };
          const taxCredit = await this.ledger_details.create(
            taxCreditData,
            transaction
          );
          // update vat ledger total account master
          // const vatLedger = await this.account_master.findAllByQuery({
          //   attributes: ["id", "total"],
          //   where: {
          //     nominalcode: 2202,
          //     userid: createSalesInvoiceDto.userid,
          //   },
          // });
          // if (vatLedger) {
          //   let total = createInvoice.type == "sales" ? totalVat : -totalVat;
          //   let accountData = {
          //     total: Number(vatLedger[0]?.total) + Number(total),
          //   };
          //   const updateVatLedger = await this.account_master.update(
          //     vatLedger[0]?.id,
          //     accountData,
          //     transaction
          //   );
          // }
        }
        if (Number(createSalesInvoiceDto.roundOff) !== Number(0)) {
          let roundCreditData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "5",
            cname: createSalesInvoiceDto.customerid,
            total: totalNet,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: ledgerAcc?.category,
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            credit:
              createSalesInvoiceDto.roundOff > 0
                ? createSalesInvoiceDto.roundOff
                : 0,
            debit:
              createSalesInvoiceDto.roundOff > 0
                ? 0
                : createSalesInvoiceDto.roundOff,
            booleantype: "1",
            usertype: "customer",
            used: "group",
            invoiceno: createInvoice.invoiceno,
            baseid: null,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
          };
          const roundCredit = await this.ledger_details.create(
            roundCreditData,
            transaction
          );
          let roundDebitData: any = {
            saleid: createInvoice.id,
            sdate: createSalesInvoiceDto.sdate,
            ldate: createSalesInvoiceDto.ldate,
            ledger: "47",
            cname: createSalesInvoiceDto.customerid,
            total: totalNet,
            userid: createSalesInvoiceDto.userid,
            ledgercategory: "3",
            adminid: createSalesInvoiceDto.adminid || 0,
            userdate: createSalesInvoiceDto.userdate,
            type:
              createSalesInvoiceDto.type == "sales"
                ? "Sales Invoice"
                : "Sales Credit Notes",
            totalamount: totalNet,
            credit:
              createSalesInvoiceDto.roundOff > 0
                ? 0
                : createSalesInvoiceDto.roundOff,
            debit:
              createSalesInvoiceDto.roundOff > 0
                ? createSalesInvoiceDto.roundOff
                : 0,
            booleantype: "1",
            usertype: "customer",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: roundCreditData.id,
            createdBy: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
          };
          const roundDebit = await this.ledger_details.create(
            roundDebitData,
            transaction
          );
        }
      }

      if (createInvoice) {
        if (createSalesInvoiceDto.paymentInfo) {
          if (createSalesInvoiceDto.redeem) {
            let retaileCustumerRedeemObj = {
              adminid: createInvoice.adminid,
              ledger: "6",
              ledgercategory: "12",
              type: "redeem",
              usertype: "staf",
              paid_amount: createSalesInvoiceDto.redeem,
              saleid: createInvoice.id,
              invoiceno: createSalesInvoiceDto.invoiceno,
              saletype: "redeem",
              customerid: createSalesInvoiceDto.creditCustomerid,
              staffid: createSalesInvoiceDto.createdBy,
              companyid: createSalesInvoiceDto.companyid,
              status: createSalesInvoiceDto.isStripe ? "closed" : "open",
              total: createInvoice.total,
              paid_status: createSalesInvoiceDto.paid_status,
              counterid: createSalesInvoiceDto.counterid,
              shiftid: createSalesInvoiceDto.shiftid,
              sdate: createSalesInvoiceDto.sdate,
              // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
            };
            let retaileCustumerRedeem =
              await this.StaffTransactionsService.create(
                retaileCustumerRedeemObj
              );
            await this.retailCustomerService.climePointUse({
              id: createSalesInvoiceDto.creditCustomerid,
              adminid: createSalesInvoiceDto.adminid,
              redeem: createSalesInvoiceDto.redeem,
            });
          }
          let staffTransactionsObj = {
            adminid: createInvoice.adminid,
            ledger: "47",
            ledgercategory: "3",
            type: "Customer Receipt",
            usertype: "staf",
            paid_amount: createSalesInvoiceDto.paymentInfo.amount,
            outstanding: createSalesInvoiceDto.paymentInfo.outstanding,
            saleid: createInvoice.id,
            invoiceno: createSalesInvoiceDto.invoiceno,
            saletype: createSalesInvoiceDto.saletype,
            paymethod: createSalesInvoiceDto.paymethod,
            customerid: createSalesInvoiceDto.creditCustomerid,
            staffid: createSalesInvoiceDto.createdBy,
            companyid: createSalesInvoiceDto.companyid,
            status: createSalesInvoiceDto.isStripe ? "closed" : "open",
            total: createInvoice.total,
            paid_status: createSalesInvoiceDto.paid_status,
            counterid: createSalesInvoiceDto.counterid,
            shiftid: createSalesInvoiceDto.shiftid,
            sdate: createSalesInvoiceDto.sdate,
            // overall_parcel_charge: createSalesInvoiceDto?.overall_parcel_charge,
          };

          let stafTrancectionCreate =
            await this.StaffTransactionsService.create(staffTransactionsObj);
          response = {
            status: true,
            message: "Sales Invoice Created Successfully",
            data: {
              ...createInvoice,
              staffTransaction: stafTrancectionCreate.data,
            },
          };
        } else {
          response = {
            status: true,
            message: "Sales Invoice Created Successfully",
            data: createInvoice,
          };
        }
        await this.userSettings.updateLastInvoiceNo(
          createSalesInvoiceDto.adminid,
          createSalesInvoiceDto.companyid,
          createSalesInvoiceDto.seriesNo,
          createSalesInvoiceDto.type
        );
      } else {
        response = {
          data: null,
          status: false,
          message: "Failed to create supplier",
        };
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response;
  }

  async staffCustomerReceipt(data, bankDetails) {
    let response = {
      data: null,
      status: false,
      message: null,
    };
    await this.databaseService.getSequelize.transaction(async (transaction) => {
      let payDebitData = {
        total: data.paid_amount,
        paidmethod: bankDetails.paidmethod,
        sdate: data.created_at,
        userid: data.adminid,
        cname: data.customerid,
        ledger: bankDetails.bankid,
        ledgercategory: "1",
        saleid: data.saleid,
        type: data.type,
        userdate: data.created_at,
        createdAt: new Date(),
        updatedAt: new Date(),
        adminid: data.adminid,
        debit: data.paid_amount,
        credit: 0,
        booleantype: "3",
        usertype: data.usertype,
        bankid: bankDetails.bankid,
        referenceid: data.saleid,
        discount_status: "0",
        createdBy: data.staffid,
        companyid: data.companyid,
      };

      const payDebit = await this.ledger_details.create(
        payDebitData,
        transaction
      );

      let payCreditData: any = {
        total: data.paid_amount,
        paidmethod: bankDetails.paidmethod,
        sdate: data.created_at,
        userid: data.adminid,
        cname: data.customerid,
        ledger: "47",
        ledgercategory: "3",
        saleid: data.saleid,
        type: data.type,
        userdate: data.created_at,
        createdAt: new Date(),
        updatedAt: new Date(),
        adminid: data.adminid,
        debit: 0,
        credit: data.paid_amount,
        booleantype: "3",
        discount_status: "1",
        usertype: data.usertype,
        transferid: payDebit.id,
        baseid: payDebit.id,
        referenceid: data.saleid,
        bankid: bankDetails.bankid,
        createdBy: data.staffid,
        companyid: data.companyid,
      };

      const payCredit = await this.ledger_details.create(
        payCreditData,
        transaction
      );

      const updateSale = await this.updateOutstandingAmount(
        data.saleid,
        {
          status: data.paid_status,
          outstanding: data.outstanding,
        },
        transaction
      );

      let ledgerView = await this.account_master.findOne(bankDetails.bankid);

      if (ledgerView.status) {
        let totalamount = ledgerView.data.total;
        let totalAmountPlus = Number(totalamount) + Number(data.paid_amount);
        let salesData_3: any = {
          total: totalAmountPlus,
          userdate: data.created_at,
          updatedAt: new Date(),
        };
        const updateLedger = await this.account_master.update(
          bankDetails.bankid,
          salesData_3,
          transaction
        );
        if (updateLedger) {
          response = {
            status: true,
            message: "Sales Invoice Created and Completed Payment",
            data: data,
          };
        } else {
          response = {
            status: false,
            message: "Invoice Created but Failed to Update Payment",
            data: data,
          };
        }
        await this.invoiceItemsService.updateSalePaymentDate(
          data.adminid,
          data.adminid,
          data.saleid,
          data.created_at
        );
      } else {
        response = {
          status: false,
          message: "Invoice Created but Failed to Update Bank",
          data: data,
        };
      }
    });
    return response;
  }

  async addStaffOtherReceipt(data, bankDetails) {
    let response: CommonResponseDto;
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        bankDetails.bankid,
        data.adminid
      );
      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);

      let runningtotal = Number(balance) + Number(data.paid_amount);

      let result1 = await this.account_master.findById(bankDetails.bankid);
      let totalamount = result1.total;
      let totalamountplus = Number(totalamount) + Number(data.paid_amount);
      let data1 = {
        total: totalamountplus,
        userdate: data.created_at,
      };

      let updateLedger = await result1.update(data1);

      let odata = {
        reference: "Other Receipt",
        total: data.paid_amount,
        userid: data.adminid,
        adminid: data.adminid,
        sdate: data.created_at,
        userdate: data.created_at,
        cname: data.customerid,
        ledger: bankDetails.bankid.toString(),
        bankid: bankDetails.bankid,
        type: data.type,
        credit: 0,
        debit: data.paid_amount,
        booleantype: "97",
        discount_status: "0",
        usertype: "customer",
        ledgercategory: "3",
        amount: data.paid_amount,
        totalamt: data.paid_amount,
        paidmethod: bankDetails.paidmethod,
        createdBy: data.staffid,
        companyid: data.companyid,
      };
      const insertDetails1 = await this.ledger_details.create(odata);
      let odata2 = {
        reference: "Other Receipt",
        total: data.paid_amount,
        userid: data.adminid,
        adminid: data.adminid,
        sdate: data.created_at,
        userdate: data.created_at,
        cname: data.customerid,
        type: data.type,
        credit: data.paid_amount,
        debit: 0,
        booleantype: "97",
        discount_status: "1",
        usertype: "customer",
        ledger: data.customerid.toString(),
        ledgercategory: "4",
        amount: data.paid_amount,
        baseid: insertDetails1.id,
        totalamt: data.paid_amount,
        paidmethod: bankDetails.paidmethod,
        createdBy: data.staffid,
        companyid: data.companyid,
      };
      const insertDetails2 = await this.ledger_details.create(odata2);

      if (insertDetails2) {
        const updateLedger = await this.account_master.update(result1.id, {
          userdate: new Date(),
          total: totalamountplus,
        });
        response = {
          status: true,
          data: data,
          message: "Other Receipt Added Successfully",
        };
      }
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async removeSalesInvoice(adminid: number, id: number, type: string) {
    try {
      const checkInvoice = await this.findById(id);
      if (checkInvoice) {
        if (checkInvoice.total === checkInvoice.outstanding) {
          const ledger: any = await this.ledger_details.distroy({
            where: {
              saleid: id,
              adminid,
            },
          });
          const deletingInvoiceItems =
            await this.invoiceItemsService.findAllByQuery({
              where: {
                adminid: adminid,
                saleid: id,
                type: {
                  [Op.notIn]: [
                    "Customer Payment",
                    "Customer Receipt",
                    "Customer Reciept",
                  ],
                },
              },
            });
          let deletedInvoiceItems =
            await this.invoiceItemsService.deleteInvoiceItems({
              where: {
                saleid: id,
                adminid: adminid,
              },
            });
          for (let i = 0; i < deletingInvoiceItems.length; i++) {
            const item = deletingInvoiceItems[i];

            let product: any = await this.product_service.findById(
              Number(item.idescription)
            );

            if (product?.itemtype !== "Service") {
              let stock = Number(product.stock);
              if (type === "sales") {
                stock = stock + Number(item.quantity);
              } else if (type === "scredit") {
                stock = stock - Number(item.quantity);
              }
              let stockObj = {
                stock: Number(stock).toFixed(0),
                quantity: stock,
              };
              let updatedData = await this.product_service.updateStock(
                Number(item.idescription),
                stockObj
              );
            }
          }
          const delInvoice = await this.SalesInvoiceRepository.destroy({
            where: {
              adminid: adminid,
              id: id,
            },
          });

          return new CommonResponseDto(
            checkInvoice,
            true,
            "Invoice deleted successfully"
          );
        } else {
          return new CommonResponseDto(
            null,
            false,
            "This invoice has already been paid and cannot be deleted"
          );
        }
      } else {
        return new CommonResponseDto(null, false, "No invoice is found");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async closeShift(creatdto: CloseShiftDto, userId: number) {
    try {
      const result = await this.databaseService.getSequelize.transaction(
        async (transaction: Transaction) => {
          const customer = await ContactMaster.findByPk(creatdto.staffId, {
            raw: true,
            transaction, 
          });

          if (!customer) {
            throw new Error(
              `Staff member with ID ${creatdto.staffId} not found`
            );
          }

          const staffTransactionIds: number[] = Array.isArray(
            creatdto.staffTransactions
          )
            ? creatdto.staffTransactions
                .map((transaction: any) => transaction?.id)
                .filter((id: any) => id != null && !isNaN(Number(id)))
                .map((id: any) => Number(id))
            : [];

          const locationId = await LocationMaster.findOne({
            where: {
              adminId: userId,
              companyid: creatdto.companyid,
            },
            attributes: ["id"],
            raw: true,
            transaction,
          });

          if (!locationId) {
            throw new Error(
              `Location not found for adminId: ${userId}, companyid: ${creatdto.companyid}`
            );
          }

          const invoiceNoResult = await this.userSettings.getInvoiceNo(
            userId,
            creatdto.companyid,
            locationId.id,
            "sales"
          );

          if (!invoiceNoResult?.data) {
            throw new Error("Failed to generate invoice number");
          }

          const outstanding = Array.isArray(creatdto.staffTransactions)
            ? creatdto.staffTransactions
                .filter(
                  (transaction: any) => transaction?.paymethod === "Credit"
                )
                .reduce((sum: number, item: any) => {
                  const amount = parseFloat(item?.outstanding || "0");
                  return sum + (isNaN(amount) ? 0 : amount);
                }, 0)
            : 0;

          const totalPaidAmount = Array.isArray(creatdto.staffTransactions)
            ? creatdto.staffTransactions.reduce((sum: number, item: any) => {
                const amount = parseFloat(item?.paid_amount || "0");
                return sum + (isNaN(amount) ? 0 : amount);
              }, 0)
            : 0;

          const uniqueOrderIds: any[] = Array.isArray(
            creatdto.staffTransactions
          )
            ? [
                ...new Set(
                  creatdto.staffTransactions
                    .map((transaction: any) => transaction?.order_id)
                    .filter(
                      (orderId: any) =>
                        orderId !== null &&
                        orderId !== undefined &&
                        !isNaN(Number(orderId))
                    )
                    .map((orderId: any) => Number(orderId))
                ),
              ]
            : [];

          let orders: any[] = [];
          if (uniqueOrderIds.length > 0) {
            orders = await OrderMaster.findAll({
              where: {
                id: {
                  [Op.in]: uniqueOrderIds,
                },
              },
              include: [
                {
                  model: OrderItems,
                  as: "orderItems",
                  include: [
                    {
                      model: ProductMaster,
                      as: "productMaster",
                      attributes: [
                        "id",
                        "icode",
                        "idescription",
                        "name",
                        "rate",
                        "price",
                        "costprice",
                        "barcode",
                        "weight",
                        "hsn_code",
                        "itemtype",
                        "variant_name",
                        "userid",
                        "active",
                        "spname",
                        "ledgercategory",
                        "svrate",
                        "sicode",
                        "pdescription",
                        "pvrate",
                        "paccount",
                        "notes",
                        "ptype",
                        "reason",
                        "userdate",
                        "pimage",
                        "qdate",
                        "date",
                        "expiredate",
                        "trade_price",
                        "wholesale",
                        "quantity",
                        "stockquantity",
                        "qtype",
                        "vatamt",
                        "includevat",
                        "rlevel",
                        "rquantity",
                        "sp_price",
                        "stock",
                        "cquantity",
                        "c_price",
                        "saccount",
                        "increase",
                        "decrease",
                        "netquantity",
                        "adminid",
                        "vat",
                        "location",
                        "is_deleted",
                        "createdBy",
                        "companyid",
                        "unit",
                        "product_category",
                        "created_at",
                        "updated_at",
                      ],
                    },
                  ],
                },
                {
                  model: ContactMaster,
                  as: "customer",
                },
                {
                  model: ContactMaster,
                  as: "staff",
                },
              ],
              transaction,
            });
          }

          // console.log('orders',JSON.stringify(orders,null,2))
          const columns: any[] = [];
          let itemOrder = 1;

          orders.forEach((order) => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
              order.orderItems.forEach((orderItem: any) => {
                if (orderItem.productMaster) {
                  const parseNumeric = (
                    value: any,
                    defaultValue: number = 0
                  ): number => {
                    const parsed = parseFloat(value);
                    return isNaN(parsed) ? defaultValue : parsed;
                  };

                  const column = {
                    id: orderItem.productMaster.id,
                    productLocationRef: orderItem.productMaster.location
                      ? parseInt(orderItem.productMaster.location)
                      : null,
                    discount: (orderItem.discount || "0.00").toString(),
                    discountamt: (orderItem.discountamt || "0.00").toString(),
                    productId: orderItem.productMaster.id,
                    product: {
                      ...(orderItem.productMaster.toJSON
                        ? orderItem.productMaster.toJSON()
                        : orderItem.productMaster),
                      unitDetails: orderItem.productMaster.unitDetails
                        ? {
                            id: orderItem.productMaster.unitDetails.id,
                            unit: orderItem.productMaster.unitDetails.unit,
                            adminId: orderItem.productMaster.unitDetails.adminId,
                            companyid: orderItem.productMaster.unitDetails.companyid,
                            formalName:
                              orderItem.productMaster.unitDetails.formalName,
                            decimalValues:
                              orderItem.productMaster.unitDetails.decimalValues,
                            isDeleted: orderItem.productMaster.unitDetails.isDeleted,
                            create_at: orderItem.productMaster.unitDetails.create_at,
                            updated_At:
                              orderItem.productMaster.unitDetails.updated_At,
                          }
                        : null,
                    },
                    idescription: orderItem.productMaster.idescription || "",
                    description: orderItem.productMaster.idescription || "",
                    vat: parseNumeric(orderItem.productMaster.vat, 0),
                    includevat:
                      orderItem.productMaster.includevat === "1.00" ||
                      orderItem.productMaster.includevat === 1 ||
                      orderItem.productMaster.includevat === true,
                    incomeTax: parseNumeric(
                      orderItem.incomeTax || orderItem.productMaster.vat,
                      1
                    ),
                    percentage: parseNumeric(
                      orderItem.percentage || orderItem.productMaster.vat,
                      1
                    ),
                    costprice: (
                      orderItem.price ||
                      orderItem.productMaster.rate ||
                      "0.00"
                    ).toString(),
                    ledgerDetails: {
                      category: "13",
                      id: 1,
                      laccount: "Sales-Products",
                      nominalcode:
                        orderItem.productMaster.saccount?.toString() || "4000",
                    },
                    ledger: {
                      category: "13",
                      id: 1,
                      laccount: "Sales-Products",
                      nominalcode:
                        orderItem.productMaster.saccount?.toString() || "4000",
                    },
                    quantity: parseNumeric(orderItem.quantity, 1),
                    total: (
                      orderItem.total ||
                      orderItem.price ||
                      "0.00"
                    ).toString(),
                    vatamt: parseNumeric(orderItem.productMaster.vat, 0),
                    vatamount: (orderItem.vatamount || "0.00").toString(),
                    incomeTaxAmount: (
                      orderItem.incomeTaxAmount || "0.00"
                    ).toString(),
                    itemorder: itemOrder++,
                    imei: [],
                  };

                  columns.push(column);
                }
              });
            }
          });

          const paymentInfo = {
            id: creatdto.bankid || null,
            bankid: creatdto.bankid || null,
            paidmethod: creatdto.paidmethod || "Cash",
            outstanding: outstanding,
            amount: totalPaidAmount,
            date: new Date(),
            type: creatdto.paidmethod || "Cash",
          };

          const totalAmount = Number(outstanding) + Number(totalPaidAmount);

          const salesInvoiceData = {
            seriesNo: locationId.id,
            cname: customer.name || "",
            customerid: customer.id,
            cusmail: customer.email || "",
            columns: columns,
            paymentInfo: paymentInfo,
            invoiceno: invoiceNoResult.data,
            sdate: new Date(),
            ldate: new Date(),
            inaddress: "",
            deladdress: "",
            terms: "",
            quotes: "",
            status: "1",
            issued: "yes",
            type: "sales",
            pagetype: "1",
            userid: userId,
            adminid: userId,
            userdate: new Date(),
            salesType: "",
            ledger: {
              id: 1,
              nominalcode: "4000",
              laccount: "Sales-Products",
              category: 13,
              categorygroup: 5,
              acctype: "",
              userid: -2,
              accnum: "",
              cardnum: "",
              paidmethod: "",
              sortcode1: "",
              sortcode2: "",
              sortcode3: "",
              ibannum: "",
              bicnum: "",
              opening: "0.00",
              total: "0",
              userdate: new Date().toISOString(),
              type: 0,
              adminid: -2,
              visiblestatus: 0,
              visbank: 0,
              vissinvoice: 1,
              vispinvoice: 0,
              visotherreceipt: 1,
              vispayroll: null,
              visotherpayment: 0,
              visjournal: 1,
              visreport: 1,
              showVatRate: 1,
              payheadType: null,
              journals: null,
              Purchase: null,
              Sales: "sales",
              calculationPeriod: null,
              branch: null,
              ifsc: null,
              accountname: null,
              createdBy: null,
              companyid: -2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              categoryDetails: {
                id: 13,
                category: "sales",
                adminid: -2,
                categorygroup: 5,
                createdBy: null,
                companyid: null,
                createdat: new Date().toISOString(),
                updatedat: null,
              },
              groupDetails: {
                id: 5,
                categorygroup: "income",
                createdat: new Date().toISOString(),
                updatedat: null,
              },
            },
            email: customer.email || "",
            reccObj: {},
            total_vat: 0.0,
            overall_discount: 0,
            taxable_value: totalAmount,
            createdBy: userId,
            companyid: creatdto.companyid,
            usertype: customer.contractors_type || "",
            loyaltyPoints: 0,
            total: totalAmount,
            claimedPoint: 0,
          };

          const salesInvoice = await this.create(salesInvoiceData);

          if (!salesInvoice || !salesInvoice.data) {
            throw new Error("Failed to create sales invoice");
          }

          if (staffTransactionIds.length > 0) {
            const updateResult = await StaffTransactions.update(
              {
                saleid: salesInvoice.data.id,
                invoiceno: invoiceNoResult.data,
              },
              {
                where: {
                  id: {
                    [Op.in]: staffTransactionIds,
                  },
                },
                transaction,
              }
            );

            console.log(`Updated ${updateResult[0]} staff transactions`);
          }

          return salesInvoice;
        }
      );
      return new CommonResponseDto(result, true, "shift closed successfully");
    } catch (error) {
      console.error("Error in closeShift:", error);
      if (error.name === "SequelizeValidationError") {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      } else if (error.name === "SequelizeForeignKeyConstraintError") {
        throw new Error(`Foreign key constraint error: ${error.message}`);
      } else if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error(`Unique constraint error: ${error.message}`);
      }

      throw error;
    }
  }
}
