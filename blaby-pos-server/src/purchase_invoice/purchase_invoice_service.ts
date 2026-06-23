import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { Op, Sequelize } from "sequelize";
import { AccountMasterService } from "../account_master/account_master_service";
import { BankService } from "../bank/bank_service";
import { unit } from "../units/unit.entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { DatabaseService } from "../database/database.service";
import { InvoiceItemsService } from "../invoice_item/invoice_item_service";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { LocationService } from "../locations/location.services";
import { OtherMasterService } from "../other_master/other_master.service";
import { ProductCategoryService } from "../product_category/product_category_services";
import { ProductLocationMasterService } from "../product_location_master/product_location.service";
import { ProductMasterService } from "../product_master/product_master_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { PageDto, PageMetaDto, PageOptionsDto } from "./../shared/dto";
import { PurchaseInvoiceDto } from "./dto/purchase_invoice_dto";
import { CreatePurhcaseReceiptDto } from "./dto/purchase_receipt_create_dto";
import { PurchaseInvoiceHelperService } from "./purchase_invoice_helper_service";
import { PurchaseInvoice } from "./purchase_invoice_model";
import { LocationMaster } from "../locations/location.entity";
const moment = require("moment");

@Injectable()
export class PurchaseInvoiceService {
  @Inject(forwardRef(() => LedgerDetailsService))
  private readonly ledger_details: LedgerDetailsService;

  @Inject(ProductMasterService)
  private readonly product_service: ProductMasterService;

  @Inject(forwardRef(() => AccountMasterService))
  private readonly account_master: AccountMasterService;

  @Inject(UserSettingsService)
  private readonly userSettings: UserSettingsService;

  @Inject(InvoiceItemsService)
  private readonly invoiceItemsService: InvoiceItemsService;

  @Inject(PurchaseInvoiceHelperService)
  private readonly invoiceItemsHelperService: PurchaseInvoiceHelperService;

  @Inject(BankService)
  private readonly BankService: BankService;

  @Inject(forwardRef(() => ContactMasterService))
  private readonly ContactMasterService: ContactMasterService;

  @Inject(StaffTransactionsService)
  private readonly StaffTransactionsService: StaffTransactionsService;

  @Inject(LocationService)
  private readonly location_master: LocationService;

  @Inject(ProductCategoryService)
  private readonly product_category: ProductCategoryService;

  @Inject(OtherMasterService)
  private readonly otherMasterService: OtherMasterService;

  @Inject(ProductLocationMasterService)
  private readonly productLocationMasterService: ProductLocationMasterService;

  constructor(
    @Inject("PurchaseInvoiceRepository")
    private readonly cartRepository: typeof PurchaseInvoice,
    private readonly databaseService: DatabaseService
  ) {}

