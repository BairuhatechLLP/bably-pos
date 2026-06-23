import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  forwardRef,
} from "@nestjs/common";
import { ContactMaster } from "./contactMasterModel";
const jwt = require("jsonwebtoken");

import { ContactMasterDto } from "./dto/contactMaster_dto";
import { genSalt, hash } from "bcrypt";
import { UpdateSupplierDto } from "./dto/contactMaster_update_dto";
import { CreateSupplierDto } from "./dto/contactMastercreate_dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { Contractors } from "../shared/constants/constants";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { AccountMasterService } from "../account_master/account_master_service";
import { Op, Sequelize } from "sequelize";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import {
  StaffChangePasswordDto,
  StaffForgotPasswordDto,
} from "./dto/forgotPasswordDto";
import { ConfigService } from "../shared/config/config.service";
import { MailService } from "../mail/mail_service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CompanyMaster } from "../company_master/company_master_entity";
import axios from "axios";
import { OtherMasterService } from "../other_master/other_master.service";

@Injectable()
export class ContactMasterService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject("contactMasterRepository")
    private readonly cartRepository: typeof ContactMaster,
    @Inject(MailService)
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SalesInvoiceService))
    private readonly sale_invoice: SalesInvoiceService,
    @Inject(forwardRef(() => LedgerDetailsService))
    private readonly ledger_details: LedgerDetailsService,
    @Inject(forwardRef(() => PurchaseInvoiceService))
    private readonly purchase_invoice: PurchaseInvoiceService,
    @Inject(forwardRef(() => AccountMasterService))
    private readonly defualt_ledger: AccountMasterService,
    @Inject(StaffTransactionsService)
    private readonly StaffTransactionsService: StaffTransactionsService,
    @Inject(OtherMasterService)
    private readonly otherMasterService: OtherMasterService
  ) { }
  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async findAll(
    id: any,
    createdBy: number,
    companyid: number,
    type: string,
    pageOptionsDto: PageOptionsDto
  ) {
    try {
      let page = Number(pageOptionsDto?.page) || 1;
      let take = Number(pageOptionsDto?.take) || 10;
      const skip = (page - 1) * take;
      const cart = await this.cartRepository.findAndCountAll<ContactMaster>({
        where: {
          adminid: id,
          createdBy,
          companyid,
          contractors_type: type,
          is_deleted: false,
        },
        limit: take,
        offset: skip,
        order: [["id", pageOptionsDto?.order]],
      });
      const itemCount = cart.count

      return {
        status: true,
        message: "ContactMaster details",
        data: cart.rows.map((cart) => new ContactMasterDto(cart)),
        metadata: new PageMetaDto({ pageOptionsDto, itemCount })
      }

    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findAllStaff(dto: any, pageOptionsDto: PageOptionsDto) {
    try {
      let page = Number(pageOptionsDto?.page) || 1;
      let take = Number(pageOptionsDto?.take) || 10;
      let whereCase = {
        contractors_type: dto.type,
      };
      if (dto.email) {
        whereCase["email"] = {
          [Op.like]: "%" + dto.email + "%",
        };
      }
      if (dto.name) {
        whereCase["name"] = {
          [Op.like]: "%" + dto.name + "%",
        };
      }
      if (dto.country) {
        whereCase["country"] = {
          [Op.like]: "%" + dto.country + "%",
        };
      }
      const skip = (page - 1) * take;
      const cart = await this.cartRepository.findAndCountAll<ContactMaster>({
        where: whereCase,
        limit: take,
        offset: Number(skip),
        order: [["id", pageOptionsDto?.order]],
      });
      const entities = cart.rows.map((ctry) => new ContactMasterDto(ctry));
      const itemCount = cart.count;
      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log("catch error>>>", error.message);
      throw error;
    }
  }

  async findAlll(id: any, companyid: number, type: string, name: string) {
    try {
      let whereCase = {
        adminid: id,
        is_deleted: false,
        companyid,
      };
      let queryCondition = {};

      if (type !== "both") {
        whereCase["contractors_type"] = type;
      } else {
        whereCase["contractors_type"] = ["customer", "supplier"];
      }
      if (name?.length) {
        const searchQuery = name.toLowerCase();
        const items = ["bus_name", "name"].map((item) => {
          return Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col(item)),
            "LIKE",
            `%${searchQuery}%`
          );
        });
        queryCondition = { [Op.or]: items };
      }
      whereCase = { ...whereCase, ...queryCondition };
      const cart = await this.cartRepository.findAll<ContactMaster>({
        where: whereCase,
        order: [["id", "DESC"]],
        limit: 20,
        raw: true,
      });
      return new CommonResponseDto(
        cart.map((cart) => new ContactMasterDto(cart)),
        true,
        "ContactMaster all details"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllCustomersAndSuppliers(
    id: number,
    companyid: number,
    name: string
  ) {
    try {
      let whereCase = {
        adminid: id,
        is_deleted: false,
        companyid,
        contractors_type: {
          [Op.or]: ["customer", "supplier"],
        },
      };

      if (name?.length) {
        whereCase["bus_name"] = { [Op.like]: `${name}%` };
      }
      const cart = await this.cartRepository.findAll<ContactMaster>({
        where: whereCase,
        order: [["id", "DESC"]],
        limit: 20,
        raw: true,
      });
      return new CommonResponseDto(
        cart.map((cart) => new ContactMasterDto(cart)),
        true,
        "customers and suppliers details"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllList(id: any, name: string) {
    try {
      let whereCase = {
        adminid: id,
        is_deleted: false,
      };
      if (name?.length) {
        whereCase["name"] = { [Op.like]: `${name}%` };
      }
      const cart = await this.cartRepository.findAll<ContactMaster>({
        where: whereCase,
        limit: 20,
        raw: true,
      });
      return new CommonResponseDto(
        cart.map((cart) => new ContactMasterDto(cart)),
        true,
        "ContactMaster all details"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllAre(id: any, companyid: any, names: any) {
    try {
      let name = names || "";
      let whereCase = {
        adminid: id,
        is_deleted: false,
        contractors_type: {
          [Op.or]: ["supplier", "customer"],
        },
        companyid,
      };
      if (name.length) {
        whereCase["name"] = { [Op.like]: `${name}%` };
      }
      const cart = await this.cartRepository.findAll<ContactMaster>({
        where: whereCase,
        limit: 20,
        raw: true,
      });
      const ledger: any = await this.defualt_ledger.defaultLedgers();
      const myLedgers: any = await this.defualt_ledger.getMyLedgers(
        id,
        companyid
      );
      const mappedCart = cart.map((cartItem) => new ContactMasterDto(cartItem));
      let datas = [];
      if (ledger.data && mappedCart) {
        datas = [...mappedCart, ...ledger.data, ...myLedgers.data];
      }

      const response = {
        data: datas,
        status: true,
        message: "ContactMaster all details",
      };
      return response;
    } catch (error) {
      console.error("Error in findAllAre:", error);
      throw error;
    }
  }
  async findAllByQuery(query) {
    try {
      const cart = await this.cartRepository.findAll<ContactMaster>(query);
      return cart.map((cart) => new ContactMasterDto(cart));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOneById(id: number) {
    try {
      const cart = await this.cartRepository.findByPk<ContactMaster>(id, {
        raw: true,
      });
      if (!cart) {
        return null;
      }
      return cart;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllPages(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp = await this.cartRepository.findAndCountAll<ContactMaster>({
        where: { is_deleted: false },
        limit: 10,
        offset: skip,
        order: [["id", pageOptionsDto.order]],
      });

      const entities = exp.rows.map((ctry) => new ContactMasterDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getOne(id: number) {
    try {
      const contact = await this.cartRepository.findOne<ContactMaster>({
        where: { id },
        raw: true,
      });
      if (!contact) {
        return new CommonResponseDto(null, false, "no ContactMaster details");
      }
      return new CommonResponseDto(contact, true, "ContactMaster details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkifVatNumberExist(adminid: any, vat_number: any) {
    try {
      const isVatContact = await this.findAllByQuery({
        where: {
          is_deleted: false,
          vat_number: vat_number,
          adminid: adminid,
        },
      });
      let message1 = `This vat number is already exists`;
      let message2 = "New vat number";
      let res = {
        data: isVatContact.length ? isVatContact : [],
        status: isVatContact.length ? true : false,
        message: isVatContact.length ? message1 : message2,
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createDto: CreateSupplierDto) {
    try {

      const existingEmail = await ContactMaster.findOne({
        where: {
          is_deleted: false,
          email: createDto.email,
          adminid: createDto.adminid,
          companyid: createDto.companyid,
        },
      });
  
      if (existingEmail) {
        return new CommonResponseDto(
          null,
          false,
          "This email address already exists"
        );
      }
  
   
      const existingContact = await ContactMaster.findOne({
        where: {
          is_deleted: false,
          vat_number: createDto.vat_number,
          adminid: createDto.adminid,
          companyid: createDto.companyid,
        },
      });
  
      if (existingContact) {
        return new CommonResponseDto(
          null,
          false,
          "This VAT number already exists"
        );
      }
  
  
      if (createDto.loyaltyCardNumber) {
        let apiUrl = `https://master-server.taxgoglobal.com/taxgov2/loyalyCardMaster/isExists/${createDto.loyaltyCardNumber}`;
        const isExists = await axios.get(apiUrl);
        if (isExists) {
          const existingLoyaltyCard = await ContactMaster.findOne({
            where: {
              is_deleted: false,
              loyaltyCardNumber: createDto?.loyaltyCardNumber,
            },
          });
  
          if (existingLoyaltyCard) {
            return new CommonResponseDto(
              null,
              false,
              "Loyalty Card already assigned to another customer"
            );
          }
        } else {
          return new CommonResponseDto(
            null,
            false,
            "Invalid card"
          );
        }
      }
  
    
      const cart = new ContactMaster();
      cart.name = createDto?.name;
      cart.bus_name = createDto?.bus_name;
      cart.email = createDto?.email;
      cart.mobile = createDto?.mobile;
      cart.telephone = createDto?.telephone;
      cart.address = createDto?.address;
      cart.city = createDto?.city;
      cart.postcode = createDto?.postcode;
      cart.acc_default = createDto?.acc_default;
      cart.notes = createDto?.notes;
      cart.reference = createDto?.reference;
      cart.userid = createDto?.userid;
      cart.adminid = createDto?.adminid;
      cart.userdate = createDto?.userdate || new Date();
      cart.active = true;
      cart.vat_number = createDto?.vat_number;
      cart.contractors_type = createDto?.type;
      cart.ledger_category = createDto?.ledger_category;
      cart.opening_balance = createDto?.opening_balance;
      cart.is_deleted = false;
      cart.country = createDto.country;
      cart.state = createDto.state;
      cart.createdBy = createDto.createdBy;
      cart.companyid = createDto.companyid;
      cart.staffId = createDto.staffId;
      cart.password = createDto.password;
      cart.referralPoint = 0;
      cart.referralCount = 0;
      cart.loyaltyCardNumber = createDto?.loyaltyCardNumber;
  
      if (createDto.referredCode) {
        const referredPerson = await ContactMaster.findOne({
          where: {
            is_deleted: false,
            loyaltyCardNumber: createDto.referredCode,
            adminid: createDto.adminid,
            companyid: createDto.companyid,
          },
        });
  
        if (referredPerson) {
          const companyDetails = await CompanyMaster.findOne({
            where: {
              adminid: createDto.adminid,
              id: createDto.companyid,
            },
          });
  
          let referredCount = referredPerson.referralCount + 1;
          let newLoyaltyPoint = Number(referredPerson.loyaltyPoints) + Number(companyDetails.referralPoint);
  
          let referralPoint = Number(referredPerson.referralPoint) + Number(companyDetails.referralPoint);
          const updateCustomer = await this.updateData(referredPerson.id, {
            referralCount: referredCount,
            referralPoint: referralPoint,
            loyaltyPoints: newLoyaltyPoint
          });
        }
      }
  
      cart.loyaltyPoints = 0;
      cart.referredCode = createDto.referredCode;
  
      let saveData = await cart.save();
  
      if (createDto?.type === "customer") {
        let otherDataObj = {
          adminId: createDto.adminid,
          companyId: createDto.companyid,
          total: createDto.opening_balance,
          ledgerId: 47,
          cname: saveData.id,
          createdBy: createDto.createdBy,
          date: new Date(),
          type: "Opening Balance"
        };
  
        const otherData = await this.otherMasterService.create(otherDataObj);
  
        let data1 = {
          credit: "0",
          debit: createDto.opening_balance,
          total: createDto.opening_balance,
          type: "Opening Balance",
          description: "Opening Balance",
          ledger: "47",
          ledgercategory: "3",
          adminid: createDto.adminid,
          cname: saveData.id,
          otherid: otherData.data.id,
          baseid: "",
          amount: createDto.opening_balance,
          usertype: "user",
          userdate: new Date(),
          sdate: new Date(),
          ldate: new Date(),
          userid: createDto.userid,
          companyid: createDto.companyid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result1: any = await this.ledger_details.create(data1);
  
        const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
          attributes: ['id', 'total'],
          where: {
            nominalcode: "999",
            userid: createDto.adminid,
            companyid: createDto.companyid
          },
        });
  
        if (differenceOpeningLedger.length) {
          let accountData = {
            total: Number(differenceOpeningLedger[0]?.total) + Number(createDto.opening_balance)
          };
          const updateVatLedger = await this.defualt_ledger.update(
            differenceOpeningLedger[0]?.id,
            accountData,
          );
        }
      } else if (createDto?.type === "supplier") {
        let otherDataObj = {
          adminId: createDto.adminid,
          companyId: createDto.companyid,
          total: createDto.opening_balance,
          ledgerId: 51,
          cname: saveData.id,
          createdBy: createDto.createdBy,
          date: new Date(),
          type: "Opening Balance"
        };
  
        const otherData = await this.otherMasterService.create(otherDataObj);
        let data = {
          otherid: otherData.data.id,
          debit: "0.00",
          credit: createDto.opening_balance,
          total: createDto.opening_balance,
          type: "Opening Balance",
          description: "Opening Balance",
          ledger: "51",
          ledgercategory: "4",
          adminid: createDto.adminid,
          cname: saveData.id,
          baseid: "",
          amount: createDto.opening_balance,
          usertype: "user",
          userdate: new Date(),
          sdate: new Date(),
          ldate: new Date(),
          userid: createDto.userid,
          companyid: createDto.companyid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result: any = await this.ledger_details.create(data);
  
        const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
          attributes: ['id', 'total'],
          where: {
            nominalcode: "999",
            userid: createDto.adminid,
            companyid: createDto.companyid
          },
        });
  
        if (differenceOpeningLedger.length) {
          let accountData = {
            total: Number(differenceOpeningLedger[0]?.total) - Number(createDto.opening_balance)
          };
          const updateVatLedger = await this.defualt_ledger.update(
            differenceOpeningLedger[0]?.id,
            accountData,
          );
        }
      }
  
      const apiUrl = `https://master-server.taxgoglobal.com/taxgov2/loyalyCardMaster/updateByNumber/${createDto.loyaltyCardNumber}`;
      const updatedCardData = await axios.put(apiUrl, { assignedStatus: true });
  
      return new CommonResponseDto(
        saveData,
        true,
        "ContactMaster details saved successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  

  async createRetail(adminId: number) {
    try {
      const existingContact = await ContactMaster.findOne({
        where: {
          is_deleted: false,
          adminid: adminId,
        },
      });

      if (existingContact) {
        return new CommonResponseDto(
          null,
          false,
          "This VAT number already exists"
        );
      }

      const cart = new ContactMaster();
      cart.name = "RetailCustomer";
      cart.bus_name = "RetailBusiness";
      cart.email = "retailcustomer@gmail.com";
      cart.mobile = "";
      cart.telephone = "";
      cart.address = "";
      cart.city = "";
      cart.postcode = "";
      cart.acc_default = null;
      cart.notes = "";
      cart.reference = "";
      cart.userid = null;
      cart.adminid = adminId;
      cart.userdate = new Date();
      cart.active = true;
      cart.vat_number = "";
      cart.contractors_type = Contractors.RetailCustomer;
      cart.ledger_category = 0;
      cart.opening_balance = null;
      cart.is_deleted = false;
      let saveData = await cart.save();
      return new CommonResponseDto(
        saveData,
        true,
        "ContactMaster details saved successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async update(id: number, updateDto: UpdateSupplierDto) {
    try {
      const cart = await this.cartRepository.findByPk<ContactMaster>(id);
      if (!cart) {
        throw new HttpException("cart not found.", HttpStatus.NOT_FOUND);
      }

      const oldOpeningDifference = cart.opening_balance;

      cart.name = updateDto.name || cart.name;
      cart.bus_name = updateDto.bus_name || cart.bus_name;
      cart.email = updateDto.email || cart.email;
      cart.mobile = updateDto.mobile || cart.mobile;
      cart.telephone = updateDto.telephone || cart.telephone;
      cart.address = updateDto.address || cart.address;
      cart.city = updateDto.city || cart.city;
      cart.postcode = updateDto.postcode || cart.postcode;
      cart.acc_default = updateDto.acc_default || cart.acc_default;
      cart.notes = updateDto.notes || cart.notes;
      cart.reference = updateDto.reference || cart.reference;
      cart.userid = updateDto.userid || cart.userid;
      cart.adminid = updateDto.adminid || cart.adminid;
      cart.userdate = updateDto.userdate || cart.userdate;
      cart.vat_number = updateDto.vat_number || cart.vat_number;
      cart.opening_balance = updateDto.opening_balance || cart.opening_balance;
      cart.ledger_category, (cart.active = updateDto.active);
      cart.staffId = updateDto?.staffId || cart.staffId;
      cart.image = updateDto?.image || cart.image;
      cart.access =
        updateDto?.access === ""
          ? updateDto?.access
          : updateDto?.access || cart.access;
      cart.country = updateDto?.country || cart.country;
      cart.state = updateDto?.state || cart.state;
      cart.createdBy = updateDto?.createdBy || cart.createdBy;
      cart.companyid = updateDto?.companyid || cart.companyid;

      cart.loyaltyCardNumber = updateDto?.loyaltyCardNumber || cart.loyaltyCardNumber;
      cart.loyaltyPoints = updateDto?.loyaltyPoints || cart.loyaltyPoints;
      cart.referralCount = updateDto?.referralCount || cart.referralCount;
      cart.referralPoint = updateDto?.referralPoint || cart.referralPoint;

      const updatedData = await cart.save();

      if (updateDto?.type === "customer") {
        const checkOpeningLedger = await this.ledger_details.findOneByQuery({
          where: {
            type: "Opening Balance",
            ledger: "47",
            adminid: updateDto.adminid,
            cname: id,
          },
        });
        if (checkOpeningLedger) {
          const transactionId = checkOpeningLedger.id;
          let deletedLedgers = this.ledger_details.distroy({
            where: {
              id: transactionId,
            },
          });

          let otherDataObj = {
            adminId: updateDto.adminid,
            companyId: updateDto.companyid,
            total: updateDto.opening_balance,
            ledgerId: 47,
            cname: updatedData.id,
            createdBy: updateDto.createdBy,
            date: new Date(),
            type: "Opening Balance"
          };

          const otherData = await this.otherMasterService.update(Number(checkOpeningLedger.otherid), otherDataObj);

          if (deletedLedgers) {
            let data = {
              otherid: otherData.data.id,
              credit: "0.00",
              debit: updateDto.opening_balance,
              total: updateDto.opening_balance,
              type: "Opening Balance",
              description: "Opening Balance",
              ledger: "47",
              ledgercategory: "3",
              adminid: updateDto.adminid,
              companyid: updateDto.companyid,
              cname: id,
              baseid: "",
              amount: updateDto.opening_balance,
              usertype: "user",
              userdate: new Date(),
              sdate: new Date(),
              ldate: new Date(),
              userid: updateDto.adminid,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const result: any = await this.ledger_details.create(data);

            const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
              attributes: ['id', 'total'],
              where: {
                nominalcode: "999",
                userid: updateDto.adminid,
                companyid: updateDto.companyid
              },
            });

            if (differenceOpeningLedger.length) {
              let accountData = {
                total: Number(differenceOpeningLedger[0]?.total) + Number(updateDto.opening_balance) - Number(oldOpeningDifference)
              }
              const updateVatLedger = await this.defualt_ledger.update(
                differenceOpeningLedger[0]?.id,
                accountData,
              );
            }
          }
        } else {
          let otherDataObj = {
            adminId: updateDto.adminid,
            companyId: updateDto.companyid,
            total: updateDto.opening_balance,
            ledgerId: 47,
            cname: updatedData.id,
            createdBy: updateDto.createdBy,
            date: new Date(),
            type: "Opening Balance"
          };

          const otherData = await this.otherMasterService.create(otherDataObj);
          let data = {
            otherid: otherData.data.id,
            credit: "0.00",
            debit: updateDto.opening_balance,
            total: updateDto.opening_balance,
            type: "Opening Balance",
            description: "Opening Balance",
            ledger: "47",
            ledgercategory: "3",
            adminid: updateDto.adminid,
            companyid: updateDto.companyid,
            cname: id,
            baseid: "",
            amount: updateDto.opening_balance,
            usertype: "user",
            userdate: new Date(),
            sdate: new Date(),
            ldate: new Date(),
            userid: updateDto.adminid,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result: any = await this.ledger_details.create(data);
          const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
            attributes: ['id', 'total'],
            where: {
              nominalcode: "999",
              userid: updateDto.adminid
            },
          });

          if (differenceOpeningLedger.length) {
            let accountData = {
              total: Number(differenceOpeningLedger[0]?.total) + Number(updateDto.opening_balance)
            }
            const updateVatLedger = await this.defualt_ledger.update(
              differenceOpeningLedger[0]?.id,
              accountData,
            );
          }
        }
      } else if (updateDto?.type === "supplier") {
        const checkOpeningLedger = await this.ledger_details.findOneByQuery({
          where: {
            type: "Opening Balance",
            ledger: "51",
            adminid: updateDto.adminid,
            cname: id,
          },
        });
        if (checkOpeningLedger) {
          const transactionId = checkOpeningLedger.id;
          let deletedLedgers = this.ledger_details.distroy({
            where: {
              id: transactionId,
            },
          });

          let otherDataObj = {
            adminId: updateDto.adminid,
            companyId: updateDto.companyid,
            total: updateDto.opening_balance,
            ledgerId: 51,
            cname: updatedData.id,
            createdBy: updateDto.createdBy,
            date: new Date(),
            type: "Opening Balance"
          };

          const otherData = await this.otherMasterService.update(Number(checkOpeningLedger.otherid), otherDataObj);

          if (deletedLedgers) {
            let data = {
              otherid: otherData.data.id,
              debit: "0.00",
              credit: updateDto.opening_balance,
              total: updateDto.opening_balance,
              type: "Opening Balance",
              description: "Opening Balance",
              ledger: "51",
              ledgercategory: "4",
              adminid: updateDto.adminid,
              companyid: updateDto.companyid,
              cname: id,
              baseid: "",
              amount: updateDto.opening_balance,
              usertype: "user",
              userdate: new Date(),
              sdate: new Date(),
              ldate: new Date(),
              userid: updateDto.adminid,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const result: any = await this.ledger_details.create(data);

            const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
              attributes: ['id', 'total'],
              where: {
                nominalcode: "999",
                userid: updateDto.adminid
              },
            });

            if (differenceOpeningLedger.length) {
              let accountData = {
                total: Number(differenceOpeningLedger[0]?.total) - Number(updateDto.opening_balance) + Number(oldOpeningDifference)
              }
              const updateVatLedger = await this.defualt_ledger.update(
                differenceOpeningLedger[0]?.id,
                accountData,
              );
            }
          }
        } else {
          let otherDataObj = {
            adminId: updateDto.adminid,
            companyId: updateDto.companyid,
            total: updateDto.opening_balance,
            ledgerId: 51,
            cname: updatedData.id,
            createdBy: updateDto.createdBy,
            date: new Date(),
            type: "Opening Balance"
          };

          const otherData = await this.otherMasterService.create(otherDataObj);
          let data = {
            otherid: otherData.data.id,
            debit: "0.00",
            credit: updateDto.opening_balance,
            total: updateDto.opening_balance,
            type: "Opening Balance",
            description: "Opening Balance",
            ledger: "51",
            ledgercategory: "4",
            adminid: updateDto.adminid,
            companyid: updateDto.companyid,
            cname: id,
            baseid: "",
            amount: updateDto.opening_balance,
            usertype: "user",
            userdate: new Date(),
            sdate: new Date(),
            ldate: new Date(),
            userid: updateDto.adminid,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result: any = await this.ledger_details.create(data);

          const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
            attributes: ['id', 'total'],
            where: {
              nominalcode: "999",
              userid: updateDto.adminid
            },
          });

          if (differenceOpeningLedger.length) {
            let accountData = {
              total: Number(differenceOpeningLedger[0]?.total) - Number(updateDto.opening_balance) + Number(oldOpeningDifference)
            }
            const updateVatLedger = await this.defualt_ledger.update(
              differenceOpeningLedger[0]?.id,
              accountData,
            );
          }
        }
      }

      return new CommonResponseDto(
        new ContactMasterDto(updatedData),
        true,
        "ContactMaster details updated"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateData(id: number, updateDto: any) {
    try {
      const cart = await this.cartRepository.findByPk<ContactMaster>(id);
      if (!cart) {
        throw new HttpException("customer not found.", HttpStatus.NOT_FOUND);
      }

      cart.name = updateDto.name || cart.name;
      cart.bus_name = updateDto.bus_name || cart.bus_name;
      cart.email = updateDto.email || cart.email;
      cart.mobile = updateDto.mobile || cart.mobile;
      cart.telephone = updateDto.telephone || cart.telephone;
      cart.address = updateDto.address || cart.address;
      cart.city = updateDto.city || cart.city;
      cart.postcode = updateDto.postcode || cart.postcode;
      cart.acc_default = updateDto.acc_default || cart.acc_default;
      cart.notes = updateDto.notes || cart.notes;
      cart.reference = updateDto.reference || cart.reference;
      cart.userid = updateDto.userid || cart.userid;
      cart.adminid = updateDto.adminid || cart.adminid;
      cart.userdate = updateDto.userdate || cart.userdate;
      cart.vat_number = updateDto.vat_number || cart.vat_number;
      cart.opening_balance = updateDto.opening_balance || cart.opening_balance;
      cart.ledger_category, (cart.active = updateDto.active);
      cart.staffId = updateDto?.staffId || cart.staffId;
      cart.image = updateDto?.image || cart.image;
      cart.access =
        updateDto?.access === ""
          ? updateDto?.access
          : updateDto?.access || cart.access;
      cart.country = updateDto?.country || cart.country;
      cart.state = updateDto?.state || cart.state;
      cart.createdBy = updateDto?.createdBy || cart.createdBy;
      cart.companyid = updateDto?.companyid || cart.companyid;

      cart.loyaltyCardNumber = updateDto?.loyaltyCardNumber || cart.loyaltyCardNumber;
      cart.loyaltyPoints = updateDto?.loyaltyPoints || cart.loyaltyPoints;
      cart.referralCount = updateDto?.referralCount || cart.referralCount;
      cart.referralPoint = updateDto?.referralPoint || cart.referralPoint;

      const updatedData = await cart.save();

      return new CommonResponseDto(
        new ContactMasterDto(updatedData),
        true,
        "ContactMaster details updated"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async statementListByContact(
    adminid: any,
    contactid: any,
    sdate: any,
    ldate: any
  ) {
    let response: CommonResponseDto;
    try {
      let startDate = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      let endDate = new Date(new Date(ldate).setHours(23, 59, 59, 59));

      const saleList = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          type: "sales",
          customerid: contactid,
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
          type: "scredit",
          customerid: contactid,
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
          vtype: "Sales",
          debit: "0.00",
          credit: item.total,
          invoiceno: item.invoiceno,
          id: item.id,
          reference: item.reference,
        };
      });
      const debitNote = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          type: "pcredit",
          supplierid: contactid,
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
          vtype: "Purchase",
          debit: item.total,
          credit: "0.00",
          invoiceno: item.invoiceno,
          id: item.id,
        };
      });
      const purchace = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          type: "purchase",
          supplierid: contactid,
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
          vtype: "Purchase",
          debit: "0.00",
          credit: item.total,
          invoiceno: item.invoiceno,
          id: item.id,
        };
      });

      // purchase asset
      const purchaceAsset = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          type: "stockassets",
          supplierid: contactid,
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
          is_deleted: false,
          cname: contactid,
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
            "19",
          ],
        },
        order: [["id", "DESC"]],
      });

      let otherDetails = [];

      for (let item of others) {
        if (item?.type == "Journal") {
          let journalDetails: any = await this.ledger_details.findAllByQuery({
            where: { baseid: Number(item.id) },
          });
          let ledgerDetails = await Promise.all(
            journalDetails.map(async (item) => {
              if (item.ledger == 47 || item.ledger == 51) {
                return await this.getOneById(Number(item.cname));
              } else {
                return await this.defualt_ledger.findById(item.ledger);
              }
            })
          );

          otherDetails.push({
            ...item,
            ledgerAccount: ledgerDetails.map(
              (detail) => detail.bus_name || detail.laccount
            ),
          });
        } else if (
          item?.type === "Customer Receipt" ||
          item?.type === "Customer Reciept" ||
          item?.type === "Other Receipt" ||
          item.type === "Supplier Refund"
        ) {
          let details = await this.defualt_ledger.findById(item?.ledger);
          otherDetails.push({
            date: item.sdate,
            credit: item.debit,
            debit: "0.00",
            type: item.type,
            id: item.id,
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

      let ledgerList: any = [
        ...salesData,
        ...credNoteData,
        ...purchaceData,
        ...purchaceAssetData,
        ...debNoteData,
        ...otherDetails,
      ];

      // to find opening balance

      //sales

      const totalSales = await this.sale_invoice.sum("total", {
        where: {
          adminid,
          type: "sales",
          customerid: contactid,
          sdate: {
            [Op.lt]: startDate,
          },
        },
      });

      // scredit note

      const totalcreditNotes = await this.sale_invoice.sum("total", {
        where: {
          adminid,
          type: "scredit",
          customerid: contactid,
          sdate: {
            [Op.lt]: startDate,
          },
        },
      });

      // purchase

      const totalPurchase = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "purchase",
          supplierid: contactid,
          sdate: {
            [Op.lt]: startDate,
          },
        },
      });

      // debit note

      const totalDebitnote = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "pcredit",
          supplierid: contactid,
          sdate: {
            [Op.lt]: startDate,
          },
        },
      });

      // purchase asset

      const totalPurchaseAsset = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "stockassets",
          supplierid: contactid,
          sdate: {
            [Op.lt]: startDate,
          },
        },
      });

      // total journal debit
      const totaJournalDebit = await this.ledger_details.sum("debit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lt]: startDate,
          },
          booleantype: ["19"],
        },
      });

      // total journal credit
      const totaJournalCredit = await this.ledger_details.sum("credit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lt]: startDate,
          },
          booleantype: ["19"],
        },
      });

      // others
      const totalOtherCredit = await this.ledger_details.sum("debit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lt]: startDate,
          },
          type: [
            "Customer Receipt",
            "Customer Reciept",
            "Other Receipt",
            "Supplier Refund",
          ],
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
            // '19',
          ],
        },
      });

      // other credit

      const totalOtherDebit = await this.ledger_details.sum("credit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lt]: startDate,
          },
          type: ["Customer Refund", "Supplier Payment", "Other Payment"],
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
            // '19',
          ],
        },
      });

      let customerData = await this.getOneById(contactid);
      let opening = customerData.opening_balance;

      let openingBalance =
        Number(opening) +
        totalPurchase +
        totalPurchaseAsset +
        totalcreditNotes +
        totaJournalCredit +
        totalOtherCredit -
        totalSales -
        totaJournalDebit -
        totalDebitnote -
        totalOtherDebit;

      response = {
        message: "Sale List By Cusotmer",
        data: {
          ledgerList,
          openingBalance,
        },
        status: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async getClosingOfContact(adminid: number, contactid: number, ldate: string) {
    let response;

    try {
      const endDate = moment(ldate).endOf("day").toISOString();
      //sales

      const totalSales = await this.sale_invoice.sum("total", {
        where: {
          adminid,
          type: "sales",
          customerid: contactid,
          sdate: {
            [Op.lte]: endDate,
          },
        },
      });

      // scredit note

      const totalcreditNotes = await this.sale_invoice.sum("total", {
        where: {
          adminid,
          type: "scredit",
          customerid: contactid,
          sdate: {
            [Op.lte]: endDate,
          },
        },
      });

      // purchase

      const totalPurchase = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "purchase",
          supplierid: contactid,
          sdate: {
            [Op.lte]: endDate,
          },
        },
      });

      // debit note

      const totalDebitnote = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "pcredit",
          supplierid: contactid,
          sdate: {
            [Op.lte]: endDate,
          },
        },
      });

      // purchase asset

      const totalPurchaseAsset = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "stockassets",
          supplierid: contactid,
          sdate: {
            [Op.lte]: endDate,
          },
        },
      });

      // total journal debit
      const totaJournalDebit = await this.ledger_details.sum("debit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lte]: endDate,
          },
          booleantype: ["19"],
        },
      });

      // total journal credit
      const totaJournalCredit = await this.ledger_details.sum("credit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lte]: endDate,
          },
          booleantype: ["19"],
        },
      });

      // others
      const totalOtherCredit = await this.ledger_details.sum("debit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lte]: endDate,
          },
          type: [
            "Customer Receipt",
            "Customer Reciept",
            "Other Receipt",
            "Supplier Refund",
          ],
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
            // '19',
          ],
        },
      });

      // other credit

      const totalOtherDebit = await this.ledger_details.sum("credit", {
        where: {
          adminid: adminid,
          is_deleted: false,
          cname: contactid,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          sdate: {
            [Op.lte]: endDate,
          },
          type: ["Customer Refund", "Supplier Payment", "Other Payment"],
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
            // '19',
          ],
        },
      });

      let customerData = await this.getOneById(contactid);
      let opening = customerData.opening_balance;

      let closingBalance =
        Number(opening) +
        totalPurchase +
        totalPurchaseAsset +
        totalcreditNotes +
        totaJournalCredit +
        totalOtherCredit -
        totalSales -
        totaJournalDebit -
        totalDebitnote -
        totalOtherDebit;

      response = {
        data: closingBalance,
        status: true,
        message: "Closing balance for a contact",
      };
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const contact = await this.cartRepository.findByPk<ContactMaster>(id);
      if (contact) {
        await contact.destroy();
        return new CommonResponseDto(contact, true, "Deleted successfully");
      }
      return new CommonResponseDto(null, false, "Failed to delete contact");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllContactsDateRange(
    adminid: any,
    type: any,
    companyid: number
  ): Promise<any> {
    const today = new Date();
    const startDay = moment(new Date(today.setDate(1))).format("YYYY-MM-DD");

    const endDate = moment(new Date()).endOf("day").toISOString();
    const startDate = moment(startDay).startOf("day").toISOString();

    try {
      const allRecords = await this.cartRepository.findAll({
        where: {
          is_deleted: false,
          adminid: adminid,
          contractors_type: type,
          companyid,
        },
      });

      const recordsForPeriod = await this.cartRepository.findAll({
        where: {
          is_deleted: false,
          adminid: adminid,
          contractors_type: type,
          companyid,
          createdat: {
            [Op.lte]: endDate,
            [Op.gte]: startDate,
          },
        },
      });

      let totalCustomers = Number(allRecords?.length);
      let customersInRange = Number(recordsForPeriod?.length);
      let percentage = (customersInRange * 100) / totalCustomers;

      let response = {
        totalCustomers,
        customersInRange,
        percentage,
      };

      return new CommonResponseDto(response, true, "all customer data by type");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllData(id: number, adminid: number) {
    try {
      const contact = await this.cartRepository.findOne<ContactMaster>({
        where: { id, adminid },
        raw: true,
      });
      if (contact) {
        return new CommonResponseDto(
          contact,
          true,
          "ContactMaster details found"
        );
      } else {
        const ledgerlist = await this.defualt_ledger.findOne(id);
        if (ledgerlist) {
          return new CommonResponseDto(
            ledgerlist,
            true,
            "ContactMaster details found"
          );
        } else {
          return new CommonResponseDto(null, false, "no ContactMaster details");
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async Delete(id: number) {
    try {
      const contact = await this.cartRepository.findByPk<ContactMaster>(id);
      contact.is_deleted = true;
      const data = await contact.save();

      const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
        attributes: ['id', 'total'],
        where: {
          nominalcode: "999",
          userid: contact.adminid
        },
      });

      if (differenceOpeningLedger.length) {
        let total = 0
        if (contact.contractors_type === 'customer') {
          total = Number(differenceOpeningLedger[0]?.total) - Number(contact.opening_balance)
        } else if (contact.contractors_type === 'supplier') {
          total = Number(differenceOpeningLedger[0]?.total) + Number(contact.opening_balance)
        }
        let accountData = {
          total: Number(total)
        }
        const updateVatLedger = await this.defualt_ledger.update(
          differenceOpeningLedger[0]?.id,
          accountData,
        );
      }

      let res = {
        data: data,
        status: true,
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getStaffByEmail(email: string) {
    try {
      let staff = await this.cartRepository.findOne<ContactMaster>({
        where: { email: email, contractors_type: Contractors.Staff },
      });
      return staff;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getStaffByStaffId(staffId: number) {
    try {
      let staff = await this.cartRepository.findOne<ContactMaster>({
        where: { staffId },
        raw: true,
      });
      return staff;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createStaff(createDto: any) {
    try {
      if (
        !createDto.password ||
        createDto.password === null ||
        createDto.password === undefined
      ) {
        return new CommonResponseDto(
          null,
          false,
          "Please provide password for user/staff"
        );
      } else if (
        !createDto.adminid ||
        createDto.adminid === null ||
        createDto.adminid === undefined
      ) {
        return new CommonResponseDto(
          null,
          false,
          "Admin ID is required for creating a user/staff"
        );
      } else if (
        !createDto.email ||
        createDto.email === null ||
        createDto.email === undefined
      ) {
        return new CommonResponseDto(
          null,
          false,
          "Email address is required for creating a user/staff"
        );
      } else if (
        !createDto.staffId ||
        createDto.staffId === null ||
        createDto.staffId === undefined
      ) {
        return new CommonResponseDto(
          null,
          false,
          "Staff ID(company) is required for creating a user/staff"
        );
      }
      // else if(!createDto.name || createDto.name === null || createDto.name === undefined){
      //   return new CommonResponseDto(null,false,"Staff name is required")
      // }

      const existingStaff = await ContactMaster.findOne({
        where: {
          // is_deleted: false,
          email: createDto.email,
        },
      });

      const existingStaffByID = await ContactMaster.findOne({
        where: {
          staffId: createDto.staffId,
        },
      });
      if (existingStaff) {
        return new CommonResponseDto(
          null,
          false,
          "Staff already exists with this email"
        );
      }
      if (existingStaffByID) {
        return new CommonResponseDto(
          null,
          false,
          "Staff already exists with this staff ID"
        );
      }

      const cart = new ContactMaster();
      cart.name = createDto?.name;
      cart.bus_name = createDto?.bus_name;
      cart.email = createDto?.email.trim();
      cart.mobile = createDto?.mobile;
      cart.telephone = createDto?.telephone;
      cart.address = createDto?.address;
      cart.city = createDto?.city;
      cart.postcode = createDto?.postcode;
      cart.acc_default = createDto?.acc_default;
      cart.notes = createDto?.notes;
      cart.reference = createDto?.reference;
      cart.userid = createDto?.userid;
      cart.adminid = createDto?.adminid;
      cart.userdate = createDto?.userdate || new Date();
      cart.active = true;
      cart.vat_number = createDto?.vat_number;
      cart.contractors_type = Contractors.Staff;
      cart.ledger_category = createDto?.ledger_category;
      cart.opening_balance = createDto?.opening_balance;
      cart.is_deleted = false;
      cart.staffId = createDto?.staffId;
      cart.image = createDto?.image;
      cart.access = createDto?.access;
      cart.staffAccess = createDto?.staffAccess;
      cart.createdBy = createDto?.createdBy;
      cart.companyid = createDto?.companyid;

      const salt = await genSalt(10);
      cart.password = await hash(createDto.password, salt);
      let data = await cart.save();

      return new CommonResponseDto(data, true, "Staff created successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createDefaultStaff(createDto: any) {
    try {
      const uuid = uuidv4();
      const sixDigitCode = uuid.substr(0, 6);

      const cart = new ContactMaster();
      cart.name = createDto?.name;
      cart.bus_name = createDto?.bus_name;
      cart.email = createDto?.email.trim();
      cart.mobile = createDto?.mobile;
      cart.telephone = createDto?.telephone;
      cart.address = createDto?.address;
      cart.city = createDto?.city;
      cart.postcode = createDto?.postcode;
      cart.acc_default = createDto?.acc_default;
      cart.notes = createDto?.notes;
      cart.reference = createDto?.reference;
      cart.userid = createDto?.userid;
      cart.adminid = createDto?.adminid;
      cart.userdate = createDto?.userdate || new Date();
      cart.active = true;
      cart.vat_number = createDto?.vat_number;
      cart.contractors_type = Contractors.Staff;
      cart.ledger_category = createDto?.ledger_category;
      cart.opening_balance = createDto?.opening_balance;
      cart.is_deleted = false;
      cart.staffId = sixDigitCode.toUpperCase();
      cart.image = createDto?.image;
      cart.access = "3|2";
      cart.createdBy = createDto?.createdBy;
      cart.companyid = createDto?.companyid;
      cart.staffAccess = ["order","billed"];
      const salt = await genSalt(10);
      cart.password = await hash(createDto.password, salt);
      let data = await cart.save();

      return new CommonResponseDto(data, true, "Staff created successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateStaff(id: number, updateDto: UpdateSupplierDto) {
    try {
      const staff = await this.cartRepository.findByPk<ContactMaster>(id);
      if (!staff) {
        throw new HttpException("staff not found.", HttpStatus.NOT_FOUND);
      }

      staff.name = updateDto.name || staff.name;
      staff.bus_name = updateDto.bus_name || staff.bus_name;
      staff.email = updateDto.email || staff.email;
      staff.mobile = updateDto.mobile || staff.mobile;
      staff.telephone = updateDto.telephone || staff.telephone;
      staff.address = updateDto.address || staff.address;
      staff.city = updateDto.city || staff.city;
      staff.postcode = updateDto.postcode || staff.postcode;
      staff.acc_default = updateDto.acc_default || staff.acc_default;
      staff.notes = updateDto.notes || staff.notes;
      staff.reference = updateDto.reference || staff.reference;
      staff.userid = updateDto.userid || staff.userid;
      staff.adminid = updateDto.adminid || staff.adminid;
      staff.userdate = updateDto.userdate || staff.userdate;
      staff.vat_number = updateDto.vat_number || staff.vat_number;
      staff.opening_balance =
        updateDto.opening_balance || staff.opening_balance;
      staff.ledger_category, (staff.active = updateDto.active);
      staff.staffId = updateDto?.staffId || staff.staffId;
      staff.image = updateDto?.image || staff.image;
      staff.access = updateDto?.access || staff.access;

      const updatedData = await staff.save();

      return new CommonResponseDto(
        new ContactMasterDto(updatedData),
        true,
        "Staff details updated"
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getStaffStatement(
    adminid: number,
    staffid: number,
    sdate: any,
    ldate: any
  ) {
    try {
      let startDate = new Date(sdate);
      const startOfDay = moment(startDate).startOf("day").toISOString();
      let endDate = new Date(ldate);
      const endOfDay = moment(endDate).endOf("day").toISOString();

      const saleList = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          type: "sales",
          createdBy: staffid,
          sdate: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
        },
        order: [["id", "DESC"]],
      });

      let salesData = saleList.map((item) => {
        return {
          date: item.userdate,
          type: "Sales Invoice",
          particular: "Sales",
          debit: item.total,
          credit: "0.00",
          invoiceno: item.invoiceno,
          id: item.id,
          reference: item.reference,
        };
      });

      const purchace = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          type: "purchase",
          createdBy: staffid,
          sdate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        order: [["id", "DESC"]],
      });

      const purchaceData = purchace.map((item: any) => {
        return {
          date: item.userdate,
          type: "Purchase Invoice",
          particular: "Purchase",
          debit: "0.00",
          credit: item.total,
          invoiceno: item.invoiceno,
          id: item.id,
        };
      });

      let transactions = await this.StaffTransactionsService.findAllByQuery({
        where: {
          adminid,
          staffid,
          createdat: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
        },
        order: [["id", "DESC"]],
      });

      let transactionData = transactions.map((item: any) => {
        return {
          date: item.createdat,
          type: item.type,
          vtype: "Purchase",
          debit:
            item?.type === "Supplier Payment" || item?.type === "Other Payment"
              ? item.paid_amount
              : "0.00",
          credit:
            item?.type === "Customer Receipt" || item?.type === "Other Receipt"
              ? item.paid_amount
              : "0.00",
          invoiceno: item.invoiceno,
          id: item.id,
          particular: "Cash",
        };
      });

      let ledgerList: any = [...salesData, ...purchaceData, ...transactionData];

      return new CommonResponseDto(ledgerList, true, "Statement details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async forgotPassword(body: StaffForgotPasswordDto) {
    try {
      const staff: any = await ContactMaster.findOne({
        where: { email: body?.email.trim() },
      });
      if (staff) {
        const token = jwt.sign(
          {
            data: {
              userId: staff?.id,
              mail: staff.email
            }
          },
          this.configService.jwtConfig.privateKey,
          {
            expiresIn: "5m",
          }
        );
        let mail = { email: staff.email, token, staff };
        let mailService = this.mailService.sentStaffForgotPassword(mail);
        if (mailService) {
          let response = {
            status: true,
            message: "Password reset successfully",
            data: null,
          };
          return response;
        }
      } else {
        return new CommonResponseDto(null, false, "something went wrong");
      }
    } catch (error) {
      console.log("error", error);
      return new CommonResponseDto(null, false, "something went wrong");
    }
  }
  async changePassword(data: StaffChangePasswordDto) {
    try {
      const verified = jwt.verify(
        data?.token,
        this.configService.jwtConfig.privateKey
      );
      if (verified) {
        const userDetails: any = await ContactMaster.findOne({
          where: { id: verified.data?.userId },
        });
        if (!userDetails) {
          return new CommonResponseDto({}, false, "No Staff found");
        } else {
          const salt = await genSalt(10);
          let Password = await hash(data?.password, salt);
          userDetails.password = Password;
          await userDetails.save();
          return new CommonResponseDto(
            userDetails,
            true,
            "Password Updated successfully"
          );
        }
      }
    } catch (error) {
      return new CommonResponseDto(error, false, "Failed to Reset Password");
    }
  }

  async forgotOtp(Dto: any) {
    try {
      const { email } = Dto;
      const staff = await ContactMaster.findOne({
        where: { email }
      });
      if (!staff) {
        return {
          status: false,
          message: `No user found with email: ${email}.`,
          data: {},
        };
      }
      const otp = await this.generateOTP();
      const token = uuidv4();
      const data = { otp, email };
      await this.cacheManager.set(token, data, 120000);
      await this.mailService.sentStaffForgotPasswordOtp({ email, otp });
      return {
        status: true,
        message: `Verification OTP sent to ${email}.`,
        data: { token, email },
      };
    } catch (error) {
      console.error('Error in forgotOtp:', error);
      throw error;
    }
  }


  async forgotVerifyOtp(Dto: any) {
    try {
      let value = await this.otpValidate(Dto);
      if (value.validate) {
        await this.cacheManager.del(Dto.token);
        return value;
      }
      return value;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async otpValidate(data: any) {
    try {
      let responce: any = {
        token: '',
        validate: false,
        message: "Incorrect OTP",
      };
      const value: any = await this.cacheManager.get(data.token);
      if (value == undefined) {
        responce.message = "Your OTP is Experd.";
      } else if (data.otp == value.otp) {
        const staff: any = await ContactMaster.findOne({
          where: { email: value?.email },
        });
        const token = jwt.sign(
          { data: { userId: staff?.id } },
          this.configService.jwtConfig.privateKey,
          {
            expiresIn: "5m",
          }
        );
        responce = {
          token: token,
          validate: true,
          message: "verified",
        };
      }
      return responce;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
