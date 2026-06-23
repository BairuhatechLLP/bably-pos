import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
  Inject,
  UnauthorizedException,
  HttpException,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { decode } from "jsonwebtoken";
import { CompanyMaster } from "../../company_master/company_master_entity";
import { Subscriptions } from "../../subscriptions/subscriptions.entity";

@Injectable()
export class CreateCompanyInterceptor implements NestInterceptor {
  constructor(
    @Inject("SubscriptionsRepository")
    private readonly subscriptions: typeof Subscriptions,
    @Inject("CompanyMasterRepository")
    private readonly companyMaster: typeof CompanyMaster
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    //we'll get the token from the request object header (bearer token)
    const token = this.extractTokenFromHeader(request);
    if (!token || token.length <= 10) {
      throw new UnauthorizedException("You don't have access to this service");
    } else {
      //if token is present we'll decode it
      try {
        const decoded: any = decode(token);
        //getting the userid from the token
        const subscriptionDetails = await this.subscriptions.findOne({
          attributes: ["company"],
          where: { userId: decoded?.userId },
        });
        if (!subscriptionDetails)
          throw new UnauthorizedException(
            "You don't have a valid subscription."
          );
        //getting the number of companies the user already have from companymaster
        const companies = await this.companyMaster.count({
          where: { adminid: decoded?.userId },
        });
        //if the number of companies user has is more than or equal to his subscription limit then reject
        if (companies >= subscriptionDetails?.company) {
          throw new ServiceUnavailableException(
            `You can only add ${subscriptionDetails?.company} companies. Use add-on to add more company.`
          );
        }
      } catch (err) {
        if (err instanceof HttpException) throw err;
        throw new UnauthorizedException();
      }
    }

    return next.handle().pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
