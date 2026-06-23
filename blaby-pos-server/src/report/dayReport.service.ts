import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Op } from "sequelize";
import { AccountMasterService } from "../account_master/account_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { AccountMaster } from "../account_master/account_master";
import moment from "moment";
import { JournalService } from "../journal/journal_service";
import { OtherMasterService } from "../other_master/other_master.service";

@Injectable()
export class DayReportService {
  constructor(
    @Inject(forwardRef(() => ContactMasterService))
    private readonly contactMaster: ContactMasterService,
    @Inject(forwardRef(() => SalesInvoiceService))
    private readonly sale_invoice: SalesInvoiceService,
    @Inject(forwardRef(() => LedgerDetailsService))
    private readonly ledger_details: LedgerDetailsService,
    @Inject(forwardRef(() => PurchaseInvoiceService))
    private readonly purchase_invoice: PurchaseInvoiceService,
    @Inject(forwardRef(() => AccountMasterService))
    private readonly defualt_ledger: AccountMasterService,
    @Inject(forwardRef(() => JournalService))
    private readonly journal_service: JournalService,
    @Inject(OtherMasterService)
    private readonly otherMasterService: OtherMasterService
  ) {}

  async statementListBy(adminid: any, companyid: any, sdate: any, ldate: any) {
    let response: CommonResponseDto;
    try {
      let startDate = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      let endDate = new Date(new Date(ldate).setHours(23, 59, 59, 59));

      const saleList = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid: companyid,
          type: "sales",
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        order: [["id", "DESC"]],
      });

      let salesData = saleList.map((item) => {
        return {
          date: item.sdate,
          type: "Sales Invoice",
          name: item.cname,
          vtype: "Sales",
          debit: item.total,
          credit: "0.00",
          invoiceno: item.invoiceno,
          id: item.id,
          reference: item.reference,
        };
      });

