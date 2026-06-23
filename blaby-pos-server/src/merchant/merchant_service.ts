import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { NOTFOUND } from 'dns';
import { Op, Sequelize, where } from 'sequelize';
import moment from 'moment';
import { Merchant } from './merchant_entity';
import { MerchantDto } from './dto/merchant_dto';
import { UpdateMerchantDto } from './dto/merchant_update';

@Injectable()
export class MerchantService {
  constructor(
    @Inject('MerchantRepository')
    private readonly MerchantRepository: typeof Merchant,
  ) {}

  async findAll() {
    try {
      const allList = await this.MerchantRepository.findAll<Merchant>({});
      const data = allList.map((item) => new MerchantDto(item));
      return {
        data,
      };
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async findById(id: number) {
    try {
      const data = await this.MerchantRepository.findByPk<Merchant>(id, {});
      if (!data) {
        throw new HttpException('No ID found', HttpStatus.NOT_FOUND);
      }
      return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete(id: number) {
    try {
      const result = await this.findById(id);
      await result.destroy();
      return result;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(data: any) {
    try {
      const merchant = new Merchant();
      merchant.merchand_id = data.merchand_id;
      merchant.account_type = data.account_type;
      merchant.account_name = data.account_name;
      merchant.private_key = data.private_key;
      merchant.registered_id = data.registered_id;
      merchant.registered_name = data.registered_name;
      merchant.type = data.type;
      merchant.user_id = data.user_id;
      merchant.vendor_name = data.vendor_name;
      merchant.pos_vendor_name = data.pos_vendor_name;
      merchant.device_id = data.device_id;
      merchant.pos_registered_id = data.pos_registered_id;
      merchant.pos_registered_name = data.pos_registered_name;
      merchant.pos_business_name = data.pos_business_name;
      const newdata = await merchant.save();
      return newdata;
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async update(id: number, data: UpdateMerchantDto) {
    try {
      const merchant = await this.findById(id);
      merchant.merchand_id = data.merchand_id;
      merchant.account_type = data.account_type;
      merchant.account_name = data.account_name;
      merchant.private_key = data.private_key;
      merchant.registered_id = data.registered_id;
      merchant.registered_name = data.registered_name;
      merchant.type = data.type;
      merchant.user_id = data.user_id;
      merchant.vendor_name = data.vendor_name;
      merchant.pos_vendor_name = data.pos_vendor_name;
      merchant.device_id = data.device_id;
      merchant.pos_registered_id = data.pos_registered_id;
      merchant.pos_registered_name = data.pos_registered_name;
      merchant.pos_business_name = data.pos_business_name;
      return merchant.save();
    } catch (error) {
      console.log(error)
      throw error
    }
   
  }
}
