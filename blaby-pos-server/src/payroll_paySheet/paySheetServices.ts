import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PayrollPaySheetDTO } from './dto/paySheet.dto';
import { PayrollPaySheet } from './paySheetEntity';
import { CreatePaySheetDto } from './dto/paySheet.create';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';
import { PaySheetItemsService } from '../payroll_paySheetItems/paysheetItemsServices';
import { DatabaseService } from '../database/database.service';
import { PayrollEmployee } from '../payroll_employees/employeeEntity';
import { LedgerDetailsService } from '../ledger_details/ledger_details_service';
import moment from 'moment';
import { AccountMasterService } from '../account_master/account_master_service';
import { UpdatePaySheetDto } from './dto/paySheet.update';

@Injectable()
export class PaySheetService {
  constructor(
    @Inject('payrollPaySheetRepository')
    private readonly paySheetRepository: typeof PayrollPaySheet,
    private readonly paySheetItemsService: PaySheetItemsService,
    private readonly databaseService: DatabaseService,
    private readonly ledger_details: LedgerDetailsService,
    private readonly account_master: AccountMasterService
  ) {}
  async findAllUser(id: any): Promise<any> {
    try {
      const paySheetItemsCategory = await this.paySheetRepository.findAll({
        include: [PayrollEmployee],
        where: { companyid: id },
      });
      return paySheetItemsCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getById(id: any): Promise<any> {

    try {
      const paySheet = await this.paySheetRepository.findOne({
        include: [PayrollEmployee],
        where: { id },
        raw: true,
      });
      let paysheetItems = await this.paySheetItemsService.findAllByPaysheetId(
        paySheet.id,
      );
      paySheet['paySheetItems'] = paysheetItems;
      return paySheet;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: number): Promise<any>  {
    try {
      const paySheet = await this.paySheetRepository.findByPk(id);
      if (!paySheet) {
        throw new HttpException('No payroll-paysheet found', HttpStatus.NOT_FOUND);
      }
      return paySheet
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(
    CreateProductCategoryDto: CreatePaySheetDto,
  ): Promise<CommonResponseDto> {
    try {
      const newPaySheet = await this.databaseService.getSequelize.transaction(
        async (transaction: any) => {
          const createdPaySheet = await this.paySheetRepository.create(
            {
              adminId: CreateProductCategoryDto.adminId,
              employeeId: CreateProductCategoryDto.employeeId,
              totalDeduction: CreateProductCategoryDto.totalDeduction,
              totalEarnings: CreateProductCategoryDto.totalEarnings,
              netSalary: CreateProductCategoryDto.netSalary,
              companyid: CreateProductCategoryDto.companyid,
            },
            { transaction },
          );

          const earnings = CreateProductCategoryDto?.earnings?.map(
            (item: any) => ({
              payHeadId: item?.payHead,
              amount: item?.amount === 0 ? 0.0 : Number(item?.amount) || 0.0,
              calculationType: item?.calculationType || '',
              type: 'earnings',
              percentageof:
                (item?.percentageof?.length && item?.percentageof?.join('|')) ||
                '',
              percentage:
                item?.percentage === 0 ? 0.0 : Number(item?.percentage) || 0.0,
              adminId: CreateProductCategoryDto.adminId,
              paySheetId: createdPaySheet?.id,
            }),
          );

          const deductions = CreateProductCategoryDto?.deduction?.map(
            (item: any) => ({
              payHeadId: item?.payHead,
              amount: item?.amount === 0 ? 0.0 : Number(item?.amount) || 0.0,
              calculationType: item?.calculationType || '',
              type: 'deduction',
              percentageof:
                (item?.percentageof.length && item?.percentageof?.join('|')) ||
                '',
              percentage:
                item?.percentage === 0 ? 0.0 : Number(item?.percentage) || 0.0,
              adminId: CreateProductCategoryDto?.adminId,
              paySheetId: createdPaySheet?.id,
            }),
          );

          const totalPaysheetItems: any = [...earnings, ...deductions];
          const paysheetItems =
            await this.paySheetItemsService.bulkPasheetItemCreate(
              totalPaysheetItems,
              { transaction },
            );
          if (!paysheetItems.success) {
            await transaction.rollback();
            return new CommonResponseDto(
              null,
              false,
              'Failed to create paysheet items',
            );
          }

          return new CommonResponseDto(
            createdPaySheet,
            true,
            'Pay Sheet Created Successfully',
          );
        },
      );

      return newPaySheet;
    } catch (error) {
      console.log(error)
      throw error
    }
  }



  async sendPayment(id:any,req:any){
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {

        const details = await this.getById(id);
      
        if(details){
          let totalAmount = details?.totalDeduction + details?.totalEarnings

        const itemDetails = await this.paySheetItemsService.findAllByPaysheetId(id);

      for(let i=0; i <itemDetails.length; i++){
        let item = itemDetails[i];

        if(item.type == 'earnings'){
          let debitData ={
              sdate: moment(req.sdate, 'YYYY-MM-DD'),
              reference: req.reference,
              paidmethod: req.paidmethod,
              // baseid:insertDebitData.id,
              ledger: req.paidfrom, 
              credit:0,
              debit: details?.totalEarnings,
              ledgercategory:'1',
              userid: item.adminId,
              // total: totalAmount,
              discount_status:'0',
              adminid: details.adminId,
              employeeid:details.employeeId,
              payrollid:details.id,
              type: item.payHead.acctype,
              userdate: req.userdate,
              booleantype: req.booleantype,
              vat: 0,
              vatamt: 0,
              includevat: 0,
              // totalamt: totalAmount,
          }
          const insertDebitData = await this.ledger_details.create(debitData, transaction);

          let creditData={
                   
            sdate: moment(req.sdate, 'YYYY-MM-DD'),
            reference: req.reference,
            paidmethod: req.paidmethod,
            baseid:insertDebitData.id,
            ledger: item.payHeadId, 
            credit: item.amount,
            debit: 0,
            adminid: details.adminId,
            payrollid: item.paySheetId,
            employeeid:details.employeeId,
            ledgercategory:item.payHead.categorygroup,
            userid: item.adminId,
            total: totalAmount,
            type: item.payHead.acctype,
            userdate: req.userdate,
            booleantype: req.booleantype,
            vat: 0,
            vatamt: 0,
            includevat: 0,
            totalamt: totalAmount,
          }
          const insertCreditData = await this.ledger_details.create(creditData,transaction);
        }
        if(item.type =='deduction'){
          let creditData ={
            sdate: moment(req.sdate, 'YYYY-MM-DD'),
            reference: req.reference,
            paidmethod: req.paidmethod,
            // baseid:insertDebitData.id,
            ledger: req.paidfrom, 
            credit:details?.totalDeduction,
            debit: 0,
            ledgercategory:'1',
            userid: item.adminId,
             total: totalAmount,
            discount_status:'0',
            adminid: details.adminId,
            employeeid:details.employeeId,
            payrollid:details.id,
            type: item.payHead.acctype,
            userdate: req.userdate,
            booleantype: req.booleantype,
            vat: 0,
            vatamt: 0,
            includevat: 0,
           totalamt: totalAmount,
        }
        const insertDebitData = await this.ledger_details.create(creditData, transaction);

        let debitData={
                 
          sdate: moment(req.sdate, 'YYYY-MM-DD'),
          reference: req.reference,
          paidmethod: req.paidmethod,
          baseid:insertDebitData.id,
          ledger: item.payHeadId, 
          credit: 0,
          debit: item.amount,
          adminid: details.adminId,
          payrollid: item.paySheetId,
          employeeid:details.employeeId,
          ledgercategory:item.payHead.categorygroup,
          userid: item.adminId,
          total: totalAmount,
          type: item.payHead.acctype,
          userdate: req.userdate,
          booleantype: req.booleantype,
          vat: 0,
          vatamt: 0,
          includevat: 0,
          totalamt: totalAmount,
        }
        const insertCreditData = await this.ledger_details.create(debitData,transaction);
        }
        
        }
        var ledgerData = await this.account_master.findById(req.paidfrom);
        let totalamountminus = Number(ledgerData.total) - Number(details?.totalEarnings) + Number(details?.totalDeduction);
        let totalData = {
          total: totalamountminus.toFixed(2),
          userdate: req.userdate,
        };
        const result = await this.account_master.update(
          req.paidfrom,
          totalData,
          transaction,
        );
        response = {
          data:details,
          status:true,
          message:'Payment recorded successfully '
        } 
      }else{
        response = {
          data:[],
          status:false,
          message:'Failed to record payment'
        }
      }
    }
      )

    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }

  async update (id:any,updatePaySheetDto: UpdatePaySheetDto,
    ): Promise<CommonResponseDto> {
      try {
        const newPaySheet = await this.databaseService.getSequelize.transaction(
          async (transaction: any) => {
            const paySheet = await this.findOne(id);

            paySheet.adminId =  updatePaySheetDto.adminId || paySheet.adminId;
            paySheet.employeeId = updatePaySheetDto.employeeId || paySheet.employeeId;
            paySheet.totalDeduction = updatePaySheetDto.totalDeduction || paySheet.employeeId;
            paySheet.totalEarnings = updatePaySheetDto.totalEarnings || paySheet.totalEarnings;
            paySheet.netSalary = updatePaySheetDto.netSalary || paySheet.netSalary;  

            let updatedPaySheet = await paySheet.save();
            const itemDetails = await this.paySheetItemsService.deleteByPaySheetId(id);
  
            const earnings = updatePaySheetDto?.earnings?.map(
              (item: any) => ({
                payHeadId: item?.payHead,
                amount: item?.amount === 0 ? 0.0 : Number(item?.amount) || 0.0,
                calculationType: item?.calculationType || '',
                type: 'earnings',
                percentageof:
                  (item?.percentageof?.length && item?.percentageof?.join('|')) ||
                  '',
                percentage:
                  item?.percentage === 0 ? 0.0 : Number(item?.percentage) || 0.0,
                adminId: updatePaySheetDto.adminId,
                paySheetId: id,
              }),
            );
  
            const deductions = updatePaySheetDto?.deduction?.map(
              (item: any) => ({
                payHeadId: item?.payHead,
                amount: item?.amount === 0 ? 0.0 : Number(item?.amount) || 0.0,
                calculationType: item?.calculationType || '',
                type: 'deduction',
                percentageof:
                  (item?.percentageof?.length && item?.percentageof?.join('|')) ||
                  '',
                percentage:
                  item?.percentage === 0 ? 0.0 : Number(item?.percentage) || 0.0,
                adminId: updatePaySheetDto?.adminId,
                paySheetId: id,
              }),
            );
  
            const updatedPaysheetItems: any = [...earnings, ...deductions];
            const paysheetItems =
              await this.paySheetItemsService.bulkPasheetItemCreate(
                updatedPaysheetItems,
                { transaction },
              );
            if (!paysheetItems.success) {
              await transaction.rollback();
              return new CommonResponseDto(
                null,
                false,
                'Failed to create paysheet items',
              );
            }
  
            return new CommonResponseDto(
              updatedPaySheet,
              true,
              'Pay Sheet Updated Successfully',
            );
          },
        );
  
        return newPaySheet;
      } catch (error) {
        console.log(error)
        throw error
      }
    }

}
