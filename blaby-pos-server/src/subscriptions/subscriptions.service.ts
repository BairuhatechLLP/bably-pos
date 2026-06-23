import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CreateSubscriptionsDto } from "./dto/subscriptions.create.dto";
import { Plan } from "../PLAN/plan.entity";
import { Subscriptions } from "./subscriptions.entity";
import { Transaction } from "sequelize";
import { GetPricingDto } from "./dto/subscription.pricing.dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";

function differenceInMonths(date2: Date) {
  const diffInMilliseconds = date2.getTime() - new Date().getTime();
  const millisecondsInMonth = 1000 * 60 * 60 * 24 * 30.4375;
  const diffInMonths = diffInMilliseconds / millisecondsInMonth;
  if (diffInMonths > 0 && diffInMonths < 0.5) return 1;
  return Math.ceil(Math.round(diffInMonths));
}
interface responseType {
  totalPrice: number;
  companyPrice: number;
  retailXpressWithTaxgoPrice: number;
  soleTraderPrice:number;
  counterPrice: number;
  period: number;
}
@Injectable()
export class SubscriptionsService {
  async findOne(id: number) {
    try {
      const subscriptions = await Subscriptions.findOne({
        where: { userId: id },
      });
      if (!subscriptions) throw new NotFoundException();
      return new CommonResponseDto(subscriptions, true, "Successfully fetched");
    } catch (error) {
      console.log(error);
      throw error;
      //   if (err instanceof HttpException) throw err;
      //   throw new InternalServerErrorException();
    }
  }