  async findAllByQuery(query: any) {
    try {
      const data = await this.cartRepository.findAll<PurchaseInvoice>(query);
      return data.map((tmp) => new PurchaseInvoiceDto(tmp));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sum(field: any, query: any) {
    const data = await this.cartRepository.sum(field, query);
    return data;
  }

  async cancelInvoice(id: number) {
    const purchaseInv = await this.findById(id);
    purchaseInv.status = 10;
    let purInvoice = await purchaseInv.save();
    return purInvoice;
  }
  async findAllList(id, type) {
    const data = await this.cartRepository.findAll<PurchaseInvoice>({
      include: [
        {
          model: ContactMaster,
          as: "supplier",
        },
      ],
      where: { adminid: id, type: type },
      order: [["sdate", "DESC"]],
      raw: true,
    });
    let res = data.map((tmp) => new PurchaseInvoiceDto(tmp));
    return {
      status: true,
      message: "Purchase Invoice List",
      data: res,
    };
  }

  async findAllListByShowBusName(id, type) {
    const data = await this.cartRepository.findAll<PurchaseInvoice>({
      include: [
        {
          model: ContactMaster,
          as: "supplier",
        },
      ],
      where: { adminid: id, type: type },
      order: [["sdate", "DESC"]],
      raw: true,
    });

    for (let i = 0; i < data.length; i++) {
      let showBusName: any = await this.ContactMasterService.getOne(
        data[i]?.supplierid
      );

      data[i]["bus_name"] = showBusName.data.bus_name;
    }

    let res = data.map((tmp) => new PurchaseInvoiceDto(tmp));

    return {
      status: true,
      message: "Purchase Invoice List",
      data: data,
    };
  }

  async findAllPurchaseInvoicePage(
    id: number,
    createdBy: number,
    companyid: number,
    type: string
  ) {
    const purchaseData = await this.cartRepository.findAll<PurchaseInvoice>({
      include: [
        {
          model: ContactMaster,
          as: "supplier",
        },
        {
          model: LocationMaster,
          as: "locationDetails",
        },
      ],
      where: {
        adminid: id,
        type: type,
        createdBy: createdBy,
        companyid: companyid,
      },
      order: [["sdate", "DESC"]],
    });

    return {
      status: true,
      message: "Purchase Invoice List",
      data: purchaseData,
    };
  }

  async findAllListBySupplier(id, supplierId) {
    const data = await this.cartRepository.findAll<PurchaseInvoice>({
      where: { adminid: id, supplierid: supplierId },
    });
    return data.map((tmp) => new PurchaseInvoiceDto(tmp));
  }

  async findAllPages(pageOptionsDto: PageOptionsDto) {
    const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    const exp = await this.cartRepository.findAndCountAll<PurchaseInvoice>({
      where: {},
      limit: 10,
      offset: skip,
      order: [["id", pageOptionsDto.order]],
    });

    const entities = exp.rows.map((ctry) => new PurchaseInvoiceDto(ctry));
    const itemCount = exp.count;

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(entities, pageMetaDto);
  }
  async getOne(id: number) {
    const cart = await this.cartRepository.findByPk<PurchaseInvoice>(id);
    if (!cart) {
      throw new HttpException(
        "cart with given id not found",
        HttpStatus.NOT_FOUND
      );
    }
    return new PurchaseInvoiceDto(cart);
  }

  async findById(id: number) {
    try {
      const inv = await this.cartRepository.findByPk<PurchaseInvoice>(id);
      if (!inv) {
        throw new HttpException("No sale invoice found", HttpStatus.NOT_FOUND);
      }
      return inv;
    } catch (error) {
      console.log(error);
    }
  }

  async create(createDto: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          createDto.type =
            createDto.type == "pinvoice" || createDto.type == "purchase"
              ? "purchase"
              : createDto.type === "stockassets"
              ? "stockassets"
              : createDto.type === "order"
              ? "order"
              : "pcredit";
          const cart = new PurchaseInvoice();
          cart.userid = createDto.userid;
          cart.supplierid = createDto.supplier.id;
          cart.invoiceno = createDto.invoiceno;
          cart.total = createDto.total;
          cart.outstanding = createDto.total;
          cart.sname = createDto.supplier.name;
          cart.type = createDto.type;
          cart.adminid = createDto.adminid;
          cart.invoiceimage = createDto.invoiceimage;
          cart.invoicedoc = createDto.invoicedoc;
          cart.quotes = createDto.quotes;
          cart.share = createDto.share;
          cart.sdate = createDto.sdate;
          cart.ldate = createDto.ldate;
          cart.userdate = createDto.paymentInfo
            ? createDto.paymentInfo.date
            : createDto.userdate;
          cart.paymentdate = createDto.paymentInfo
            ? createDto.paymentInfo.date
            : createDto.paymentdate;
          cart.refid = createDto.refid;
          cart.purchase_ref = createDto.purchase_ref;
          cart.ledger = createDto?.ledger?.id;
          // cart.roundOff = createDto.roundOff || 0;
          cart.quantity = createDto.quantity;
          cart.total_vat = createDto?.total_vat;
          cart.overall_discount = createDto?.overall_discount;
          cart.taxable_value = createDto?.taxable_value;
          cart.usertype = createDto.usertype;
          cart.stockid = createDto.pList.productId;
          cart.createdBy = createDto.createdBy;
          cart.companyid = createDto.companyid;
          cart.seriesNo = createDto.seriesNo;

          if (createDto.type === "order") {
            cart.status = 5; // order status
          } else {
            cart.status = createDto.status;
          }
          let invoice: any = await cart.save();

          for (const product of createDto.pList) {
            const costprice = await this.product_service.updateRate(
              product.id,
              {
                adminid: createDto.adminid,
                costprice: product.costprice,
              }
            );
          }
          if (createDto.type === "order") {
            const lineItem =
              await this.invoiceItemsHelperService.createInvoiceLineItem(
                createDto.type,
                invoice,
                createDto
              );
            await this.invoiceItemsService.createInvoiceItems(lineItem);

            await this.userSettings.updateLastInvoiceNo(
              createDto.adminid,
              createDto.companyid,
              createDto.seriesNo,
              createDto.type
            );

            response = {
              status: true,
              message: `Purchase ${createDto.type} invoice created successfully`,
              data: invoice,
            };
          } else {
            response = await this.saveInvoiceToledger(
              invoice,
              createDto,
              transaction
            );

            if (createDto?.pagetype == "4") {
              createDto.invoiceno = createDto.purchaseOrderInvoiceNo;
              createDto.type = "order";
              createDto.id = createDto.purchaseOrderInvoiceId;
              const orderUpdate = await this.update(createDto.id, createDto);
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: {},
      };
    }
    return response;
  }

  async saveInvoiceToledger(
    createInvoice: any,
    createDto: any,
    transaction: any
  ) {
    let response: CommonResponseDto;
    let type = createDto.type;
    if (createDto.type == "pinvoice" || createDto.type == "purchase") {
      type = "pinvoice";
    } else if (type == "pcredit") {
      type = "pcredit";
    }
    let count = 0;
    const ledgerAcc: any = createDto.ledger;
    let totalVat = 0;
    let totalNet = 0;
    let totalDiscount = 0;

    if (createInvoice) {
      let count = 0;
      let index = 0;
      const lineItem =
        await this.invoiceItemsHelperService.createInvoiceLineItem(
          type,
          createInvoice,
          createDto
        );
      await this.invoiceItemsService.createInvoiceItems(lineItem);

      let isService = false;

      for (let i = 0; i < createDto.pList.length; i++) {
        let element = createDto.pList[i];
        count++;

        if (element.product?.itemtype === "Service") {
          isService = true;
        }

        if (
          element.product.itemtype === "Stock" ||
          element.product.itemtype === "Nonstock"
        ) {
          const proStock: any = await this.product_service.findOne(
            element.product.id
          );
          const productLocationStock: any =
            await this.productLocationMasterService.findOne(
              element.productLocationRef
            );

          let stock1 = proStock.data.stock;
          let locationStock1 = productLocationStock.data.stock;

          let stock = Number(stock1);
          let locationStock = Number(locationStock1);

          let purqty = element.quantity;
          if (type == "pinvoice" || type == "purchase") {
            stock = Number(stock1) + Number(purqty);
            locationStock = Number(locationStock) + Number(purqty);
          } else if (type == "pcredit") {
            stock = Number(stock1) - Number(purqty);
            locationStock = Number(locationStock) - Number(purqty);
          }

          const updateStock = await this.product_service.updateStock(
            element.product.id,
            {
              stock: stock,
              quantity: stock,
            },
            transaction
          );

          const updateLocationStock =
            await this.productLocationMasterService.update(
              element.productLocationRef,
              { stock: Number(locationStock), quantity: Number(locationStock) }
            );
        }

        const costprice = element.costprice;
        const quantity = element.quantity;
        let totalamount = Number(costprice) * Number(quantity);
        const discount = element.discountamt ? Number(element.discountamt) : 0;
        if (discount && discount > 0) {
          totalamount = totalamount - discount;
        }
        const incomeTaxAmount = element.vatamount
          ? Number(element.vatamount)
          : 0;
        if (element.includevat) {
          totalamount = totalamount - incomeTaxAmount;
        }
        totalVat += incomeTaxAmount;
        totalNet += totalamount;
        totalDiscount += Number(element.discountamt);
      }

      // round off entry to ledger details
      // if (Number(createDto.roundOff) !== Number(0)) {
      //   let roundCreditData: any = {
      //     saleid: createInvoice.id,
      //     sdate: createDto.sdate,
      //     ldate: createDto.ldate,
      //     ledger: "5",
      //     cname: createDto.customerid,
      //     total: totalNet,
      //     userid: createDto.userid,
      //     ledgercategory: ledgerAcc?.category,
      //     adminid: createDto.adminid || 0,
      //     userdate: createDto.userdate,
      //     type:
      //       type == "pinvoice"
      //         ? "Purchase Invoice"
      //         : type == "stockassets"
      //         ? "stockassets"
      //         : "Purchase Credit Notes",
      //     credit: createDto.roundOff > 0 ? createDto.roundOff : 0,
      //     debit: createDto.roundOff > 0 ? 0 : createDto.roundOff,
      //     booleantype: "1",
      //     usertype: "customer",
      //     used: "group",
      //     invoiceno: createInvoice.invoiceno,
      //     baseid: null,
      //     createdBy: createDto.createdBy,
      //     companyid: createDto.companyid,
      //     seriesNo: createDto.seriesNo,
      //   };
      //   const roundCredit = await this.ledger_details.create(
      //     roundCreditData,
      //     transaction
      //   );
      //   let roundDebitData: any = {
      //     saleid: createInvoice.id,
      //     sdate: createDto.sdate,
      //     ldate: createDto.ldate,
      //     ledger: "51",
      //     cname: createDto.customerid,
      //     total: totalNet,
      //     userid: createDto.userid,
      //     ledgercategory: "3",
      //     adminid: createDto.adminid || 0,
      //     userdate: createDto.userdate,
      //     type:
      //       type == "pinvoice"
      //         ? "Purchase Invoice"
      //         : type == "stockassets"
      //         ? "stockassets"
      //         : "Purchase Credit Notes",
      //     totalamount: totalNet,
      //     credit: createDto.roundOff > 0 ? 0 : createDto.roundOff,
      //     debit: createDto.roundOff > 0 ? createDto.roundOff : 0,
      //     booleantype: "1",
      //     usertype: "customer",
      //     discount_status: "1",
      //     invoiceno: createInvoice.invoiceno,
      //     baseid: roundCreditData.id,
      //     createdBy: createDto.createdBy,
      //     companyid: createDto.companyid,
      //     seriesNo: createDto.seriesNo,
      //   };
      //   const roundDebit = await this.ledger_details.create(
      //     roundDebitData,
      //     transaction
      //   );
      // }
      if (isService === true) {
        let data1 = {
          purchaseid: createInvoice.id,
          // idescription: element.product.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          cname: createDto.supplier.id,
          total: totalNet,
          ledgercategory: ledgerAcc.category,
          userid: createDto.userid,
          adminid: createDto.adminid,
          type:
            type == "pinvoice"
              ? "Purchase Invoice"
              : type == "stockassets"
              ? "stockassets"
              : "Purchase Credit Notes",
          ledger: ledgerAcc.id,
          credit:
            type == "pinvoice" || type == "stockassets" ? 0 : createDto.total,
          debit:
            type == "pinvoice" || type == "stockassets" ? createDto.total : 0,
          booleantype: type == "pinvoice" || type == "stockassets" ? "2" : "25",
          usertype: "supplier",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          userdate: createDto.userdate,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
          seriesNo: createDto.seriesNo,
        };
        let returnid = await this.ledger_details.create(data1, transaction);
        let data2 = {
          purchaseid: createInvoice.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          ledger: "51",
          cname: createDto.supplier.id,
          total: totalNet,
          ledgercategory: "4",
          userid: createDto.userid,
          adminid: createDto.adminid,
          userdate: createDto.userdate,
          type:
            type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
          debit:
            type == "pinvoice" || type == "stockassets" ? 0 : createDto.total,
          credit:
            type == "pinvoice" || type == "stockassets" ? createDto.total : 0,

          discount_status: "1",
          booleantype: type == "pinvoice" || type == "stockassets" ? "2" : "25",
          usertype: "supplier",
          baseid: returnid.id,
          invoiceno: createInvoice.invoiceno,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
          seriesNo: createDto.seriesNo,
        };
        let result = await this.ledger_details.create(data2, transaction);
      } else {
        let data1 = {
          purchaseid: createInvoice.id,
          // idescription: element.product.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          cname: createDto.supplier.id,
          total: totalNet,
          ledgercategory: ledgerAcc.category,
          userid: createDto.userid,
          adminid: createDto.adminid,
          type:
            type == "pinvoice"
              ? "Purchase Invoice"
              : type == "stockassets"
              ? "stockassets"
              : "Purchase Credit Notes",
          ledger: ledgerAcc.id,
          credit:
            type == "pinvoice" || type == "stockassets"
              ? 0
              : totalNet + totalDiscount,
          debit:
            type == "pinvoice" || type == "stockassets"
              ? type == "stockassets"
                ? totalNet + totalVat
                : totalNet + totalDiscount
              : 0,
          booleantype: type == "pinvoice" || type == "stockassets" ? "2" : "25",
          usertype: "supplier",
          used: "group",
          invoiceno: createInvoice.invoiceno,
          userdate: createDto.userdate,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
          seriesNo: createDto.seriesNo,
        };
        let returnid = await this.ledger_details.create(data1, transaction);
        let data2 = {
          purchaseid: createInvoice.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          ledger: "51",
          cname: createDto.supplier.id,
          total: totalNet,
          ledgercategory: "4",
          userid: createDto.userid,
          adminid: createDto.adminid,
          userdate: createDto.userdate,
          type:
            type == "pinvoice"
              ? "Purchase Invoice"
              : type == "stockassets"
              ? "stockassets"
              : "Purchase Credit Notes",
          debit:
            type == "pinvoice" || type == "stockassets"
              ? 0
              : type == "stockassets"
              ? totalVat + totalNet
              : totalNet + totalDiscount,
          credit:
            type == "pinvoice" || type == "stockassets"
              ? type == "stockassets"
                ? totalVat + totalNet
                : totalNet + totalDiscount
              : 0,

          discount_status: "1",
          booleantype: type == "pinvoice" || type == "stockassets" ? "2" : "25",
          usertype: "supplier",
          baseid: returnid.id,
          invoiceno: createInvoice.invoiceno,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
          seriesNo: createDto.seriesNo,
        };
        let result = await this.ledger_details.create(data2, transaction);
        if (totalDiscount > 0 && type !== "stockassets") {
          let discountDebitData = {
            purchaseid: createInvoice.id,
            sdate: createInvoice.sdate,
            ldate: createInvoice.ldate,
            ledger: ledgerAcc.id,
            cname: createInvoice.customerid,
            total: -totalDiscount,
            userid: createInvoice.userid,
            ledgercategory: ledgerAcc.category,
            adminid: createInvoice.adminid || 0,
            userdate: createInvoice.userdate,
            type:
              type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
            credit: type == "pinvoice" ? totalDiscount : 0,
            debit: type == "pinvoice" ? 0 : totalDiscount,
            booleantype: createInvoice.type == "pinvoice" ? "2" : "25",
            usertype: "supplier",
            used: "discount",
            invoiceno: createInvoice.invoiceno,
            discount_status: "1",
            baseid: null,
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
            seriesNo: createDto.seriesNo,
          };
          const discountDebit = await this.ledger_details.create(
            discountDebitData,
            transaction
          );
          let discountCreditData = {
            purchaseid: createInvoice.id,
            sdate: createInvoice.sdate,
            ldate: createInvoice.ldate,
            ledger: "51",
            cname: createInvoice.customerid,
            total: -totalDiscount,
            userid: createInvoice.userid,
            ledgercategory: "4",
            adminid: createInvoice.adminid || 0,
            userdate: createInvoice.userdate,
            type:
              type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
            debit: type == "pinvoice" ? totalDiscount : 0,
            credit: type == "pinvoice" ? 0 : totalDiscount,
            booleantype: createInvoice.type == "pinvoice" ? "2" : "25",
            usertype: "supplier",
            used: "discount",
            discount_status: "1",
            invoiceno: createInvoice.invoiceno,
            baseid: discountDebit.id,
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
            seriesNo: createDto.seriesNo,
          };
          const discountCredit = await this.ledger_details.create(
            discountCreditData,
            transaction
          );
        }
        if (totalVat > 0 && type !== "stockassets") {
          let taxData = {
            purchaseid: createInvoice.id,
            sdate: createDto.purchase.sdate,
            ldate: createDto.purchase.ldate,
            ledger: "55",
            cname: createDto.supplier.id,
            total: totalVat,
            userid: createDto.userid,
            ledgercategory: "4",
            adminid: createDto.adminid,
            userdate: createDto.userdate,
            type:
              type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
            discount_status: "0",
            credit: type == "pinvoice" || type == "stockassets" ? 0 : totalVat,
            debit: type == "pinvoice" || type == "stockassets" ? totalVat : 0,
            booleantype: type == "pinvoice" ? "2" : "25",
            usertype: "supplier",
            used: "incometax",
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
            seriesNo: createDto.seriesNo,
          };

          const resultTax = await this.ledger_details.create(
            taxData,
            transaction
          );

          let taxData1 = {
            purchaseid: createInvoice.id,
            sdate: createDto.purchase.sdate,
            ldate: createDto.purchase.ldate,
            ledger: "51",
            cname: createDto.supplier.id,
            total: totalVat,
            userid: createDto.userid,
            ledgercategory: "4",
            adminid: createDto.adminid,
            userdate: createDto.userdate,
            type:
              type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
            invoiceno: createInvoice.invoiceno,
            discount_status: "1",
            debit: type == "pinvoice" || type == "stockassets" ? 0 : totalVat,
            credit: type == "pinvoice" || type == "stockassets" ? totalVat : 0,
            booleantype: type == "pinvoice" ? "2" : "25",
            usertype: "supplier",
            used: "incometax",
            baseid: resultTax.id,
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
            seriesNo: createDto.seriesNo,
          };
          const resultTax1 = await this.ledger_details.create(
            taxData1,
            transaction
          );

          // update vat ledger total account master
          // const vatLedger = await this.account_master.findAllByQuery({
          //   attributes: ['id', 'total'],
          //   where: {
          //     nominalcode: 2202,
          //     userid: createDto.userid
          //   },
          // });
          // if (vatLedger) {
          //   let total = type == 'pinvoice' ? totalVat : type == 'pcredit' ? -totalVat : 0
          //   let accountData = {
          //     total: Number(vatLedger[0]?.total) - Number(total)
          //   }
          //   const updateVatLedger = await this.account_master.update(
          //     vatLedger[0]?.id,
          //     accountData,
          //     transaction,
          //   );
          // }
        }
      }

      if (count == createDto.pList.length) {
        if (createDto.paymentInfo) {
          let payDebitData = {
            total: createDto.paymentInfo.amount,
            paidmethod: createDto.paymentInfo.paidmethod,
            sdate: createDto.paymentInfo.date,
            userid: createDto.userid,
            cname: createDto.supplier.id,
            ledger: createDto.paymentInfo.bankid,
            ledgercategory: "1",
            purchaseid: createInvoice.id,
            type: "Supplier Payment",
            userdate: createDto.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: createDto.adminid,
            debit: 0,
            credit: createDto.paymentInfo.amount,
            booleantype: "6",
            usertype: "supplier",
            bankid: createDto.paymentInfo.bankid,
            referenceid: createDto.id,
            discount_status: "0",
            running_total: createDto.paymentInfo.running_total,
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
            seriesNo: createDto.seriesNo,
          };
          const payDebit = await this.ledger_details.create(
            payDebitData,
            transaction
          );

          let payCreditData = {
            total: createDto.paymentInfo.amount,
            paidmethod: createDto.paymentInfo.paidmethod,
            sdate: createDto.paymentInfo.date,
            userid: createDto.userid,
            cname: createDto.supplier.id,
            ledger: "51",
            ledgercategory: "4",
            purchaseid: createInvoice.id,
            type: "Supplier Payment",
            userdate: createDto.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: createDto.adminid,
            debit: createDto.paymentInfo.amount,
            credit: 0,
            booleantype: "3",
            discount_status: "1",
            usertype: "supplier",
            transferid: payDebit.id,
            baseid: payDebit.id,
            referenceid: createDto.id,
            bankid: createDto.paymentInfo.bankid,
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
            seriesNo: createDto.seriesNo,
          };
          let status = createDto.status;
          if (
            Number(createDto.paymentInfo.amount) == Number(createDto.total) ||
            Number(createDto.paymentInfo.outstanding) === 0
          ) {
            status = "2";
          } else if (
            Number(createDto.paymentInfo.amount) < Number(createDto.total) &&
            Number(createDto.paymentInfo.outstanding) > 0
          ) {
            status = "1";
          } else if (Number(createDto.paymentInfo.amount) == 0) {
            status = "0";
          }
          const payCredit = await this.ledger_details.create(
            payCreditData,
            transaction
          );

          createInvoice.outstanding = createDto.paymentInfo.outstanding;
          createInvoice.status = status;
          const updatePurchase = await this.updateOutstandingAmount(
            createInvoice.id,
            createInvoice,
            transaction
          );
          let ledgerView = await this.account_master.findOne(
            createDto.paymentInfo.bankid
          );

          if (ledgerView.status) {
            let totalamount = ledgerView.data.total;
            let totalAmountPlus =
              Number(totalamount) - Number(createDto.paymentInfo.amount);
            let purchaseData_3 = {
              total: totalAmountPlus,
              userdate: createDto.userdate,
              updatedAt: new Date(),
            };
            const updateLedger = await this.account_master.update(
              createDto.paymentInfo.bankid,
              purchaseData_3,
              transaction
            );
            if (updateLedger) {
              response = {
                status: true,
                message: "Purchase Invoice Created and Completed Payment",
                data: createInvoice,
              };
              response = {
                status: true,
                message: "Purchase Invoice Created and Completed Payment",

                data: {
                  createInvoice,
                  payDebit,
                  payCredit,
                  updatePurchase,
                  updateLedger,
                },
              };
            } else {
              response = {
                status: false,
                message: "Invoice Created but Failed to Update Payment",
                data: createInvoice,
              };
            }
          } else {
            response = {
              status: false,
              message: "Invoice Created but Failed to Update Bank",
              data: createInvoice,
            };
          }

          await this.invoiceItemsService.updatePurchasePaymentDate(
            createDto.adminid,
            createDto.userid,
            createDto.id,
            createDto.paymentInfo.date
          );
        } else {
          response = {
            status: true,
            message: "Purchase Invoice Created Successfully",
            data: createInvoice,
          };
        }
        await this.userSettings.updateLastInvoiceNo(
          createDto.adminid,
          createDto.companyid,
          createDto.seriesNo,
          createDto.type
        );
      }
    } else {
      response = {
        status: false,
        message: "Error while creating Invoice/Credit Note",
        data: null,
      };
    }
    return response;
  }

  async updateData(id: number, updateDto: any, transaction: any) {
    const cart = await this.cartRepository.findByPk<PurchaseInvoice>(id);
    if (!cart) {
      throw new HttpException("cart not found.", HttpStatus.NOT_FOUND);
    }
    cart.userid = updateDto.userid || cart.userid;
    cart.supplierid = updateDto.supplierid || cart.supplierid;
    cart.invoiceno = updateDto.invoiceno || cart.invoiceno;
    cart.total = updateDto.total || cart.total;
    cart.outstanding =
      updateDto.outstanding === 0
        ? updateDto.outstanding
        : updateDto.outstanding || cart.outstanding;
    cart.sname = updateDto.sname || cart.sname;
    cart.status = updateDto.status || cart.status;
    cart.type = updateDto.type || cart.type;
    cart.adminid = updateDto.adminid || cart.adminid;
    cart.share = updateDto.share || cart.share;
    cart.sdate = updateDto.sdate || cart.sdate;
    cart.ldate = updateDto.ldate || cart.ldate;
    cart.userdate = updateDto.userdate || cart.userdate;

    try {
      let invoice: any = await cart.save({ transaction });
      return {
        data: invoice,
        status: true,
        message: "Invoice Updated Successfully",
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDataa(id: number, updateDto: any) {
    const cart = await this.cartRepository.findByPk<PurchaseInvoice>(id);
    if (!cart) {
      throw new HttpException("cart not found.", HttpStatus.NOT_FOUND);
    }
    cart.userid = updateDto.userid || cart.userid;
    cart.supplierid = updateDto.supplierid || cart.supplierid;
    cart.invoiceno = updateDto.invoiceno || cart.invoiceno;
    cart.total = updateDto.total || cart.total;
    cart.outstanding =
      updateDto.outstanding === 0
        ? updateDto.outstanding
        : updateDto.outstanding || cart.outstanding;
    cart.sname = updateDto.sname || cart.sname;
    cart.status = updateDto.status || cart.status;
    cart.type = updateDto.type || cart.type;
    cart.adminid = updateDto.adminid || cart.adminid;
    cart.share = updateDto.share || cart.share;
    cart.sdate = updateDto.sdate || cart.sdate;
    cart.ldate = updateDto.ldate || cart.ldate;
    cart.userdate = updateDto.userdate || cart.userdate;

    try {
      let invoice: any = await cart.save();
      return {
        data: invoice,
        status: true,
        message: "Invoice Updated Successfully",
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateDto: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const cart = await this.cartRepository.findByPk<PurchaseInvoice>(id);
          if (!cart) {
            return new CommonResponseDto(
              null,
              false,
              "No invoice found for provided details"
            );
          }

          cart.userid = updateDto.userid || cart.userid;
          cart.supplierid = updateDto.supplierid || cart.supplierid;
          cart.invoiceno = updateDto.invoiceno || cart.invoiceno;
          cart.total = updateDto.total || cart.total;
          cart.outstanding =
            updateDto?.outstanding ||
            updateDto?.paymentInfo?.outstanding ||
            cart.outstanding;

          cart.sname = updateDto.sname || cart.sname;
          cart.type = updateDto.type || cart.type;
          cart.adminid = updateDto.adminid || cart.adminid;
          cart.invoiceimage = updateDto.invoiceimage || cart.invoiceimage;
          cart.invoicedoc = updateDto.invoicedoc || cart.invoicedoc;
          cart.quotes = updateDto.quotes || cart.quotes;
          cart.share = updateDto.share || cart.share;
          cart.sdate = updateDto.sdate || cart.sdate;
          cart.ldate = updateDto.ldate || cart.ldate;
          cart.userdate = updateDto.paymentInfo
            ? updateDto.paymentInfo.date
            : updateDto.userdate || cart.userdate;
          cart.paymentdate = updateDto.paymentInfo
            ? updateDto.paymentInfo.date
            : updateDto.paymentdate || cart.paymentdate;
          cart.refid = updateDto.refid || cart.refid;
          cart.purchase_ref = updateDto.purchase_ref || cart.purchase_ref;
          cart.quantity = updateDto.quantity || cart.quantity;
          cart.overall_discount = updateDto?.overall_discount;
          cart.taxable_value = updateDto?.taxable_value;
          // cart.roundOff = updateDto?.roundOff || 0;
          cart.createdBy = updateDto.createdBy;
          cart.companyid = updateDto.companyid;
          cart.usertype = updateDto.usertype;
          cart.seriesNo = updateDto.seriesNo;

          if (updateDto.pagetype == "4") {
            cart.status = 4;
          } else {
            cart.status = Number(updateDto.status) || cart.status;
          }

          let invoice: any = await cart.save();

          if (updateDto.type === "order") {
            await this.invoiceItemsService.deleteInvoiceItems({
              where: {
                purchaseid: invoice.id,
                adminid: invoice.adminid,
                userid: invoice.userid,
              },
            });
            const lineitems =
              await this.invoiceItemsHelperService.createInvoiceLineItem(
                updateDto.type,
                invoice,
                updateDto
              );

            const saveInvoiceItem =
              await this.invoiceItemsService.createInvoiceItems(lineitems);

            response = {
              status: true,
              message: "Purchase order updated successfully",
              data: invoice,
            };
          } else {
            response = await this.updateInvoiceToledger(
              invoice,
              updateDto,
              transaction
            );
          }
        }
      );
    } catch (err) {
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: err,
      };
      console.log(err);
    }
    return response;
  }

  async updateInvoiceToledger(
    checkInvoice: any,
    updateDto: any,
    transaction: any
  ) {
    try {
      let totalVat = 0;
      let totalNet = 0;
      let totalDiscount = 0;
      let index = 0;
      const ledgerAcc: any = updateDto.ledger;

      let type =
        updateDto.type == "pinvoice" || updateDto.type == "purchase"
          ? "pinvoice"
          : updateDto.type == "stockassets"
          ? "stockassets"
          : "pcredit";
      let response: CommonResponseDto;
      if (checkInvoice) {
        const deleteingLedgerDetails = await this.ledger_details.findAllByQuery(
          {
            where: {
              adminid: checkInvoice.adminid,
              purchaseid: checkInvoice.id,
              type: {
                [Op.notIn]: ["Supplier Payment", "Supplier Receipt"],
              },
            },
          }
        );

        const deleteingInvoiceItems =
          await this.invoiceItemsService.findAllByQuery({
            where: {
              adminid: checkInvoice.adminid,
              purchaseid: checkInvoice.id,
              type: {
                [Op.notIn]: ["Supplier Payment", "Supplier Receipt"],
              },
            },
          });

        let deleteLedger: boolean = false;
        if (deleteingLedgerDetails && deleteingLedgerDetails.length > 0) {
          for (let i = 0; i < deleteingLedgerDetails.length; i++) {
            const deleteLedgers = await this.ledger_details.delete(
              deleteingLedgerDetails[i].id
            );
            if (i === deleteingLedgerDetails.length - 1) {
              deleteLedger = true;
            }
          }
          let deletedInvoiceItems =
            await this.invoiceItemsService.deleteInvoiceItems({
              where: {
                purchaseid: checkInvoice.id,
                adminid: checkInvoice.adminid,
                userid: checkInvoice.userid,
              },
            });
        }
        const lineitems =
          await this.invoiceItemsHelperService.createInvoiceLineItem(
            type,
            checkInvoice,
            updateDto
          );
        const saveInvoiceItem =
          await this.invoiceItemsService.createInvoiceItems(lineitems);

        if (deleteLedger) {
          let count = 0;

          let updatedStockData = [];
          let updatedLocationStockData = [];

          for (let i = 0; i < deleteingInvoiceItems.length; i++) {
            const item = deleteingInvoiceItems[i];

            let product: any = await this.product_service.findById(
              Number(item.idescription)
            );

            if (product.itemtype == "Stock" || product.itemtype == "Nonstock") {
              const productLocationStock: any =
                await this.productLocationMasterService.findOne(
                  item.productLocationRef
                );

              let stock = Number(product.stock);
              let locationStock = Number(productLocationStock.data.stock);

              if (type === "pinvoice" || type === "purchase") {
                stock = stock - Number(item.quantity);
                locationStock = Number(locationStock) - Number(item.quantity);
              } else if (type === "pcredit") {
                stock = stock + Number(item.quantity);
                locationStock = Number(locationStock) + Number(item.quantity);
              }
              let stockObj = {
                stock: Number(stock).toFixed(0),
                quantity: Number(stock),
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

          let isService = false;
          for (let i = 0; i < updateDto.columns.length; i++) {
            let element = updateDto.columns[i];
            count++;
            if (element.product?.itemtype === "Service") {
              isService = true;
            }

            if (
              element.product.itemtype == "Stock" ||
              element.product.itemtype == "Nonstock"
            ) {
              let oldEntry = updatedStockData.find(
                (item: any) => element.product.id === item.id
              );
              let oldProductLocationEntry = updatedLocationStockData.find(
                (item: any) => element.productLocationRef == item.id
              );

              let newEntry = updateDto.columns.find(
                (item: any) =>
                  !deleteingInvoiceItems.some(
                    (deleted) => Number(deleted.idescription) === item.id
                  )
              );
              let newProductLocationEntry = updateDto.columns.find(
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

              if (type === "pinvoice" || type === "purchase") {
                stock = Number(stock) + Number(element.quantity);
                locationStock =
                  Number(locationStock) + Number(element.quantity);
              } else if (type === "pcredit") {
                stock = Number(stock) - Number(element.quantity);
                locationStock =
                  Number(locationStock) - Number(element.quantity);
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

            const costprice = element.costprice;
            const quantity = element.quantity;
            let totalamount = Number(costprice) * Number(quantity);
            const discount = element.discountamt
              ? Number(element.discountamt)
              : 0;
            if (discount && discount > 0) {
              totalamount = totalamount - discount;
            }
            const incomeTaxAmount = Number(element.vatamount)
              ? Number(element.vatamount)
              : 0;
            if (element.includevat) {
              totalamount = totalamount - incomeTaxAmount;
            }
            totalVat += incomeTaxAmount;
            totalNet += totalamount;
            totalDiscount += Number(element.discountamt);
          }

          // round off entry to ledger details
          // if (Number(updateDto.roundOff) !== Number(0)) {
          //   let roundCreditData: any = {
          //     saleid: checkInvoice.id,
          //     sdate: updateDto.sdate,
          //     ldate: updateDto.ldate,
          //     ledger: "5",
          //     cname: updateDto.customerid,
          //     total: totalNet,
          //     userid: updateDto.userid,
          //     ledgercategory: ledgerAcc?.category,
          //     adminid: updateDto.adminid || 0,
          //     userdate: updateDto.userdate,
          //     type:
          //       type == "pinvoice"
          //         ? "Purchase Invoice"
          //         : type == "stockassets"
          //         ? "stockassets"
          //         : "Purchase Credit Notes",
          //     credit: updateDto.roundOff > 0 ? updateDto.roundOff : 0,
          //     debit: updateDto.roundOff > 0 ? 0 : updateDto.roundOff,
          //     booleantype: "1",
          //     usertype: "customer",
          //     used: "group",
          //     invoiceno: checkInvoice.invoiceno,
          //     baseid: null,
          //     createdBy: updateDto.createdBy,
          //     companyid: updateDto.companyid,
          //   };
          //   const roundCredit = await this.ledger_details.create(
          //     roundCreditData,
          //     transaction
          //   );
          //   let roundDebitData: any = {
          //     saleid: checkInvoice.id,
          //     sdate: updateDto.sdate,
          //     ldate: updateDto.ldate,
          //     ledger: "51",
          //     cname: updateDto.customerid,
          //     total: totalNet,
          //     userid: updateDto.userid,
          //     ledgercategory: "3",
          //     adminid: updateDto.adminid || 0,
          //     userdate: updateDto.userdate,
          //     type:
          //       type == "pinvoice"
          //         ? "Purchase Invoice"
          //         : type == "stockassets"
          //         ? "stockassets"
          //         : "Purchase Credit Notes",
          //     totalamount: totalNet,
          //     credit: updateDto.roundOff > 0 ? 0 : updateDto.roundOff,
          //     debit: updateDto.roundOff > 0 ? updateDto.roundOff : 0,
          //     booleantype: "1",
          //     usertype: "customer",
          //     discount_status: "1",
          //     invoiceno: checkInvoice.invoiceno,
          //     baseid: roundCreditData.id,
          //     createdBy: updateDto.createdBy,
          //     companyid: updateDto.companyid,
          //   };
          //   const roundDebit = await this.ledger_details.create(
          //     roundDebitData,
          //     transaction
          //   );
          // }

          if (isService === true) {
            let data1 = {
              purchaseid: checkInvoice.id,
              sdate: updateDto.purchase.sdate,
              ldate: updateDto.purchase.ldate,
              cname: updateDto.supplier.id,
              ledger: ledgerAcc.id,
              total: totalNet,
              ledgercategory: ledgerAcc.category,
              userid: updateDto.userid,
              adminid: updateDto.adminid,
              type:
                type == "pinvoice"
                  ? "Purchase Invoice"
                  : type == "stockassets"
                  ? "stockassets"
                  : "Purchase Credit Notes",
              credit:
                type == "pinvoice" || type == "stockassets"
                  ? 0
                  : updateDto.total,
              debit:
                type == "pinvoice" || type == "stockassets"
                  ? updateDto.total
                  : 0,
              booleantype:
                type == "pinvoice" || type == "stockassets" ? "2" : "25",
              usertype: "supplier",
              used: "group",
              discount_status: "0",
              invoiceno: checkInvoice.invoiceno,
              userdate: updateDto.userdate,
              createdBy: updateDto.createdBy,
              companyid: updateDto.companyid,
            };
            let returnid = await this.ledger_details.create(data1, transaction);
            let data2 = {
              purchaseid: checkInvoice.id,
              sdate: updateDto.purchase.sdate,
              ldate: updateDto.purchase.ldate,
              ledger: "51",
              cname: updateDto.supplier.id,
              total: totalNet,
              ledgercategory: "4",
              userid: updateDto.userid,
              adminid: updateDto.adminid,
              userdate: updateDto.userdate,
              type:
                type == "pinvoice"
                  ? "Purchase Invoice"
                  : type == "stockassets"
                  ? "stockassets"
                  : "Purchase Credit Notes",
              debit:
                type == "pinvoice" || type == "stockassets"
                  ? 0
                  : updateDto.total,
              credit:
                type == "pinvoice" || type == "stockassets"
                  ? updateDto.total
                  : 0,
              discount_status: "1",
              booleantype:
                type == "pinvoice" || type == "stockassets" ? "2" : "25",
              usertype: "supplier",
              baseid: returnid.id,
              createdBy: updateDto.createdBy,
              companyid: updateDto.companyid,
            };

            let result = await this.ledger_details.create(data2, transaction);
          } else {
            let data1 = {
              purchaseid: checkInvoice.id,
              sdate: updateDto.purchase.sdate,
              ldate: updateDto.purchase.ldate,
              cname: updateDto.supplier.id,
              ledger: ledgerAcc.id,
              total: totalNet,
              ledgercategory: ledgerAcc.category,
              userid: updateDto.userid,
              adminid: updateDto.adminid,
              type:
                type == "pinvoice"
                  ? "Purchase Invoice"
                  : type == "stockassets"
                  ? "stockassets"
                  : "Purchase Credit Notes",
              credit:
                type == "pinvoice" || type == "stockassets"
                  ? 0
                  : totalNet + totalDiscount,
              debit:
                type == "pinvoice" || type == "stockassets"
                  ? type == "stockassets"
                    ? totalNet + totalVat
                    : totalNet + totalDiscount
                  : 0,
              booleantype:
                type == "pinvoice" || type == "stockassets" ? "2" : "25",
              usertype: "supplier",
              used: "group",
              discount_status: "0",
              invoiceno: checkInvoice.invoiceno,
              userdate: updateDto.userdate,
              createdBy: updateDto.createdBy,
            };
            let returnid = await this.ledger_details.create(data1, transaction);
            let data2 = {
              purchaseid: checkInvoice.id,
              sdate: updateDto.purchase.sdate,
              ldate: updateDto.purchase.ldate,
              ledger: "51",
              cname: updateDto.supplier.id,
              total: totalNet,
              ledgercategory: "4",
              userid: updateDto.userid,
              adminid: updateDto.adminid,
              userdate: updateDto.userdate,
              type:
                type == "pinvoice"
                  ? "Purchase Invoice"
                  : type == "stockassets"
                  ? "stockassets"
                  : "Purchase Credit Notes",
              debit:
                type == "pinvoice" || type == "stockassets"
                  ? 0
                  : type == "stockassets"
                  ? totalVat + totalNet
                  : totalNet + totalDiscount,
              credit:
                type == "pinvoice" || type == "stockassets"
                  ? type == "stockassets"
                    ? totalVat + totalNet
                    : totalNet + totalDiscount
                  : 0,
              discount_status: "1",
              booleantype:
                type == "pinvoice" || type == "stockassets" ? "2" : "25",
              usertype: "supplier",
              baseid: returnid.id,
              createdBy: updateDto.createdBy,
              companyid: updateDto.companyid,
            };

            let result = await this.ledger_details.create(data2, transaction);
            if (totalDiscount > 0 && type !== "stockassets") {
              let discountDebitData = {
                purchaseid: checkInvoice.id,
                sdate: updateDto.sdate,
                ldate: updateDto.ldate,
                ledger: ledgerAcc.id,
                cname: updateDto.customerid,
                total: -totalDiscount,
                userid: updateDto.userid,
                ledgercategory: ledgerAcc.category,
                adminid: updateDto.adminid || 0,
                userdate: updateDto.userdate,
                type:
                  type == "pinvoice"
                    ? "Purchase Invoice"
                    : type == "stockassets"
                    ? "stockassets"
                    : "Purchase Credit Notes",
                credit: type == "pinvoice" ? totalDiscount : 0,
                debit: type == "pinvoice" ? 0 : totalDiscount,
                booleantype: type == "pinvoice" ? "2" : "25",
                usertype: "supplier",
                used: "discount",
                invoiceno: checkInvoice.invoiceno,
                discount_status: "1",
                baseid: null,
                createdBy: updateDto.createdBy,
                companyid: updateDto.companyid,
              };
              const discountDebit = await this.ledger_details.create(
                discountDebitData,
                transaction
              );
              let discountCreditData = {
                purchaseid: checkInvoice.id,
                sdate: updateDto.sdate,
                ldate: updateDto.ldate,
                ledger: "51",
                cname: updateDto.customerid,
                total: -totalDiscount,
                userid: updateDto.userid,
                ledgercategory: "4",
                adminid: updateDto.adminid || 0,
                userdate: updateDto.userdate,
                type:
                  type == "pinvoice"
                    ? "Purchase Invoice"
                    : type == "stockassets"
                    ? "stockassets"
                    : "Purchase Credit Notes",
                debit: type == "pinvoice" ? totalDiscount : 0,
                credit: type == "pinvoice" ? 0 : totalDiscount,
                booleantype: type == "pinvoice" ? "2" : "25",
                usertype: "supplier",
                used: "discount",
                discount_status: "1",
                invoiceno: checkInvoice.invoiceno,
                baseid: discountDebit.id,
                createdBy: updateDto.createdBy,
                companyid: updateDto.companyid,
              };
              const discountCredit = await this.ledger_details.create(
                discountCreditData,
                transaction
              );
            }
            if (totalVat > 0 && type !== "stockassets") {
              let taxData = {
                purchaseid: checkInvoice.id,
                sdate: updateDto.purchase.sdate,
                ldate: updateDto.purchase.ldate,
                ledger: "55",
                cname: updateDto.supplier.id,
                total: totalVat,
                userid: updateDto.userid,
                ledgercategory: "4",
                adminid: updateDto.adminid,
                userdate: updateDto.userdate,
                type:
                  type == "pinvoice"
                    ? "Purchase Invoice"
                    : type == "stockassets"
                    ? "stockassets"
                    : "Purchase Credit Notes",
                discount_status: "0",
                credit: type == "pinvoice" ? 0 : totalVat,
                debit: type == "pinvoice" ? totalVat : 0,
                booleantype: type == "pinvoice" ? "2" : "25",
                usertype: "supplier",
                used: "incometax",
                invoiceno: checkInvoice.invoiceno,
                createdBy: updateDto.createdBy,
                companyid: updateDto.companyid,
              };

              const resultTax = await this.ledger_details.create(
                taxData,
                transaction
              );

              let taxData1 = {
                purchaseid: checkInvoice.id,
                sdate: updateDto.purchase.sdate,
                ldate: updateDto.purchase.ldate,
                ledger: "51",
                cname: updateDto.supplier.id,
                total: totalVat,
                userid: updateDto.userid,
                ledgercategory: "4",
                adminid: updateDto.adminid,
                userdate: updateDto.userdate,
                type:
                  type == "pinvoice"
                    ? "Purchase Invoice"
                    : type == "stockassets"
                    ? "stockassets"
                    : "Purchase Credit Notes",
                invoiceno: checkInvoice.invoiceno,
                discount_status: "1",
                debit:
                  type == "pinvoice" || type == "stockassets" ? 0 : totalVat,
                credit:
                  type == "pinvoice" || type == "stockassets" ? totalVat : 0,
                booleantype:
                  type == "pinvoice" || type == "stockassets" ? "2" : "25",
                usertype: "supplier",
                used: "incometax",
                baseid: resultTax.id,
                createdBy: updateDto.createdBy,
                companyid: updateDto.companyid,
              };
              const resultTax1 = await this.ledger_details.create(
                taxData1,
                transaction
              );

              let deletedVatLedger = deleteingLedgerDetails.find(
                (item: any) => item.ledger === 55
              );
              let previousTotalVat = deletedVatLedger?.total;

              // update vat ledger total account master
              // const vatLedger = await this.account_master.findAllByQuery({
              //   attributes: ['id', 'total'],
              //   where: {
              //     nominalcode: 2202,
              //     userid: updateDto.userid
              //   },
              // });

              // if (vatLedger) {
              //   let totalVal;
              //   let previousTotalVat;
              //   if (type == 'pinvoice') {
              //     totalVal = -totalVat;
              //     previousTotalVat = deletedVatLedger?.total;
              //   } else if (type == "pcredit") {
              //     totalVal = totalVat;
              //     previousTotalVat = Number(deletedVatLedger?.total) * -1;
              //   }

              //   let accountData = {
              //     total: Number(vatLedger[0]?.total) + Number(totalVal) + Number(previousTotalVat)
              //   }
              //   const updateVatLedger = await this.account_master.update(
              //     vatLedger[0]?.id,
              //     accountData,
              //     transaction,
              //   );
              // }
            }
          }

          if (count == updateDto.columns.length) {
            if (updateDto.paymentInfo) {
              let payDebitData = {
                total: updateDto.paymentInfo.amount,
                paidmethod: updateDto.paymentInfo.paidmethod,
                sdate: updateDto.paymentInfo.date,
                userid: updateDto.userid,
                cname: updateDto.supplier.id,
                ledger: updateDto.paymentInfo.bankid,
                ledgercategory: "1",
                purchaseid: checkInvoice.id,
                type: "Supplier Payment",
                userdate: updateDto.userdate,
                createdAt: new Date(),
                updatedAt: new Date(),
                adminid: updateDto.adminid,
                debit: 0,
                credit: updateDto.paymentInfo.amount,
                booleantype: "3",
                usertype: "supplier",
                bankid: updateDto.paymentInfo.bankid,
                referenceid: checkInvoice.id,
                discount_status: "0",
                running_total: updateDto.paymentInfo.running_total,
                createdBy: updateDto.createdBy,
                companyid: updateDto.companyid,
              };
              const payDebit = await this.ledger_details.create(
                payDebitData,
                transaction
              );

              let payCreditData = {
                total: updateDto.paymentInfo.amount,
                paidmethod: updateDto.paymentInfo.paidmethod,
                sdate: updateDto.paymentInfo.date,
                userid: updateDto.userid,
                cname: updateDto.supplier.id,
                ledger: "51",
                ledgercategory: "4",
                purchaseid: checkInvoice.id,
                type: "Supplier Payment",
                userdate: updateDto.userdate,
                createdAt: new Date(),
                updatedAt: new Date(),
                adminid: updateDto.adminid,
                debit: updateDto.paymentInfo.amount,
                credit: 0,
                booleantype: "3",
                discount_status: "1",
                usertype: "supplier",
                transferid: payDebit.id,
                baseid: payDebit.id,
                referenceid: checkInvoice.id,
                bankid: updateDto.paymentInfo.bankid,
                running_total: updateDto.paymentInfo.running_total,
                createdBy: updateDto.createdBy,
                companyid: updateDto.companyid,
              };
              let status = updateDto.status;
              if (
                Number(updateDto.paymentInfo.amount) ==
                  Number(updateDto.total) ||
                Number(updateDto.paymentInfo.outstanding) === 0
              ) {
                status = "2";
              } else if (
                Number(updateDto.paymentInfo.amount) <
                  Number(updateDto.total) &&
                Number(updateDto.paymentInfo.outstanding) > 0
              ) {
                status = "1";
              } else if (Number(updateDto.paymentInfo.amount) == 0) {
                status = "0";
              }
              const payCredit = await this.ledger_details.create(
                payCreditData,
                transaction
              );
              checkInvoice.outstanding = updateDto.paymentInfo.outstanding;
              checkInvoice.status = status;
              const updatePurchase = await this.updateOutstandingAmount(
                checkInvoice.id,
                checkInvoice,
                transaction
              );
              let ledgerView = await this.account_master.findOne(
                updateDto.paymentInfo.bankid
              );

              if (ledgerView.status) {
                let totalamount = ledgerView.data.total;
                let totalAmountPlus =
                  Number(totalamount) - Number(updateDto.paymentInfo.amount);
                let purchaseData_3 = {
                  total: totalAmountPlus,
                  userdate: updateDto.userdate,
                  updatedAt: new Date(),
                };
                const updateLedger = await this.account_master.update(
                  updateDto.paymentInfo.bankid,
                  purchaseData_3,
                  transaction
                );
                if (updateLedger) {
                  response = {
                    status: true,
                    message: "Purchase Invoice Updated and Completed Payment",
                    data: checkInvoice,
                  };
                  response = {
                    status: true,
                    message: "Purchase Invoice Updated and Completed Payment",

                    data: {
                      checkInvoice,
                      payDebit,
                      payCredit,
                      updatePurchase,
                      updateLedger,
                    },
                  };
                } else {
                  response = {
                    status: false,
                    message: "Invoice Created but Failed to Update Payment",
                    data: checkInvoice,
                  };
                }
              } else {
                response = {
                  status: false,
                  message: "Invoice Created but Failed to Update Bank",
                  data: checkInvoice,
                };
              }
            } else {
              response = {
                status: true,
                message: "Purchase Invoice Updated Successfully",
                data: {
                  checkInvoice,
                  deleteingLedgerDetails,
                },
              };
            }
            await this.invoiceItemsService.updatePurchasePaymentDate(
              updateDto.adminid,
              updateDto.userid,
              updateDto.id,
              updateDto.paymentInfo.date
            );
          }
        } else {
          response = {
            status: true,
            message: "Invoice Updated without updating Item Information.",
            data: null,
          };
        }
      } else {
        response = {
          status: false,
          message: "Failed to update Invoice",
          data: null,
        };
      }
      return response;
    } catch (err) {
      console.log("error in invoice update", err);
    }
  }

  async delete(id: number) {
    const cart = await this.cartRepository.findByPk<PurchaseInvoice>(id);
    await cart.destroy();
    return new PurchaseInvoiceDto(cart);
  }

  async getInvoiceNo(id, type) {
    let response: CommonResponseDto;
    let likeQuery = "PI-";
    if (type == "purchase") {
      likeQuery = "PI-";
    } else if (type == "pcredit") {
      likeQuery = "PCN-";
    } else if (type == "retail") {
      likeQuery = "REINV-";
    }
    const data = await this.cartRepository.findAll<PurchaseInvoice>({
      where: {
        adminid: id,
        invoiceno: { [Op.like]: `${likeQuery}%` },
      },
      order: [["id", "DESC"]],
      limit: 1,
    });
    if (data) {
      let newID: any = "";
      if (data.length > 0) {
        let splitString = String(data[0].invoiceno).split("-");
        let newID: any = Number(splitString[1]) + 1;
        newID = likeQuery + "" + newID;
        response = {
          data: newID,
          status: true,
          message: "Generating New Invoice ID",
        };
      } else {
        newID = likeQuery + "" + 1;
        response = {
          data: newID,
          status: true,
          message: "Generating New Invoice ID",
        };
      }
    } else {
      response = {
        data: null,
        status: false,
        message: "Error Generating New Invoice ID",
      };
    }
    return response;
  }

  async findBySupplier(id: number, type: string) {
    try {
      let response: CommonResponseDto = {
        status: false,
        message: null,
        data: null,
      };
      const invoiceDetails =
        await this.cartRepository.findByPk<PurchaseInvoice>(id, {
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
            {
              model: LocationMaster,
              as: "locationDetails",
            },
          ],
        });
      if (!invoiceDetails) {
        throw new HttpException("No awb invomer found", HttpStatus.NOT_FOUND);
      }
      let banking: any = [];
      let bankList: any = [];
      const invoiceTotal = invoiceDetails.total;
      if (type == "purchase" || type == "qpurchase") {
        bankList = await this.ledger_details.findAllByQuery({
          where: {
            adminid: invoiceDetails.adminid,
            purchaseid: id,
            type: {
              [Op.or]: ["Supplier Payment", "Supplier Receipt"],
            },
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
          if (element.type === "Supplier Payment") {
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
            banking.push(resList);
          } else {
            const bankInfo = await this.account_master.findById(element.bankid);
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
            purchaseid: id,
            type: {
              [Op.or]: ["Supplier Refund", "Supplier Receipt"],
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
            if (element.type == "Supplier Refund") {
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
          purchaseid: id,
          used: "group",
        },
        include: [
          {
            model: PurchaseInvoice,
            as: "purchase",
          },
        ],
        order: [["id", "DESC"]],
        raw: true,
      });
      let invoiceItem: any = [];
      if (columns && columns.length > 0) {
        for (let i = 0; i < columns.length; i++) {
          let element = columns[i];
          let itemDetail: any = { ...element };
          const productInfo: any = await this.product_service.findOneByQuery(
            Number(element.idescription),
            {
              where: {
                adminid: invoiceDetails.adminid,
              },
              include: [
                {
                  model: unit,
                  as: "unitDetails",
                },
              ],
            }
          );
          itemDetail.product = productInfo;
          const ledgerInfo = await this.account_master.findByQuery(
            Number(element.ledger),
            {
              where: {
                userid: {
                  [Op.or]: ["-2"],
                },
                adminid: {
                  [Op.or]: ["", invoiceDetails.adminid],
                },
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
    }
  }

  async updateOutstandingAmount(id: number, updateData: any, transaction: any) {
    const purchaseInv = await this.findById(id);
    purchaseInv.outstanding = updateData.outstanding;
    purchaseInv.status = updateData.status;
    if (updateData.userdate) {
      purchaseInv.userdate = updateData.userdate;
    }
    if (updateData.paymentdate) {
      purchaseInv.paymentdate = updateData.paymentdate;
    }
    let saveInvoice = await purchaseInv.save({ transaction });
    return saveInvoice;
  }

  async listSupplierPay(id, adminid, companyid, debit) {
    let response: CommonResponseDto;
    try {
      let wherCase = {
        supplierid: id,
        adminid: adminid,
        companyid: companyid,
        status: {
          [Op.notIn]: [2, 10],
        },
      };

      if (debit?.type) {
        wherCase["status"] = {
          [Op.notIn]: [10],
        };
        wherCase["type"] = {
          [Op.notIn]: ["stockassets", "pcredit"],
        };
      }
      const purchaseDetails =
        await this.cartRepository.findAll<PurchaseInvoice>({
          where: wherCase,
          order: [["id", "DESC"]],
        });

      let recList = [];

      if (purchaseDetails) {
        purchaseDetails.forEach((element: any) => {
          let dataAry;
          if (element.type == "purchase" || element.type == "stockassets") {
            dataAry = {
              id: element.id,
              invoiceno: element.invoiceno,
              sname: element.sname,
              date: element.sdate,
              reference: element.reference,
              total: element.total,
              duplicateout: element.outstanding,
              amountpaid: 0,
              rout: element.outstanding,
              checked: 0,
              ledgerid: "",
              ledgercategory: "",
              type:
                element.type === "purchase"
                  ? "Purchase Invoice"
                  : "Purchase Asset",
            };
          }
          recList.push(dataAry);
        });
      }
      response = {
        status: true,
        message: "List Supplier Pay",
        data: recList,
      };
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

  async findByLocationAndSupplier(userId: number, queryData: any) {
    let response: CommonResponseDto;
    try {
      let wherCase = {
        supplierid: queryData.supplierId,
        adminid: userId,
        companyid: queryData.companyId,
        seriesNo: queryData.locationId,
        status: {
          [Op.notIn]: [2, 10],
        },
      };

      if (queryData?.type) {
        wherCase["status"] = {
          [Op.notIn]: [10],
        };
        wherCase["type"] = {
          [Op.notIn]: ["stockassets", "pcredit"],
        };
      }
      const purchaseDetails =
        await this.cartRepository.findAll<PurchaseInvoice>({
          where: wherCase,
          order: [["id", "DESC"]],
        });

      let recList = [];

      if (purchaseDetails) {
        purchaseDetails.forEach((element: any) => {
          let dataAry;
          if (element.type == "purchase" || element.type == "stockassets") {
            dataAry = {
              id: element.id,
              invoiceno: element.invoiceno,
              sname: element.sname,
              date: element.sdate,
              reference: element.reference,
              total: element.total,
              duplicateout: element.outstanding,
              amountpaid: 0,
              rout: element.outstanding,
              checked: 0,
              ledgerid: "",
              ledgercategory: "",
              type:
                element.type === "purchase"
                  ? "Purchase Invoice"
                  : "Purchase Asset",
            };
          }
          recList.push(dataAry);
        });
      }
      response = {
        status: true,
        message: "List Supplier Pay",
        data: recList,
      };
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

  async supplierPayidList(id, adminid) {
    let response: CommonResponseDto;
    try {
      const purchaseDetails =
        await this.cartRepository.findAll<PurchaseInvoice>({
          where: {
            supplierid: id,
            adminid: adminid,
            type: "pcredit",
            status: {
              [Op.ne]: 2,
            },
          },
          order: [["sdate", "DESC"]],
        });
      let recList = [];
      if (purchaseDetails) {
        purchaseDetails.forEach((element: any) => {
          let dataAry: any = {
            id: element.id,
            sname: element.sname,
            date: element.sdate,
            reference: "supplier Refund Invoice",
            total: element.total,
            duplicateout: element.outstanding,
            amountpaid: 0,
            rout: element.outstanding,
            checked: 0,
            ledgerid: "",
            ledgercategory: "",
            invoiceno: element.invoiceno,
            type: "Purchase debit note",
          };
          recList.push(dataAry);
        });
      }
      response = {
        status: true,
        message: "List Supplier Refund List",
        data: recList,
      };
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

  async addSuppReceipt(req: CreatePurhcaseReceiptDto) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          var creditData = {
            ledger: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.sname,
            type: req.receipttype,
            status: "2",
            usedamount: 0,
            userdate: req.userdate,
            credit: 0,
            adminid: req.adminid,
            debit: req.amount,
            booleantype: "6",
            discount_status: "0",
            usertype: "supplier",
            ledgercategory: "1",
            totalamount: -req.amount,
            saleid: req.item[0].id,
            totalamt: req.item[0].total,
            outstanding: req.item[0].remainout,
          };
          const createLedgerDetails = await this.ledger_details.create(
            creditData,
            transaction
          );

          let debitData = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.sname,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "6",
            baseid: createLedgerDetails.id,
            usertype: "supplier",
            adminid: req.adminid,
            totalamount: -req.amount,
            credit: req.amount,
            debit: 0,
            ledger: "51",
            ledgercategory: "4",
            saleid: req.item[0].id,
            totalamt: req.item[0].total,
            outstanding: req.item[0].remainout,
          };
          const createLedgerDetails2 = await this.ledger_details.create(
            debitData,
            transaction
          );

          var ledgerData = await this.account_master.findById(req.paidto);
          let totalamount = ledgerData.total;
          let totalamountminus = Number(totalamount) - Number(req.amount);
          let data4 = {
            total: totalamountminus.toFixed(2),
            userdate: req.userdate,
          };
          const result = await this.account_master.update(
            req.paidto,
            data4,
            transaction
          );

          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.type == "Purchase Invoice") {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                let data5 = {
                  cname: req.sname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  type: "Supplier Payment",
                  used,
                  receiptid: element.itemid,
                  userdate: req.userdate,
                  purchaseid: element.id,
                  booleantype: "10",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: element.amountpaid,
                  debit: 0,
                  ledger: req.paidto,
                  ledgercategory: "1",
                  transferid: createLedgerDetails.id,
                  invoiceno: element.invoiceno,
                  totalamt: element.total,
                  outstanding: element.remainout,
                };
                const resultData5 = await this.ledger_details.create(
                  data5,
                  transaction
                );

                let data6 = {
                  cname: req.sname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  type: "Supplier Payment",
                  used,
                  receiptid: element.itemid,
                  userdate: req.userdate,
                  purchaseid: element.id,
                  debit: element.amountpaid,
                  credit: 0,
                  ledger: "51",
                  ledgercategory: "4",
                  baseid: resultData5.id,
                  booleantype: "4",
                  discount_status: "1",
                  usertype: "supplier",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: createLedgerDetails.id,
                  invoiceno: element.invoiceno,
                  totalamt: element.total,
                  outstanding: element.remainout,
                };
                const resultData6 = await this.ledger_details.create(
                  data6,
                  transaction
                );
                let data1: any = {
                  outstanding: element.remainout,
                  status,
                };

                const purchaseUpdate = await this.updateData(
                  element.id,
                  data1,
                  transaction
                );
              } else if (element.type == "Purchase Credit Notes") {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                let data6 = {
                  cname: req.sname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  type: "Supplier Receipt",
                  used,
                  receiptid: element.itemid,
                  userdate: req.userdate,
                  purchaseid: element.id,
                  booleantype: "27",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: 0, //element.amountpaid,
                  debit: 0,
                  ledger: req.paidto,
                  ledgercategory: "1",
                  transferid: createLedgerDetails.id,
                  invoiceno: element.invoiceno,
                  totalamt: element.total,
                  outstanding: element.remainout,
                };
                const result6 = await this.ledger_details.create(
                  data6,
                  transaction
                );

                let data7 = {
                  cname: req.sname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  type: "Supplier Receipt",
                  used,
                  receiptid: element.itemid,
                  userdate: req.userdate,
                  purchaseid: element.id,
                  booleantype: "27",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: 0,
                  debit: 0, //-element.amountpaid,
                  ledger: "51",
                  ledgercategory: "4",
                  transferid: createLedgerDetails.id,
                  baseid: result6.id,
                  invoiceno: element.invoiceno,
                  totalamt: element.total,
                  outstanding: element.remainout,
                };
                const result7 = await this.ledger_details.create(
                  data7,
                  transaction
                );
                let data9: any = {
                  outstanding: -element.remainout,
                  status,
                };

                const result = await this.updateData(
                  element.id,
                  data9,
                  transaction
                );
              } else {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                let data4 = {
                  cname: req.sname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referecnce: createLedgerDetails.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  used,
                  type: "Supplier Receipt",
                  receiptid: element.id,
                  userdate: req.userdate,
                  booleantype: "12",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: element.amountpaid,
                  debit: 0,
                  ledger: req.paidto,
                  ledgercategory: "1",
                  transferid: createLedgerDetails.id,
                  totalamt: element.total,
                  outstanding: element.remainout,
                };
                const result4 = await this.ledger_details.create(
                  data4,
                  transaction
                );
                let data5 = {
                  cname: req.sname,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  // total: element.total,
                  total: -element.amount,
                  usedamount: element.amountpaid,
                  used,
                  type: "Supplier Receipt",
                  receiptid: element.id,
                  userdate: req.userdate,
                  credit: element.amountpaid,
                  debit: 0,
                  baseid: result4.id,
                  booleantype: "12",
                  ledger: "51",
                  ledgercategory: "4",
                  discount_status: "1",
                  usertype: "supplier",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: createLedgerDetails.id,
                  totalamt: element.total,
                };
                const result5 = await this.ledger_details.create(
                  data5,
                  transaction
                );
              }
              if (req.item.length === count) {
                response = {
                  status: true,
                  message: "Receipt Updated Successfully",
                  data: result,
                };
              }
            }
          } else {
            if (result) {
              response = {
                status: true,
                message: "New Receipt Created Successfully",
                data: result,
              };
            } else {
              response = {
                status: true,
                message: "New Receipt Created, Failed to update Bank",
                data: result,
              };
            }
          }
        }
      );
    } catch (error) {
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async supplierPayment(req: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let payDebitData = {
            total: -Number(req.amount).toFixed(2),
            paidmethod: req.paidmethod,
            sdate: req.date,
            userid: req.userid,
            cname: req.supplierid,
            ledger: req.bankid,
            ledgercategory: "1",
            purchaseid: req.sinvoice,
            type: req.type,
            userdate: req.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: req.adminid,
            debit: 0,
            credit: req.amount,
            booleantype: "4",
            usertype: "supplier",
            bankid: req.bankid,
            totalamount: req.amount,
            discount_status: "0",
          };
          const payDebit = await this.ledger_details.create(
            payDebitData,
            transaction
          );

          let payCreditData = {
            total: -Number(req.amount).toFixed(2),
            paidmethod: req.paidmethod,
            sdate: req.date,
            userid: req.userid,
            cname: req.supplierid,
            ledger: "51",
            ledgercategory: "4",
            purchaseid: req.sinvoice,
            type: req.type,
            userdate: req.userdate,
            createdAt: new Date(),
            updatedAt: new Date(),
            adminid: req.adminid,
            debit: req.amount,
            credit: 0,
            booleantype: "4",
            discount_status: "1",
            usertype: "supplier",
            transferid: payDebit.id,
            baseid: payDebit.id,
            bankid: req.bankid,
            totalamount: req.amount,
          };
          const payCredit = await this.ledger_details.create(
            payCreditData,
            transaction
          );
          let salesData_2 = {
            outstanding: req.outstanding,
            status: req.status,
            userdate: req.date || req.userdate,
            paymentdate: req.date || req.userdate,
          };
          const updateSale = await this.updateOutstandingAmount(
            req.sinvoice,
            salesData_2,
            transaction
          );
          let ledgerView: any = await this.account_master.findById(req.bankid);

          if (ledgerView) {
            let totalamount = ledgerView.total;
            let totalAmountPlus = Number(totalamount) - Number(req.amount);
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
              data: null,
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

  async addSupOtherReceipt(req: any) {
    let response: CommonResponseDto;
    try {
      let ledgerid = req?.ledger ? req?.ledger : null;
      let contactid = req?.sname ? req?.sname : null;
      let ledgerCat;
      let ledgerData;

      if (ledgerid !== null) {
        ledgerData = await this.account_master.findById(ledgerid);
        ledgerCat = ledgerData?.category;
      }
      let contactData;
      if (contactid !== null) {
        contactData = await this.ContactMasterService.getOneById(contactid);
      }
      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );

      let balance =
        Number(totalAvailableBalance?.data?.bankDetails?.opening) +
        Number(totalAvailableBalance?.data?.bankDetails?.total);
      let runningtotal = Number(balance) - Number(req.amount);
      const totalamount = totalAvailableBalance?.data?.bankDetails?.total;
      let totalamountminus = Number(totalamount) - Number(req.amount);

      let count = 0;
      for (let i = 0; i < req.columns.length; i++) {
        let element = req.columns[i];
        count++;
        const totalval = -Number(element.total);
        let creditData = {
          reference: req.reference,
          total: element.amount, // removed -
          totalamount: req.amount,
          otherid: "",
          userid: req.userid,
          sdate: req.sdate,
          userdate: req.userdate,
          paidmethod: req.paidmethod,
          cname: req.sname,
          customer_name: contactData?.name || ledgerData?.laccount,
          details: req.details,
          ledger: req.paidto,
          type: "Other Payment",
          credit: 0,
          debit: element.total,
          booleantype: req.booleantype,
          discount_status: "0",
          usertype: "supplier",
          ledgercategory: ledgerCat,
          amount: element?.amount, // removed -
          incomeTax: element.vat,
          incomeTaxAmount: element.vatamt,
          vat: element.vat,
          vatamt: element.vatamt,
          includevat: element.includevat ? 1 : 0,
          adminid: req.adminid,
          running_total: runningtotal,
        };
        const insertCredit = await this.ledger_details.create(creditData);
        let debitData = {
          reference: req.reference,
          total: element.amount,
          otherid: "",
          totalamount: req.amount,
          details: req.details,
          userid: req.userid,
          sdate: req.sdate,
          paidmethod: req.paidmethod,
          userdate: req.userdate,
          cname: req.sname,
          customer_name: contactData?.name || ledgerData?.laccount,
          ledger: req.sname ? element.ledger?.id : req.ledger,
          type: "Other Payment",
          credit: element?.total,
          debit: 0,
          booleantype: req.booleantype,
          discount_status: "1",
          usertype: "supplier",
          ledgercategory: ledgerCat,
          amount: element.amount,
          incomeTax: element.vat,
          incomeTaxAmount: element.vatamt,
          vat: element.vat,
          vatamt: element.vatamt,
          baseid: insertCredit.id,
          includevat: element.includevat ? 1 : 0,
          adminid: req.adminid,
          running_total: runningtotal,
        };
        const insertDebit = await this.ledger_details.create(debitData);
        if (count === req.columns.length) {
          const updateLedger = await this.account_master.update(req?.paidto, {
            userdate: new Date(),
            total: totalamountminus,
          });

          response = {
            status: true,
            message: "Other payment successful",
            data: updateLedger,
          };
        } else {
          response = {
            status: false,
            message: "Some payment got error",
            data: [],
          };
        }
      }
    } catch (error) {
      console.log(error, "error--------------------->");

      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async addSupOtherPayment(req: any) {
    let response: CommonResponseDto;
    try {
      let ledgerid = req?.ledger ? req?.ledger : null;
      let ledgerCat;
      let ledgerData;

      if (ledgerid !== null) {
        ledgerData = await this.account_master.findById(ledgerid);
        ledgerCat = ledgerData?.category;
      }

      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );

      let totalamountminus =
        Number(totalAvailableBalance?.data?.bankDetails?.total) -
        Number(req.amount);

      let otherDataObj = {
        adminId: req.adminid,
        companyId: req.companyid,
        total: req.amount,
        cname: req.cname,
        ledgerId: req?.ledger,
        bankid: req.paidto,
        reference: req.reference,
        createdBy: req.createdBy,
        date: req.sdate,
        type: "Other Payment",
      };

      const otherData = await this.otherMasterService.create(otherDataObj);

      let count = 0;
      for (let i = 0; i < req.columns.length; i++) {
        let element = req.columns[i];
        count++;
        const totalval = -Number(element.total);
        let debitData = {
          reference: req.reference,
          total: element.amount, // removed -
          totalamount: req.amount,
          userid: req.userid,
          sdate: req.sdate,
          userdate: req.userdate,
          paidmethod: req.paidmethod,
          cname: req.cname,
          details: req.details,
          ledger: req.paidto,
          bankid: req.paidto,
          type: "Other Payment",
          credit: element.total,
          otherid: otherData.data.id,
          debit: 0,
          booleantype: req.booleantype,
          discount_status: "0",
          usertype: "supplier",
          ledgercategory: "3", //ledgerCat,
          amount: element?.amount, // removed -
          incomeTax: element.vat,
          incomeTaxAmount: element.vatamt,
          vat: element.vat,
          vatamt: element.vatamt,
          includevat: element.includevat ? 1 : 0,
          adminid: req.adminid,
          createdBy: req.createdBy,
          companyid: req.companyid,
        };
        const insertCredit = await this.ledger_details.create(debitData);
        let creditData = {
          reference: req.reference,
          total: element.amount,
          totalamount: req.amount,
          details: req.details,
          userid: req.userid,
          sdate: req.sdate,
          paidmethod: req.paidmethod,
          userdate: req.userdate,
          cname: req.cname,
          ledger: req.ledger || 51,
          type: "Other Payment",
          credit: 0,
          debit: element?.total,
          booleantype: req.booleantype,
          otherid: otherData.data.id,
          discount_status: "1",
          usertype: "supplier",
          ledgercategory: ledgerCat || "4",
          amount: element.amount,
          incomeTax: element.vat,
          incomeTaxAmount: element.vatamt,
          vat: element.vat,
          vatamt: element.vatamt,
          baseid: insertCredit.id,
          includevat: element.includevat ? 1 : 0,
          adminid: req.adminid,
          createdBy: req.createdBy,
          companyid: req.companyid,
        };
        const insertDebit = await this.ledger_details.create(creditData);
        if (insertCredit) {
          const updateLedger = await this.account_master.update(req.paidto, {
            userdate: new Date(),
            total: totalamountminus,
          });

          response = {
            status: true,
            message: "Other payment successful",
            data: otherData,
          };
        } else {
          response = {
            status: false,
            message: "Some payment got error",
            data: [],
          };
        }
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

  async findAllInvoicesByMonth(id: any, stockid: any, month: string) {
    const data: any = await this.invoiceItemsService.findAllByQuery({
      where: {
        adminid: id,
        idescription: stockid,
        type: [
          "Purchase Invoice" as "Purchase Invoice",
          "Sales Invoice",
          "Sales Credit Notes" as "Credit Note",
          "Purchase Credit Notes" as "Debit Note",
        ],
        sdate: {
          [Op.and]: [Sequelize.literal(`MONTH(sdate) = ${month}`)],
        },
      },
      row: true,
      order: [["id", "DESC"]],
    });
    for (let i = 0; i < data.length; i++) {
      data[i].type =
        data[i].type == "Purchase Credit Notes"
          ? "Purchase Debit Notes"
          : data[i].type;
      if (data[i].cname) {
        let contactData: any = await this.ContactMasterService.getOneById(
          data[i].cname
        );
        data[i].dataValues["particular"] = contactData?.name || "_____";
      }
    }

    if (data.error) {
      return {
        status: false,
        message: data.error,
        data: null,
      };
    }
    return {
      status: true,
      message: "Purchase Invoice List",
      data: data,
    };
  }

  async getDataByMonths(data: any, targetMonth: string) {
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
  }
  async findAllPurchaseList(id: any, stockid: any, type: any) {
    // const data = await this.cartRepository.findAll<PurchaseInvoice>({
    //   include: [
    //     {
    //       model: ContactMaster,
    //       as: 'supplier',
    //     },
    //   ],
    //   where: { adminid: id, type: type, stockid: stockid },
    //   order: [['id', 'DESC']],
    // });
    const data: any = await this.invoiceItemsService.findAllByQuery({
      where: {
        adminid: id,
        idescription: stockid,
        type: "Purchase Invoice",
      },
      order: [["id", "DESC"]],
      raw: true,
    });
    let responce = await this.getDataByMonth(data);
    return {
      status: true,
      message: "Purchase Invoice List",
      data: responce,
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

  async addSupplierRefund(req: any) {
    let response: CommonResponseDto;
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
          var creditData = {
            ledger: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.cname,
            customer_name: req.customer_name,
            outstanding: req.outstanding,
            type: req.receipttype,
            status: "2",
            usedamount: 0,
            userdate: req.userdate,
            credit: req.amount,
            adminid: req.adminid,
            debit: 0,
            booleantype: "6",
            discount_status: "0",
            usertype: "supplier",
            ledgercategory: "1",
            totalamount: -req.amount,
            purchaseid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
          };
          const createLedgerDetails = await this.ledger_details.create(
            creditData,
            transaction
          );

          let debitData = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.sname,
            customer_name: req.customer_name,
            outstanding: req.outstanding,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "6",
            baseid: createLedgerDetails.id,
            usertype: "supplier",
            adminid: req.adminid,
            totalamount: req.amount,
            credit: 0,
            debit: req.amount,
            ledger: "51",
            ledgercategory: "4",
            purchaseid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
          };
          const createLedgerDetails2 = await this.ledger_details.create(
            debitData,
            transaction
          );

          var ledgerData = await this.account_master.findById(req.paidto);
          let totalamount = ledgerData.total;
          let totalamountminus = Number(totalamount) + Number(req.amount);
          let data4 = {
            total: totalamountminus.toFixed(2),
            userdate: req.userdate,
          };
          const result = await this.account_master.update(
            req.paidto,
            data4,
            transaction
          );

          if (req?.item?.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.type == "Purchase Invoice") {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                const update = await this.update(element?.id, req);
                if (!update) {
                  throw new HttpException(
                    "Something Went Wrong",
                    HttpStatus.NOT_FOUND
                  );
                } else {
                  let data5 = {
                    cname: req.sname,
                    // customer_name: req.customer_name,
                    userid: req.userid,
                    sdate: req.sdate,
                    status,
                    referenceid: createLedgerDetails.id,
                    checked: element.checked,
                    total: element.total,
                    usedamount: element.amount,
                    type: "Supplier Payment",
                    used,
                    receiptid: element.itemid,
                    userdate: req.userdate,
                    purchaseid: element.id,
                    booleantype: "10",
                    discount_status: "0",
                    usertype: "supplier",
                    bankid: req.paidto,
                    paidmethod: req.paidmethod,
                    outstanding: element.outstanding,
                    adminid: req.adminid,
                    credit: 0,
                    debit: element.amountpaid,
                    ledger: req.paidto,
                    ledgercategory: "1",
                    transferid: createLedgerDetails.id,
                    invoiceno: element.invoiceno,
                    running_total: runningtotal,
                  };
                  const resultData5 = await this.ledger_details.create(
                    data5,
                    transaction
                  );

                  let data6 = {
                    cname: req.sname,
                    // customer_name: req.customer_name,
                    userid: req.userid,
                    sdate: req.sdate,
                    status,
                    referenceid: createLedgerDetails.id,
                    checked: element.checked,
                    total: element.total,
                    usedamount: element.amountpaid,
                    type: "Supplier Payment",
                    used,
                    receiptid: element.itemid,
                    userdate: req.userdate,
                    purchaseid: element.id,
                    outstanding: element.outstanding,
                    debit: element.amountpaid,
                    credit: 0,
                    ledger: "51",
                    ledgercategory: "4",
                    baseid: resultData5.id,
                    booleantype: "4",
                    discount_status: "1",
                    usertype: "supplier",
                    paidmethod: req.paidmethod,
                    adminid: req.adminid,
                    transferid: createLedgerDetails.id,
                    invoiceno: element.invoiceno,
                    running_total: runningtotal,
                  };
                  const resultData6 = await this.ledger_details.create(
                    data6,
                    transaction
                  );
                  let data1: any = {
                    outstanding: element.outstanding,
                    status,
                  };

                  const purchaseUpdate = await this.updateData(
                    element.id,
                    data1,
                    transaction
                  );
                }
              } else if (element.type == "scredit") {
                let status = "2";
                let used = "fullused";
                if (element.outstanding == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                const update = await this.update(req.id, req);
                if (!update) {
                  throw new HttpException(
                    "Something Went Wrong",
                    HttpStatus.NOT_FOUND
                  );
                } else {
                  let dataDebit = {
                    //SCREDIT DEBIT DATA
                    cname: element.cname,
                    customer_name: req.customer_name,
                    userid: req.userid,
                    sdate: req.sdate,
                    status,
                    referenceid: createLedgerDetails.id.toString(),
                    checked: element.checked,
                    total: parseInt(element.total),
                    usedamount: element.amountpaid,
                    type: "Supplier Refund",
                    used,
                    receiptid: element.itemid,
                    userdate: req.userdate,
                    purchaseid: element.id,
                    outstanding: element.outstanding,
                    booleantype: 27,
                    discount_status: 0,
                    usertype: "supplier",
                    bankid: req.paidto,
                    paidmethod: req.paidmethod,
                    adminid: req.adminid,
                    credit: 0, //element.amountpaid,
                    debit: parseInt(req.amount),
                    ledger: parseInt(req.paidto),
                    ledgercategory: 1,
                    transferid: createLedgerDetails.id.toString(),
                    invoiceno: element.invoiceno,
                    running_total: runningtotal,
                  };
                  const result6 = await this.ledger_details.create(
                    dataDebit,
                    transaction
                  );

                  let dataCredit = {
                    //SCREDIT CREDIT
                    cname: element.cname,
                    customer_name: req.customer_name,
                    userid: req.userid,
                    sdate: req.sdate,
                    status,
                    referenceid: createLedgerDetails.id.toString(),
                    checked: element.checked,
                    total: parseInt(element.total),
                    usedamount: element.amountpaid,
                    type: "Supplier Refund",
                    used,
                    receiptid: element.itemid,
                    userdate: req.userdate,
                    purchaseid: element.id,
                    booleantype: 27,
                    discount_status: 0,
                    usertype: "supplier",
                    bankid: req.paidto,
                    paidmethod: req.paidmethod,
                    adminid: req.adminid,
                    credit: parseInt(req.amount), //element.amountpaid,
                    debit: 0,
                    outstanding: element.outstanding,
                    ledger: 51,
                    ledgercategory: 4,
                    baseid: result6.id,
                    transferid: createLedgerDetails.id.toString(),
                    invoiceno: element.invoiceno,
                    running_total: runningtotal,
                  };

                  const result7 = await this.ledger_details.create(
                    dataCredit,
                    transaction
                  );
                  let scrditData: any = {
                    outstanding: element.outstanding,
                    status,
                  };
                  const purchaseUpdate = await this.updateData(
                    element.id,
                    scrditData,
                    transaction
                  );
                }
              } else if (element.type == "Purchase debit note") {
                // Purchase Credit Notes
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                let data6 = {
                  cname: req.sname,
                  // customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  type: "Supplier Receipt",
                  used,
                  receiptid: element.itemid,
                  userdate: req.userdate,
                  purchaseid: element.id,
                  outstanding: element.outstanding,
                  booleantype: "27",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: element.amountpaid,
                  debit: 0,
                  ledger: req.paidto,
                  ledgercategory: "1",
                  transferid: createLedgerDetails.id,
                  invoiceno: element.invoiceno,
                  running_total: runningtotal,
                };
                const result6 = await this.ledger_details.create(
                  data6,
                  transaction
                );

                let data7 = {
                  cname: req.sname,
                  // customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  type: "Supplier Receipt",
                  used,
                  receiptid: element.itemid,
                  userdate: req.userdate,
                  purchaseid: element.id,
                  booleantype: "27",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  outstanding: element.outstanding,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: 0,
                  debit: 0, //-element.amountpaid,
                  ledger: "51",
                  ledgercategory: "4",
                  transferid: createLedgerDetails.id,
                  baseid: result6.id,
                  invoiceno: element.invoiceno,
                  running_total: runningtotal,
                };
                const result7 = await this.ledger_details.create(
                  data7,
                  transaction
                );
                let data9: any = {
                  outstanding: element.remainout,
                  status,
                };

                const result = await this.updateData(
                  element.id,
                  data9,
                  transaction
                );
              } else {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                let data4 = {
                  cname: req.sname,
                  // customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referecnce: createLedgerDetails.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  used,
                  type: "Supplier Receipt",
                  receiptid: element.id,
                  userdate: req.userdate,
                  booleantype: "12",
                  discount_status: "0",
                  usertype: "supplier",
                  bankid: req.paidto,
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  credit: 0,
                  debit: element.amountpaid,
                  ledger: req.paidto,
                  ledgercategory: "1",
                  transferid: createLedgerDetails.id,
                  running_total: runningtotal,
                };
                const result4 = await this.ledger_details.create(
                  data4,
                  transaction
                );
                let data5 = {
                  cname: req.sname,
                  // customer_name: req.customer_name,
                  userid: req.userid,
                  sdate: req.sdate,
                  status,
                  referenceid: createLedgerDetails.id,
                  checked: element.checked,
                  total: element.total,
                  usedamount: element.amountpaid,
                  used,
                  type: "Supplier Receipt",
                  receiptid: element.id,
                  userdate: req.userdate,
                  credit: 0,
                  debit: element.amountpaid,
                  outstanding: element.outstanding,
                  baseid: result4.id,
                  booleantype: "12",
                  ledger: "51",
                  ledgercategory: "4",
                  discount_status: "1",
                  usertype: "supplier",
                  paidmethod: req.paidmethod,
                  adminid: req.adminid,
                  transferid: createLedgerDetails.id,
                  running_total: runningtotal,
                };
                const result5 = await this.ledger_details.create(
                  data5,
                  transaction
                );
              }
              if (req.item.length === count) {
                response = {
                  status: true,
                  message: "Receipt Updated Successfully",
                  data: result,
                };
              }
            }
          } else {
            if (result) {
              response = {
                status: true,
                message: "New Receipt Created Successfully",
                data: result,
              };
            } else {
              response = {
                status: true,
                message: "New Receipt Created, Failed to update Bank",
                data: result,
              };
            }
          }
        }
      );
    } catch (error) {
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }
  async addSuppRefundCash(req: any) {
    let response: CommonResponseDto;
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
          var creditData = {
            ledger: req.paidto,
            bankid: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.cname,
            customer_name: req.customer_name,
            outstanding: req.outstanding,
            type: req.receipttype,
            status: "2",
            usedamount: 0,
            userdate: req.userdate,
            credit: 0,
            debit: req.amount,
            adminid: req.adminid,
            booleantype: "6",
            discount_status: "0",
            usertype: "supplier",
            ledgercategory: "3",
            totalamount: -req.amount,
            purchaseid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const createLedgerDetails = await this.ledger_details.create(
            creditData,
            transaction
          );

          let debitData = {
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: req.amount,
            userid: req.userid,
            cname: req.sname,
            customer_name: req.customer_name,
            outstanding: req.outstanding,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "6",
            baseid: createLedgerDetails.id,
            usertype: "supplier",
            adminid: req.adminid,
            totalamount: req.amount,
            credit: req.amount,
            debit: 0,
            ledger: "51",
            ledgercategory: "4",
            purchaseid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const createLedgerDetails2 = await this.ledger_details.create(
            debitData,
            transaction
          );

          var ledgerData = await this.account_master.findById(req.paidto);
          let totalamount = ledgerData.total;
          let totalamountminus = Number(totalamount) + Number(req.amount);
          let data4 = {
            total: totalamountminus.toFixed(2),
            userdate: req.userdate,
          };
          const result = await this.account_master.update(
            req.paidto,
            data4,
            transaction
          );

          if (req?.item?.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (element.type == "Purchase debit note") {
                // Purchase Credit Notes
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                // let data6 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Receipt',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   outstanding: element.outstanding,
                //   booleantype: '27',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: element.amountpaid,
                //   debit: 0,
                //   ledger: req.paidto,
                //   ledgercategory: '1',
                //   transferid: createLedgerDetails.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const result6 = await this.ledger_details.create(
                //   data6,
                //   transaction,
                // );

                // let data7 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Receipt',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   booleantype: '27',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   outstanding: element.outstanding,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: 0,
                //   debit: 0, //-element.amountpaid,
                //   ledger: '51',
                //   ledgercategory: '4',
                //   transferid: createLedgerDetails.id,
                //   baseid: result6.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const result7 = await this.ledger_details.create(
                //   data7,
                //   transaction,
                // );
                let data9: any = {
                  outstanding: element.remainout,
                  status,
                };

                const result = await this.updateData(
                  element.id,
                  data9,
                  transaction
                );
              } else {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                // let data4 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referecnce: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   used,
                //   type: 'Supplier Receipt',
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   booleantype: '12',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: 0,
                //   debit: element.amountpaid,
                //   ledger: req.paidto,
                //   ledgercategory: '1',
                //   transferid: createLedgerDetails.id,
                //   running_total: runningtotal,
                // };
                // const result4 = await this.ledger_details.create(
                //   data4,
                //   transaction,
                // );
                // let data5 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   used,
                //   type: 'Supplier Receipt',
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   credit: 0,
                //   debit: element.amountpaid,
                //   outstanding: element.outstanding,
                //   baseid: result4.id,
                //   booleantype: '12',
                //   ledger: '51',
                //   ledgercategory: '4',
                //   discount_status: '1',
                //   usertype: 'supplier',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: createLedgerDetails.id,
                //   running_total: runningtotal,
                // };
                // const result5 = await this.ledger_details.create(
                //   data5,
                //   transaction,
                // );
              }
              if (req.item.length === count) {
                response = {
                  status: true,
                  message: "Receipt Updated Successfully",
                  data: result,
                };
              }
            }
          } else {
            if (result) {
              response = {
                status: true,
                message: "New Receipt Created Successfully",
                data: result,
              };
            } else {
              response = {
                status: true,
                message: "New Receipt Created, Failed to update Bank",
                data: result,
              };
            }
          }
        }
      );
    } catch (error) {
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
    const data = await this.cartRepository.findAll<PurchaseInvoice>({
      where: {
        adminid: Number(adminid),
        supplierid: Number(cname),
        createdat: {
          [Op.between]: [endDate, startDate],
        },
      },
    });
    return data.map((tmp) => new PurchaseInvoiceDto(tmp));
  }

  async addSuppReceiptCash(req: any) {
    let response: CommonResponseDto;
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );
      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);
      let runningtotal = Number(balance) - Number(req.amount);

      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          var creditData = {
            ledger: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.sname,
            customer_name: req.customer_name,
            type: req.receipttype,
            status: "2",
            usedamount: 0,
            userdate: req.userdate,
            credit: req.amount,
            debit: 0,
            // credit: req.receipttype === 'Supplier Payment' ? 0 : req.amount,
            adminid: req.adminid,
            // debit: req.receipttype === 'Supplier Payment' ? req.amount : 0,
            booleantype: "6",
            discount_status: "0",
            usertype: "supplier",
            ledgercategory: "3", //'1',
            totalamount: -req.amount,
            purchaseid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const createLedgerDetails = await this.ledger_details.create(
            creditData,
            transaction
          );

          let debitData = {
            purchaseid: req.item[0].id,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.sname,
            customer_name: req.customer_name,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "6",
            baseid: createLedgerDetails.id,
            usertype: "supplier",
            adminid: req.adminid,
            totalamount: -req.amount,
            credit: 0,
            debit: req.amount,
            ledger: "51",
            ledgercategory: "4",
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const createLedgerDetails2 = await this.ledger_details.create(
            debitData,
            transaction
          );

          var ledgerData = await this.account_master.findById(req.paidto);
          let totalamount = ledgerData.total;
          let totalamountminus = Number(totalamount) - Number(req.amount);
          let data4 = {
            total: totalamountminus.toFixed(2),
            userdate: req.userdate,
          };
          const result = await this.account_master.update(
            req.paidto,
            data4,
            transaction
          );

          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (
                element.type == "Purchase Invoice" ||
                element.type == "Purchase Asset"
              ) {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                // let data5 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Payment',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   booleantype: '10',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: element.amountpaid,
                //   debit: 0,
                //   ledger: req.paidto,
                //   ledgercategory: '1',
                //   transferid: createLedgerDetails.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const resultData5 = await this.ledger_details.create(
                //   data5,
                //   transaction,
                // );

                // let data6 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Payment',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   debit: element.amountpaid,
                //   credit: 0,
                //   ledger: '51',
                //   ledgercategory: '4',
                //   baseid: resultData5.id,
                //   booleantype: '4',
                //   discount_status: '1',
                //   usertype: 'supplier',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: createLedgerDetails.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const resultData6 = await this.ledger_details.create(
                //   data6,
                //   transaction,
                // );
                let data1: any = {
                  outstanding: element.remainout,
                  status,
                };

                const purchaseUpdate = await this.updateData(
                  element.id,
                  data1,
                  transaction
                );
              } else if (element.type == "Purchase Credit Notes") {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                // let data6 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Receipt',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   booleantype: '27',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: 0, //element.amountpaid,
                //   debit: 0,
                //   ledger: req.paidto,
                //   ledgercategory: '1',
                //   transferid: createLedgerDetails.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const result6 = await this.ledger_details.create(
                //   data6,
                //   transaction,
                // );

                // let data7 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Receipt',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   booleantype: '27',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: 0,
                //   debit: 0, //-element.amountpaid,
                //   ledger: '51',
                //   ledgercategory: '4',
                //   transferid: createLedgerDetails.id,
                //   baseid: result6.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const result7 = await this.ledger_details.create(
                //   data7,
                //   transaction,
                // );
                let data9: any = {
                  outstanding: -element.remainout,
                  status,
                };

                const result = await this.updateData(
                  element.id,
                  data9,
                  transaction
                );
              } else {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                // let data4 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referecnce: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   used,
                //   type: 'Supplier Receipt',
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   booleantype: '12',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: element.amountpaid,
                //   debit: 0,
                //   ledger: req.paidto,
                //   ledgercategory: '1',
                //   transferid: createLedgerDetails.id,
                //   running_total: runningtotal,
                // };
                // const result4 = await this.ledger_details.create(
                //   data4,
                //   transaction,
                // );
                // let data5 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   used,
                //   type: 'Supplier Receipt',
                //   receiptid: element.id,
                //   userdate: req.userdate,
                //   credit: element.amountpaid,
                //   debit: 0,
                //   baseid: result4.id,
                //   booleantype: '12',
                //   ledger: '51',
                //   ledgercategory: '4',
                //   discount_status: '1',
                //   usertype: 'supplier',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: createLedgerDetails.id,
                //   running_total: runningtotal,
                // };
                // const result5 = await this.ledger_details.create(
                //   data5,
                //   transaction,
                // );
              }
              if (req.item.length === count) {
                response = {
                  status: true,
                  message: "Receipt Updated Successfully",
                  data: result,
                };
              }
            }
          } else {
            if (result) {
              response = {
                status: true,
                message: "New Receipt Created Successfully",
                data: result,
              };
            } else {
              response = {
                status: true,
                message: "New Receipt Created, Failed to update Bank",
                data: result,
              };
            }
          }
        }
      );
    } catch (error) {
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }
  async addSuppReceiptBankNew(req: any) {
    let response: CommonResponseDto;
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        req.paidto,
        req.adminid
      );
      let balance =
        Number(totalAvailableBalance.data.bankDetails.opening) +
        Number(totalAvailableBalance.data.bankDetails.total);
      let runningtotal = Number(balance) - Number(req.amount);

      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          var creditData = {
            ledger: req.paidto,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.sname,
            customer_name: req.customer_name,
            type: req.receipttype,
            status: "2",
            usedamount: 0,
            userdate: req.userdate,
            credit: req.amount,
            debit: 0,
            adminid: req.adminid,
            booleantype: "6",
            discount_status: "0",
            usertype: "supplier",
            ledgercategory: "3", //'1'
            totalamount: -req.amount,
            purchaseid: req.item[0].id,
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            outstanding: req.item[0].remainout,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const createLedgerDetails = await this.ledger_details.create(
            creditData,
            transaction
          );

          let debitData = {
            purchaseid: req.item[0].id,
            paidmethod: req.paidmethod,
            sdate: req.sdate,
            reference: req.reference,
            total: -req.amount,
            userid: req.userid,
            cname: req.sname,
            customer_name: req.customer_name,
            type: req.receipttype,
            status: "2",
            userdate: req.userdate,
            discount_status: "1",
            booleantype: "6",
            baseid: createLedgerDetails.id,
            usertype: "supplier",
            adminid: req.adminid,
            totalamount: -req.amount,
            credit: 0,
            debit: req.amount,
            ledger: "51",
            ledgercategory: "4",
            amount: req.item[0].rout,
            totalamt: req.item[0].total,
            running_total: runningtotal,
            outstanding: req.item[0].remainout,
            createdBy: req.createdBy,
            companyid: req.companyid,
          };
          const createLedgerDetails2 = await this.ledger_details.create(
            debitData,
            transaction
          );

          var ledgerData = await this.account_master.findById(req.paidto);
          let totalamount = ledgerData.total;
          let totalamountminus = Number(totalamount) - Number(req.amount);
          let data4 = {
            total: totalamountminus.toFixed(2),
            userdate: req.userdate,
          };
          const result = await this.account_master.update(
            req.paidto,
            data4,
            transaction
          );

          if (req.item.length > 0) {
            let count = 0;
            for (let i = 0; i < req.item.length; i++) {
              let element = req.item[i];
              count++;
              if (
                element.type == "Purchase Invoice" ||
                element.type == "Purchase Asset"
              ) {
                let status = "2";
                let used = "fullused";
                if (element.remainout == 0) {
                  status = "2";
                  used = "fullused";
                } else {
                  status = "1";
                  used = "partused";
                }
                // let data5 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Payment',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   booleantype: '10',
                //   discount_status: '0',
                //   usertype: 'supplier',
                //   bankid: req.paidto,
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   credit: 0,
                //   debit: element.amountpaid,
                //   ledger: req.paidto,
                //   ledgercategory: '1',
                //   transferid: createLedgerDetails.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const resultData5 = await this.ledger_details.create(
                //   data5,
                //   transaction,
                // );

                // let data6 = {
                //   cname: req.sname,
                //   // customer_name: req.customer_name,
                //   userid: req.userid,
                //   sdate: req.sdate,
                //   status,
                //   referenceid: createLedgerDetails.id,
                //   checked: element.checked,
                //   total: element.total,
                //   usedamount: element.amountpaid,
                //   type: 'Supplier Payment',
                //   used,
                //   receiptid: element.itemid,
                //   userdate: req.userdate,
                //   purchaseid: element.id,
                //   debit: 0,
                //   credit: element.amountpaid,
                //   ledger: '51',
                //   ledgercategory: '4',
                //   baseid: resultData5.id,
                //   booleantype: '4',
                //   discount_status: '1',
                //   usertype: 'supplier',
                //   paidmethod: req.paidmethod,
                //   adminid: req.adminid,
                //   transferid: createLedgerDetails.id,
                //   invoiceno: element.invoiceno,
                //   running_total: runningtotal,
                // };
                // const resultData6 = await this.ledger_details.create(
                //   data6,
                //   transaction,
                // );
                let data1: any = {
                  outstanding: element.remainout,
                  status,
                };

                const purchaseUpdate = await this.updateData(
                  element.id,
                  data1,
                  transaction
                );

                // const result5 = await this.ledger_details.create(
                //   data5,
                //   transaction,
                // );
              }
              if (req.item.length === count) {
                response = {
                  status: true,
                  message: "Receipt Updated Successfully",
                  data: result,
                };
              }
            }
          } else {
            if (result) {
              response = {
                status: true,
                message: "New Receipt Created Successfully",
                data: result,
              };
            } else {
              response = {
                status: true,
                message: "New Receipt Created, Failed to update Bank",
                data: result,
              };
            }
          }
        }
      );
    } catch (error) {
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error,
      };
    }
    return response;
  }

  async purchaseListByDate(
    adminid: any,
    createdBy: number,
    companyid: number,
    type: any,
    sdate: any,
    ldate: any
  ) {
    try {
      let startdate = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      let enddate = new Date(new Date(ldate).setHours(23, 59, 59, 59));

      const data = await this.cartRepository.findAll<PurchaseInvoice>({
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
          {
            model: LocationMaster,
            as: "locationDetails",
          },
        ],
        where: {
          adminid,
          companyid,
          // createdBy,
          type,
          sdate: {
            [Op.gte]: startdate,
            [Op.lte]: enddate,
          },
        },
        order: [["sdate", "DESC"]],
      });

      for (let i = 0; i < data.length; i++) {
        let showBusName: any = await this.ContactMasterService.getOne(
          data[i]?.supplierid
        );
        data[i]["bus_name"] = showBusName.data.bus_name;
      }

      return {
        status: true,
        message: "Purchase Invoice List By Date Filter",
        res: data,
      };
    } catch (error) {
      console.log(error, "error---------------->on the filter by date");
    }
  }

  async stafPurchasecreate(createDto: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          createDto.type =
            createDto.type == "pinvoice" || createDto.type == "purchase"
              ? "purchase"
              : createDto.type === "stockassets"
              ? "stockassets"
              : "pcredit";
          const cart = new PurchaseInvoice();
          cart.userid = createDto.userid;
          cart.supplierid = createDto.supplier.id;
          cart.invoiceno = createDto.invoiceno;
          cart.total = createDto.total;
          cart.outstanding = createDto.total;
          cart.sname = createDto.supplier.name;
          cart.status = 0;
          cart.type = createDto.type;
          cart.adminid = createDto.adminid;
          cart.invoiceimage = createDto.invoiceimage;
          cart.invoicedoc = createDto.invoicedoc;
          cart.quotes = createDto.quotes;
          cart.share = createDto.share;
          cart.sdate = createDto.sdate;
          cart.ldate = createDto.ldate;
          cart.userdate = createDto.paymentInfo
            ? createDto.paymentInfo.date
            : createDto.userdate;
          cart.paymentdate = createDto.paymentInfo
            ? createDto.paymentInfo.date
            : createDto.paymentdate;
          cart.refid = createDto.refid;
          cart.ledger = createDto?.ledger?.id;
          // cart.roundOff = createDto.roundOff || 0;
          cart.quantity = createDto.quantity;
          cart.total_vat = createDto?.total_vat;
          cart.overall_discount = createDto?.overall_discount;
          cart.taxable_value = createDto?.taxable_value;
          cart.stockid = createDto.pList.productId;
          cart.createdBy = createDto.createdBy;
          cart.companyid = createDto.companyid;
          cart.usertype = createDto.usertype;
          let invoice: any = await cart.save();
          for (const product of createDto.pList) {
            const costprice = await this.product_service.updateRate(
              product.id,
              {
                adminid: createDto.adminid,
                costprice: product.costprice,
              }
            );
          }
          response = await this.staffSaveInvoiceToledger(
            invoice,
            createDto,
            transaction
          );
        }
      );
    } catch (error) {
      console.log(error);
      response = {
        status: false,
        message: "Oops Something went wrong in server..!",
        data: error.message,
      };
    }
    return response;
  }

  async staffSaveInvoiceToledger(
    createInvoice: any,
    createDto: any,
    transaction: any
  ) {
    let response: CommonResponseDto;
    let type = createDto.type;
    if (createDto.type == "pinvoice" || createDto.type == "purchase") {
      type = "pinvoice";
    } else if (type == "pcredit") {
      type = "pcredit";
    }

    const ledgerAcc: any = createDto.ledger;
    let totalVat = 0;
    let totalNet = 0;
    let totalDiscount = 0;
    // let roundedValue = 0;
    // if (createDto.roundOff) {
    //   roundedValue = Number(createDto.roundOff);
    // }
    if (createInvoice) {
      let count = 0;
      const lineItem =
        await this.invoiceItemsHelperService.createInvoiceLineItem(
          type,
          createInvoice,
          createDto
        );
      await this.invoiceItemsService.createInvoiceItems(lineItem);

      for (let i = 0; i < createDto.pList.length; i++) {
        let element = createDto.pList[i];
        count++;
        if (
          element.product.itemtype === "Stock" ||
          element.product.itemtype === "Nonstock"
        ) {
          let proStock: any = await this.product_service.findOne(
            element.product.id
          );
          let stock1 = proStock.data.stock;
          let stock = Number(stock1);
          let purqty = element.quantity;
          if (type == "pinvoice" || type == "purchase") {
            stock = Number(stock1) + Number(purqty);
          } else if (type == "pcredit") {
            stock = Number(stock1) - Number(purqty);
          }

          let updateStock = await this.product_service.updateStock(
            element.product.id,
            {
              stock: stock,
              quantity: stock,
            },
            transaction
          );
        }

        const costprice = element.costprice;
        const quantity = element.quantity;
        let totalamount = Number(costprice) * Number(quantity);
        const discount = element.discountamt ? Number(element.discountamt) : 0;
        if (discount && discount > 0) {
          totalamount = totalamount - discount;
        }
        const incomeTaxAmount = element.vatamount
          ? Number(element.vatamount)
          : 0;
        if (element.includevat) {
          totalamount = totalamount - incomeTaxAmount;
        }
        totalVat += incomeTaxAmount;
        totalNet += totalamount;
        totalDiscount += Number(element.discountamt);
      }

      let data1 = {
        purchaseid: createInvoice.id,
        // idescription: element.product.id,
        sdate: createDto.purchase.sdate,
        ldate: createDto.purchase.ldate,
        cname: createDto.supplier.id,
        total: totalNet,
        ledgercategory: ledgerAcc.category,
        userid: createDto.userid,
        adminid: createDto.adminid,
        type:
          type == "pinvoice"
            ? "Purchase Invoice"
            : type == "stockassets"
            ? "stockassets"
            : "Purchase Credit Notes",
        ledger: ledgerAcc.id,
        credit:
          type == "pinvoice" || type == "stockassets"
            ? 0
            : totalNet + totalDiscount,
        debit:
          type == "pinvoice" || type == "stockassets"
            ? type == "stockassets"
              ? totalNet + totalVat
              : totalNet + totalDiscount
            : 0,
        booleantype: type == "pinvoice" || type == "stockassets" ? "2" : "25",
        usertype: "supplier",
        used: "group",
        invoiceno: createInvoice.invoiceno,
        userdate: createDto.userdate,
        createdBy: createDto.createdBy,
        companyid: createDto.companyid,
      };
      let returnid = await this.ledger_details.create(data1, transaction);
      let data2 = {
        purchaseid: createInvoice.id,
        sdate: createDto.purchase.sdate,
        ldate: createDto.purchase.ldate,
        ledger: "51",
        cname: createDto.supplier.id,
        total: totalNet,
        ledgercategory: "4",
        userid: createDto.userid,
        adminid: createDto.adminid,
        userdate: createDto.userdate,
        type:
          type == "pinvoice"
            ? "Purchase Invoice"
            : type == "stockassets"
            ? "stockassets"
            : "Purchase Credit Notes",
        debit:
          type == "pinvoice" || type == "stockassets"
            ? 0
            : type == "stockassets"
            ? totalVat + totalNet
            : totalNet + totalDiscount,
        credit:
          type == "pinvoice" || type == "stockassets"
            ? type == "stockassets"
              ? totalVat + totalNet
              : totalNet + totalDiscount
            : 0,

        discount_status: "1",
        booleantype: type == "pinvoice" || type == "stockassets" ? "2" : "25",
        usertype: "supplier",
        baseid: returnid.id,
        invoiceno: createInvoice.invoiceno,
        createdBy: createDto.createdBy,
        companyid: createDto.companyid,
      };

      // round off entry to ledger details
      // if (Number(createDto.roundOff) !== Number(0)) {
      //   let roundCreditData: any = {
      //     saleid: createInvoice.id,
      //     sdate: createDto.sdate,
      //     ldate: createDto.ldate,
      //     ledger: "5",
      //     cname: createDto.customerid,
      //     total: totalNet,
      //     userid: createDto.userid,
      //     ledgercategory: ledgerAcc?.category,
      //     adminid: createDto.adminid || 0,
      //     userdate: createDto.userdate,
      //     type:
      //       type == "pinvoice"
      //         ? "Purchase Invoice"
      //         : type == "stockassets"
      //         ? "stockassets"
      //         : "Purchase Credit Notes",
      //     credit: createDto.roundOff > 0 ? createDto.roundOff : 0,
      //     debit: createDto.roundOff > 0 ? 0 : createDto.roundOff,
      //     booleantype: "1",
      //     usertype: "customer",
      //     used: "group",
      //     invoiceno: createInvoice.invoiceno,
      //     baseid: null,
      //     createdBy: createDto.createdBy,
      //     companyid: createDto.companyid,
      //   };
      //   const roundCredit = await this.ledger_details.create(
      //     roundCreditData,
      //     transaction
      //   );
      //   let roundDebitData: any = {
      //     saleid: createInvoice.id,
      //     sdate: createDto.sdate,
      //     ldate: createDto.ldate,
      //     ledger: "51",
      //     cname: createDto.customerid,
      //     total: totalNet,
      //     userid: createDto.userid,
      //     ledgercategory: "3",
      //     adminid: createDto.adminid || 0,
      //     userdate: createDto.userdate,
      //     type:
      //       type == "pinvoice"
      //         ? "Purchase Invoice"
      //         : type == "stockassets"
      //         ? "stockassets"
      //         : "Purchase Credit Notes",
      //     totalamount: totalNet,
      //     credit: createDto.roundOff > 0 ? 0 : createDto.roundOff,
      //     debit: createDto.roundOff > 0 ? createDto.roundOff : 0,
      //     booleantype: "1",
      //     usertype: "customer",
      //     discount_status: "1",
      //     invoiceno: createInvoice.invoiceno,
      //     baseid: roundCreditData.id,
      //     createdBy: createDto.createdBy,
      //     companyid: createDto.companyid,
      //   };
      //   const roundDebit = await this.ledger_details.create(
      //     roundDebitData,
      //     transaction
      //   );
      // }
      let result = await this.ledger_details.create(data2, transaction);
      if (totalDiscount > 0 && type !== "stockassets") {
        let discountDebitData = {
          purchaseid: createInvoice.id,
          sdate: createInvoice.sdate,
          ldate: createInvoice.ldate,
          ledger: ledgerAcc.id,
          cname: createInvoice.customerid,
          total: -totalDiscount,
          userid: createInvoice.userid,
          ledgercategory: ledgerAcc.category,
          adminid: createInvoice.adminid || 0,
          userdate: createInvoice.userdate,
          type:
            type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
          credit: type == "pinvoice" ? totalDiscount : 0,
          debit: type == "pinvoice" ? 0 : totalDiscount,
          booleantype: createInvoice.type == "pinvoice" ? "2" : "25",
          usertype: "supplier",
          used: "discount",
          invoiceno: createInvoice.invoiceno,
          discount_status: "1",
          baseid: null,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
        };
        const discountDebit = await this.ledger_details.create(
          discountDebitData,
          transaction
        );
        let discountCreditData = {
          purchaseid: createInvoice.id,
          sdate: createInvoice.sdate,
          ldate: createInvoice.ldate,
          ledger: "51",
          cname: createInvoice.customerid,
          total: -totalDiscount,
          userid: createInvoice.userid,
          ledgercategory: "4",
          adminid: createInvoice.adminid || 0,
          userdate: createInvoice.userdate,
          type:
            type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
          debit: type == "pinvoice" ? totalDiscount : 0,
          credit: type == "pinvoice" ? 0 : totalDiscount,
          booleantype: createInvoice.type == "pinvoice" ? "2" : "25",
          usertype: "supplier",
          used: "discount",
          discount_status: "1",
          invoiceno: createInvoice.invoiceno,
          baseid: discountDebit.id,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
        };
        const discountCredit = await this.ledger_details.create(
          discountCreditData,
          transaction
        );
      }
      if (totalVat > 0 && type !== "stockassets") {
        let taxData = {
          purchaseid: createInvoice.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          ledger: "55",
          cname: createDto.supplier.id,
          total: totalVat,
          userid: createDto.userid,
          ledgercategory: "4",
          adminid: createDto.adminid,
          userdate: createDto.userdate,
          type:
            type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
          discount_status: "0",
          credit: type == "pinvoice" || type == "stockassets" ? 0 : totalVat,
          debit: type == "pinvoice" || type == "stockassets" ? totalVat : 0,
          booleantype: type == "pinvoice" ? "2" : "25",
          usertype: "supplier",
          used: "incometax",
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
        };

        const resultTax = await this.ledger_details.create(
          taxData,
          transaction
        );

        let taxData1 = {
          purchaseid: createInvoice.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          ledger: "51",
          cname: createDto.supplier.id,
          total: totalVat,
          userid: createDto.userid,
          ledgercategory: "4",
          adminid: createDto.adminid,
          userdate: createDto.userdate,
          type:
            type == "pinvoice" ? "Purchase Invoice" : "Purchase Credit Notes",
          invoiceno: createInvoice.invoiceno,
          discount_status: "1",
          debit: type == "pinvoice" || type == "stockassets" ? 0 : totalVat,
          credit: type == "pinvoice" || type == "stockassets" ? totalVat : 0,
          booleantype: type == "pinvoice" ? "2" : "25",
          usertype: "supplier",
          used: "incometax",
          baseid: resultTax.id,
          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
        };
        const resultTax1 = await this.ledger_details.create(
          taxData1,
          transaction
        );

        // update vat ledger total account master
        // const vatLedger = await this.account_master.findAllByQuery({
        //   attributes: ['id', 'total'],
        //   where: {
        //     nominalcode: 2202,
        //     userid: createDto.userid
        //   },
        // });
        // if (vatLedger) {
        //   let total = type == 'pinvoice' ? totalVat : type == 'pcredit' ? -totalVat : 0
        //   let accountData = {
        //     total: Number(vatLedger[0]?.total) - Number(total)
        //   }
        //   const updateVatLedger = await this.account_master.update(
        //     vatLedger[0]?.id,
        //     accountData,
        //     transaction,
        //   );
        // }
      }

      if (count == createDto.pList.length) {
        if (createDto.paymentInfo) {
          let staffTransactionsObj = {
            adminid: createDto.adminid,
            ledger: "51",
            ledgercategory: "4",
            type: "Supplier Payment",
            usertype: "staff",
            paid_amount: createDto.paymentInfo.amount,
            outstanding: createDto.paymentInfo.outstanding,
            purchaseid: createInvoice.id,
            invoiceno: createInvoice.invoiceno,
            customerid: createDto.supplier.id,
            staffid: createDto.createdBy,
            saletype: createDto.saletype,
            total: createInvoice.total,
            paid_status: createDto.status,
            companyid: createDto.companyid,
            shiftid: createDto.shiftid,
            counterid: createDto.counterid,
          };
          let stafTrancectionCreate =
            await this.StaffTransactionsService.create(staffTransactionsObj);

          response = {
            status: true,
            message: "Invoice Created",
            data: { ...createInvoice, ...stafTrancectionCreate },
          };
        } else {
          response = {
            status: true,
            message: "Purchase Invoice Created Successfully",
            data: createInvoice,
          };
        }
        await this.userSettings.updateLastInvoiceNo(
          createDto.adminid,
          createDto.companyid,
          createDto.seriesNo,
          createDto.type
        );
      }
    } else {
      response = {
        status: false,
        message: "Error while creating Invoice/Credit Note",
        data: null,
      };
    }
    return response;
  }

  async staffSupplierPayment(data, bankDetails) {
    let response: CommonResponseDto = {
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
        purchaseid: data.purchaseid,
        type: data.type,
        userdate: data.created_at,
        createdAt: new Date(),
        updatedAt: new Date(),
        adminid: data.adminid,
        debit: 0,
        credit: data.paid_amount,
        booleantype: "6",
        usertype: data.usertype,
        bankid: bankDetails.bankid,
        referenceid: data.purchaseid,
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
        ledger: "51",
        ledgercategory: "4",
        purchaseid: data.purchaseid,
        type: data.type,
        userdate: data.created_at,
        createdAt: new Date(),
        updatedAt: new Date(),
        adminid: data.adminid,
        debit: data.paid_amount,
        credit: 0,
        booleantype: "3",
        discount_status: "1",
        usertype: data.usertype,
        transferid: payDebit.id,
        baseid: payDebit.id,
        referenceid: data.purchaseid,
        bankid: bankDetails.bankid,
        createdBy: data.staffid,
        companyid: data.companyid,
      };

      const payCredit = await this.ledger_details.create(
        payCreditData,
        transaction
      );

      const updateSale = await this.updateOutstandingAmount(
        data.purchaseid,
        {
          status: data.paid_status,
          outstanding: data.outstanding,
        },
        transaction
      );

      let ledgerView = await this.account_master.findOne(bankDetails.bankid);

      if (ledgerView.status) {
        let totalamount = ledgerView.data.total;
        let totalAmountPlus = Number(totalamount) - Number(data.paid_amount);
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
            data: payDebit,
          };
        } else {
          response = {
            status: false,
            message: "Invoice Created but Failed to Update Payment",
            data: payDebit,
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
          data: payDebit,
        };
      }
    });
    return response;
  }

  async addStaffOtherPayment(data, bankDetails) {
    let response: CommonResponseDto;
    try {
      let totalAvailableBalance = await this.BankService.getBankDetails(
        bankDetails.bankid,
        data.adminid
      );

      let totalamountminus =
        Number(totalAvailableBalance?.data?.bankDetails?.total) -
        Number(data.paid_amount);

      let debitData = {
        reference: "Other Payment",
        total: data.paid_amount,
        totalamount: data.paid_amount,
        userid: data.adminid,
        sdate: data.created_at,
        userdate: data.created_at,
        paidmethod: bankDetails.paidmethod,
        cname: data.customerid,
        ledger: bankDetails.bankid.toString(),
        bankid: bankDetails.bankid,
        type: "Other Payment",
        credit: data.paid_amount,
        debit: 0,
        booleantype: "97",
        discount_status: "0",
        usertype: data.usertype,
        ledgercategory: "3",
        amount: data.paid_amount,
        adminid: data.adminid,
        createdBy: data.staffid,
        companyid: data.companyid,
      };
      const insertCredit = await this.ledger_details.create(debitData);
      let creditData = {
        reference: "Other Payment",
        baseid: insertCredit.id,
        total: data.paid_amount,
        totalamount: data.paid_amount,
        userid: data.adminid,
        sdate: data.created_at,
        paidmethod: bankDetails.paidmethod,
        userdate: data.created_at,
        cname: data.customerid,
        ledger: data.customerid.toString(),
        type: "Other Payment",
        credit: 0,
        debit: data.paid_amount,
        booleantype: "97",
        discount_status: "1",
        usertype: "staff",
        ledgercategory: "4",
        amount: data.paid_amount,
        adminid: data.adminid,
        createdBy: data.staffid,
        companyid: data.companyid,
      };
      const insertDebit = await this.ledger_details.create(creditData);
      if (insertCredit) {
        const updateLedger = await this.account_master.update(
          bankDetails.bankid,
          {
            userdate: new Date(),
            total: totalamountminus,
          }
        );

        response = {
          status: true,
          message: "Other payment successful",
          data: data,
        };
      } else {
        response = {
          status: false,
          message: "Some payment got error",
          data: [],
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

  async createRetailPurchase(createDto: any) {
    try {
      const newProduct = await this.product_service.create(createDto);
      if (newProduct.status) {
        let totalVat = Number(createDto.vatamt) * Number(createDto.itemStock);
        let overallDiscount = Number(createDto.discountamt);
        let taxableValue = 0;
        if (createDto.includevat) {
          taxableValue =
            Number(createDto.itemStock) * Number(createDto.costprice);
        } else {
          taxableValue =
            Number(createDto.itemStock) * Number(createDto.costprice) +
            Number(totalVat);
        }

        let totalPrice = Number(taxableValue) - Number(overallDiscount);

        let invNo = await this.userSettings.getInvoiceNo(
          createDto.adminid,
          createDto.companyid,
          createDto.seriesNo,
          "purchase"
        );

        let purchaseDataObj = {
          supplier: createDto.user,
          ledger: {
            id: 12,
            nominalcode: "5000",
            laccount: "Cost of Sales-goods",
            category: 6,
            categorygroup: 3,
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
            total: "0.00",
            userdate: "2019-06-19T12:52:29.000Z",
            type: 0,
            adminid: -2,
            visiblestatus: 0,
            visbank: 0,
            vissinvoice: 0,
            vispinvoice: 1,
            visotherreceipt: 0,
            vispayroll: null,
            visotherpayment: 0,
            visjournal: 1,
            visreport: 1,
            showVatRate: 1,
            payheadType: null,
            journals: "null",
            Purchase: "purchase",
            Sales: "null",
            calculationPeriod: null,
            branch: null,
            ifsc: null,
            accountname: null,
            createdBy: null,
            companyid: null,
            created_at: "2022-12-23T19:47:16.000Z",
            updated_at: "2023-12-31T14:48:23.000Z",
            categoryDetails: {
              id: 6,
              category: "direct expenses",
              adminid: -2,
              categorygroup: 3,
              createdBy: null,
              companyid: null,
              createdat: "2022-12-23T19:13:47.000Z",
              updatedat: null,
            },
            groupDetails: {
              id: 3,
              categorygroup: "expenditure",
              createdat: "2022-12-23T19:05:37.000Z",
              updatedat: null,
            },
          },
          purchase: {
            sdate: new Date(),
            ldate: new Date(),
            invoiceno: invNo.data,
            quotes: null,
            status: "0",
            refid: null,
          },

          pList: [
            {
              id: newProduct.data.id,
              productId: newProduct.data.id,
              idescription: createDto.idescription,
              description: createDto.description,
              discount: createDto.discount,
              discountamt: createDto.discountamt,
              includevat: createDto.includevat,
              costprice: createDto.costprice,
              vat: Number(createDto.vat),
              incomeTax: Number(createDto.vat),
              incomeTaxAmount: Number(totalVat),
              percentage: createDto.discount, // discount
              vatamt: Number(totalVat),
              vatamount: Number(totalVat),
              ledgerDetails: {},
              ledger: {},
              quantity: createDto.itemStock,
              total: Number(totalPrice),
              product: newProduct.data,
            },
          ],

          invoiceno: invNo.data,
          sdate: new Date(),
          ldate: new Date(),
          quotes: null,
          adminid: createDto.adminid,
          status: "0",
          issued: "yes",
          type: "purchase",
          pagetype: "1",
          total: Number(totalPrice),
          userid: createDto.adminid,
          userdate: new Date(),
          attachDoc: "",
          attachImage: "",
          paymentInfo: {
            id: 0,
            bankid: 0,
            outstanding: 0,
            amount: Number(totalPrice),
            date: moment(new Date(), "YYYY-MM-DD"),
            type: "-",
            paidmethod: "-",
          },
          saletype: "Purchase",
          refid: null,
          quantity: createDto.itemStock,
          total_vat: Number(totalVat),
          overall_discount: overallDiscount,
          taxable_value: Number(taxableValue),

          createdBy: createDto.createdBy,
          companyid: createDto.companyid,
          usertype: createDto.usertype,
          shiftid: createDto.shiftid,
          counterid: createDto.counterid,
          seriesNo: createDto.seriesNo,
        };

        const purchaseData = await this.stafPurchasecreate(purchaseDataObj);
        return new CommonResponseDto(
          { product: newProduct.data, purchaseData: purchaseData.data },
          true,
          "Product adde successfully"
        );
      } else {
        return newProduct;
      }
    } catch (error) {
      console.log(error);
      return new CommonResponseDto(
        null,
        false,
        "Server Error: Failed to  create product"
      );
    }
  }

  async bulkRetailPurchase(createDto: any) {
    try {
      let variants = [];
      for (let j = 0; j < createDto?.items?.length; j++) {
        const item = createDto?.items[j];
        const items = [
          {
            name: `${item?.idescription}`,
            isParcel: false,
            price: item?.price,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} Without Sugar and Without Ice`,
            isParcel: false,
            price: item?.price,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} With Sugar and Without Ice`,
            isParcel: false,
            price: item?.price,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} Without Sugar and With Ice`,
            isParcel: false,
            price: item?.price,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} - Parcel`,
            isParcel: true,
            price: Number(item?.price) + 5,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} Without Sugar and Without Ice - Parcel`,
            isParcel: true,
            price: Number(item?.price) + 5,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} With Sugar and Without Ice - Parcel`,
            isParcel: true,
            price: Number(item?.price) + 5,
            product_category: item?.product_category
          },
          {
            name: `${item?.idescription} Without Sugar and With Ice - Parcel`,
            isParcel: true,
            price: Number(item?.price) + 5,
            product_category: item?.product_category
          },
        ];
      
        variants.push(...items);
      }
      
      await Promise.all(
        variants.map(async (element) => {
          const obj = {
            itemtype: "Stock",
            icode: element?.name,
            idescription: element.name,
            price: element?.price,
            c_price: element?.price,
            rate: element?.price,
            sp_price: element?.price,
            type: "Stock",
            userid: createDto?.adminid,
            adminid: createDto?.adminid,
            vat: 0,
            vatamt: 0,
            product_category: element?.product_category,
            date: new Date(),
            unit: createDto?.unit,
            location: createDto?.location,
            barcode: createDto?.barcode,
            createdBy: createDto?.staffId,
            companyid: createDto?.companyid,
            itemStock: 10000000,
            stock: 10000000,
            costprice: element?.price,
            pimage: createDto?.pimage,
            saccount: 0,
            trade_price: 0,
            notes: "",
            logintype: "user",
            paccount: 0,
            includevat: 0,
            usertype: "staff",
            existingstock: false,
            hsn_code: null,
            unitDecimalValues: "",
            unitFormalName: "",
            discountamt: 0,
            discount: 0,
            user: createDto?.staff,
            counterid: createDto?.counterid,
            shiftid: createDto?.shiftid,
            product_loctions: createDto?.location,
            seriesNo: createDto?.seriesNo,
            parcel_charge: Number(createDto?.parcel_charge) || 0,
          };
          await this.createRetailPurchase(obj);
        })
      );
      return new CommonResponseDto("success",true,"success")
    } catch (error) {
      console.log(error);
      return new CommonResponseDto(
        null,
        false,
        "Server Error: Failed to  create product"
      );
    }
  }

  async removePurchaseInvoice(adminid: number, id: number, type: string) {
    try {
      const checkInvoice = await this.findById(id);
      if (checkInvoice) {
        if (checkInvoice.total === checkInvoice.outstanding) {
          const ledger: any = await this.ledger_details.distroy({
            where: {
              purchaseid: id,
              adminid,
            },
          });
          const deletingInvoiceItems =
            await this.invoiceItemsService.findAllByQuery({
              where: {
                adminid: checkInvoice.adminid,
                purchaseid: checkInvoice.id,
                type: {
                  [Op.notIn]: ["Supplier Payment", "Supplier Receipt"],
                },
              },
            });

          for (let i = 0; i < deletingInvoiceItems.length; i++) {
            const item = deletingInvoiceItems[i];

            let product: any = await this.product_service.findById(
              Number(item.idescription)
            );
            if (product.itemtype == "Stock" || product.itemtype == "Nonstock") {
              let stock = Number(product.stock);
              if (type === "pinvoice" || type === "purchase") {
                stock = stock - Number(item.quantity);
              } else if (type === "pcredit") {
                stock = stock + Number(item.quantity);
              }
              let stockObj = {
                stock: Number(stock).toFixed(0),
                quantity: Number(stock),
              };
              let updatedData = await this.product_service.updateStock(
                Number(item.idescription),
                stockObj
              );
            }
          }
          let deletedInvoiceItems =
            await this.invoiceItemsService.deleteInvoiceItems({
              where: {
                purchaseid: id,
                adminid: adminid,
              },
            });
          const delInvoice = await this.cartRepository.destroy({
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
}
