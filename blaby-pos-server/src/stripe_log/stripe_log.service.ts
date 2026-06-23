import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { StripeLog } from "./stripe_log.entity";
import { CreateStripeLogDto } from "./dto/create_stripe_log.dto";
import { UpdateStripeLogDto } from "./dto/update_stripe_log.dto";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { UserService } from "../users/user.services";
import { AffiliationsService } from "../affiliations/affiliations-service";
import { Affiliations } from "../affiliations/affiliations-model";
import { Countries } from "../countries/countries_model";

@Injectable()
export class StripeLogService {
  // @Inject(StaffTransactionsService)
  constructor(
    @Inject("StripeLogRepository")
    private readonly StripeLogRepository: typeof StripeLog,
    @Inject(forwardRef(() => StaffTransactionsService))
    private readonly staff_transaction_service: StaffTransactionsService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly SubscriptionsService: SubscriptionsService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => AffiliationsService))
    private readonly affiliations_Service: AffiliationsService
  ) {}

  async findAll() {
    try {
      const stripeLogs = await this.StripeLogRepository.findAll<StripeLog>({});
      return new CommonResponseDto(stripeLogs, true, "stripe log List");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findSubscriptionByAdminid(adminid: number) {
    try {
      const stripeLogs = await this.StripeLogRepository.findAll<StripeLog>({
        where: {
          adminid,
          paymentFor: "subscription",
        },
        order: [["createdAt", "DESC"]],
      });
      return new CommonResponseDto(
        stripeLogs,
        true,
        "Subscription log List for a user"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByCompany(adminid: number, companyid: number) {
    try {
      const logData = await this.StripeLogRepository.findAll({
        where: {
          companyid,
          adminid,
        },
      });
      if (logData) {
        return new CommonResponseDto(logData, true, "stripe log for a company");
      }

      return new CommonResponseDto(null, false, "failed to fetch stripe log");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const log = await this.StripeLogRepository.findByPk<StripeLog>(id);
      return new CommonResponseDto(log, true, "Blog fetched successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(CreateStripeLogDto: CreateStripeLogDto) {
    try {
      const log = new StripeLog();
      log.stripeId = CreateStripeLogDto.stripeId;
      log.invoiceId = CreateStripeLogDto.invoiceId;
      log.status = CreateStripeLogDto.status;
      log.invoiceNo = CreateStripeLogDto.invoiceNo;
      log.amount = CreateStripeLogDto.amount;
      log.invoiceNo = CreateStripeLogDto.invoiceNo;
      log.status = CreateStripeLogDto.status;
      log.companyid = CreateStripeLogDto.companyid;
      log.adminid = CreateStripeLogDto.adminid;
      log.date = CreateStripeLogDto.date;
      log.subscriptionPlan = CreateStripeLogDto.subscriptionPlan;
      log.staffTransactionId = CreateStripeLogDto.staffTransactionId;
      let createdData = await log.save();

      return new CommonResponseDto(
        createdData,
        true,
        "Stripe log created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createSubscription(CreateStripeLogDto: any) {
    try {
      if (CreateStripeLogDto.status.toLowerCase() === "succeeded") {
        const adminDetails = await this.userService.getUser(
          String(CreateStripeLogDto.adminid)
        );
        
        let isAffiliateCodeUsed = false;
        if (CreateStripeLogDto?.affiliationCode) {
          const affiliation = await Affiliations.findOne({
            where: { affiliationCode: CreateStripeLogDto.affiliationCode },
            include: [{ model: Countries, as: "countryInfo" }],
          });

          isAffiliateCodeUsed = adminDetails?.data?.isAffiliateCodeUsed;
          if (affiliation && !adminDetails?.data?.isAffiliateCodeUsed) {
            let previousDetails = [];
            if (affiliation?.details?.length !== 0) {
              previousDetails = affiliation?.details;
            }
            let currentDetails = {
              id: CreateStripeLogDto?.adminid,
              email: adminDetails?.data?.email,
              company: CreateStripeLogDto?.company,
              period: CreateStripeLogDto?.period,
              counter: CreateStripeLogDto?.counter,
              retailXpressWithTaxgo: CreateStripeLogDto?.retailXpress,
              userId: CreateStripeLogDto?.adminid,
              price: CreateStripeLogDto?.amount / 100,
              soleTrader: CreateStripeLogDto?.soleTrader || false,
              affiliationCode: CreateStripeLogDto?.affiliationCode || "",
            };
            previousDetails?.push(currentDetails);
            let amountReward =
              (CreateStripeLogDto.amount / 100) * affiliation?.rewardPercentage;
            await this.affiliations_Service.updateNumberOfAffiliation(
              affiliation?.id,
              {
                affiliationCode: affiliation?.affiliationCode,
                noOfPersons: affiliation?.noOfPersons + 1,
                details: previousDetails,
                amountEarned: affiliation?.amountEarned + amountReward,
              }
            );
            const updatedUserData = await this.userService.updateUserDataAlone(
              CreateStripeLogDto.adminid,
              { isAffiliateCodeUsed: true }
            );
            isAffiliateCodeUsed = updatedUserData.data.isAffiliateCodeUsed;
          }
        }
        const subscriptionObj = {
          company: CreateStripeLogDto.company,
          period: CreateStripeLogDto?.period,
          counter: CreateStripeLogDto.counter,
          retailXpressWithTaxgo: CreateStripeLogDto.retailXpress,
          userId: CreateStripeLogDto.adminid,
          price: CreateStripeLogDto.amount / 100,
          soleTrader: CreateStripeLogDto?.soleTrader || false,
          addOn: CreateStripeLogDto.addOn,
          affiliationCode: CreateStripeLogDto.affiliationCode,
        };
        const subscriptionData = await this.SubscriptionsService.upgradePlan(
          subscriptionObj
        );
        if (subscriptionData?.status) {
          const subscription = await Subscriptions.findOne({
            where: { userId: CreateStripeLogDto.adminid },
          });
          const token = await this.userService.signToken(
            adminDetails.data,
            subscription
          );
          const log = new StripeLog();
          log.stripeId = CreateStripeLogDto.stripeId;
          log.paymentFor = "subscription";
          log.date = new Date();
          log.status = CreateStripeLogDto.status;
          log.subscriptionPlan =
            CreateStripeLogDto.period || subscription.period;
          log.adminid = CreateStripeLogDto.adminid;
          log.amount = CreateStripeLogDto.amount / 100;
          let createdData = await log.save();
          return new CommonResponseDto(
            { token, subscription, isAffiliateCodeUsed },
            true,
            "Subscription log updated successfully"
          );
        } else {
          return new CommonResponseDto(
            null,
            false,
            "Failed to update subscription plan"
          );
        }
      } else {
        const log = new StripeLog();
        log.stripeId = CreateStripeLogDto.stripeId;
        log.paymentFor = "subscription";
        log.date = new Date();
        log.status = CreateStripeLogDto.status;
        log.subscriptionPlan = CreateStripeLogDto.period;
        log.adminid = CreateStripeLogDto.adminid;
        log.amount = CreateStripeLogDto.amount / 100;
        let createdData = await log.save();
        return new CommonResponseDto(
          null,
          false,
          "Payment Failed : failed to update subscription plan"
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, UpdateStripeLogDto: UpdateStripeLogDto) {
    try {
      const stripeLog = await this.StripeLogRepository.findByPk(id);
      if (stripeLog) {
        stripeLog.stripeId = UpdateStripeLogDto.stripeId || stripeLog.stripeId;
        stripeLog.invoiceId =
          UpdateStripeLogDto.invoiceId || stripeLog.invoiceId;
        stripeLog.status = UpdateStripeLogDto.status || stripeLog.status;
        stripeLog.invoiceNo =
          UpdateStripeLogDto.invoiceNo || stripeLog.invoiceNo;
        stripeLog.amount = UpdateStripeLogDto.amount || stripeLog.amount;
        stripeLog.companyid =
          UpdateStripeLogDto.companyid || stripeLog.companyid;
        stripeLog.adminid = UpdateStripeLogDto.adminid || stripeLog.adminid;
        stripeLog.date = UpdateStripeLogDto.date || stripeLog.date;
        stripeLog.staffTransactionId =
          UpdateStripeLogDto.staffTransactionId || stripeLog.staffTransactionId;
        stripeLog.subscriptionPlan =
          UpdateStripeLogDto.subscriptionPlan || stripeLog.subscriptionPlan;
        const updatedData = await stripeLog.save();

        return new CommonResponseDto(
          updatedData,
          true,
          "Stripe Log updated successfully"
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Failed to update stripe log"
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async paymentApproval(id: number, updateDto: any) {
    try {
      const logData = await this.StripeLogRepository.findByPk<StripeLog>(id, {
        raw: true,
      });
      const transaction = await this.staff_transaction_service.findById(
        logData.staffTransactionId
      );
      let transactionDto = {
        staffTransactions: [transaction.dataValues],
        paidmethod: updateDto.paidmethod,
        bankid: updateDto.bankid,
      };
      if (updateDto.status === "approved") {
        const paymentToLedger =
          await this.staff_transaction_service.pymentCreateToLedeger(
            transactionDto
          );
      }
      let obj: any = {
        status: updateDto.status,
      };
      const updatedData = await this.update(id, obj);
      return new CommonResponseDto(
        updatedData,
        true,
        `Payment ${updateDto.status} successfully`
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const stripeLog = await this.StripeLogRepository.findByPk(id);
      await stripeLog.destroy();
      return stripeLog;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
