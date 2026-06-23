import { Inject, Injectable } from "@nestjs/common";
import sequelize, { Op } from "sequelize";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { InvoiceItemsService } from "../invoice_item/invoice_item_service";
import { InvoiceItem } from "../invoice_item/invoice_items_entity";
import { ProductMasterDto } from "../product_master/dto/product_master_dto";
import { ProductMaster } from "../product_master/product_master";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import moment from "moment";
import { ProductCategory } from "../product_category/product_category_entity";

@Injectable()
export class StockSummaryService {
  constructor(
    @Inject(InvoiceItemsService)
    private readonly invoiceItemsService: InvoiceItemsService
  ) {}

  async getAllStockData1(id: number) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        [Op.or]: [
          { is_deleted: null },
          { is_deleted: false },
          { stock: { [Op.gt]: 0 } },
          { stockquantity: { [Op.gt]: 0 } },
        ],
        itemtype: "Stock" || "Nonstock",
        // stock: {
        //   [Op.gt]: 0,
        // },
      };

      const products = await ProductMaster.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
          },
        ],
      });

      if (products && products?.length) {
        let arr = [];
        let len = products?.length;

        for (let i = 0; i < len; i++) {
          let invoiceItems: any = await this.invoiceItemsService.findAllByQuery(
            {
              where: {
                idescription: products[i].id,
                type: ["Purchase Invoice", "Sales Invoice"],
              },
            }
          );

          let salesQuantity = invoiceItems
            ?.filter((item: any) => item?.type === "Sales Invoice")
            .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

          let purchaseQuantity = invoiceItems
            ?.filter((item: any) => item?.type === "Purchase Invoice")
            .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

          const salesPrice = invoiceItems
            .filter((item: any) => item.type === "Sales Invoice")
            .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

          const purchasePrice = invoiceItems
            .filter((item: any) => item.type === "Purchase Invoice")
            .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

          let obj = {
            salesQuantity,
            purchaseQuantity,
            salesPrice,
            purchasePrice,
          };
        }
      } else {
        return [];
      }

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //

  async getAllStockData(
    id: number,
    companyid: number,
    fdate: string,
    lastdate: string
  ) {
    try {
      let sdate = moment(fdate).startOf("day").toISOString();
      let ldate = moment(lastdate).endOf("day").toISOString();
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        companyid,
        [Op.or]: [
          { is_deleted: null },
          { is_deleted: false },
          { stock: { [Op.gt]: 0 } },
          { stockquantity: { [Op.gt]: 0 } },
        ],
        itemtype: ["Stock", "Nonstock"],
        date: {
          [Op.gte]: sdate,
          [Op.lte]: ldate,
        },
      };

      const data = await ProductMaster.findAll<ProductMaster>({
        where: whereCondition,
        raw: true,
        include: [
          {
            model: ContactMaster,
          },
          {
            model: ProductCategory,
            attributes: ["id", "category"],
          },
        ],
      });
      let len = data?.length;
      let arr = [];
      for (let i = 0; i < len; i++) {
        let opening = 0;

        if (data[i].stockquantity) {
          opening = data[i].costprice * data[i].stockquantity;
        }

        const _purchaseData: any = await InvoiceItem.findAll<InvoiceItem>({
          where: {
            adminid: id,
            type: "Purchase Invoice",
            companyid,
            idescription: Number(data[i]?.id),
            // sdate: {
            //   [Op.lte]: sdate,
            // },
          },
          raw: true,
        });

        const creditData: any = await InvoiceItem.findAll<InvoiceItem>({
          where: {
            adminid: id,
            type: "Purchase Credit Notes",
            companyid,
            idescription: Number(data[i]?.id),
            // sdate: {
            //   [Op.lte]: sdate,
            // },
          },
          raw: true,
        });

        let totalPurchaseRate = _purchaseData.reduce(
          (total: any, item: any) =>
            Number(total) + Number(item?.total) - Number(item?.vatamt),
          0
        );
        let totalCreditRate = creditData.reduce(
          (total: any, item: any) =>
            Number(total) + Number(item?.total) - Number(item.vatamt),
          0
        );
        let totalRate = totalPurchaseRate - totalCreditRate;
        let totalPurchaseQuantity = _purchaseData.reduce(
          (total: any, item: any) => Number(total) + Number(item.quantity),
          0
        );
        let totalCreditQuantity = creditData.reduce(
          (total: any, item: any) => Number(total) + Number(item.quantity),
          0
        );
        let totalQuantity = totalPurchaseQuantity - totalCreditQuantity;
        let allTotal = Number(totalRate) + Number(opening);
        let allQuantity = Number(totalQuantity);
        if (data[i]?.stockquantity) {
          allQuantity = Number(totalQuantity) + Number(data[i].stockquantity);
        }
        let itemAmount = Number(allTotal) / Number(allQuantity);
        if (Number(allTotal) === 0 && Number(allQuantity) === 0) {
          itemAmount = 0;
        }
        let obj = {
          id: data[i]?.id,
          quantity: Number(data[i]?.stock) + Number(data[i]?.stockquantity),
          idescription: data[i]?.idescription,
          itemtype: data[i]?.productCategory?.category || "",
          rate: itemAmount,
          value: Number(itemAmount) * Number(data[i]?.stock),
        };
        arr?.push(obj);
      }
      return arr;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getAllStockData2(id: number, companyid: number) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        companyid,
        [Op.or]: [
          { is_deleted: null },
          { is_deleted: false },
          { stock: { [Op.gt]: 0 } },
          { stockquantity: { [Op.gt]: 0 } },
        ],
        itemtype: { [Op.or]: ["Stock", "Nonstock"] },
        // stock: { [Op.gt]: 0 },
      };

      const data = await ProductMaster.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
          },
        ],
      });

      let arr = [];
      for (let i = 0; i < data.length; i++) {
        const datapurchase: any = await this.invoiceItemsService.findAllByQuery(
          {
            where: {
              companyid,
              idescription: data[i].id,
              type: ["Purchase Invoice", "Sales Invoice"],
            },
          }
        );

        const purchaseQuantity = datapurchase
          .filter((item: any) => item.type === "Purchase Invoice")
          .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

        const purchasecostprice = datapurchase
          .filter((item: any) => item.type === "Purchase Invoice")
          .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

        const salesQuantity = datapurchase
          .filter((item: any) => item.type === "Sales Invoice")
          .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

        const salescostprice = datapurchase
          .filter((item: any) => item.type === "Sales Invoice")
          .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

        let totalqty =
          Number(data[i].stock) +
          Number(purchaseQuantity) -
          Number(salesQuantity);

        let totalcostprice =
          Number(data[i].costprice) +
          Number(purchasecostprice) -
          Number(salescostprice);

        let totalrate = Number(totalcostprice) / Number(totalqty);
        let obj = {
          id: data[i].id,
          quantity: totalqty,
          costprice: totalcostprice,
          idescription: data[i].idescription,
          itemtype: data[i].product_category,
          rate: totalrate,
        };
        arr.push(obj);
      }
      return arr;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findStoctDetails(id: number, companyid: number) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        companyid,
        [Op.or]: [
          { is_deleted: null },
          { is_deleted: false },
          { stock: { [Op.gt]: 0 } },
          { stockquantity: { [Op.gt]: 0 } },
        ],
        itemtype: "Stock" || "Nonstock",
        // stock: {
        //   [Op.gt]: 0,
        // },
      };
      const data = await ProductMaster.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
          },
        ],
      });
      return new CommonResponseDto(
        data.map((tmp) => new ProductMasterDto(tmp)),
        true,
        "Product List"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getDataByMonths(data: any) {
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

  async inwardData(adminId: number, id: number) {
    try {
      const purchaseData: any = await InvoiceItem.findAll<InvoiceItem>({
        where: { adminid: adminId, type: "Purchase Invoice", idescription: id },
        raw: true,
      });
      const creditData: any = await InvoiceItem.findAll<InvoiceItem>({
        where: {
          adminid: adminId,
          type: "Purchase Credit Notes",
          idescription: id,
        },
        raw: true,
      });
      for (let i = 0; i < creditData.length; i++) {
        for (let j = 0; j < purchaseData.length; j++) {
          let samePurcahase: any =
            creditData[i].invoiceid == purchaseData[j].purchaseid;
          if (samePurcahase) {
            let quantity =
              Number(purchaseData[j]?.quantity) -
              Number(creditData[i]?.quantity);
            let reduceVatamt =
              Number(purchaseData[j]?.vatamt) - Number(creditData[i]?.vatamt);
            purchaseData[j].total =
              (purchaseData[j].total / purchaseData[j].quantity) * quantity -
              reduceVatamt;
            purchaseData[j].quantity =
              purchaseData[j].quantity - creditData[i].quantity;
          }
        }
      }
      const Data: any = await this.getDataByMonths(purchaseData);
      return {
        status: true,
        message: "Inward Invoice List",
        data: Data,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async outwardData(adminId: number, id: number) {
    try {
      const salesData: any = await InvoiceItem.findAll<InvoiceItem>({
        where: { adminid: adminId, type: "Sales Invoice", idescription: id },
        raw: true,
      });
      const debitData: any = await InvoiceItem.findAll<InvoiceItem>({
        where: {
          adminid: adminId,
          type: "Sales Credit Notes",
          idescription: id,
        },
        raw: true,
      });
      for (let i = 0; i < debitData.length; i++) {
        for (let j = 0; j < salesData.length; j++) {
          let samePurcahase: any =
            debitData[i].invoiceid == salesData[j].saleid;
          if (samePurcahase) {
            let quantity = salesData[j].quantity - debitData[i].quantity;
            let reduceVatamt =
            Number(salesData[j]?.vatamt) - Number(debitData[i]?.vatamt);
            salesData[j].total =
             ( (salesData[j].total / salesData[j].quantity) * quantity)-reduceVatamt;
            salesData[j].quantity = quantity;
          }
        }
      }
      const Data: any = await this.getDataByMonths(salesData);
      return {
        status: true,
        message: "Outward Invoice List",
        data: Data,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllStockDataForOpening(id: number, companyid: number, sdate: any) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        companyid,
        [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        itemtype: ["Stock"], //, 'Nonstock'
        // created_at: {
        //   [Op.lt]: sdate,
        // },
      };

      const data = await ProductMaster.findAll<ProductMaster>({
        where: whereCondition,
        raw: true,
      });
      let len = data?.length;
      let arr = [];
      for (let i = 0; i < len; i++) {
        let opening = 0;
        if (data[i].stockquantity > 0) {
          opening = Number(data[i]?.costprice) * Number(data[i]?.stockquantity);
        }
        const _purchaseData: any = await InvoiceItem.findAll<InvoiceItem>({
          where: {
            adminid: id,
            companyid,
            type: "Purchase Invoice",
            idescription: Number(data[i]?.id),
            sdate: {
              [Op.lt]: sdate,
            },
          },
          raw: true,
        });
        const creditData: any = await InvoiceItem.findAll<InvoiceItem>({
          where: {
            adminid: id,
            companyid,
            type: "Purchase Credit Notes",
            idescription: Number(data[i]?.id),
            sdate: {
              [Op.lt]: sdate,
            },
          },
          raw: true,
        });
        for (let j = 0; j < creditData.length; j++) {
          for (let k = 0; k < _purchaseData.length; k++) {
            let samePurcahase: any =
              creditData[j].invoiceid == _purchaseData[k].purchaseid;
            if (samePurcahase) {
              let quantity = _purchaseData[k].quantity - creditData[j].quantity;
              _purchaseData[k].total =
                (_purchaseData[k].total / _purchaseData[k].quantity) * quantity;
              _purchaseData[k].quantity =
                _purchaseData[k].quantity - creditData[j].quantity;
            }
          }
        }
        let totalRate = _purchaseData.reduce(
          (total: any, item: any) =>
            Number(total) + Number(item?.total) - Number(item?.vatamt),
          0
        );
        let totalQuantity = _purchaseData.reduce(
          (total: any, item: any) => Number(total) + Number(item?.quantity),
          0
        );
        let allTotal = Number(totalRate) + Number(opening);
        let allQuantity =
          Number(totalQuantity) + Number(data[i]?.stockquantity);
        let itemAmount = Number(allTotal) / Number(allQuantity);
        if (Number(allTotal) === 0 && Number(allQuantity) === 0) {
          itemAmount = 0;
        }
        let obj = {
          id: data[i]?.id,
          quantity: data[i]?.stock,
          idescription: data[i]?.idescription,
          itemtype: data[i].product_category,
          value: Number(itemAmount) * Number(data[i]?.stock),
          rate: Number(data[i]?.stock) ? itemAmount : 0.0,
        };
        arr?.push(obj);
      }
      return arr;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getAllStockDataForClosing(id: number, companyid: number, sdate: any) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        companyid,
        [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        itemtype: ["Stock"], //, 'Nonstock'
        // created_at: {
        //   [Op.lte]: sdate,
        // },
      };

      const data = await ProductMaster.findAll<ProductMaster>({
        where: whereCondition,
        raw: true,
      });
      let len = data?.length;
      let arr = [];
      for (let i = 0; i < len; i++) {
        let opening = 0;
        if (data[i].stockquantity) {
          opening = Number(data[i].costprice) * Number(data[i].stockquantity);
        }
        const _purchaseData: any = await InvoiceItem.findAll<InvoiceItem>({
          where: {
            adminid: id,
            type: "Purchase Invoice",
            companyid,
            idescription: Number(data[i]?.id),
            sdate: {
              [Op.lte]: sdate,
            },
          },
          raw: true,
        });

        const creditData: any = await InvoiceItem.findAll<InvoiceItem>({
          where: {
            adminid: id,
            type: "Purchase Credit Notes",
            companyid,
            idescription: Number(data[i]?.id),
            sdate: {
              [Op.lte]: sdate,
            },
          },
          raw: true,
        });

        // for (let j = 0; j < creditData.length; j++) {
        //   for (let k = 0; k < _purchaseData.length; k++) {
        //     let samePurcahase: any =
        //       creditData[j].invoiceid == _purchaseData[k].purchaseid;
        //     if (samePurcahase) {
        //       let quantity =
        //         (await Number(_purchaseData[k].quantity)) -
        //         Number(creditData[j].quantity);
        //       _purchaseData[k].total =
        //         (Number(_purchaseData[k].total) /
        //           Number(_purchaseData[k].quantity)) *
        //         quantity;
        //       _purchaseData[k].quantity =
        //         Number(_purchaseData[k].quantity) -
        //         Number(creditData[j].quantity);
        //     }
        //   }
        // }
        let totalPurchaseRate = _purchaseData.reduce(
          (total: any, item: any) =>
            Number(total) + Number(item.total) - Number(item.vatamt),
          0
        );

        let totalCreditRate = creditData.reduce(
          (total: any, item: any) =>
            Number(total) + Number(item.total) - Number(item.vatamt),
          0
        );

        let totalRate = totalPurchaseRate - totalCreditRate;
        let totalPurchaseQuantity = _purchaseData.reduce(
          (total: any, item: any) => Number(total) + Number(item.quantity),
          0
        );
        let totalCreditQuantity = creditData.reduce(
          (total: any, item: any) => Number(total) + Number(item.quantity),
          0
        );
        let totalQuantity = totalPurchaseQuantity - totalCreditQuantity;
        let allTotal = Number(totalRate) + Number(opening);
        let allQuantity = Number(totalQuantity) + Number(data[i].stockquantity);
        let itemAmount = Number(allTotal) / Number(allQuantity);
        if (Number(allTotal) === 0 && Number(allQuantity) === 0) {
          itemAmount = 0;
        }
        let obj = {
          id: data[i]?.id,
          quantity: Number(data[i]?.stock) + Number(data[i]?.stockquantity),
          idescription: data[i]?.idescription,
          itemtype: data[i].product_category,
          value: Number(itemAmount) * Number(data[i]?.stock),
        };
        arr?.push(obj);
      }
      return arr;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