      const credNotes = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid: companyid,
          type: "scredit",
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        order: [["id", "DESC"]],
      });

      const credNoteData = credNotes.map((item: any) => {
        return {
          date: item.sdate,
          type: "Credit Notes",
          name: item.cname,
          vtype: "Sales",
          debit: "0.00",
          credit: item.total,
          invoiceno: item.invoiceno,
          id: item.id,
          reference: item.reference,
        };
      });
      const debitNote = await this.purchase_invoice.findAllByQuery({
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
        where: {
          adminid: adminid,
          companyid: companyid,
          type: "pcredit",
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        order: [["id", "DESC"]],
      });

      const debNoteData = debitNote.map((item: any) => {
        return {
          date: item.sdate,
          type: "Debit Notes",
          name: item?.supplier?.bus_name,
          vtype: "Purchase",
          debit: item.total,
          credit: "0.00",
          invoiceno: item.invoiceno,
          id: item.id,
        };
      });
      const purchace = await this.purchase_invoice.findAllByQuery({
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
        where: {
          adminid: adminid,
          companyid: companyid,
          type: "purchase",
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },

        order: [["id", "DESC"]],
      });

      const purchaceData = purchace.map((item: any) => {
        return {
          date: item.sdate,
          type: "Purchase Invoice",
          name: item?.supplier?.bus_name,
          vtype: "Purchase",
          debit: "0.00",
          credit: item.total,
          invoiceno: item.invoiceno,
          id: item.id,
        };
      });

      // purchase asset
      const purchaceAsset = await this.purchase_invoice.findAllByQuery({
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
        where: {
          adminid: adminid,
          companyid: companyid,
          type: "stockassets",
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        order: [["id", "DESC"]],
      });

      const purchaceAssetData = purchaceAsset.map((item: any) => {
        return {
          date: item.sdate,
          type: "stockassets",
          name: item?.supplier?.bus_name,
          vtype: "Purchase",
          debit: "0.00",
          credit: item.total,
          invoiceno: item.invoiceno,
          id: item.id,
        };
      });

      const others = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          companyid: companyid,
          is_deleted: false,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
          booleantype: [
            "14",
            "22",
            "8",
            "6",
            "4",
            "5",
            "3",
            "42",
            "7",
            "13",
            "23",
            "16",
            "15",
            "97",
          ],
        },
        order: [["id", "DESC"]],
      });

      let otherDetails = [];

      for (let item of others) {
        if (
          item?.type === "Customer Receipt" ||
          item?.type === "Customer Reciept" ||
          item?.type === "Other Receipt" ||
          item.type === "Supplier Refund"
        ) {
          let details = await this.defualt_ledger.findById(item?.ledger);
          console.log(details);
          otherDetails.push({
            date: item.sdate,
            credit: item.debit,
            debit: "0.00",
            type: item.type,
            id: item.id,
            name: details?.laccount,
            ledger: item.ledger,
            ledgercategory: item.ledgercategory,
            saleid: item.saleid,
            paidmethod: item.paidmethod,
            itemDetails: details,
          });
        } else if (
          item?.type === "Customer Refund" ||
          item.type === "Supplier Payment" ||
          item.type === "Other Payment"
        ) {
          let details = await this.defualt_ledger.findById(item?.ledger);
          otherDetails.push({
            date: item.sdate,
            debit: item.credit,
            credit: "0.00",
            type: item.type,
            id: item.id,
            ledger: item.ledger,
            ledgercategory: item.ledgercategory,
            paidmethod: item.paidmethod,
            name: details?.laccount,
            itemDetails: details,
          });
        } else {
          let details = await this.defualt_ledger.findById(item?.ledger);
          otherDetails.push({
            ...item,
            itemDetails: details,
          });
        }
      }

      const journal = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          companyid: companyid,
          is_deleted: false,
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
          booleantype: ["19"],
        },
        order: [["id", "DESC"]],
      });

      let journalDetail = [];

      for (let item of journal) {
        if (item?.type == "Journal") {
          let ledgerDetails = await Promise.all(
            journal.map(async (current) => {
              if (current.id === item.id) {
                if (item.cname) {
                  return await this.contactMaster.getOneById(
                    Number(item.cname)
                  );
                } else {
                  return await this.defualt_ledger.findById(item.ledger);
                }
              }
            })
          );

          if (Number(item.credit) === 0) {
            journalDetail.push({
              date: item.sdate,
              debit: item.debit,
              credit: item.credit,
              type: item.type,
              vtype: "Journal",
              id: item.id,
              ledger: item.ledger,
              ledgercategory: item.ledgercategory,
              paidmethod: item.paidmethod,
              name: ledgerDetails.map(
                (detail: any) => detail?.bus_name || detail?.laccount
              ),
              itemDetails: item,
              // name: details?.laccount,
              // itemDetails: details,
            });
          }
        }
      }

      let ledgerList: any = [
        ...salesData,
        ...credNoteData,
        ...purchaceData,
        ...purchaceAssetData,
        ...debNoteData,
        ...otherDetails,
        ...journalDetail,
      ];
      // to find opening balance
      response = {
        message: "Day Report",
        data: ledgerList,
        status: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async dayTotalReport(
    adminid: any,
    companyid: any,
    sdate: any,
    ldate: any,
    page: any,
    limit: any
  ) {
    let response;
    try {
      let startDate = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      let endDate = new Date(new Date(ldate).setHours(23, 59, 59, 59));
      // const offset = (Number(page) - 1) * Number(limit);
      const query = {
        attributes: [
          "id",
          "baseid",
          "credit",
          "debit",
          "type",
          "bankid",
          "ledger",
          "ledgercategory",
          "saleid",
          "purchaseid",
          "journalid",
          "invoiceid",
          "receiptid",
          "otherid",
          "userid",
          "adminid",
          "total",
          "invoiceno",
          "userdate",
          "cname",
          "customer_name",
          "idescription",
          "sdate",
        ],
        where: {
          adminid: adminid,
          companyid: companyid,
          is_deleted: false,

          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        // limit: Number(limit),
        // offset: Number(offset),
        order: [["id", "DESC"]],
      };
      let totalCount = await this.ledger_details.count(query);
      let dayReport = await this.ledger_details.findAllByQuery(query);
      let groupitems = this.groupDataByTypeAndId(dayReport);
      let result = this.parseData(groupitems);

      let summeriseData: any = this.summarizeData(result);

      let ledgerDetails = await Promise.all(
        summeriseData.map(async (current) => {
          if (current.cname) {
            if (current.type === "Journal") {
              let respone = await this.contactMaster.getOneById(
                Number(current.cname)
              );
              return {
                ...current,
                name: respone.bus_name,
              };
            } else {
              let respone = await this.defualt_ledger.findById(current.ledger);
              return {
                ...current,
                name: respone.laccount,
              };
            }
          } else {
            let respone = await this.defualt_ledger.findById(current.ledger);
            return {
              ...current,
              name: respone.laccount,
            };
          }
        })
      );
      let secoundGroup = this.groupDataByTypeAndId(ledgerDetails);
      response = {
        message: "Day Reports",
        data: secoundGroup,
        meta: {
          totalCount,
          page,
          limit,
          tatalPage: Number(totalCount) / Number(limit),
        },
        status: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  /// helpersssssss

  groupDataByTypeAndId = (data: any) => {
    const groupedByTypeAndId = data.reduce((acc, entry) => {
      const { type, saleid, purchaseid, journalid, ...items } = entry;
      const id = saleid || purchaseid || journalid;

      if (!acc[type]) {
        acc[type] = {};
      }

      if (!acc[type][id]) {
        acc[type][id] = [];
      }

      acc[type][id].push(entry);

      return acc;
    }, {});

    // for (const type in groupedByTypeAndId) {
    //   result[type] = {};

    //   for (const id in groupedByTypeAndId[type]) {
    //     const entries = groupedByTypeAndId[type][id];
    //     const ledgerGrouped = entries.reduce((ledgerAcc, entry) => {
    //       const { ledger, credit, debit } = entry;

    //       if (!ledgerAcc[ledger]) {
    //         ledgerAcc[ledger] = {
    //           ledger,
    //           credit: 0,
    //           debit: 0,
    //           // name: entry.ledgerDetails.laccount,
    //           ...entry,
    //         };
    //       }

    //       ledgerAcc[ledger].credit += credit || 0;
    //       ledgerAcc[ledger].debit += debit || 0;

    //       return ledgerAcc;
    //     }, {});
    //     result[type][id] = Object.values(ledgerGrouped);
    //   }
    // }

    return groupedByTypeAndId;
  };
  parseData(data: any) {
    const purchaseInvoices = data["Purchase Invoice"] || {};
    // console.log(purchaseInvoices);
    const purchaseAssets = data["stockassets"] || {};
    const salesInvoices = data["Sales Invoice"] || {};
    const openingBalances = data["Opening Balance"] || {};
    const customerReceipt =
      data["Customer Receipt"] || data["Customer Reciept"] || {};
    const otherReceipt = data["Other Receipt"] || data["Other Receipt"] || {};
    const supplierRefund = data["Supplier Refund"] || {};
    const customerRefund = data["Customer Refund"] || {};
    const supplierPayment = data["Supplier Payment"] || {};
    const otherPayment = data["Other Payment"] || {};
    const journal = data["Journal"] || {};
    const flattenData = (invoices: any, type: any) => {
      return Object.entries(invoices).flatMap(([key, entries]: any) =>
        entries.map((entry: any) => ({
          ...entry,
          category: type,
          vtype: type,
          key: entry.id,
        }))
      );
    };

    return [
      ...flattenData(purchaseInvoices, "Purchase Invoice"),
      ...flattenData(purchaseAssets, "stockassets"),
      ...flattenData(salesInvoices, "Sales Invoice"),
      ...flattenData(openingBalances, "Opening Balance"),
      ...flattenData(customerReceipt, "Customer Receipt"),
      ...flattenData(otherReceipt, "Other Receipt"),
      ...flattenData(supplierRefund, "Supplier Refund"),
      ...flattenData(customerRefund, "Customer Refund"),
      ...flattenData(supplierPayment, "Supplier Payment"),
      ...flattenData(otherPayment, "Other Payment"),
      ...flattenData(journal, "Journal"),
    ];
  }
  summarizeData(data) {
    const result = {};

    data.forEach((entry) => {
      const key = `${entry.saleid || entry.purchaseid}-${entry.ledger}`;
      if (!result[key]) {
        result[key] = {
          ...entry,
          debit: 0,
          credit: 0,
          saleid: entry.saleid,
          purchaseid: entry.purchaseid,
          ledger: entry.ledger,
        };
      }
      result[key].debit = Number(result[key].debit) + Number(entry.debit);
      result[key].credit = Number(result[key].credit) + Number(entry.credit);
    });

    return Object.values(result);
  }

  // new day report
  async dayBookReport(
    userId: number,
    companyId: number,
    sdate: any,
    ldate: any
  ) {
    try {
      const startDate = moment(sdate).startOf("day").toISOString();
      const endDate = moment(ldate).endOf("day").toISOString();

      let purchaseDetails = [];
      let salesDetails = [];
      let otherDetails = [];
      let totalDebit = 0;
      let totalCredit = 0;

      // 1.Purchase Invoice
      const purchaceData = await this.purchase_invoice.findAllByQuery({
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
        where: {
          adminid: userId,
          companyid: companyId,
          type: {
            [Op.or]: ["purchase", "pcredit", "stockassets"],
          },
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        attributes: [ "id", "supplierid"],
        order: [["id", "DESC"]],
      });

      for (const item of purchaceData) {
        // Purchse invoice , Debit Notes and Purchase Asset
        const ledgerPurchaseData = await this.ledger_details.findAllByQuery({
          where: {
            adminid: userId,
            companyid: companyId,
            sdate: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
            type: {
              [Op.or]: [
                "Purchase Invoice",
                "Purchase Credit Notes",
                "stockassets",
              ],
            },
            purchaseid: item.id,
          },
          include: [
            {
              model: AccountMaster,
            as: 'accountMasterDetails',
              attributes: ["laccount", "category", "id"],
            },
          ],
        });
        const result = this.processLedgerData(
          ledgerPurchaseData,
          item.id,
          item.supplier.name
        );
        if (result.values.length > 0) {
          totalDebit += result.totalDebit;
          totalCredit += result.totalCredit;
          purchaseDetails.push(result);
        }

        // Supplier Payment, Supplier Refund
        const ledgerPurchasePaymentData =
          await this.ledger_details.findAllByQuery({
            where: {
              adminid: userId,
              companyid: companyId,
              sdate: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
              },
              type: {
                [Op.or]: ["Supplier Payment", "Supplier Refund"],
              },
              purchaseid: item.id,
            },
            include: [
              {
                model: AccountMaster,
             as: 'accountMasterDetails',
                attributes: ["laccount", "category", "id"],
              },
            ],
          });
        const paymentResult = this.processLedgerData(
          ledgerPurchasePaymentData,
          item.id,
          item.supplier.name
        );
        if (paymentResult.values.length > 0) {
          totalDebit += paymentResult.totalDebit;
          totalCredit += paymentResult.totalCredit;
          purchaseDetails.push(paymentResult);
        }
      }

      // 2.Sales invoice
      const salesData = await this.sale_invoice.findAllByQuery({
        include: [
          {
            model: ContactMaster,
            as: "customer",
          },
        ],
        where: {
          adminid: userId,
          companyid: companyId,
          type: {
            [Op.or]: ["sales", "scredit"],
          },
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        attributes: [ "id", "customerid"],
        order: [["id", "DESC"]],
      });

      for (const item of salesData) {
        // Sales invoice and Credit Notes
        const ledgerSalesData = await this.ledger_details.findAllByQuery({
          where: {
            adminid: userId,
            companyid: companyId,
            sdate: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
            type: {
              [Op.or]: ["Sales Invoice", "Sales Credit Notes"],
            },
            saleid: item.id,
          },
          include: [
            {
              model: AccountMaster,
 as: 'accountMasterDetails',
              attributes: ["laccount", "category", "id"],
            },
          ],
        });
        const result = this.processLedgerData(
          ledgerSalesData,
          item.id,
          item.customer.name
        );
        if (result.values.length) {
          totalDebit += result.totalDebit;
          totalCredit += result.totalCredit;
          salesDetails.push(result);
        }

        // Customer Receipt, Customer Refund
        const ledgerSalesPaymentData = await this.ledger_details.findAllByQuery(
          {
            where: {
              adminid: userId,
              companyid: companyId,
              sdate: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
              },
              type: {
                [Op.or]: ["Customer Receipt", "Customer Refund"],
              },
              saleid: item.id,
            },
            include: [
              {
                model: AccountMaster,
      as: 'accountMasterDetails',
                attributes: ["laccount", "category", "id"],
              },
            ],
          }
        );
        const paymentResult = this.processLedgerData(
          ledgerSalesPaymentData,
          item.id,
          item.customer.name
        );
        if (result.values.length) {
          totalDebit += paymentResult.totalDebit;
          totalCredit += paymentResult.totalCredit;
          salesDetails.push(paymentResult);
        }
      }

      //Other Receipt ,Other Payment , Opening Balance and Bank Transfer
      const otherData = await this.otherMasterService.findAllByQuery({
        include: [
          {
            model: ContactMaster,
            as: "customer",
          },
        ],
        where: {
          adminId: userId,
          companyId: companyId,
          date: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
          type: {
            [Op.or]: [
              "Other Receipt",
              "Other Payment",
              "Bank Transfer",
              "Opening Balance",
            ],
          },
        },
        attributes: [ "id", "cname"],
        order: [["id", "DESC"]],
      });

      for (const item of otherData) {
        const ledgerOtherData = await this.ledger_details.findAllByQuery({
          where: {
            adminid: userId,
            companyid: companyId,
            sdate: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
            type: {
              [Op.or]: [
                "Other Receipt",
                "Other Payment",
                "Bank Transfer",
                "Opening Balance",
              ],
            },
            otherid: item.id,
          },
          include: [
            {
              model: AccountMaster,
            as: 'accountMasterDetails',
              attributes: ["laccount", "category", "id"],
            },
          ],
        });
        const result = this.processLedgerData(
          ledgerOtherData,
          item.id,
          item?.customer?.name
        );
        if (result.values.length) {
          totalDebit += result.totalDebit;
          totalCredit += result.totalCredit;
          otherDetails.push(result);
        }
      }

      // Journal
      const journalData = await this.journal_service.findAllByDate(
        userId,
        companyId,
        startDate,
        endDate
      );
      let journalDetails: any = [];
      if (journalData?.data) {
        for (const item of journalData.data) {
          totalDebit += item.totalDebit;
          totalCredit += item.totalCredit;
        }
        journalDetails = journalData.data;
      }

      const allData: any = [
        ...purchaseDetails,
        ...salesDetails,
        ...journalDetails,
        ...otherDetails,
      ];

      const sortedData = allData?.sort(
        (a: any, b: any) => +new Date(b.date) - +new Date(a.date)
      );

      return new CommonResponseDto(
        { allData: sortedData, totalCredit, totalDebit },
        true,
        "Data fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  processLedgerData(ledgerPurchaseData: any, id?: number, name?: string) {
    let ledgerIdGroups = {};
    let totalDebit = 0;
    let totalCredit = 0;
    let type = "";
    let date = "";

    ledgerPurchaseData.forEach((p: any) => {
      if (!ledgerIdGroups[p.ledgerDetails.id]) {
        ledgerIdGroups[p.ledgerDetails.id] = {
          type:
            p.type === "stockassets"
              ? "Purchase Asset"
              : p.type === "Purchase Credit Notes"
              ? "Debit Note"
              : p.type === "Sales Credit Notes"
              ? "Credit Note"
              : p.type,
          credit: 0,
          debit: 0,
          date: p.sdate,
          ledgerName:
            p.ledgerDetails.id == 51 || p.ledgerDetails.id == 47
              ? name
              : p.ledgerDetails.laccount,
          ledgerId: p.ledgerDetails.id,
          customerId: p.cname,
          customerName: name,
          id: id,
        };
      }
      ledgerIdGroups[p.ledgerDetails.id].debit += p.debit;
      ledgerIdGroups[p.ledgerDetails.id].credit += p.credit;
      totalDebit += p.debit;
      totalCredit += p.credit;
      type =
        p.type === "stockassets"
          ? "Purchase Asset"
          : p.type === "Purchase Credit Notes"
          ? "Debit Note"
          : p.type === "Sales Credit Notes"
          ? "Credit Note"
          : p.type;
      date = p.sdate;
    });

    Object.values(ledgerIdGroups).forEach((group: any) => {
      if (group.credit > group.debit) {
        group.credit -= group.debit;
        group.debit = 0;
      } else {
        group.debit -= group.credit;
        group.credit = 0;
      }
    });
    return {
      totalDebit,
      totalCredit,
      type,
      date,
      values: Object.values(ledgerIdGroups),
    };
  }
}
