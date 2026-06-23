const jwt = require("jsonwebtoken");
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { compare, genSalt, hash } from "bcrypt";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { AccountMasterService } from "../account_master/account_master_service";
import { CompanyMasterService } from "../company_master/company_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { MailService } from "../mail/mail_service";
import { ConfigService } from "../shared/config/config.service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { SmsService } from "../SMS/sms.service";
import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { UserLoginResponseDto } from "../users/dto/user-login-response.dto";
import { User } from "../users/user.entity";
import { UserService } from "../users/user.services";
import {
  ForgotPasswordDto,
  newpasswordPasswordDto,
} from "./dto/forgotPassword.dto";
import { login_Email, login_google, login_phone } from "./dto/login.dto";
import { signup_Register } from "./dto/signup.dto";
import { UserEmailUpdateDto } from "./dto/updateEmail.dto";
import { UserPhoneUpdateDto } from "./dto/updatePhonenumber.dto";
import { AccountMaster } from "../account_master/account_master";
import { CompanyMaster } from "../company_master/company_master_entity";
import { BillingCounter } from "../billing_counter/billing_counter_entity";
const admin = require("../firebase");

@Injectable()
export class AuthService {
  @Inject(AccountMasterService)
  private readonly ledger: AccountMasterService;
  @Inject(ContactMasterService)
  private readonly contact_master: ContactMasterService;
  @Inject(CompanyMasterService)
  private readonly company_master: CompanyMasterService;
  @Inject(SmsService)
  private readonly sms_service: SmsService;
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  async login(body: login_Email) {
    try {
      const { email, password } = body;
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return new CommonResponseDto(null, false, "Invalid email or password.");
      }
      const isMatch = await compare(password, user.password);
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      if (subscription.soleTrader) {
        return new CommonResponseDto(
          null,
          false,
          "You have no access to Tax GO global! Please contact your admin to upgrade your plan"
        );
      }
      const token = await this.userService.signToken(user, subscription);
      if (isMatch) {
        if (user.id == -2) {
          return {
            data: { user, token, isAdmin: true },
            status: true,
            message: "Success",
          };
        } else {
          return {
            data: new UserLoginResponseDto(user, token),
            status: true,
            message: "Success",
          };
        }
      } else {
        return new CommonResponseDto(null, false, "Invalid email or password.");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async phoneLogin(body: login_phone) {
    try {
      const user = await this.userService.findUserByPhoneNumber(body);
      if (user.data.emailverified !== 1) {
        return new CommonResponseDto(null, false, "Please Verify Your Email");
      }
      if (user) {
        const subscription = await Subscriptions.findOne({
          where: { userId: user?.data.id },
        });
        if (subscription.soleTrader) {
          return new CommonResponseDto(
            null,
            false,
            "You have no access to Tax GO global! Please contact your admin to upgrade your plan"
          );
        }
        const token = await this.userService.signToken(user, subscription);

        let bankInfo = {};

        return new CommonResponseDto(
          new UserLoginResponseDto(user.data, token, bankInfo),
          true,
          "Success"
        );
      } else {
        return new CommonResponseDto(null, false, "Use not found");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async googleLogin(body: login_google) {
    try {
      const userDetails: DecodedIdToken = await admin
        .auth()
        .verifyIdToken(body.idToken);
      if (!userDetails?.email) throw new Error("Unauthorized Access..@@");
      const user = await this.userService.getUserByEmail(userDetails?.email);
      if (user) {
        if (user.emailverified !== 1) {
          // return new CommonResponseDto(null, false, "Please Verify Your Email");
          let userUpdate = await this.userService.updateUser(user.id, {
            emailverified: 1,
          });
        }
        const subscription = await Subscriptions.findOne({
          where: { userId: user?.id },
        });
        if (subscription.soleTrader) {
          return new CommonResponseDto(
            null,
            false,
            "You have no access to Tax GO global! Please contact your admin to upgrade your plan"
          );
        }
        const token = await this.userService.signToken(user, subscription);
        let bankInfo = {};

        return new CommonResponseDto(
          new UserLoginResponseDto(user, token),
          true,
          "Success"
        );
      }
      return new CommonResponseDto(
        null,
        false,
        "No user found with this email..! Please sign up"
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async forgotPassword(body: ForgotPasswordDto) {
    try {
      const user: any = await User.findOne<User>({
        where: { email: body?.email },
      });
      if (!user)
        return new CommonResponseDto(
          null,
          false,
          "There is no user associated with this email."
        );

      const token = jwt.sign(
        { data: { userId: user?.id } },
        this.configService.jwtConfig.privateKey,
        {
          expiresIn: "5m",
        }
      );

      let mail = { email: user.email, token, user };
      let mailService = this.mailService.sentForgotPassword(mail);
      if (mailService) {
        let response = {
          status: true,
          message: "Password reset successfully",
          data: null,
        };
        return response;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async changePassword(data: newpasswordPasswordDto) {
    try {
      const verified = jwt.verify(
        data.token,
        this.configService.jwtConfig.privateKey
      );
      if (verified) {
        const userDetails: any = await User.findOne({
          where: { id: verified.data?.userId },
        });
        if (!userDetails)
          return new CommonResponseDto({}, false, "No user found");
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
      return new CommonResponseDto({}, false, "Failed to Reset Password");
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async userRegister(body: any) {
    try {
      const emailExists: any = await this.userService.checkEmailExist(body);
      const contactEMailExists = await this.contact_master.findAllByQuery({
        where: {
          email: body.email,
          contractors_type: "staff",
        },
      });
      if (!emailExists || contactEMailExists.length) {
        return new CommonResponseDto(
          "emailexist",
          false,
          "User already exists with this email."
        );
      }

      const newUser: any = await this.userService.createUserwithGmail(body);
      if (newUser) {
        return newUser; // Return the newly created user
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async register(body: signup_Register) {
    try {
      const emailExists: any = await this.userService.checkEmailExist(body);
      const contactEMailExists = await this.contact_master.findAllByQuery({
        where: {
          email: body.email,
          contractors_type: "staff",
        },
      });
      if (!emailExists || contactEMailExists.length) {
        return new CommonResponseDto(
          "emailexist",
          false,
          "User already exists with this email."
        );
      }
      if (body.phonenumber) {
        const phoneExists: any = await this.userService.checkPhoneExist(body);
        if (!phoneExists) {
          return new CommonResponseDto(
            "phoneexist",
            false,
            "User already exists with this phone number."
          );
        }
      }

      const newUser: any = await this.userService.createUser(body);
      if (newUser) {
        return newUser; // Return the newly created user
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sendVerificationEmail(id: number) {
    try {
      let user: any = await User.findByPk(id);
      if (user) {
        let verifyData = Buffer.from(
          `email=${user.email}&verifycode=TaxGo${id}`,
          "utf8"
        ).toString("base64");
        await this.mailService.sendWelcomeMail(user, verifyData);
        return new CommonResponseDto(user, true, "Email sent successfully");
      }
      return new CommonResponseDto(null, false, "User not fount");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendVerificationEmailRetail(id: number) {
    try {
      let user: any = await User.findByPk(id);
      if (user) {
        let verifyData = Buffer.from(
          `email=${user.email}&verifycode=TaxGo${id}`,
          "utf8"
        ).toString("base64");
        await this.mailService.sendRetailWelcomeMail(user, verifyData);
        return new CommonResponseDto(user, true, "Email sent successfully");
      }
      return new CommonResponseDto(null, false, "User not fount");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updatePhoneNumber(body: UserPhoneUpdateDto, id: string) {
    try {
      const user = await this.userService.UpdatePhone(id, body);
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async updatePhoneNumberWithWhatsapp(adminid: number, body: any) {
    try {
      const verifyResponse = await this.sms_service.verifyUpdateOtp(body);
      if (verifyResponse.status) {
        let userDetails = await User.findByPk(adminid);
        userDetails.mobileverified = 1;
        userDetails.phonenumber = body.phonenumber;
        await userDetails.save();
        return new CommonResponseDto(
          userDetails,
          true,
          "Phone number updated successfully"
        );
      } else {
        return verifyResponse;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateEmail(body: UserEmailUpdateDto) {
    const verifyId: any = await User.findOne({
      where: { id: body?.userId },
    });

    if (verifyId) {
      verifyId.email = body.email;
      // verifyId.emailverified = 0;
    }
    try {
      await verifyId.save();
    } catch (error) {
      console.error("Validation Error:", error);
      throw error;
    }

    const token = jwt.sign(
      { data: { userId: body?.userId } },
      this.configService.jwtConfig.privateKey,
      {
        expiresIn: "5m",
      }
    );

    if (token) {
      let mail = {
        id: token,
        verifyId,
        email: body.email,
        userId: body?.userId,
      };
      let mailService = await this.mailService.sentUpdatedEmail(mail);

      if (mailService) {
        let response = {
          status: true,
          message: "mail updated successfully",
          data: verifyId,
        };
        return response;
      }
    }
  }

  async sendUpdateEmail(id: number, dataDto: any) {
    try {
      let user: any = await User.findByPk(id);
      if (user) {
        let verifyData = Buffer.from(
          `email=${dataDto.email}&verifycode=TaxGo${id}&user=${id}`,
          "utf8"
        ).toString("base64");
        let obj = {
          email: dataDto.email,
          firstname: user.firstname,
          lastname: user.lastname,
          id: user.id,
        };
        user.verifycode = verifyData;
        await user.save();
        await this.mailService.sendUpdateEmail(obj, verifyData);
        return new CommonResponseDto(user, true, "Email sent successfully");
      }
      return new CommonResponseDto(null, false, "User not fount");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyEmail(userId: any, token: any) {
    try {
      let verifiedToken = jwt.verify(
        token,
        this.configService.jwtConfig.privateKey
      );

      if (verifiedToken) {
        let user: any = await User.findOne({
          where: { id: userId },
        });

        user.emailverified = 1;
        await user.save();
      }
      return verifiedToken;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async staffEmailLogin(body: any) {
    try {
      let staff;
      if (body.email) {
        staff = await this.contact_master.getStaffByEmail(body.email);
        if (!staff) {
          staff = await this.contact_master.getStaffByStaffId(body.email);
        }
      }
      if (body.staffId) {
        staff = await this.contact_master.getStaffByStaffId(body.staffId);
        if (!staff) {
          staff = await this.contact_master.getStaffByEmail(body.staffId);
        }
      }
      if (!staff) {
        return new CommonResponseDto(null, false, "Invalid credentials");
      }
      const adminDetails = await this.userService.getUser(
        String(staff.adminid)
      );
      // if (adminDetails.data.emailverified !== 1) {
      //   return new CommonResponseDto(
      //     null,
      //     false,
      //     "Your email not verified ..! Please contact your admin"
      //   );
      // }

      const isMatch = await compare(body.password, staff.password);
      const subscription = await Subscriptions.findOne({
        where: { userId: adminDetails?.data?.id },
      });

      // if(!subscription.retailExpress){
      //   return new CommonResponseDto(
      //     null,
      //     false,
      //    "You have not subscribed to Retail Xpress!  Please contact your admin"
      //   );
      // }

      const token = await this.userService.signToken(
        adminDetails?.data,
        subscription
      );

      const company = await this.company_master.findOne(staff.companyid);
      const bankInfo = await this.ledger.findQuery(company?.defaultBank, "");
      const cashArray = await this.ledger.findAllByQuery({
        where: {
          companyid: staff.companyid,
          adminid: staff.adminid,
          category: 1,
          laccount: "Cash",
        },
      });
      const cashInfo = cashArray?.length ? cashArray[0] : {};
      const data = {
        isStaff: true,
        staff,
        token,
        companyInfo: company,
        ...adminDetails?.data,
        bankInfo,
        cashInfo,
      };

      if (isMatch) {
        return new CommonResponseDto(
          { ...data },
          true,
          "Staff Logged in successfully"
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          body.email
            ? "Invalid email or password."
            : "Invalid staff id or password"
        );
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getOverallAdminDetails(body: any) {
    try {
      const { email, password } = body;
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return new CommonResponseDto(null, false, "Invalid email or password.");
      }

      const isMatch = await compare(password, user.password);
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      if (subscription.soleTrader) {
        return new CommonResponseDto(
          null,
          false,
          "You have no access to Tax GO global! Please contact your admin to upgrade your plan"
        );
      }
      const token = await this.userService.signToken(user, subscription);
      if (isMatch) {
        const companies = [];
        const userCompanies = await CompanyMaster.findAll({
          where: {
            adminid: user?.id,
          },
          attributes: ["id", "bname"],
        });

        for (let i = 0; i < userCompanies.length; i++) {
          const counterList = await BillingCounter.findAll({
            where: {
              adminid: user?.id,
              companyid: userCompanies[i].id,
            },
          });

          let ledgers = await AccountMaster.findAll({
            where: {
              adminid: user?.id,
              companyid: userCompanies[i].id,
              category: 1,
            },
            attributes: ["id", "nominalcode", "laccount"],
            order: [["id", "ASC"]],
          });

          companies.push({
            id: userCompanies[i].id,
            name: userCompanies[i].bname,
            counters:counterList,
            ledgerList: ledgers,
          });
        }

        const userData = {
          name: user.fullName,
          userId: user.id,
          token,
          companies,
        };

        if (user.id == -2) {
          return {
            data: { ...userData, isAdmin: true },
            status: true,
            message: "Success",
          };
        } else {
          return {
            data: userData,
            status: true,
            message: "Success",
          };
        }
      } else {
        return new CommonResponseDto(null, false, "Invalid email or password.");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
