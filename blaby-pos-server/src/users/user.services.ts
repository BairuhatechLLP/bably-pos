import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Module,
} from "@nestjs/common";
import { S3 } from "aws-sdk";
import { compare, genSalt, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Op } from "sequelize";
import config from "../../config";
import { AccountMasterService } from "../account_master/account_master_service";
import { CompanyMasterService } from "../company_master/company_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { Countries } from "../countries/countries_model";
import { DatabaseService } from "../database/database.service";
import { MailService } from "../mail/mail_service";
import { ConfigService } from "../shared/config/config.service";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserUpdateProfileResponseDto } from "./dto/update-profileData.dto";
import { UserLoginRequestDto } from "./dto/user-login-request.dto";
import { UserLoginResponseDto } from "./dto/user-login-response.dto";
import { UserDto } from "./dto/user.dto";
import { UserFullDTO } from "./dto/userdtofull";
import { User, User as users } from "./user.entity";
import { v4 as uuidv4 } from "uuid";
import { BillingCounterService } from "../billing_counter/billing_counter_service";
import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import axios from "axios";
import { LocationMaster } from "../locations/location.entity";
import { CompanyMaster } from "../company_master/company_master_entity";
import moment from "moment";

@Module({
  imports: [],
})
@Injectable()
export class UserService {
  @Inject(CompanyMasterService)
  private readonly companyMasterService: CompanyMasterService;
  @Inject(ContactMasterService)
  private readonly contact_service: ContactMasterService;

  @Inject(AccountMasterService)
  private readonly ledger: AccountMasterService;

  @Inject(MailService)
  private readonly mailService: MailService;

  @Inject(BillingCounterService)
  private readonly BillingCounterService: BillingCounterService;

  @Inject(SubscriptionsService)
  private readonly SubscriptionsService: SubscriptionsService;

  private readonly jwtPrivateKey: string;

  constructor(
    @Inject("UsersRepository")
    private readonly usersRepository: typeof users,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService
  ) {
    this.jwtPrivateKey = this.configService.jwtConfig.privateKey;
  }

