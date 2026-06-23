import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { InvoiceItem } from "./invoice_items_entity";

@Injectable()
export class InvoiceItemsService {
  constructor(
    @Inject("InvoiceItemRepository")
    private readonly invoiceItemRepository: typeof InvoiceItem
  ) {}

  async createInvoiceItems(invoiceItem) {
    try {
      const invoiceItems =
        await this.invoiceItemRepository.bulkCreate<InvoiceItem>(invoiceItem);
      if (invoiceItems) {
        return new CommonResponseDto(
          invoiceItems,
          true,
          "InvoiceItems created successfully."
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Error in creating Invoice No Config."
        );
      }
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async deleteInvoiceItems(query) {
    try {
      const invoiceItems =
        await this.invoiceItemRepository.destroy<InvoiceItem>(query);
      if (invoiceItems) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async findAllByQuery(query: any) {
    try {
      const data = await this.invoiceItemRepository.findAll<InvoiceItem>(query);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async updateSalePaymentDate(adminid, userid, saleid, userdate) {
    try {
      let invoiceItems: any =
        await this.invoiceItemRepository.findOne<InvoiceItem>({
          where: {
            type: "Sales Invoice",
            adminid: adminid,
            userid: userid,
            saleid: saleid,
          },
        });
      if (invoiceItems) {
        await this.invoiceItemRepository.update(
          {
            paymentdate: userdate,
            userdate: userdate,
          },
          {
            where: {
              type: "Sales Invoice",
              adminid: adminid,
              saleid: saleid,
            },
          }
        );
        return new CommonResponseDto(
          invoiceItems,
          true,
          "items updated successfully."
        );
      }
    } catch (err) {
      console.log(err);
      return new CommonResponseDto(
        null,
        false,
        "Error in saving Invoice items."
      );
    }
  }

  async updatePurchasePaymentDate(adminid, userid, purchaseid, userdate) {
    try {
      let invoiceItems: any =
        await this.invoiceItemRepository.findOne<InvoiceItem>({
          where: {
            type: "Purchase Invoice",
            adminid: adminid,
            userid: userid,
            purchaseid: purchaseid,
          },
        });
      if (invoiceItems) {
        await this.invoiceItemRepository.update(
          {
            paymentdate: userdate,
            userdate: userdate,
          },
          {
            where: {
              type: "Purchase Invoice",
              adminid: adminid,
              purchaseid: purchaseid,
            },
          }
        );
        return new CommonResponseDto(
          invoiceItems,
          true,
          "items updated successfully."
        );
      }
    } catch (err) {
      console.log(err);
      return new CommonResponseDto(
        null,
        false,
        "Error in saving Invoice items."
      );
    }
  }

  async distroy(query) {
    let data = await this.invoiceItemRepository.destroy(query);
    return data;
  }
}
