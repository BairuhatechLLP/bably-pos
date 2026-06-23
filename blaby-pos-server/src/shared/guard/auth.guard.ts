import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ServiceUnavailableException,
    UnauthorizedException,
  } from "@nestjs/common";
  import { JwtService } from "@nestjs/jwt";
  import { config } from "../../../config/envconfig";
  import { getErrorMessage } from "../helpers/errormessage";
import { Reflector } from "@nestjs/core";
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<any> {
      const request = context.switchToHttp().getRequest();

      // allow public requests
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [context.getClass(),context.getHandler()]);
      if (isPublic) {
        return true;
      }

      //getting the token from header
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException(
          "You do not have permission to access this resource. Please make sure you are logged in with the correct credentials."
        );
      }
      try {
        //extracting payload from the token
        const payload = await this.jwtService.verifyAsync(token, {
          secret: config.jwtPrivateKey,
        });

        request["userId"] = payload?.userId ?? undefined;

      //    // allow subscription free requests
      // const isFree = this.reflector.getAllAndOverride<boolean>('isFree', [context.getClass(),context.getHandler()]);
      // if (isFree) {
      //   return true;
      // }

      //   let currentDate = new Date();
      //   let subscriptionEndDate = new Date(payload.subscriptionExpiry);
      //   if(payload.subscriptionExpiry === null ){
      //    throw new ServiceUnavailableException("You are not subscribed to any plans. Please subscribe to continue")
      //   }
      //   if(subscriptionEndDate < currentDate){
      //     throw new ServiceUnavailableException(
      //       "Your subscription plan has expired. Please renew your subscription plan."
      //     );
      //   }
  
        
      } catch (err) {
        if (err.name == "TokenExpiredError") {
          throw new UnauthorizedException(
            "Your Session has been Expired. Please Re-login"
          );
        } else if (err.name?.includes("Token")) {
          throw new UnauthorizedException("Invalid Token Please Sign in");
        } else {
          throw new UnauthorizedException(getErrorMessage(err));
        }
      }
      return true;
    }
  
    private extractTokenFromHeader(request: any): string | undefined {
      const [type, token] = request.headers?.authorization?.split(" ") ?? [];
      return type === "Bearer" ? token : undefined;
    }
  }
  