  async findAll(pageOptionsDto: PageOptionsDto, dto: any) {
    try {
      let whereCase = {
        isTaxgo: dto.isTaxgo,
      };
      if (dto.email) {
        whereCase["email"] = {
          [Op.like]: "%" + dto.email + "%",
        };
      }
      if (dto.name) {
        whereCase[Op.or] = [
          {
            firstname: {
              [Op.like]: "%" + dto.name + "%",
            },
          },
          {
            lastname: {
              [Op.like]: "%" + dto.name + "%",
            },
          },
        ];
      }
      const skip =
        Number(pageOptionsDto.page - 1) * Number(pageOptionsDto.take);
      const exp = await this.usersRepository.findAndCountAll<users>({
        where: whereCase,
        limit: Number(pageOptionsDto.take),
        offset: skip,
        order: [["id", pageOptionsDto.order]],
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });

      const entities = exp.rows.map((ctry) => new UserDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.usersRepository.findByPk<users>(id, {
        raw: true,
      });
      if (!user) {
        throw new HttpException(
          "User with given id not found",
          HttpStatus.NOT_FOUND
        );
      }
      return new CommonResponseDto(user, true, "User Details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.usersRepository.findOne<users>({
        where: { email: email },
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findUserByPhoneNumber(data: any) {
    try {
      const user = await this.usersRepository.findAll({
        where: {
          phonenumber: data?.phonenumber,
        },
        raw: true,
      });
      if (user.length) {
        return new CommonResponseDto(user, true, "User fetched successfully");
      } else {
        return new CommonResponseDto(null, false, "Failed to fetch User");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createUser(createUserDto: any) {
    try {
      let subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 14);

      const user = new users();
      user.email = createUserDto.email.trim().toLowerCase();
      user.fullName = createUserDto.fullName;
      user.phonenumber = createUserDto.phonenumber || null;
      user.countryid = createUserDto.countryid;
      user.mobileverified = createUserDto.mobileverified;
      user.city = createUserDto.city;
      user.address = createUserDto.address;
      user.image = createUserDto.image;
      user.affiliationCode = createUserDto.affiliationCode;
      user.isTaxgo = createUserDto.isTaxgo || false;
      user.isAffiliateCodeUsed = false;

      const salt = await genSalt(10);
      let verifyCode = "";
      user.password = await hash(createUserDto.password, salt);
      let userData: any = await user.save();

      let retailXpress = false;
      let soleTrader = false;
      let counter = 1;
      if (createUserDto.isRetail) {
        soleTrader = true;
        counter = 1;
      }
      const subscriptionObj = {
        company: 1,
        period: 2,
        counter: counter,
        retailXpressWithTaxgo: retailXpress,
        userId: userData.dataValues.id,
        soleTrader: soleTrader,
        subscriptionExpiry: subscriptionExpiry,
        price: 0,
      };
      const subscriptionData = await this.SubscriptionsService.freePlan(
        subscriptionObj
      );

      // verifyCode = await hash("TaxGo" + userData.dataValues.id, salt);
      // userData.dataValues.verifycode = verifyCode;
      let verifyData = Buffer.from(
        `email=${userData.dataValues.email}&verifycode=TaxGo${userData.dataValues.id}`,
        "utf8"
      ).toString("base64");
      if (createUserDto.isRetail) {
        await this.mailService.sendRetailWelcomeMail(userData, verifyData);
      } else {
        await this.mailService.sendWelcomeMail(userData, verifyData);
      }
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.signToken(userData, subscription);
      const userDetails: any = await this.getUserByEmail(userData.email);
      userDetails.token = token;
      let userUpdate = await this.updateData(userData.dataValues.id, {
        verifycode: verifyCode,
        adminid: userData.dataValues.id,
      });

      let res = {
        status: true,
        data: { ...userUpdate, token },
        token,
        message: "User registered successfully",
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateData(id: number, updateUserDto: any) {
    try {
      const user = await this.usersRepository.findByPk<users>(id, {
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }

      user.fullName = updateUserDto.fullName || user.fullName;
      user.email = updateUserDto.email || user.email;
      user.password = updateUserDto.password || user.password;
      user.phonenumber = updateUserDto.phonenumber || user.phonenumber;
      user.dob = updateUserDto.dob || user.dob;
      user.countryid = updateUserDto.countryid || user.countryid;
      user.verifycode = updateUserDto.verifycode || user.verifycode;
      user.image = updateUserDto.image || user.image;
      user.address = updateUserDto.address || user.address;
      user.city = updateUserDto.city || user.city;
      await user.save();
      const userDetails = await user.reload({
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      const plainUser = userDetails.get({ plain: true });
      return plainUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createUserwithGmail(createUserDto: any) {
    let response: CommonResponseDto;
    try {
      const userData = await users.create({
        fullName: createUserDto?.name,
        email: createUserDto?.email,
        image: createUserDto?.picture,
        emailverified: createUserDto?.email_verified,
      });

      let verifyCode = "";

      // Default company
      const companyObj: any = {
        bname: "Default Company",
        bcategory: "Default Category",
        status: "",
        type: "",
        expiretime: "",
        btype: "",
        registerno: "",
        rtype: "",
        rdate: null,
        expiredate: null,
        plan: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        cemail: "",
        cphoneno: "",
        cperson: "",
        taxregno: "",
        tax: "",
        taxno: "",
        logo: "",
        adminid: userData.id,
        userid: userData.id,
        bimage: "",
        accounttype: "",
        defaultmail: "",
        defaultinvoice: "1",
        country: 101,
        accplan: "",
        cusNotes: "",
        fulladdress: "",
        website: "",
        reporttype: 0,
        endYear: "",
        financial_year_start: new Date(),
        books_begining_from: new Date(),
        defaultTerms: "",
        defaultMerchant: "",
        defaultBank: 0,
        stripeKey: "",
        stripe_offline_link: "",
        isUniformShifts: 1,
        workingTimeFrom: "9:00 AM",
        workingTimeTo: "9:00 PM",
      };

      const company: any = await this.companyMasterService.create(companyObj);

      // Default staff
      const uuid = uuidv4();
      const sixDigitCode = uuid.substr(0, 6);
      const staffData = {
        name: createUserDto.firstname,
        password: createUserDto.password,
        email: createUserDto.email,
        adminid: userData.dataValues.id,
        createdBy: userData.dataValues.id,
        companyid: company?.id,
        staffId: sixDigitCode.toUpperCase(),
        bus_name: "",
        mobile: "",
        telephone: "",
        address: "",
        city: "",
        postcode: "",
        acc_default: "",
        notes: "",
        reference: "",
        userdate: new Date(),
        active: true,
        contractors_type: "",
        is_deleted: false,
        image: "",
        access: "",
      };
      const defaultStaff = await this.contact_service.createDefaultStaff(
        staffData
      );

      // Default counter
      let counterData = {
        adminid: userData.dataValues.id,
        companyid: company?.id,
        name: "Counter 1",
        balance: 0,
        sdate: new Date(),
        shiftlist: [
          {
            fromtime: "8:00 AM",
            totime: "8:00 PM",
            name: "Day Shift",
          },
        ],
      };

      const defaultCounter = await this.BillingCounterService.create(
        counterData
      );

      const subscription = await Subscriptions.findOne({
        where: { userId: userData?.id },
      });
      const token = await this.signToken(userData, subscription);
      if (userData) {
        const ledgerCreation = await this.createBank(userData);
        const profitnLossLedgerCreation = await this.createProfitnLossLedger(
          userData
        );

        verifyCode = await hash(
          "TaxGo" + userData.dataValues.id,
          10
          //salt
        );
        userData.dataValues.verifycode = verifyCode;

        let verifyData = Buffer.from(
          `email=${userData.dataValues.email}&verifycode=TaxGo${userData.dataValues.id}`,
          "utf8"
        ).toString("base64");

        await this.mailService.sendWelcomeMail(userData, verifyData);
        const user: any = await this.getUserByEmail(userData.email);
        user.token = token;
        let userUpdate = await this.updateUser(userData.dataValues.id, {
          verifycode: verifyCode,
          adminid: userData.dataValues.id,
        });

        const companyInfo = await this.companyMasterService.findOne(company.id);

        response = {
          data: {
            user: {
              ...userUpdate.data,
              adminid: userUpdate.data.id,
              companyid: companyInfo?.id,
              companyInfo,
            },
            token,
            bankInfo: {},
            isNew: true,
          },
          status: true,
          message: "User Registered Sucessfully",
        };
      } else {
        response = {
          data: {
            userData,
            token,
            company,
            defaultStaff: defaultStaff.data,
            defaultCounter: defaultCounter.data,
          },
          status: false,
          message: "User Registered Sucessfully with errors",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async updateUser(id: number, updateUserDto: any) {
    try {
      const user = await this.usersRepository.findByPk<users>(id, {
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }

      user.fullName = updateUserDto.fullName || user.fullName;
      user.email = updateUserDto.email || user.email;
      user.password = updateUserDto.password || user.password;
      user.phonenumber = updateUserDto.phonenumber || user.phonenumber;
      user.dob = updateUserDto.dob || user.dob;
      user.countryid = updateUserDto.countryid || user.countryid;
      user.verifycode = updateUserDto.verifycode || user.verifycode;
      user.image = updateUserDto.image || user.image;
      user.address = updateUserDto.address || user.address;
      user.city = updateUserDto.city || user.city;
      await user.save();
      const userDetails = await user.reload({
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      const plainUser = userDetails.get({ plain: true });

      return {
        data: plainUser,
        status: true,
        message: "User profile info Updated",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async checkEmailExist(data: any) {
    try {
      const user = await this.usersRepository.findAll({
        where: {
          email: data?.email,
        },
      });
      if (user.length) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.log(err);
      return true;
    }
  }
  async updateUserDataAlone(id: number, updateUserDto: any) {
    try {
      let response: CommonResponseDto;
      const user = await this.usersRepository.findByPk<User>(id);
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }

      user.fullName = updateUserDto.fullName || user.fullName;
      user.email = updateUserDto.email || user.email;
      user.password = updateUserDto.password || user.password;
      user.phonenumber = updateUserDto.phonenumber || user.phonenumber;
      user.dob = updateUserDto.dob || user.dob;
      user.countryid = updateUserDto.countryid || user.countryid;
      user.verifycode = updateUserDto.verifycode || user.verifycode;
      user.isAffiliateCodeUsed =
        updateUserDto.isAffiliateCodeUsed || user.isAffiliateCodeUsed;
      user.image = updateUserDto.image || user.image;
      user.address = updateUserDto.address || user.address;
      user.city = updateUserDto.city || user.city;
      const userInfo: any = await user.save();
      return {
        data: userInfo,
        status: true,
        message: "User profile info Updated",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkPhoneExist(data: any) {
    try {
      const user = await this.usersRepository.findAll({
        where: {
          phonenumber: data?.phonenumber,
        },
      });
      if (user.length) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.log(err);
      return true;
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.usersRepository.findByPk<User>(id);
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async create(createUserDto: CreateUserDto) {
    try {
      const user = new users();
      user.email = createUserDto.email.trim().toLowerCase();
      user.fullName = createUserDto.fullName;
      user.phonenumber = createUserDto.phonenumber;
      user.dob = createUserDto.dob;
      user.countryid = createUserDto.countryid;
      user.mobileverified = createUserDto.mobileverified;
      user.image = createUserDto.image;
      user.address = createUserDto.address;
      user.city = createUserDto.city;

      const salt = await genSalt(10);
      user.password = await hash(createUserDto.password, salt);
      const userData = await user.save();

      // when registering then log user in automatically by returning a token
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.signToken(userData, subscription);
      await this.contact_service.createRetail(userData.id);
      return new UserLoginResponseDto(userData, token);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByAdminId(id: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new HttpException("No user found", HttpStatus.NOT_FOUND);
      }
      return new UserFullDTO(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async login(userLoginRequestDto: UserLoginRequestDto) {
    try {
      const email = userLoginRequestDto.email;
      const password = userLoginRequestDto.password;

      const user = await this.getUserByEmail(email);
      if (!user) {
        return new CommonResponseDto(null, false, "Invalid email or password.");
      }

      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        return new CommonResponseDto(null, false, "Invalid email or password.");
      }

      if (!user.emailverified || user.emailverified === 0) {
        return new CommonResponseDto(null, false, "Email not verified.");
      }
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.signToken(user, subscription);
      return new CommonResponseDto(
        new UserLoginResponseDto(user, token),
        true,
        "Success"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, companyid: any, updateUserDto: any) {
    try {
      let response: CommonResponseDto;
      const user = await this.usersRepository.findByPk<users>(id);
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }

      user.fullName = updateUserDto.fullName || user.fullName;
      user.email = updateUserDto.email || user.email;
      user.password = updateUserDto.password || user.password;
      user.phonenumber = updateUserDto.phonenumber || user.phonenumber;
      user.dob = updateUserDto.dob || user.dob;
      user.countryid = updateUserDto.countryid || user.countryid;
      user.verifycode = updateUserDto.verifycode || user.verifycode;
      user.image = updateUserDto.image || user.image;
      user.address = updateUserDto.address || user.address;
      user.city = updateUserDto.city || user.city;
      const userInfo: any = await user.save();
      const users = await this.getUserByEmail(userInfo?.email);
      const companyInfos = await this.updateProfileInfo(
        companyid,
        updateUserDto
      );
      // when registering then log user in automatically by returning a token
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.signToken(userInfo, subscription);
      const companyInfo = {
        ...companyInfos.companyInfoData?.dataValues,
        bankInfo: companyInfos.bankInfo,
      };
      return {
        data: new UserUpdateProfileResponseDto(users, companyInfo, token),
        status: true,
        message: "User profile info Updated",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateProfileInfo(companyid: any, updateUserDto: any) {

    try {
      const company: any = await this.companyMasterService.findOne(companyid);

      if (company) {
        let companyInfo: any = {
          type: updateUserDto.type || company.type,
          expiretime: updateUserDto.expiretime || company.expiretime,
          bname: updateUserDto.bname || company.bname,
          btype: updateUserDto.btype || company.btype,
          registerno: updateUserDto.registerno || company.registerno,
          rtype: updateUserDto.rtype || company.rtype,
          rdate: updateUserDto.rdate || company.rdate,
          reporttype: updateUserDto.reporttype || company.reporttype,
          expiredate: updateUserDto.expiredate || company.expiredate,
          plan: updateUserDto.plan || company.plan,
          company: updateUserDto.company || company.company,
          address1: updateUserDto.address1 || company.address1,
          address2: updateUserDto.address2 || company.address2,
          city: updateUserDto.city || company.city,
          cemail: updateUserDto.cemail || company.cemail,
          cphoneno: updateUserDto.cphoneno || company.cphoneno,
          cperson: updateUserDto.cperson || company.cperson,
          taxregno: updateUserDto.taxregno || company.taxregno,
          tax: updateUserDto.tax || company.tax,
          taxno: updateUserDto.taxno || company.taxno,
          logo: updateUserDto.logo || company.logo,
          adminid: updateUserDto.adminid || company.adminid,
          bimage: updateUserDto.bimage || company.bimage,
          bcategory: updateUserDto.bcategory || company.bcategory,
          accounttype: updateUserDto.accounttype || company.accounttype,
          defaultmail: updateUserDto.defaultmail || company.defaultmail,
          defaultinvoice:
            updateUserDto.defaultinvoice || company.defaultinvoice,
          accplan: updateUserDto.accplan || company.accplan,
          cusNotes: updateUserDto.cusNotes || company.cusNotes,
          fulladdress: updateUserDto.fulladdress || company.fulladdress,
          website: updateUserDto.website || company.website,

          endYear: updateUserDto.endYear || company.endYear,
          books_begining_from:
            updateUserDto.books_begining_from || company.books_begining_from,
          financial_year_start:
            updateUserDto.financial_year_start || company.financial_year_start,
          defaultTerms: updateUserDto.defaultTerms || company.defaultTerms,
          defaultMerchant:
            updateUserDto.defaultMerchant || company.defaultMerchant,
          defaultBank: updateUserDto.defaultBank || company.defaultBank,
          stripeKey: updateUserDto.stripeKey || company.stripeKey,
          payStackKey: updateUserDto.payStackKey || company.payStackKey,
          country: updateUserDto.country || company.country,
          state: updateUserDto.state || company.state,
          isLoyaltyEnabled:updateUserDto?.isLoyaltyEnabled === false? false :updateUserDto?.isLoyaltyEnabled === true? true : company.isLoyaltyEnabled,
          stripe_offline_link:
            updateUserDto.stripe_offline_link || company.stripe_offline_link,
          workingTimeFrom:
            updateUserDto?.workingTimeFrom || company?.workingTimeFrom,
          workingTimeTo: updateUserDto?.workingTimeTo || company?.workingTimeTo,
        };
  
        let companyInfoData = await this.companyMasterService.update(
          companyid,
          companyInfo
        
        );

        let bankInfo = {};
        if (companyInfoData?.defaultBank) {
          bankInfo = await this.ledger.findQuery(companyInfoData?.defaultBank, {
            attributes: [
              "id",
              "nominalcode",
              "accountname",
              "laccount",
              "accnum",
              "cardnum",
              "paidmethod",
              "ibannum",
              "bicnum",
              "total",
              "branch",
              "ifsc",
            ],
          });
        }
        return { companyInfoData, bankInfo };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateInvoice(id: number, companyid: number, invoiceId: string) {
    try {
      let response: CommonResponseDto;
      const user = await this.usersRepository.findByPk<users>(id, {
        // raw: true,
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });

      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }
      const plainUser = user.get({ plain: true });
      const companyInfoData: any = await this.updateDefaultInvoiceInfo(
        companyid,
        invoiceId
      );
      const defaultBank = companyInfoData?.companyInfo?.dataValues?.defaultBank;
      let bankInfo;
      if (defaultBank) {
        bankInfo = await this.ledger.findQuery(defaultBank, {
          attributes: [
            "id",
            "nominalcode",
            "accountname",
            "laccount",
            "accnum",
            "cardnum",
            "paidmethod",
            "ibannum",
            "bicnum",
            "total",
            "branch",
            "ifsc",
          ],
        });
      }

      return {
        data: {
          ...plainUser,
          companyInfo: {
            ...companyInfoData?.companyInfo?.dataValues,
            bankInfo,
          },
        },
        bankInfo: companyInfoData?.companyInfo?.bankInfo,
        status: true,
        message: "Default Invoice Updated",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateDefaultInvoiceInfo(companyid: any, invoiceId: any) {
    try {
      const company = await this.companyMasterService.findOne(companyid);
      if (company) {
        let companyInfo: any = {
          defaultinvoice: invoiceId,
        };
        let companyInfoData = await this.companyMasterService.update(
          companyid,
          companyInfo
        );
        let bankInfo = {};
        const projection = {
          attributeName1: 1, // include this attribute
          attributeName2: 1, // include this attribute
          // ... add more attributes you want to include
          _id: 0, // exclude the _id field, you can include or exclude based on your requirement
        };
        if (companyInfoData?.defaultBank) {
          bankInfo = await this.ledger.findQuery(company?.defaultBank, {
            attributes: [
              "id",
              "accountname",
              "nominalcode",
              "laccount",
              "accnum",
              "cardnum",
              "paidmethod",
              "ibannum",
              "bicnum",
              "total",
              "branch",
              "ifsc",
            ],
          });
        }
        return { companyInfo: companyInfoData, bankInfo };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyEmailAddress(verifyData: any) {
    try {
      if (verifyData) {
        const plain = Buffer.from(verifyData, "base64").toString("utf8");
        if (plain) {
          const param = plain?.split("&");
          let mail = "";
          let verifycode = "";
          if (param.length > 0) {
            mail = param[0]?.split("=")[1];
          }
          let user = await this.getUserByEmail(mail);
          if (!user) {
            new CommonResponseDto(false, false, "User not found.");
            throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
          }

          user.emailverified = 1;
          let isMatch = true;
          await user.save();

          return new CommonResponseDto(isMatch, isMatch, "");
        } else {
        }
      } else {
        return new CommonResponseDto(false, false, null);
      }
    } catch (error) {
      console.log("cdadds", error);
      throw error;
    }
  }

  async updateEmail(dataDto: any) {
    try {
      if (dataDto.verifyData) {
        const plain = Buffer.from(dataDto.verifyData, "base64").toString(
          "utf8"
        );
        if (plain) {
          const param = plain.split("&");
          let mail;
          let verifycode = "";
          let id;
          if (param.length > 0) {
            mail = param[0].split("=")[1];
            verifycode = param[1].split("=")[1];
            id = param[2].split("=")[1];
          }

          let user = await User.findByPk(id);

          if (verifycode && user && id) {
            user.emailverified = 1;
            user.email = mail;
            await user.save();
            return new CommonResponseDto(
              user,
              true,
              "Email updated successfully"
            );
          }
        }
      }
      return new CommonResponseDto(
        null,
        false,
        "Failed to verify and update your email"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const user = await this.usersRepository.findByPk<users>(id);
      await user.destroy();
      return new UserDto(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async signToken(user: any, subscription: Subscriptions | null = null) {
    const payload: any = {
      email: user?.email,
      subscriptionExpiry: subscription
        ? subscription?.subscriptionExpiry
        : null,
      soleTrader:subscription?subscription?.soleTrader:null,
      userId: user?.id,
    };

    return sign(payload, this.jwtPrivateKey, {
      expiresIn: config.SESSION_EXPIRY,
    });
  }

  async createProfitnLossLedger(user: any) {
    try {
      var data: any = {
        userid: user.id,
        adminid: user.adminid,
        acctype: "",
        laccount: "Profit and Loss Account",
        nominalcode: "3100",
        paidmethod: "",
        opening: "0",
        total: "0.0",
        type: "0",
        userdate: new Date(),
        categorygroup: 4,
        category: 7,
        visbank: "1",
        vissinvoice: "0",
        vispinvoice: "0",
        visotherreceipt: "1",
        visotherpayment: "1",
        visjournal: "1",
        visreport: "1",
        showVatRate: "1",
        companyid: user?.companyid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const new_ledger = await this.ledger.create(data);
      if (new_ledger) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async createBank(user) {
    try {
      var data_credit: any = {
        userid: user.id,
        adminid: user.adminid,
        acctype: "current",
        laccount: "Current",
        nominalcode: "1100",
        paidmethod: "creditcard",
        opening: "0",
        type: "1",
        userdate: new Date(),
        categorygroup: 1,
        category: 1,
        visbank: "1",
        vissinvoice: "0",
        vispinvoice: "0",
        visotherreceipt: "0",
        visotherpayment: "0",
        visjournal: "1",
        visreport: "1",
        companyid: user?.companyid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      var data_debit: any = {
        userid: user.id,
        adminid: user.adminid,
        acctype: "cash",
        laccount: "Cash",
        nominalcode: "1200",
        paidmethod: "cash",
        opening: "0",
        type: "1",
        userdate: new Date(),
        categorygroup: 1,
        category: 1,
        visbank: "1",
        vissinvoice: "0",
        vispinvoice: "0",
        visotherreceipt: "0",
        visotherpayment: "0",
        visjournal: "1",
        visreport: "1",
        companyid: user?.companyid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const ledger_credit = await this.ledger.create(data_credit);
      const ledger_debit = await this.ledger.create(data_debit);
      if (ledger_credit && ledger_debit) {
        return { status: true, data: ledger_credit };
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateProfilePicture(id: any, imageUrl: any) {
    let response: CommonResponseDto;
    try {
      let company: any = await this.companyMasterService.getCompanyMaster(id);
      if (company) {
        company.bimage = imageUrl.bimage || company.bimage;
        let updatedData = await company.save();
        if (updatedData) {
          response = {
            status: true,
            message: "Image Updated successfully",
            data: updatedData,
          };
        } else {
          response = {
            status: false,
            message: "Failed to Update Profile Image",
            data: null,
          };
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async resetPassword(email: any) {
    let response: CommonResponseDto;
    try {
      const user: any = await this.getUserByEmail(email);
      if (user) {
        const token = Math.floor(100000 + Math.random() * 900000);
        user.code = token;
        user.updatedAt = new Date().getTime();
        const updateData = await user.save();
        if (updateData) {
          let mailOptions = {
            to: [email],
            bcc: [],
            subject: "Reset Password - Tax GO Accounting",
          };
          let sendMail = this.mailService.sendPasswordResetMail(
            mailOptions,
            updateData
          );

          if (!sendMail) {
            response = {
              status: false,
              message: "Failed to reset. Please try again",
              data: null,
            };
          } else {
            const historyInfo = {
              userid: user.id,
              details: "Requested code to reset password",
              message: "Password Reset Code",
              action: "NA",
              notification: "Forgot Password",
              notify: true,
            };

            response = {
              status: true,
              message: "Reset Code Sent to Registered Email",
              data: null,
            };
          }
        } else {
          response = {
            status: false,
            message: "Failed to reset. Please try again",
            data: null,
          };
        }
      } else {
        response = {
          status: false,
          message: "Account Not Found. Create Account with Tax GO",
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async forgotPassword(req: any) {
    let response: CommonResponseDto;
    try {
      const user = await this.getUserByEmail(req.email);
      if (user) {
        const token = sign({ id: user.id }, this.jwtPrivateKey, {
          expiresIn: config.SESSION_EXPIRY,
        });
        const salt = await genSalt(10);

        const new_pass_ = await hash(req.password_new, salt);
        user.password = new_pass_;
        const updateData = await user.save();
        if (updateData) {
          let mailOptions = {
            to: [req.email],
            bcc: [],
            subject: "Password Updated - Tax GO Accounting",
          };

          let sendMail = this.mailService.sendPasswordResetCompleteMail(
            mailOptions,
            updateData
          );

          if (sendMail) {
            response = {
              status: true,
              message: "Password updated successfully",
              data: "Success",
            };
          } else {
            const historyInfo = {
              userid: user.id,
              details: "Password reset completed",
              message: "Password Updated",
              action: "NA",
              notification: "Password Updated",
              notify: true,
            };
            // const history = await WriteHistory(historyInfo);

            response = {
              status: true,
              message: "Password updated successfully",
              data: null,
            };
          }
        } else {
          response = {
            status: false,
            message: "Error resetting password",
            data: [],
          };
        }
      } else {
        response = {
          status: false,
          message: "Reset Code or Email Does not exist",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async updatePassword(req: any) {
    let response: CommonResponseDto;

    try {
      const user = await users.findByPk(req.userid);
      const isMatch = await compare(req.password, user.password);
      if (!isMatch) {
        response = {
          status: false,
          message: "Existing password did not match",
          data: [],
        };
      } else {
        const token = sign({ id: user.id }, this.jwtPrivateKey, {
          expiresIn: config.SESSION_EXPIRY,
        });
        const salt = await genSalt(10);
        const new_pass_ = await hash(req.password_new, salt);
        user.password = new_pass_;
        const updateData = user.save();
        if (updateData) {
          response = {
            status: true,
            message: "Password changed..!",
            data: updateData,
          };
        } else {
          response = {
            status: false,
            message: "Failed to update password",
            data: [],
          };
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async updateLogoPicture(userid, companyid, file) {
    let response: CommonResponseDto;
    try {
      const user = await this.usersRepository.findByPk<users>(userid, {
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      const plainUser = user.get({ plain: true });

      if (user) {
        const bucket_name = this.configService.awsConfig.bucket + "/logo";
        const time = new Date().getTime();
        const filename = "TaxGO_LOGO_" + userid + "_logo_" + time + ".png";
        var params = { Bucket: bucket_name, Key: filename, Body: file.buffer };
        let _s3 = new S3(this.configService.awsConfig);
        const uploadData = await _s3.upload(params).promise();
        if (uploadData) {
          let companyinfo = {
            logo: filename,
            logoUrl: uploadData.Location,
          };

          const companyInfo = await this.updateProfileInfo(
            companyid,
            companyinfo
          );

          let bankInfo = {};
          if (companyInfo?.companyInfoData?.defaultBank) {
            bankInfo = await this.ledger.findQuery(
              companyInfo?.companyInfoData?.defaultBank,
              {
                attributes: [
                  "id",
                  "accountname",
                  "nominalcode",
                  "laccount",
                  "accnum",
                  "cardnum",
                  "paidmethod",
                  "ibannum",
                  "bicnum",
                  "total",
                  "branch",
                  "ifsc",
                ],
              }
            );
          }

          let obj = {
            ...plainUser,
            companyInfo: {
              ...companyInfo.companyInfoData?.dataValues,
              bankInfo,
            },
          };

          const returnData = {
            location: uploadData.Location,
            filename,
            updatedData: obj,
          };
          response = {
            status: true,
            message: "Logo Updated successfully",
            data: returnData,
          };
        } else {
          response = {
            status: false,
            message: "Failed to update Logo picture",
            data: null,
          };
        }
      } else {
        response = {
          status: false,
          message: "User not found",
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async UpdatePhone(id: string, body: any) {
    try {
      const user = await this.usersRepository.findByPk<User>(id);
      user.phonenumber = body.phonenumber;
      const userData = await user.save();
      let success = {
        data: new UserDto(userData),
        status: true,
        message: "Phone number Updated successfully.",
      };
      return success;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async UpdateEmail(id: string, body: any) {
    try {
      const user = await this.usersRepository.findByPk<User>(id);
      user.email = body.email;
      const userData = await user.save();
      let success = {
        data: new UserDto(userData),
        status: true,
        message: "Email Updated successfully.",
      };
      return new UserDto(userData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async ClearUserData(id: number, userId: number) {
    try {
      // 1. ledger details
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.ledger_details WHERE companyid=${id}`
      );

      // 2. invoice items
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.invoice_items WHERE companyid=${id}`
      );

      // 3. recurring notification
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.reccuring_notification WHERE companyid=${id}`
      );

      // 4. sales invoice - Must be deleted before contact_master due to foreign key constraints
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.sale_invoice WHERE companyid=${id}`
      );

      // 5. purchase invoice
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.purchase_invoice WHERE companyid=${id}`
      );

      // 6. pay sheet items
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.payroll_paysheet_items WHERE companyid=${id}`
      );

      // 7. pay sheet
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.payroll_paysheet WHERE companyid=${id}`
      );

      // 8. payroll employee
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.payroll_employees WHERE companyid=${id}`
      );

      // 9. employee category
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.payroll_employee_category WHERE companyid=${id}`
      );

      // 10. journal master
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.journal_master WHERE companyid=${id}`
      );

      // 11. other master
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.other_master WHERE companyId=${id}`
      );

      // 12. product location master
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.product_location_master WHERE companyid=${id}`
      );

      // 13. product master
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.product_master WHERE companyid=${id}`
      );

      // 14. product category
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.product_category WHERE companyid=${id}`
      );

      // 15. unit
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.unit WHERE companyid=${id}`
      );

      // 16. tax
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.tax_master WHERE companyid=${id}`
      );

      // 17. hsn code
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.hsn_code_master WHERE companyid=${id}`
      );

      // 18. proposal
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.proposal WHERE companyid=${id}`
      );

      // 19. staff transactions
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.staff_transactions WHERE companyid=${id}`
      );

      // 20. contact master - Now it should be safe to delete
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.contact_master WHERE companyid=${id}`
      );

      // 21. My Ledger Categories
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.ledger_category_master WHERE companyid=${id}`
      );

      // 22. Stripe log
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.stripe_log WHERE companyid=${id}`
      );

      // 23. counter details
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.counter_details WHERE companyid=${id}`
      );

      // 24. billing counter
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.billing_counter WHERE companyid=${id}`
      );

      // 26. location master
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.location_master WHERE companyid=${id}`
      );

      // 27. user settings
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.user_settings WHERE companyid=${id}`
      );

      // Insert new location and settings
      let InvoiceConfig = [
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

      const locationObj = {
        location: "Main",
        locationCode: "Main",
        userid: userId,
        companyid: id,
      };

      const newLocation = await LocationMaster.create(locationObj);

      const InvoiceConfigString = JSON.stringify(InvoiceConfig);
      await this.databaseService.getSequelize.query(
        `INSERT INTO \`${config.database.database}\`.user_settings (adminid,companyid,locationId,value) VALUES (?, ?, ?, ?)`,
        {
          replacements: [userId, id, newLocation.id, InvoiceConfigString],
        }
      );

      // Update company data
      const currentBankQuery = `
            SELECT id FROM \`${config.database.database}\`.account_master 
            WHERE companyid = ? AND nominalcode = 1100 AND adminid = ?`;

      const currentBankData = await this.databaseService.getSequelize.query(
        currentBankQuery,
        {
          replacements: [id, userId],
          type: this.databaseService.getSequelize.QueryTypes.SELECT,
        }
      );

      const updateCompanyDataQuery = `UPDATE \`${config.database.database}\`.company_master SET defaultBank = ? WHERE id = ?`;
      await this.databaseService.getSequelize.query(updateCompanyDataQuery, {
        replacements: [currentBankData[0].id, id],
      });

      // 29. All my ledgers including new banks
      await this.databaseService.getSequelize.query(
        `DELETE FROM \`${config.database.database}\`.account_master WHERE companyid = ${id} AND nominalcode NOT IN (1100, 1200)`
      );

      return {
        data: "Success",
        status: true,
        message: "User Data Cleared Successfully",
      };
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      const userData = await this.usersRepository.findByPk<User>(id);
      if (!userData) {
        return {
          data: null,
          status: false,
          message: "User not found",
        };
      }

      //1. ledger details
      const query1 = `DELETE FROM \`${config.database.database}\`.ledger_details WHERE adminid=${id}`;
      const ledgerdetails = await this.databaseService.getSequelize.query(
        query1
      );
      //2. Invoice items
      const query2 = `DELETE FROM \`${config.database.database}\`.invoice_items WHERE adminid=${id}`;
      const invoiceitems = await this.databaseService.getSequelize.query(
        query2
      );
      //3. recurring notification
      const reccuring_query = `DELETE FROM \`${config.database.database}\`.reccuring_notification WHERE userid=${id}`;
      const reccuring = await this.databaseService.getSequelize.query(
        reccuring_query
      );
      //4. sales invoice
      const query3 = `DELETE FROM \`${config.database.database}\`.sale_invoice WHERE adminid=${id}`;
      const sales_invoice = await this.databaseService.getSequelize.query(
        query3
      );
      //5. purchase invoice
      const query4 = `DELETE FROM \`${config.database.database}\`.purchase_invoice WHERE adminid=${id}`;
      const purchase_invoice = await this.databaseService.getSequelize.query(
        query4
      );
      //6. pay sheet items
      const paySheet_items_query = `DELETE FROM \`${config.database.database}\`.payroll_paysheet_items WHERE adminId=${id}`;
      const paySheet_items = await this.databaseService.getSequelize.query(
        paySheet_items_query
      );
      //7. pay sheet
      const paySheet_query = `DELETE FROM \`${config.database.database}\`.payroll_paysheet WHERE adminId=${id}`;
      const paySheet = await this.databaseService.getSequelize.query(
        paySheet_query
      );
      //8. payroll employee
      const payroll_employees_query = `DELETE FROM \`${config.database.database}\`.payroll_employees WHERE adminId=${id}`;
      const payroll_employees = await this.databaseService.getSequelize.query(
        payroll_employees_query
      );
      //9. employee category
      const payroll_employees_category_query = `DELETE FROM \`${config.database.database}\`.payroll_employee_category WHERE adminId=${id}`;
      const payroll_employee_category =
        await this.databaseService.getSequelize.query(
          payroll_employees_category_query
        );

      //10. journal master
      const query6 = `DELETE FROM \`${config.database.database}\`.journal_master WHERE adminid=${id}`;
      const journal_master = await this.databaseService.getSequelize.query(
        query6
      );
      //11. other Master
      const other_master_query = `DELETE FROM \`${config.database.database}\`.other_master WHERE adminId=${id}`;
      const other_master = await this.databaseService.getSequelize.query(
        other_master_query
      );
      //12. product location master
      const product_location_master_query = `DELETE FROM \`${config.database.database}\`.product_master WHERE adminid=${id}`;
      const product_location_master =
        await this.databaseService.getSequelize.query(
          product_location_master_query
        );
      //13. product master
      const query7 = `DELETE FROM \`${config.database.database}\`.product_master WHERE adminid=${id}`;
      const product_master = await this.databaseService.getSequelize.query(
        query7
      );

      //14. product category
      const query9 = `DELETE FROM \`${config.database.database}\`.product_category WHERE userid=${id}`;
      const product_category = await this.databaseService.getSequelize.query(
        query9
      );
      //15. unit
      const query10 = `DELETE FROM \`${config.database.database}\`.unit WHERE adminid=${id}`;
      const unit = await this.databaseService.getSequelize.query(query10);
      //16. tax master
      const tax_query = `DELETE FROM \`${config.database.database}\`.tax_master WHERE adminid=${id}`;
      const tax = await this.databaseService.getSequelize.query(tax_query);
      //17. hsn code master
      const hsnCode_query = `DELETE FROM \`${config.database.database}\`.hsn_code_master WHERE adminid=${id}`;
      const hsnCode = await this.databaseService.getSequelize.query(
        hsnCode_query
      );
      //18. user settings
      const query11 = `DELETE FROM \`${config.database.database}\`.user_settings WHERE adminid=${id}`;
      const user_settings = await this.databaseService.getSequelize.query(
        query11
      );
      //19. proposal
      const proposal_query = `DELETE FROM \`${config.database.database}\`.proposal WHERE adminid=${id}`;
      const proposals = await this.databaseService.getSequelize.query(
        proposal_query
      );

      //21. Staff Transactions
      const staff_transaction_query = `DELETE FROM \`${config.database.database}\`.staff_transactions WHERE adminid=${id}`;
      const staff_transaction = await this.databaseService.getSequelize.query(
        staff_transaction_query
      );
      //22. contact master
      const query8 = `DELETE FROM \`${config.database.database}\`.contact_master WHERE adminid=${id}`;
      const contact_master = await this.databaseService.getSequelize.query(
        query8
      );

      //23. Ledger Category Master
      const ledger_category_query = `DELETE FROM \`${config.database.database}\`.ledger_category_master WHERE adminid=${id}`;
      const ledger_category = await this.databaseService.getSequelize.query(
        ledger_category_query
      );

      //24. Stripe log
      const stripe_log_query = `DELETE FROM \`${config.database.database}\`.stripe_log WHERE adminid=${id}`;
      const stripe_log = await this.databaseService.getSequelize.query(
        stripe_log_query
      );

      //25. Business category
      const business_category_query = `DELETE FROM \`${config.database.database}\`.business_category WHERE adminid=${id}`;
      const business_category = await this.databaseService.getSequelize.query(
        business_category_query
      );

      //26. Subscription Details
      const subscription_query = `DELETE FROM \`${config.database.database}\`.subscription WHERE userId=${id}`;
      const subscription = await this.databaseService.getSequelize.query(
        subscription_query
      );

      //27.counter
      const counterdatails_query = `DELETE FROM \`${config.database.database}\`.counter_details WHERE companyid=${id}`;
      const counterDetails = await this.databaseService.getSequelize.query(
        counterdatails_query
      );

      //28. Billing counter
      const counter_query = `DELETE FROM \`${config.database.database}\`.billing_counter WHERE adminid=${id}`;
      const counter = await this.databaseService.getSequelize.query(
        counter_query
      );

      //29. Location master
      const location_query = `DELETE FROM \`${config.database.database}\`.location_master WHERE adminId=${id}`;
      const location = await this.databaseService.getSequelize.query(
        location_query
      );

      //30. Comapany master
      const company_query = `DELETE FROM \`${config.database.database}\`.company_master WHERE adminid=${id}`;
      const company = await this.databaseService.getSequelize.query(
        company_query
      );

      //31. account master
      const query5 = `
      DELETE FROM \`${config.database.database}\`.account_master WHERE adminid = ${id}`;
      const account_master = await this.databaseService.getSequelize.query(
        query5
      );

      //32. User
      const user_query = `DELETE FROM \`${config.database.database}\`.user WHERE id=${id}`;
      const user = await this.databaseService.getSequelize.query(user_query);

      //33. Base url
      let url = `https://master-server.taxgoglobal.com/taxgov2/base/${id}`;
      const baseUrlData = await axios.delete(url);

      return {
        data: user,
        status: true,
        message: "User Data Cleared Successfully",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async userUsageReport(id: number, query: any) {
    try {
      const { startDate, endDate } = query;
      const users = await this.usersRepository.findAll({
        where: {
          countryid: id,
          createdAt: {
            [Op.between]: [
              moment(startDate).startOf("day").toDate(),
              moment(endDate).endOf("day").toDate(),
            ],
          },
        },
        attributes: ["id", "fullName", "email", "countryid"],
      });
  
      const userIds = users.map((user) => user.id);
  
      const countsQuery = `
      SELECT u.id AS adminid,
        (SELECT COUNT(*) FROM company_master WHERE adminid = u.id) AS company_count,
        (SELECT COUNT(*) FROM sale_invoice WHERE adminid = u.id AND type='sales' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS sales_count,
        (SELECT COUNT(*) FROM sale_invoice WHERE adminid = u.id AND type='proforma' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS proforma_count,
        (SELECT COUNT(*) FROM sale_invoice WHERE adminid = u.id AND type='scredit' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS scredit_count,
        (SELECT COUNT(*) FROM purchase_invoice WHERE adminid = u.id AND type='purchase' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS purchase_count,
        (SELECT COUNT(*) FROM purchase_invoice WHERE adminid = u.id AND type='pcredit' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS pcredit_count,
        (SELECT COUNT(*) FROM purchase_invoice WHERE adminid = u.id AND type='stockassets' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS stockassets_count,
        (SELECT COUNT(*) FROM account_master WHERE adminid = u.id AND createdat BETWEEN '${startDate}' AND '${endDate}') AS ledgers_count,
        (SELECT COUNT(*) FROM billing_counter WHERE adminid = u.id AND createdat BETWEEN '${startDate}' AND '${endDate}') AS counter_count,
        (SELECT COUNT(*) FROM contact_master WHERE adminid = u.id AND contractors_type='customer' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS customer_count,
        (SELECT COUNT(*) FROM contact_master WHERE adminid = u.id AND contractors_type='supplier' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS supplier_count,
        (SELECT COUNT(*) FROM contact_master WHERE adminid = u.id AND contractors_type='staff' AND createdat BETWEEN '${startDate}' AND '${endDate}') AS staff_count,
        (SELECT COUNT(*) FROM product_master WHERE adminid = u.id AND createdat BETWEEN '${startDate}' AND '${endDate}') AS product_count,
        (SELECT COUNT(*) FROM journal_master WHERE adminid = u.id AND createdat BETWEEN '${startDate}' AND '${endDate}') AS journal_count
      FROM user u
      WHERE u.id IN (${userIds.join(",")});
      `;            
  
      const countsData = await this.databaseService.getSequelize.query(countsQuery, {
        type: this.databaseService.getSequelize.QueryTypes.SELECT,
      });
  
      // Get country data
      const country = await this.databaseService.getSequelize.query(
        `SELECT * FROM \`${config.database.database}\`.country_master WHERE id=${id}`,
        {
          type: this.databaseService.getSequelize.QueryTypes.SELECT,
        }
      );
  
      // Map counts data to the users
      const result = users.map((user) => {
        const userCounts = countsData.find((count) => count.adminid === user.id);
  
        return {
          name: user.fullName,
          email: user.email,
          country: country[0].name,
          countryid: user.countryid,
          company: userCounts?.company_count || 0,
          sales_count: userCounts?.sales_count || 0,
          proforma_count: userCounts?.proforma_count || 0,
          sales_credit_count: userCounts?.scredit_count || 0,
          purchase_count: userCounts?.purchase_count || 0,
          pcredit_count: userCounts?.pcredit_count || 0,
          stockassets_count: userCounts?.stockassets_count || 0,
          ledgers_count: userCounts?.ledgers_count || 0,
          counter_count: userCounts?.counter_count || 0,
          customer_count: userCounts?.customer_count || 0,
          supplier_count: userCounts?.supplier_count || 0,
          staff_count: userCounts?.staff_count || 0,
          product_count: userCounts?.product_count || 0,
          journal_count: userCounts?.journal_count || 0,
        };
      });
  
      return {
        totalUsers: users.length,
        data: result,
        status: true,
        message: "User Report",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
  async getToken(userId: number) {
    try {
      let user: any = await User.findOne({
        where: { id: userId },
      });

      const subscription = await Subscriptions.findOne({
        where: { userId },
      });

      const payload: any = {
        email: user?.email,
        subscriptionExpiry: subscription
          ? subscription?.subscriptionExpiry
          : null,
        userId: user?.id,
      };

      let token = sign(payload, this.jwtPrivateKey, {
        expiresIn: config.SESSION_EXPIRY,
      });

      return new CommonResponseDto(token, true, "Token refreshed successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
