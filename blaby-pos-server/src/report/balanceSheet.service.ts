import { Injectable } from "@nestjs/common";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import sequelize, { Op } from "sequelize";
import moment from "moment";

import { PurchaseInvoice } from "../purchase_invoice/purchase_invoice_model";
import { SaleInvoice } from "../sale_invoice/sale_invoice";
import { AccountMaster } from "../account_master/account_master";
import { ProductMaster } from "../product_master/product_master";
import { LedgerDetails } from "../ledger_details/ledger_details";
import { InvoiceItem } from "../invoice_item/invoice_items_entity";

@Injectable()
export class BalanceSheetService {
  async report(data: any) {
    try {
      const sdate = moment(data?.from).startOf("day").toISOString();
      const edate = moment(data?.to).endOf("day").toISOString();
      // const tradeDebitors = await SaleInvoice.sum("outstanding", {
      //   where: {
      //     adminid: data?.adminid,
      //     companyid: data?.companyid,
      //     sdate: {
      //       [Op.gte]: sdate,
      //       [Op.lte]: edate,
      //     },
      //   },
      //   raw: true,
      // });

      const cashinHand: any = await AccountMaster.findAll({
        attributes: ["id", "laccount", "opening"],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          category: 1,
          laccount: "Cash",
        },
        raw: true,
      });

      const cashDetails: any = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledger: cashinHand[0]?.id,
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        include: [
          {
            model: AccountMaster,
          as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });

      const cashBalance =
        Number(cashDetails[0].totalDebit) - Number(cashDetails[0].totalCredit);

      const bank = await AccountMaster.findAll({
        attributes: ["id", "laccount", "opening"],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          category: 1,
          laccount: { [Op.ne]: "Cash" },
        },
        raw: true,
      });
      const bankIds = bank?.map((item) => item.id);
      const bankDetails = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledger: { [Op.in]: bankIds },
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
          as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      const updatedbank = this.getUpdatedBankData(bankDetails, bank);
      const bankTotal = this.getTotalAssets(updatedbank);
      const fixedAssets = await PurchaseInvoice.findAll({
        attributes: [
          "ledger",
          [
            sequelize.fn("SUM", sequelize.literal("`PurchaseInvoice`.`total`")),
            "sum",
          ],
        ],
        include: [
          {
            model: AccountMaster,
   as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount"],
          },
        ],
        group: ["ledger"],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          type: "stockassets",
          sdate: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        raw: true,
      });

      const liabilityLedgers = await AccountMaster.findAll({
        attributes: ["id", "category"],
        where: {
          adminid: { [Op.in]: [-2, data?.adminid] },
          companyid: { [Op.in]: [-2, data?.companyid] },
          category: { [Op.notIn]: [10] },
          categorygroup: 2,
        },
        raw: true,
      });
      const assetsLedgers = await AccountMaster.findAll({
        attributes: ["id", "category"],
        where: {
          adminid: { [Op.in]: [-2, data?.adminid] },
          companyid: { [Op.in]: [-2, data?.companyid] },
          category: { [Op.notIn]: [9, 8, 1] },
          categorygroup: 1,
        },
        raw: true,
      });
      const capitalLedgers = await AccountMaster.findAll({
        attributes: ["id", "category"],
        where: {
          adminid: { [Op.in]: [-2, data?.adminid] },
          companyid: { [Op.in]: [-2, data?.companyid] },
          categorygroup: 4,
        },
        raw: true,
      });
      console.log(capitalLedgers);
      function getCategoryUniqueIds(objects) {
        const categoryIds = objects.map((obj) => obj.category);
        return [...new Set(categoryIds)];
      }

