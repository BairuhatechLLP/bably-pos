import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { User } from "./user.entity";
import { genSalt, hash, compare } from "bcrypt";
import { UserDto } from "./dto/user.dto";
import { UserLoginRequestDto } from "./dto/user-login-request.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserLoginResponseDto } from "./dto/user-login-response.dto";
import config from "../../config";
import { sign } from "jsonwebtoken";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ConfigService } from "../shared/config/config.service";
import { Subscriptions } from "../subscriptions/subscriptions.entity";

@Injectable()
export class UsersService {
  private readonly jwtPrivateKey: string;

  constructor(
    @Inject("UsersRepository")
    private readonly usersRepository: typeof User,
    private readonly configService: ConfigService
  ) {
    this.jwtPrivateKey = this.configService.jwtConfig.privateKey;
  }

  async findAll() {
    try {
      const users = await this.usersRepository.findAll<User>();
      return users.map((user) => new UserDto(user));
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.usersRepository.findByPk<User>(id);
      if (!user) {
        throw new HttpException(
          "User with given id not found",
          HttpStatus.NOT_FOUND
        );
      }
      return new UserDto(user);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.usersRepository.findOne<User>({
        where: { email },
      });
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = new User();
      user.email = createUserDto.email.trim().toLowerCase();
      user.fullName = createUserDto.fullName;

      const salt = await genSalt(10);
      user.password = await hash(createUserDto.password, salt);

      const userData = await user.save();

      // when registering then log user in automatically by returning a token
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.signToken(userData, subscription);
      return new UserLoginResponseDto(userData, token);
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async login(userLoginRequestDto: UserLoginRequestDto) {
    try {
      const email = userLoginRequestDto.email;
      const password = userLoginRequestDto.password;
  
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new HttpException(
          "Invalid email or password.",
          HttpStatus.BAD_REQUEST
        );
      }
  
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        throw new HttpException(
          "Invalid email or password.",
          HttpStatus.BAD_REQUEST
        );
      }
      const subscription = await Subscriptions.findOne({
        where: { userId: user?.id },
      });
      const token = await this.signToken(user, subscription);
      return new UserLoginResponseDto(user, token);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findByPk<User>(id);
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }
  
      user.fullName = updateUserDto.fullName || user.fullName;
      const data = await user.save();
      return new UserDto(data);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      const user = await this.usersRepository.findByPk<User>(id);
      await user.destroy();
      return new UserDto(user);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async signToken(user: any, subscription: Subscriptions | null = null) {
    const payload: any = {
      email: user?.email,
      subscriptionExpiry: subscription
        ? subscription?.subscriptionExpiry
        : null,
      userId: user?.id,
    };

    return sign(payload, this.jwtPrivateKey, {
      expiresIn: config.SESSION_EXPIRY,
  });
  }
}
