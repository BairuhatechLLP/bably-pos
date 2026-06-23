import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import { UserLoginResponseDto } from "../users/dto/user-login-response.dto";
import { UserService } from "../users/user.services";
import { RequestOtpDto } from "./dto/requestOtp.dto";
import { verifyOtpDto } from "./dto/sms.dto";
import { Subscriptions } from "../subscriptions/subscriptions.entity";

@Injectable()
export class SmsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserService
  ) {}
  private apiUrl = "https://wato.bairuhatech.com/whatsapp";
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string, otp: string) {
    try {
      let res = await axios.post(this.apiUrl, {
        number: phoneNumber,
        message: otp,
      });
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async requestOTP(users: RequestOtpDto) {
    try {
      let { code, phonenumber } = users || {};
      let newPhoneNumber = code + phonenumber;
      let otp = this.generateOTP();
      let userPhone = code + " " + phonenumber
      const user = await this.userService.findUserByPhoneNumber({
        phonenumber: userPhone
      });
      if (!user) {
        return {
          status: false,
          message: "No user registered with this phone number",
        };
      }
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.data?.id },
      });
      const token = await this.userService.signToken(user.data, subscription);
      await this.cacheManager.set(token, otp, 120000);
      await this.sendOTP(newPhoneNumber, otp);

      return { status: true, message: "Success", token: token };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async verifyOTP(verifyData: verifyOtpDto): Promise<any> {
    let response = {
      data: null,
      status: false,
      message: "Incorrect OTP",
    };

    try {
      const validate = await this.validateDatas(verifyData);
      if (validate) {
        await this.cacheManager.del(verifyData.token);
        let token = verifyData.token;
        let phonenumber = verifyData.phonenumber + " " + verifyData.code
        const user = await this.userService.findUserByPhoneNumber({
          phonenumber
        });
        response = {
          data: new UserLoginResponseDto(user.data, token),
          status: true,
          message: "Logged in Successfully",
        };
      }
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async validateDatas(userData) {
    let response = false;
    try {
      const value = await this.cacheManager.get(userData.token);
      if (value && userData.otp === value) {
        response = true;
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOtp(adminid: number, body: any) {
    try {
      let { phonenumber, code } = body || {};
      let otp = this.generateOTP();
      const user = await this.userService.getUserById(adminid);
      if (!user) {
        return {
          status: false,
          message: "Failed to sent otp to your whatsapp",
        };
      }
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.userService.signToken(user, subscription);
      await this.cacheManager.set(token, otp, 120000);
      let newPhoneNumber = code + phonenumber;
      await this.sendOTP(newPhoneNumber, otp);
      return {
        status: true,
        message: "An otp has been sent to your whatsapp",
        token: token,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyUpdateOtp(verifyData: verifyOtpDto): Promise<any> {
    let response = {
      data: null,
      status: false,
      message: "Incorrect OTP",
    };

    try {
      const validate = await this.validateDatas(verifyData);
      if (validate) {
        await this.cacheManager.del(verifyData.token);
        response = {
          data: true,
          status: true,
          message: "Logged in Successfully",
        };
      }
      return response;
    } catch (err) {
      console.log(err);
      response.message = err;
      return response;
    }
  }
}