  async freePlan(data: CreateSubscriptionsDto){
    try {
      const result = await Subscriptions.sequelize.transaction(
        async (transaction: Transaction) => {
          const sub = await Subscriptions.create(
            {...data },
            { transaction }
          );
          return new CommonResponseDto(sub,true,'Free subscription added successfully')
        }
      )
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async subscribeToPlan(data: CreateSubscriptionsDto) {
    try {
      const result = await Subscriptions.sequelize.transaction(
        async (transaction: Transaction) => {
          const { company, period, counter, retailXpressWithTaxgo, userId } = data;
          const subscriptionExpiry = new Date();
          const subscription = await Subscriptions.findOne({
            where: { userId },
            transaction,
          });
          const plan = await Plan.findOne({
            where: { period },
            transaction,
          });
          if (!plan)
            throw new ServiceUnavailableException(
              "Please select a valid period"
            );
          //adds two months free for new user
          subscriptionExpiry.setDate(
            subscriptionExpiry.getDate() +
              ( period * 30 ) 
          );
          if (!subscription) {
            const { totalPrice } = this.calculatePrice(data, plan);
            const sub = await Subscriptions.create(
              {
                ...data,
                period: period,
                subscriptionExpiry,
                price: totalPrice,
              },
              { transaction }
            );
            return {
              sub,
              message: `Your purchase is valid for ${sub.period} months. (including 2 months free)`,
            };
          } else {
            //checking if previous plan is expired or not
            const endDate = new Date(subscription.subscriptionExpiry);
            const remaining = differenceInMonths(endDate);
            if (remaining >= 1)
              throw new ServiceUnavailableException(
                "Your current plan is not expired yet.."
              );
            const { totalPrice: price } = this.calculatePriceRenewal(
              data,
              plan,
              subscription
            );
            await subscription.increment(
              {
                ...(company > 0 && { company }),
                ...(counter > 0 && { counter }),
              },
              { transaction }
            );
            subscription.set({
              ...(retailXpressWithTaxgo &&
                !subscription.retailXpressWithTaxgo && { retailXpressWithTaxgo: true }),
              subscriptionExpiry,
              period,
              price,
            });
            await subscription.save({ transaction });
            await subscription.reload({ transaction });
            return {
              subscription,
              message: `Your subscription has been renewed for ${subscription.period} month successfully`,
            };
          }
        }
      );
      return new CommonResponseDto(result, true, "Successfully Created");
    } catch (err) {
      // if (err instanceof HttpException)
      console.log(err);
      throw err;
      // throw new InternalServerErrorException();
    }
  }


  async upgradePlan(data: any) {
    try {
      const result = await Subscriptions.sequelize.transaction(
        async (transaction: Transaction) => {
          const { userId } = data;
          const subscription = await Subscriptions.findOne({
            where: { userId },
            transaction
          });
            if(data.addOn){
              const addOnData = await this.addOn(data)
              return new CommonResponseDto(addOnData, true, "Add-ons updated successfully");
            }else{
              const plan = await Plan.findOne({
                where: {period:data?.period},
                transaction,
                raw:true
              });
              if (!plan)
                throw new ServiceUnavailableException(
                  "Please select a valid period"
                );

              if(new Date(subscription.subscriptionExpiry) < new Date()){
                const currentDate = new Date();
                let newMonth = currentDate.getMonth() + data?.period;
    
                let newYear = currentDate.getFullYear();
                if (newMonth > 11) {
                    newYear += Math.floor(newMonth / 12);
                    newMonth %= 12;
                }
    
                const newSubscriptionExpiry = new Date(currentDate);
                newSubscriptionExpiry.setMonth(newMonth);
                newSubscriptionExpiry.setFullYear(newYear);
               
                const { totalPrice } = this.calculatePrice(data, plan);
                subscription.set({
                  ...data,
                  period: data?.period,
                  subscriptionExpiry:newSubscriptionExpiry,
                  price: totalPrice,
                });
                }else{
                  const subEndDate = new Date(subscription.subscriptionExpiry);
                  let newMonth = subEndDate.getMonth() + data?.period;
      
                  let newYear = subEndDate.getFullYear();
                  if (newMonth > 11) {
                      newYear += Math.floor(newMonth / 12);
                      newMonth %= 12;
                  }
      
                  const newSubscriptionExpiry = new Date(subEndDate);
                  newSubscriptionExpiry.setMonth(newMonth);
                  newSubscriptionExpiry.setFullYear(newYear);
                  const { totalPrice } = this.calculatePrice(data, plan);
                   subscription.set({
                    ...data,
                    period: data?.period,
                    subscriptionExpiry:newSubscriptionExpiry,
                    price: totalPrice,
                  });
                }
                await subscription.save({ transaction });
                await subscription.reload({ transaction });
              }
            }
      );
      return new CommonResponseDto(result, true, "Successfully Created");
    } catch (err) {
      // if (err instanceof HttpException)
      console.log(err);
      throw err;
      // throw new InternalServerErrorException();
    }
  }


  async addOn(data: CreateSubscriptionsDto) {
    try {
      const result = await Subscriptions.sequelize.transaction(
        async (transaction: Transaction) => {
          const subscription = await Subscriptions.findOne({
            where: { userId: data.userId },
            attributes: { exclude: ["createdAt", "updatedAt"] },
            transaction,
          });
          if (!subscription) throw new NotFoundException("No user found");
          const endDate = new Date(subscription.subscriptionExpiry);
          const remaining = differenceInMonths(endDate);
          if (remaining <= 0)
            throw new ServiceUnavailableException("your plan has been expired");

          //getting pricings for 1 month (all addons will be priced based on 1month pricing)
          const plan = await Plan.findOne({
            where: { period: 1 },
            transaction,
          });
          const { totalPrice: price } = this.calculateAddon(
            data,
            plan,
            remaining,
            subscription
          );
          await subscription.increment(
            {
              ...(data.company > 0 && { company: data.company }),
              ...(data.counter > 0 && { counter: data.counter }),
              ...(price && { price }),
            },
            { transaction }
          );
          await subscription.reload({ transaction });
          //if user already has no retail xpress and he adds it on addon
          if (data.retailXpressWithTaxgo && !subscription.retailXpressWithTaxgo) {
            subscription.set({ retailXpressWithTaxgo: true });
            await subscription.save({ transaction });
            await subscription.reload({ transaction });
          }
           else if (data.retailXpressWithTaxgo && subscription.retailXpressWithTaxgo) {
            throw new ServiceUnavailableException(
              "You've Already purchased Retail Xpress"
            );
          }

           //if user already has no sole trader access and he adds it on addon
           if (data.soleTrader && !subscription.soleTrader) {
            subscription.set({ soleTrader: true });
            await subscription.save({ transaction });
            await subscription.reload({ transaction });
          } 
          else if (data.soleTrader && subscription.soleTrader) {
            throw new ServiceUnavailableException(
              "You've Already purchased Sole trader version"
            );
          }
          return { price, subscription, remaining };
        }
      );

      return new CommonResponseDto(result, true, "Successfully Created");
    } catch (err) {
      // if (err instanceof HttpException)
      console.log(err,);
      throw err;
      // throw new InternalServerErrorException();
    }
  }

  async getPriceDetails( userId:number,data: GetPricingDto) {
    try {
      const { period,currencyCode } = data;

      if(data?.addon){
        const subscription = await Subscriptions.findOne({ where: { userId } });
        if (!subscription)
          throw new NotFoundException(
            "No Subscription has been found for this user."
          );
          const endDate = new Date(subscription.subscriptionExpiry);
          const remaining = differenceInMonths(endDate);
          if (remaining <= 0)
            throw new ServiceUnavailableException("your plan has been expired");

          const plan = await Plan.findOne({
            where: { period:subscription.period,currencyCode:currencyCode.toUpperCase()  }, // currencyCode
          });

          const price = this.calculateAddon(data, plan, remaining, subscription);
          return new CommonResponseDto(
            this.getResponse(data, price),
            true,
            `Price calculated for ${remaining} month`
          );
      }

      const plan = await Plan.findOne({
        where: { period,currencyCode:currencyCode.toUpperCase() },
      });

      if (!plan) throw new NotFoundException("Please select a Valid plan");

      const prices = this.calculatePrice(data, plan);
      return new CommonResponseDto(
        this.getResponse(data, prices),
        true,
        `Price calculated for ${data.period} months `
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  calculatePrice(
    basePlan: CreateSubscriptionsDto | GetPricingDto,
    pricings: Plan
  ): responseType {
    let totalPrice = 0;
    let companyPrice = 0;
    let counterPrice = 0;
    let retailXpressWithTaxgoPrice = 0;
    let soleTraderPrice = 0;
    const { company, counter, retailXpressWithTaxgo, soleTrader, period } = basePlan;
    if (isNaN(company) == false)
      companyPrice = company * (pricings?.company * period);
    if (isNaN(counter) == false)
      counterPrice = counter * (pricings?.counter * period);
    if (retailXpressWithTaxgo) {
      retailXpressWithTaxgoPrice = pricings?.retailXpressWithTaxgo * period;
    }
    if (soleTrader) {
      soleTraderPrice = pricings?.soleTrader * period;
    }
    totalPrice = companyPrice + counterPrice + retailXpressWithTaxgoPrice + soleTraderPrice;
    return {
      totalPrice,
      companyPrice,
      retailXpressWithTaxgoPrice,
      soleTraderPrice,
      counterPrice,
      period,
    };
  }

  calculatePriceRenewal(
    newPlan: CreateSubscriptionsDto | GetPricingDto,
    pricings: Plan,
    subscription: Subscriptions
  ): responseType {
    let totalPrice = 0;
    let companyPrice = 0;
    let counterPrice = 0;
    let retailXpressWithTaxgoPrice = 0;
    let soleTraderPrice = 0;
    const {
      counter: baseCounter,
      company: baseCompany,
      retailXpressWithTaxgo: baseretailXpressWithTaxgo,
      soleTrader : baseSoleTrader,
    } = subscription;

    const { company, counter, retailXpressWithTaxgo, soleTrader, period } = newPlan;
    const finalCompany = baseCompany + company;
    const finalCounter = baseCounter + counter;
    const finalretailXpressWithTaxgo = baseretailXpressWithTaxgo
      ? baseretailXpressWithTaxgo
      : retailXpressWithTaxgo;
      const finalSoleTrader = baseSoleTrader
      ? baseSoleTrader
      : soleTrader;

    if (isNaN(finalCompany) == false)
      companyPrice = finalCompany * (pricings?.company * period);
    if (isNaN(finalCounter) == false)
      counterPrice = finalCounter * (pricings?.counter * period);
    if (finalretailXpressWithTaxgo == true) {
      retailXpressWithTaxgoPrice = pricings?.retailXpressWithTaxgo * period;
    }
    if (finalSoleTrader == true) {
      soleTraderPrice = pricings?.soleTrader * period;
    }
    totalPrice = companyPrice + counterPrice + retailXpressWithTaxgoPrice + soleTraderPrice;
    return {
      totalPrice,
      companyPrice,
      retailXpressWithTaxgoPrice,
      soleTraderPrice,
      counterPrice,
      period,
    };
  }

  calculateAddon(
    addOn: any,
    pricings: Plan,
    period: number,
    subscription: Subscriptions
  ): responseType {
    let totalPrice = 0;
    let companyPrice = 0;
    let counterPrice = 0;
    let retailXpressWithTaxgoPrice = 0;
    let soleTraderPrice = 0;
    const {
      company: addOnCompany,
      counter: addOnCounter,
      retailXpressWithTaxgo: addOnretailXpressWithTaxgo,
      soleTrader: addOnSoleTrader,
    } = addOn;
    if (isNaN(addOnCompany) == false)
      companyPrice = addOnCompany * (pricings?.company * period);
    if (isNaN(addOnCounter) == false)
      counterPrice = addOnCounter * (pricings?.counter * period);
    if (addOnretailXpressWithTaxgo == true && !subscription?.retailXpressWithTaxgo) {
      retailXpressWithTaxgoPrice = pricings?.retailXpressWithTaxgo * period;
    }
    if (addOnSoleTrader == true && !subscription?.soleTrader) {
      soleTraderPrice = pricings?.soleTrader * period;
    }
    totalPrice = companyPrice + counterPrice + retailXpressWithTaxgoPrice + soleTraderPrice;
    return {
      totalPrice,
      companyPrice,
      retailXpressWithTaxgoPrice,
      soleTraderPrice,
      counterPrice,
      period,
    };
  }

  getResponse(
    data: GetPricingDto,
    pricings: responseType,
    subsription: Subscriptions | null = null
  ) {
    return {
      company: {
        count: subsription
          ? data?.company + subsription?.company
          : data?.company,
        price: pricings?.companyPrice,
      },
      counter: {
        count: subsription
          ? data?.counter + subsription?.counter
          : data?.counter,
        price: pricings?.counterPrice,
      },
      retailXpressWithTaxgo: {
        status: pricings?.retailXpressWithTaxgoPrice > 0 ? true : false,
        price: pricings?.retailXpressWithTaxgoPrice,
      },
      soleTrader: {
        status: pricings?.soleTraderPrice > 0 ? true : false,
        price: pricings?.soleTraderPrice,
      },
      totalPrice: pricings?.totalPrice,
      period: pricings?.period,
    };
  }
}
