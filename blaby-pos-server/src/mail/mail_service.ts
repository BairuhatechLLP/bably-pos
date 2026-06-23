import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "../users/user.entity";
import { ApprovalIATATemplate } from "./templates/ApprovalIATATemplate";
import { ResetPasswordTemplate } from "./templates/resetPassword";

import { UpdateEmailTemplate } from "./templates/updatedEmail";
import { template1 } from "./templates/reccuringnotification";
import moment from "moment";
import { StaffResetPasswordTemplate } from "./templates/staff-forgottPassword";
import { StaffResetPasswordOtpTemplate } from "./templates/forget-password-otp";
const fs = require("fs");
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeMail(user: User, verifyData: any) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: "company@taxgoglobal.com", // override default from
        subject:
          "Welcome to TaxGo!| Registration Successful | Confirm your Email",
        template: "./welcome-mail", // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          firstname: user.fullName,
          verifyData: verifyData,
          email: user.email,
          admind: user.id,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendRetailWelcomeMail(user: User, verifyData: any) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: "company@taxgoglobal.com", // override default from
        subject:
          "Welcome to Retail Xpress!| Registration Successful | Confirm your Email",
        template: "./retail_welcome_mail", // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          firstname: user.fullName,
          verifyData: verifyData,
          email: user.email,
          admind: user.id,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendUpdateEmail(user: any, verifyData: any) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: "company@taxgoglobal.com",
        subject: "Tax GO Global | Update Email Address",
        template: "./updateEmail",
        context: {
          firstname: user.firstname,
          lastname: user.lastname,
          verifyData: verifyData,
          email: user.email,
          admind: user.id,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendEmailToPerson(
    personEmail: string,
    emailSubject: string,
    emailText: string
  ) {
    try {
      return await this.mailerService.sendMail({
        to: personEmail,
        from: "company@taxgoglobal.com",
        subject: emailSubject,
        text: emailText,
        template: "./sample-mail",
        context: {
          text: emailText,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async recoveryNotification(
    personEmail: string,
    emailSubject: string,
    emailText: string
  ) {
    try {
      return await this.mailerService.sendMail({
        to: personEmail,
        from: "company@taxgoglobal.com",
        subject: emailSubject,
        text: emailText,
        template: "./sample-mail",
        context: {
          text: emailText,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendInvoiceMail(mailOptions: any, msg: any, email: string) {
    try {
      return await this.mailerService.sendMail({
        to: mailOptions.to,
        from: mailOptions.sender,
        subject: mailOptions.subject,
        template: "./invoice-mail",
        context: {
          subject: mailOptions.subject,
          mailText: msg || "Dear User, Please find Invoice Attached.",
          email: email,
        },
        attachments: mailOptions.attachments,
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendPasswordResetMail(mailOptions: any, user: any) {
    try {
      return await this.mailerService.sendMail({
        to: mailOptions.to,
        subject: mailOptions.subject,
        template: "./password-reset", // `.hbs` extension is appended automatically
        context: {
          subject: mailOptions.subject,
          firstname: user.firstname,
          lastname: user.lastname,
          code: user.code,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendPasswordResetCompleteMail(mailOptions: any, user: any) {
    try {
      return await this.mailerService.sendMail({
        to: mailOptions.to,
        from: "company@taxgoglobal.com",
        subject: mailOptions.subject,
        template: "./reset-complete", // `.hbs` extension is appended automatically
        context: {
          subject: mailOptions.subject,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sentProductLimit(data: any) {
    try {
      let emailContent = ApprovalIATATemplate(data);
      return await this.mailerService.sendMail({
        to: data.email,
        subject: "Out of Stock",
        text: "TaxGo Notification",
        html: emailContent,
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }
  async sentForgotPassword(data: any) {
    try {
      let emailContent = ResetPasswordTemplate(data);

      return await this.mailerService.sendMail({
        to: data?.email,
        subject: "New Password",
        text: "TaxGo Notification",
        html: emailContent,
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sentStaffForgotPassword(data: any) {
    let emailContent = StaffResetPasswordTemplate(data);
    return await this.mailerService.sendMail({
      to: data?.email,
      subject: "New Password",
      text: "Retail Express Notification",
      html: emailContent,
    });
  }

  async sentStaffForgotPasswordOtp(data: any) {
    let emailContent = StaffResetPasswordOtpTemplate(data);
    return await this.mailerService.sendMail({
      to: data?.email,
      subject: "Password-reset-otp",
      text: "Retail Express Notification",
      html: emailContent,
    });
  }

  async sentUpdatedEmail(data: any) {
    try {
      let emailContent = UpdateEmailTemplate(data);
      return await this.mailerService.sendMail({
        to: data.email,
        html: emailContent,
      });
    } catch (err) {
      console.log(err);
      throw err
    }
 
  }
  async sentPaymentEmail(data: any) {
    try {
      let emailContent = data.html;
      return await this.mailerService.sendMail({
        to: data.email,
        html: emailContent,
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendContactUsMail(mailOptions: any) {
    try {
      return await this.mailerService.sendMail({
        to: "info@taxgoglobal.com",
        subject: 'Queries about Tax GO',
        template: "./contactus-mail",
        context: {
          name: mailOptions.name,
          email: mailOptions.email,
          phone: mailOptions.phone,
          message: mailOptions.message,
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async scheduleDemoMail(mailOptions: any) {
    try {
      let date = moment(mailOptions.sdate).format("DD-MM-YYYY hh:mm a")
      return await this.mailerService.sendMail({
        to: "ibairuha@gmail.com",
        from: "company@taxgoglobal.com",
        subject: "Schedule demo for Tax GO accounting software" ,
        template: "./schedule-demo",
        context: {
          name: mailOptions.name,
          email: mailOptions.email,
          phone: mailOptions.phone,
          message: mailOptions.message,
          timeZone:mailOptions.timeZone,
          sdate:date
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async reccuringMail(
    emailData: any,
    customersData: any,
    userData: any,
    companyData: any,
    invoiceItems: any,
    countryInfo: any,
    newInvoiceNo: any,
    sdate: any
  ) {
    try {
      let emailContent = template1({
        emailData,
        customersData,
        userData,
        companyData,
        invoiceItems,
        countryInfo,
        newInvoiceNo,
        sdate,
      });
      return emailContent;
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async sendAffiliateAgreement(data:any) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        from: "company@taxgoglobal.com",
        // cc:"ibairuha@gmail.com",
        subject:
          "Welcome to TaxGo Affiliate Program!| Registration Successful | Agreement",
        template: "./affiliate-agreement",
        context: {
          name: data.name,
          email: data.email,
          country:data.country
        },
      });
    } catch (err) {
      console.log(err);
      throw err
    }
  }

}
