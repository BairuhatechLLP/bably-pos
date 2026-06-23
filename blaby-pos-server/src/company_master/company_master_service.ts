import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { Op } from "sequelize";
import { AccountMaster } from "../account_master/account_master";
import { AccountMasterService } from "../account_master/account_master_service";
import { Countries } from "../countries/countries_model";
import { LocationService } from "../locations/location.services";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { User } from "../users/user.entity";
import { UserService } from "../users/user.services";
import { CompanyMaster } from "./company_master_entity";
import { CompanyMasterDto } from "./dto/company_master_dto";
import { CreateDto } from "./dto/create_company_master_dto";
import { UpdateDto } from "./dto/update_company_master_dto";

@Injectable()
export class CompanyMasterService {
  @Inject(forwardRef(() => AccountMasterService))
  private readonly ledger: AccountMasterService;
  @Inject(forwardRef(() => UserService))
  private readonly user_service: UserService;
  @Inject(UserSettingsService)
  private readonly user_settings: UserSettingsService;
  @Inject(LocationService)
  private readonly locationService: LocationService;

  constructor(
    @Inject("CompanyMasterRepository")
    private readonly companysRepository: typeof CompanyMaster
  ) {}

  async findAll() {
    try {
      const companys = await this.companysRepository.findAll<CompanyMaster>({
        include: [User],
      });
      return companys.map((company) => new CompanyMasterDto(company));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByAdminId(adminid: number) {
    try {
      const company = await this.companysRepository.findAll({
        where: { adminid },
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
          {
            model: AccountMaster,
            as: "bankInfo",
          },
        ],
      });

      let bankids = company.map((item: any) => item.defaultBank);
      let banks = await this.ledger.findAllByQuery({
        where: {
          id: { [Op.in]: bankids },
        },
      });

      if (!company || company.length === 0) {
        throw new HttpException("No companies found", HttpStatus.NOT_FOUND);
      }

      return new CommonResponseDto(company, true, "All company details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByAdminId(adminid: number) {
    try {
      const company = await this.companysRepository.findOne({
        where: { adminid },
      });
      if (!company) {
        throw new HttpException("No company found", HttpStatus.NOT_FOUND);
      }
      return new CompanyMasterDto(company);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByAdminIdStripeKey(adminid: number) {
    try {
      const company = await this.companysRepository.findOne({
        attributes: ["stripeKey"],
        where: { adminid },
        raw: true,
      });
      if (!company) {
        throw new HttpException("No company found", HttpStatus.NOT_FOUND);
      }
      return new CompanyMasterDto(company);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const company = await this.companysRepository.findByPk<CompanyMaster>(
        id,
        {
          include: [
            {
              model: Countries,
              as: "countryInfo",
            },
          ],
        }
      );
      if (!company) {
        throw new HttpException("No company found", HttpStatus.NOT_FOUND);
      }
      return new CompanyMasterDto(company);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createDto: CreateDto) {
    try {
      const company = new CompanyMaster();
      company.type = createDto.type;
      company.expiretime = createDto.expiretime;
      company.bname = createDto.bname;
      company.btype = createDto.btype;
      company.registerno = createDto.registerno;
      company.rtype = createDto.rtype;
      company.rdate = createDto.rdate;
      company.expiredate = createDto.expiredate;
      company.plan = createDto.plan;
      company.company = createDto.company;
      company.address1 = createDto.address1;
      company.address2 = createDto.address2;
      company.city = createDto.city;
      company.cemail = createDto.cemail;
      company.cphoneno = createDto.cphoneno;
      company.cperson = createDto.cperson;
      company.taxregno = createDto.taxregno;
      company.tax = createDto.tax;
      company.taxno = createDto.taxno;
      company.logo = createDto.logo;
      company.adminid = createDto.adminid;
      company.bimage = createDto.bimage;
      company.bcategory = createDto.bcategory;
      company.accounttype = createDto.accounttype;
      company.defaultmail = createDto.defaultmail;
      company.defaultinvoice = createDto.defaultinvoice || "1";
      company.accplan = createDto.accplan;
      company.cusNotes = createDto.cusNotes;
      company.fulladdress = createDto.fulladdress;
      company.website = createDto.website;
      company.reporttype = createDto.reporttype;
      company.defaultBank = createDto.defaultBank;

      company.endYear = createDto.endYear;
      company.country = createDto.country;
      company.state = createDto.state;
      company.endYear = createDto.endYear;
      company.isEInvoice = createDto.isEInvoice;
      company.isEwayBill = createDto.isEwayBill;

      company.defaultTerms = createDto.defaultTerms;
      company.stripeKey = createDto.stripeKey;
      company.payStackKey = createDto.payStackKey;
      company.defaultMerchant = createDto.defaultMerchant;
      company.stripe_offline_link = createDto.stripe_offline_link;
      company.isUniformShifts = createDto.isUniformShifts;
      company.workingTimeFrom = createDto.workingTimeFrom;
      company.workingTimeTo = createDto.workingTimeTo;
      company.isLoyaltyEnabled = createDto.isLoyaltyEnabled || false;

      company.loyaltyDiscountPercentage = createDto.loyaltyDiscountPercentage;
      company.referralPoint = createDto.referralPoint;
      company.loyaltyRedeemLimit = createDto.loyaltyRedeemLimit;

      const newCompany = await company.save();
      return newCompany;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createNewCompany(createDto: any) {
    try {
      const checkExists = await this.companysRepository.findAll({
        where: {
          adminid: createDto.adminid,
          bname: createDto.bname,
        },
      });

      if (checkExists.length) {
        return new CommonResponseDto(
          null,
          false,
          "Company name already exists"
        );
      }

      const company = new CompanyMaster();
      company.type = createDto.type;
      company.expiretime = createDto.expiretime;
      company.bname = createDto.bname;
      company.btype = createDto.btype;
      company.registerno = createDto.registerno;
      company.rtype = createDto.rtype;
      company.rdate = createDto.rdate;
      company.expiredate = createDto.expiredate;
      company.plan = createDto.plan;
      company.company = createDto.company;
      company.address1 = createDto.address1;
      company.address2 = createDto.address2;
      company.fulladdress = createDto.fulladdress;
      company.city = createDto.city;
      company.cemail = createDto.cemail;
      company.cphoneno = createDto.cphoneno;
      company.cperson = createDto.cperson;
      company.taxregno = createDto.taxregno;
      company.tax = createDto.tax;
      company.taxno = createDto.taxno;
      company.logo = createDto.logo;
      company.adminid = createDto.adminid;
      company.bimage = createDto.bimage;
      company.bcategory = createDto.bcategory;
      company.accounttype = createDto.accounttype;
      company.defaultmail = createDto.defaultmail;
      company.defaultinvoice = createDto.defaultinvoice || "1";
      company.accplan = createDto.accplan;
      company.cusNotes = createDto.cusNotes;
      company.fulladdress = createDto.fulladdress;
      company.website = createDto.website;
      company.reporttype = createDto.reporttype;
      company.financial_year_start = createDto.financial_year_start;
      company.books_begining_from = createDto.books_begining_from;
      company.defaultBank = createDto.defaultBank;
      company.payStackKey = createDto.payStackKey||"";
      company.endYear = createDto.endYear;
      company.country = createDto.country;
      company.state = createDto.state;
      company.defaultTerms = createDto.defaultTerms;
      company.stripeKey = createDto.stripeKey;
      company.defaultMerchant = createDto.defaultMerchant;
      company.isOtherTerritory = createDto.isOtherTerritory;
      company.isEInvoice = createDto.isEInvoice;
      company.isEwayBill = createDto.isEwayBill;
      company.stripe_offline_link = createDto.stripe_offline_link;
      company.payStackKey = createDto?.payStackKey||"";
      company.isUniformShifts = createDto.isUniformShifts;
      company.workingTimeFrom = createDto.workingTimeFrom;
      company.workingTimeTo = createDto.workingTimeTo;
      company.isLoyaltyEnabled = createDto.isLoyaltyEnabled || false;

      company.loyaltyDiscountPercentage =
        createDto.loyaltyDiscountPercentage || 0.001;
      company.referralPoint = createDto.referralPoint;
      company.loyaltyRedeemLimit = createDto.loyaltyRedeemLimit || 1000;

      const newCompany = await company.save();

      const locationObj = {
        location: "Main",
        locationCode: "Main",
        userid: newCompany.adminid,
        companyid: newCompany.id,
      };

      const newLocation = await this.locationService.create(locationObj);

      let values = [
        {
          id: 1,
          desc: "Sale Invoice",
          type: "sales",
          prefix: "SI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 2,
          desc: "Purchase Invoice",
          type: "purchase",
          prefix: "PI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 3,
          desc: "Credit Note",
          type: "scredit",
          prefix: "SCN",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 4,
          desc: "Debit Note",
          type: "pcredit",
          prefix: "PDN",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 5,
          desc: "Proforma Invoice",
          type: "proforma",
          prefix: "PRI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 6,
          desc: "reccuring sales",
          type: "reccuring",
          prefix: "PI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 7,
          desc: "Purchase Order",
          type: "order",
          prefix: "PO",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 8,
          desc: "Stock Transfer",
          type: "stockTransfer",
          prefix: "ST",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 9,
          desc: "Purchase Asset",
          type: "purchaseAsset",
          prefix: "PA",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 10,
          desc: "Journal",
          type: "journal",
          prefix: "JRNL",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 11,
          desc: "Cash Receipt",
          type: "cashReceipt",
          prefix: "C-RCPT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 12,
          desc: "Cash Payment",
          type: "cashPayment",
          prefix: "C-PYMT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 13,
          desc: "Contra",
          type: "contra",
          prefix: "CT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 14,
          desc: "Bank Receipt",
          type: "bankReceipt",
          prefix: "B-RCPT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 15,
          desc: "Bank Payment",
          type: "bankPayment",
          prefix: "B-PYMT",
          startNumber: 1,
          currentInvNumber: 0,
        },
      ];

      const obj = {
        id: createDto.adminid,
        adminid: createDto.adminid,
        companyid: newCompany.id,
      };

      const companySettings = await this.user_settings.create(
        newCompany.adminid,
        newCompany.id,
        newLocation.data.id,
        values
      );
      const bank: any = await this.user_service.createBank(obj);
      const profitLossLedger = await this.user_service.createProfitnLossLedger(
        obj
      );

      if (bank?.status) {
        let res = await this.update(newCompany.id, {
          defaultBank: bank?.data?.data?.dataValues?.id,
        });
      }
      return new CommonResponseDto(
        { ...newCompany.dataValues, newLocation: newLocation.data },
        true,
        "Company registered successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCompanyMaster(id: number) {
    try {
      const company = await this.companysRepository.findByPk<CompanyMaster>(
        id,
        {
          include: [
            {
              model: Countries,
              as: "countryInfo",
            },
          ],
        }
      );
      if (!company) {
        throw new HttpException("No company found", HttpStatus.NOT_FOUND);
      }
      return company;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateDto) {
    try {
      const company: any = await this.getCompanyMaster(id);

      company.status = updateDto.status || company.status;
      company.type = updateDto.type || company.type;
      company.expiretime = updateDto.expiretime || company.expiretime;
      company.bname = updateDto.bname || company.bname;
      company.btype = updateDto.btype || company.btype;
      company.registerno = updateDto.registerno || company.registerno;
      company.rtype = updateDto.rtype || company.rtype;
      company.rdate = updateDto.rdate || company.rdate;
      company.expiredate = updateDto.expiredate || company.expiredate;
      company.plan = updateDto.plan || company.plan;
      company.company = updateDto.company || company.company;
      company.address1 = updateDto.address1 || company.address1;
      company.address2 = updateDto.address2 || company.address2;
      company.city = updateDto.city || company.city;
      company.cemail = updateDto.cemail || company.cemail;
      company.cphoneno = updateDto.cphoneno || company.cphoneno;
      company.cperson = updateDto.cperson || company.cperson;
      company.taxregno = updateDto.taxregno || company.taxregno;
      company.tax = updateDto.tax || company.tax;
      company.taxno = updateDto.taxno || company.taxno;
      company.logo = updateDto.logo || company.logo;
      company.adminid = updateDto.adminid || company.adminid;
      company.bimage = updateDto.bimage || company.bimage;
      company.bcategory = updateDto.bcategory || company.bcategory;
      company.accounttype = updateDto.accounttype || company.accounttype;
      company.defaultmail = updateDto.defaultmail || company.defaultmail;
      company.defaultinvoice =
        updateDto.defaultinvoice || company.defaultinvoice;
      company.accplan = updateDto.accplan || company.accplan;
      company.cusNotes = updateDto.cusNotes || company.cusNotes;
      company.fulladdress = updateDto.fulladdress || company.fulladdress;
      company.website = updateDto.website || company.website;
      company.reporttype = updateDto.reporttype || company.reporttype;
      company.endYear = updateDto.endYear || company.endYear;
      company.financial_year_start =
        updateDto.financial_year_start || company.financial_year_start;
      company.books_begining_from =
        updateDto.books_begining_from || company.books_begining_from;
      company.defaultTerms = updateDto.defaultTerms || company.defaultTerms;
      company.stripeKey = updateDto.stripeKey;
      company.payStackKey = updateDto.payStackKey;
      company.defaultMerchant =
        updateDto.defaultMerchant || company.defaultMerchant;
      company.defaultBank = updateDto.defaultBank || company.defaultBank;
      company.country = updateDto.country || company.country;
      company.state = updateDto.state || company.state;
      company.isOtherTerritory =
        updateDto.isOtherTerritory || company.isOtherTerritory;
      company.isEInvoice = updateDto.isEInvoice || company.isEInvoice;
      company.isEwayBill = updateDto.isEwayBill || company.isEwayBill;
      company.stripe_offline_link =
        updateDto.stripe_offline_link || company.stripe_offline_link;

      company.isUniformShifts =
        updateDto.isUniformShifts || company.isUniformShifts;
      company.workingTimeFrom =
        updateDto.workingTimeFrom || company.workingTimeFrom;
      company.workingTimeTo = updateDto.workingTimeTo || company.workingTimeTo;
      company.isLoyaltyEnabled =  updateDto.isLoyaltyEnabled  === false? false :updateDto?.isLoyaltyEnabled === true? true : company.isLoyaltyEnabled,
      // company.isLoyaltyEnabled ===false;


      company.loyaltyDiscountPercentage =
        updateDto.loyaltyDiscountPercentage ||
        company.loyaltyDiscountPercentage;
      company.referralPoint = updateDto.referralPoint || company.referralPoint;
      company.loyaltyRedeemLimit =
        updateDto.loyaltyRedeemLimit || company.loyaltyRedeemLimit;

      let updatedDetails = await company.save();
      console.log("hyyyyyyyy===========",updatedDetails)
      updatedDetails = await company.reload({
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      return updatedDetails;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const company = await this.getCompanyMaster(id);
      const deletedCompany = await company.destroy();
      return new CommonResponseDto(
        deletedCompany,
        true,
        "Company deleted successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
