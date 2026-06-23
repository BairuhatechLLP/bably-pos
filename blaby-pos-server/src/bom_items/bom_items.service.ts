import { Inject, Injectable } from "@nestjs/common";
import { BomItems } from "./bom_items.entity";
import { BomItemDto } from "./dto/createBomItem.dto";
import { Transaction } from "sequelize";
import { ProductMaster } from "../product_master/product_master";
import { UpdateBomItemDto } from "./dto/updateBomItem.dto";

@Injectable()
export class BomItemsService {
  constructor(
    @Inject("BomItemsRepository")
    private readonly bomItemsRepository: typeof BomItems
  ) {}
  async createByBomMaster(
    body: BomItemDto,
    companyId: number,
    userId: number,
    transaction: Transaction
  ) {
    try {
      const product = await ProductMaster.findOne({
        where: {
          companyid: companyId,
          adminid: userId,
          id: body?.productId,
        },
      });
      if (!product) {
        throw new Error(`Invalid Product in ${body?.type}@@`);
      }
      const bomItemCreated = await this.bomItemsRepository.create(body, {
        transaction,
      });
      return bomItemCreated;
    } catch (error) {
      throw new Error(error?.message);
    }
  }
  async updateByBomMaster(
    body: UpdateBomItemDto,
    companyId: number,
    userId: number,
    transaction: Transaction
  ) {
    try {
      if (body?.productId) {
        const product = await ProductMaster.findOne({
          where: {
            companyid: companyId,
            adminid: userId,
            id: body?.productId,
          },
        });
        if (!product) {
          throw new Error(`Invalid Product in ${body?.type}@@`);
        }
      }
      let obj = {
        ...body,
        
      };
      let result: any;
      const bomItems = await this.bomItemsRepository.upsert(obj, {
        transaction,
      });
      result = {
        ...bomItems[0].get({ plain: true }), // Convert orderItem to plain object
      };
      return result;
    } catch (error) {
      throw new Error(error?.message);
    }
  }
}
