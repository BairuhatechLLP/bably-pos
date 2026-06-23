import { Inject, Injectable } from '@nestjs/common';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { SaleInvoice } from '../sale_invoice/sale_invoice';
import { Op } from 'sequelize';
import { PurchaseInvoice } from '../purchase_invoice/purchase_invoice_model';

@Injectable()
export class InvoiceNoService {
  constructor(
    @Inject('SalesInvoiceRepository')
    private readonly SalesInvoiceRepository: typeof SaleInvoice,
    @Inject('PurchaseInvoiceRepository')
    private readonly cartRepository: typeof PurchaseInvoice,
  ) {}

  getInvoiceNo(id,companyid,locationId, type) {
    try {
      if (type === 'sales' || type === 'scredit' || type === 'proforma') {
        return this.getSaleInvoiceNo(id,companyid,locationId, type);
      } else {
        return this.getPurchaseInvoiceNo(id,companyid,locationId, type);
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getSaleInvoiceNo(id,companyid,locationId, type) {
    try {
      let response: CommonResponseDto;
      let likeQuery = 'SI-';
      if (type == 'sales') {
        if (id == '2214') {
          likeQuery = 'INV-';
        } else {
          likeQuery = 'SI-';
        }
      } else if (type == 'scredit') {
        likeQuery = 'SCN-';
      } else if (type == 'proforma') {
        likeQuery = 'PRI-';
      }
      const data = await this.SalesInvoiceRepository.findAll<SaleInvoice>({
        where: {
          adminid: id,
          companyid:companyid,
          seriesNo:locationId,
          invoiceno: { [Op.like]: `${likeQuery}%` },
        },
        order: [['id', 'DESC']],
        limit: 1,
      });
      if (data) {
        let newID: any = '';
        if (data.length > 0) {
          let splitString = String(data[0].invoiceno).split('-');
          let newID: any = Number(splitString[1]) + 1;
          newID = likeQuery + '' + newID;
          response = {
            data: newID,
            status: true,
            message: 'Generating New Invoice ID',
          };
        } else {
          newID = likeQuery + '' + 1;
          response = {
            data: newID,
            status: true,
            message: 'Generating New Invoice ID',
          };
        }
      } else {
        response = {
          data: null,
          status: false,
          message: 'Error Generating New Invoice ID',
        };
      }
      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getPurchaseInvoiceNo(id,companyid,locationId, type) {
    try {
      let response: CommonResponseDto;
      let likeQuery = 'PI-';
      if (type == 'purchase') {
        likeQuery = 'PI-';
      } else if (type == 'pcredit') {
        likeQuery = 'PCN-';
      } else if (type == 'retail') {
        likeQuery = 'REINV-';
      }
      const data = await this.cartRepository.findAll<PurchaseInvoice>({
        where: {
          adminid: id,
          companyid:companyid,
          seriesNo:locationId,
          invoiceno: { [Op.like]: `${likeQuery}%` },
        },
        order: [['id', 'DESC']],
        limit: 1,
      });
      if (data) {
        let newID: any = '';
        if (data.length > 0) {
          let splitString = String(data[0].invoiceno).split('-');
          let newID: any = Number(splitString[1]) + 1;
          newID = likeQuery + '' + newID;
          response = {
            data: newID,
            status: true,
            message: 'Generating New Invoice ID',
          };
        } else {
          newID = likeQuery + '' + 1;
          response = {
            data: newID,
            status: true,
            message: 'Generating New Invoice ID',
          };
        }
      } else {
        response = {
          data: null,
          status: false,
          message: 'Error Generating New Invoice ID',
        };
      }
      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
   
  }
}