      let currentlablitycategory: any[] =
        getCategoryUniqueIds(liabilityLedgers);
      console.log(currentlablitycategory);
      let currentassetscategory: any[] = getCategoryUniqueIds(assetsLedgers);
      let capitalcategory: any[] = getCategoryUniqueIds(capitalLedgers);
      const currentLiability = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledger: { [Op.notIn]: [54, 55] },
          ledgercategory: { [Op.in]: currentlablitycategory },
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
 as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      console.log("current liability", currentLiability);
      const futureLiability = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledgercategory: 10,
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
         as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      const futureAssets = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledgercategory: 9,
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
            as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      const currentAsset = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledger: { [Op.notIn]: [54, 55] },
          ledgercategory: { [Op.in]: currentassetscategory },
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
 as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });

      // var totalAmntQery: any = [
      //   sequelize.fn(
      //     'SUM',
      //     sequelize.cast(sequelize.col('total'), 'DECIMAL(11, 2)'),
      //   ),
      //   'totalAmnt',
      // ];
      const capital = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledgercategory: { [Op.in]: capitalcategory },
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
         as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      const vatOnSale = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledger: 54,
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
 as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      const vatOnPurchase = await LedgerDetails.findAll({
        attributes: [
          "ledger",
          "ledgercategory",
          "credit",
          "debit",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `credit` IS NOT NULL THEN `credit` ELSE 0 END"
              )
            ),
            "totalCredit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN `debit` IS NOT NULL THEN `debit` ELSE 0 END"
              )
            ),
            "totalDebit",
          ],
        ],
        where: {
          adminid: data?.adminid,
          companyid: data?.companyid,
          ledger: 55,
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["ledger"],
        include: [
          {
            model: AccountMaster,
     as: 'accountMasterDetails',
            where: { od: sequelize.col("ledger") },
            attributes: ["laccount", "category"],
          },
        ],
        raw: true,
      });
      const vatSale = this.getTotalSaleVat(vatOnSale);
      const vatPurchase = this.getTotalPurchaseVat(vatOnPurchase);

      const stockData = await InvoiceItem.findAll({
        attributes: [
          "total",
          "idescription",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                'CASE WHEN type = "Purchase Invoice" THEN quantity ELSE 0 END'
              )
            ),
            "totalPurchaseQuantity",
          ],
          // [sequelize.fn('sum', sequelize.col('total')), 'total_amount'],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                'CASE WHEN type = "Purchase Invoice" THEN total ELSE 0 END'
              )
            ),
            "totalAmountPurchase",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                'CASE WHEN type = "Purchase Invoice" THEN vatamt ELSE 0 END'
              )
            ),
            "totalInvoiceVat",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                'CASE WHEN type = "Purchase Credit Notes" THEN total ELSE 0 END'
              )
            ),
            "totalAmountDebit",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                'CASE WHEN type = "Purchase Credit Notes" THEN vatamt ELSE 0 END'
              )
            ),
            "totalDebitVat",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                'CASE WHEN type = "Purchase Credit Notes" THEN quantity ELSE 0 END'
              )
            ),
            "totalCreditQuantity",
          ],
        ],
        where: {
          adminid: data.adminid,
          companyid: data?.companyid,
          type: ["Purchase Invoice", "Purchase Credit Notes"],
          sdate: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        group: ["idescription"],
        raw: true,
      });

    
      const productMasterData = await ProductMaster.findAll({
        attributes: [
          "id",
          "stock",
          "stockquantity",
          "costprice",
          [sequelize.literal("stockquantity*costprice"), "openingBalance"],
        ],
        where: {
          adminid: data.adminid,
          companyid: data?.companyid,
          created_at: {
            [Op.gte]: sdate,
            [Op.lte]: edate,
          },
        },
        raw: true,
      });
      const mergedStockData = stockData.map((item: any) => ({
        ...item,
        debitTotalOutTax:
          Number(item?.totalAmountDebit) - Number(item?.totalDebitVat),
        purchaseTotalOutTax:
          Number(item?.totalAmountPurchase) - Number(item?.totalInvoiceVat),
        productMasterInfo: productMasterData.find(
          (product: any) => Number(product.id) === Number(item.idescription)
        ),
      }));
      const openingBalances = productMasterData.reduce(
        (acc: number, item: any) => acc + Number(item.openingBalance),
        0
      );
      let stock = this.getStockTotalamount(mergedStockData);
      stock += openingBalances;
      let capitals = this.getTotalCapital(capital);
      let labilities = this.getUpdatedCurrentLabilty(currentLiability);
      let futurelablity = this.getUpdatedCurrentLabilty(futureLiability);
      let futureAsset = this.getUpdatedFutureAssets(futureAssets);

      let modifiedAssets = this.getUpdatedCurrentAsset(currentAsset);
      let totallabilities =
        Number(this.getTotalLability(labilities)) +
        Number(capitals) +
        Number(this.getTotalLability(futurelablity));
      let vatRecivable = Number(vatPurchase) - Number(vatSale);
      let vatPayble = Number(vatSale) - Number(vatPurchase);
      if (Number(vatSale) - Number(vatPurchase) >= 0) {
        totallabilities += Number(Number(vatSale) - Number(vatPurchase));
      }

      let stockWIthVatRecivable = Number(stock);
      // if (vatRecivable > 0) {
      //   stockWIthVatRecivable = stockWIthVatRecivable;
      // } else {
      //   stockWIthVatRecivable = Number(stock);
      // }

      let totalCurrentAsset = Number(this.getTotalAssets(modifiedAssets));
      let totalFixedAssets = Number(this.getTotalFixedAssets(fixedAssets));
      let totalAssets =
        Number(totalCurrentAsset) +
        Number(totalFixedAssets) +
        Number(bankTotal) +
        Number(cashBalance);

      if (Number(stockWIthVatRecivable) >= 0) {
        totalAssets += Number(stockWIthVatRecivable);
      }
      if (Number(vatPurchase) - Number(vatSale) >= 0) {
        totalAssets += Number(Number(vatPurchase) - Number(vatSale));
      }

      let obj = {
        cashinHand: cashBalance,
        stock: Number(stock),
        bank: updatedbank,
        bankSum: bankTotal,
        stockWIthVatRecivable: stockWIthVatRecivable,
        totalFixedAssets: totalFixedAssets,
        totalCurrentAsset: totalCurrentAsset,
        fixedAssets: fixedAssets,
        currentLiability: labilities,
        futureLiability: futurelablity,
        futureAsset: futureAsset,
        vatRecivable: Number(vatPurchase) - Number(vatSale),
        vatPayble: Number(vatSale) - Number(vatPurchase),
        currentAsset: modifiedAssets,
        capital: capitals,
        datacapital: this.getUpdatedCurrentLabilty(capital),
        totalLabilities: totallabilities,
        totalAssets: totalAssets,
      };
      let response = new CommonResponseDto(obj, true, "success");
      return response;
    } catch (err) {
      console.log("err = = = = >", err);
      throw err;
    }
  }

  getTotalCapital(capitals: any) {
    const sumTotalCredit = capitals.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.totalCredit);
    }, 0);
    const sumTotalDebit = capitals.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.totalDebit);
    }, 0);
    const result = Number(sumTotalCredit) - Number(sumTotalDebit);
    return result;
  }

  getTotalPurchaseVat(capitals: any) {
    const sumTotalCredit = capitals.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.totalCredit);
    }, 0);
    const sumTotalDebit = capitals.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.totalDebit);
    }, 0);
    const result = Number(sumTotalDebit) - Number(sumTotalCredit);
    return result;
  }
  getTotalSaleVat(capitals: any) {
    const sumTotalCredit = capitals.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.totalCredit);
    }, 0);
    const sumTotalDebit = capitals.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.totalDebit);
    }, 0);
    const result = Number(sumTotalCredit) - Number(sumTotalDebit);
    return result;
  }
  getUpdatedCurrentAsset(currentAsset: any) {
    let calculatedCurrentAsset: any = [];
    for (let i = 0; i < currentAsset.length; i++) {
      const element = currentAsset[i];
      if (element["ledgerDetails.category"] !== 1) {
        let obj = {
          totalCredit: element?.totalCredit,
          totalDebit: element?.totalDebit,
          balance: Number(element?.totalDebit) - Number(element?.totalCredit),
          laccount: element["ledgerDetails.laccount"],
          category: element["ledgerDetails.ledgercategory"],
        };
        calculatedCurrentAsset = [...calculatedCurrentAsset, obj];
      }
    }

    return calculatedCurrentAsset;
  }
  getStockTotalamount(stockData: any) {
    let totalStockAmount: any = 0;
    for (let i = 0; i < stockData.length; i++) {
      const element = stockData[i];
      const openingStock =
        Number(element?.productMasterInfo?.stockquantity) || 0;
      const currentStock = //5
        Number(element?.totalPurchaseQuantity) +
        Number(openingStock) -
        Number(element?.totalCreditQuantity);
      const alltotalAmount = //476.19
        Number(element?.purchaseTotalOutTax) -
        Number(element?.debitTotalOutTax) +
        Number(element?.productMasterInfo?.openingBalance);

      let allQuantity = Number(currentStock) + Number(openingStock);
      let itemAmount = Number(alltotalAmount) / allQuantity;

      let lastStockAmountAfterSaleAndPurch =
        itemAmount * Number(element.productMasterInfo.stock);
      totalStockAmount += lastStockAmountAfterSaleAndPurch;
    }

    return totalStockAmount;
  }

  getUpdatedBankData(currentAsset: any, bank: any) {
    let calculatedBank: any = [];
    for (let i = 0; i < currentAsset.length; i++) {
      const element = currentAsset[i];
      let obj = {
        totalCredit: element?.totalCredit,
        totalDebit: element?.totalDebit,
        balance: Number(element?.totalDebit) - Number(element?.totalCredit),
        laccount: element["ledgerDetails.laccount"],
        category: element["ledgerDetails.ledgercategory"],
      };
      calculatedBank = [...calculatedBank, obj];
    }

    return calculatedBank;
  }
  getUpdatedCurrentLabilty(currentLiability: any) {
    let totalLability = [];
    for (let i = 0; i < currentLiability.length; i++) {
      const element = currentLiability[i];
      totalLability.push({
        ...element,
        balance: Number(element.totalCredit) - Number(element.totalDebit),
      });
    }
    return totalLability;
  }
  getUpdatedFutureAssets(futureAssets: any) {
    let futureAsset = [];
    for (let i = 0; i < futureAssets.length; i++) {
      const element = futureAssets[i];
      futureAsset.push({
        ...element,
        balance: Number(element?.totalDebit) - Number(element?.totalCredit),
      });
    }
    return futureAsset;
  }
  getTotalLability(lability: any) {
    const sumTotalCredit = lability.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.balance);
    }, 0);
    return Number(sumTotalCredit);
  }
  getTotalAssets(asset: any) {
    const sumBalance = asset.reduce(
      (acc: number, entry: any) => Number(acc) + Number(entry.balance),
      0
    );
    return sumBalance;
  }
  getTotalFixedAssets(asset: any) {
    const sumBalance = asset.reduce((acc: number, entry: any) => {
      return Number(acc) + Number(entry.sum);
    }, 0);

    return sumBalance;
  }
}
