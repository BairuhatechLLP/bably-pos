import { Inject, Injectable } from "@nestjs/common";
import { OrderItems } from "./order_items.entity";
import { OrderItemDto } from "./dto/create.dto";
import { Op, Transaction } from "sequelize";
import { ProductMaster } from "../product_master/product_master";
import { UpdateOrderItemDto } from "./dto/update.dto";

@Injectable()
export class OrderItemsService {
  constructor(
    @Inject("OrderItemsRepository")
    private readonly orderItemsRepository: typeof OrderItems
  ) {}
  async createByOrder(
    body: OrderItemDto,
    orderId: number,
    transaction: Transaction
  ) {
    try {
      const product = await ProductMaster.findByPk(body?.productId);
      if (!product) {
        throw new Error("No product Found");
      }
      const orderedProductCount = await this.orderItemsRepository.sum(
        "quantity",
        {
          where: {
            orderStatus: {
              [Op.notIn]: ["cancelled", "billed"],
            },
            productId: body.productId,
          },
        }
      );
      if (body.quantity > product?.stock - orderedProductCount) {
        throw new Error(`${product.idescription} is out of stock`);
      }
      let obj = {
        // ...body,
        orderId: orderId,
        quantity: body?.quantity,
        idescription: body?.idescription,
        productId: body?.productId,
        sp_price: body?.sp_price,
        comb_id: body?.comb_id,
        ice_option: body?.ice_option,
        sugar_option: body?.sugar_option,
        parcel_option: body?.parcel_option,
        companyId: body?.companyId
      };
      const orderItem = await this.orderItemsRepository.create(obj, {
        transaction,
      });
      const result = {
        ...orderItem.get({ plain: true }),
        productName: product.get("idescription"),
      };
      return result;
    } catch (error) {
      console.log(error)
      throw new Error(error?.message);
    }
  }
  async updateByOrder(
    body: UpdateOrderItemDto,
    orderId: number,
    transaction: Transaction
  ) {
    try {
      const product = await ProductMaster.findByPk(body?.productId);
      if (!product) {
        throw new Error("No product Found");
      }
      const orderedProductCount = await this.orderItemsRepository.sum(
        "quantity",
        {
          where: {
            orderId: { [Op.notIn]: [body.productId] },
            orderStatus: {
              [Op.notIn]: ["cancelled", "billed"],
            },
            productId: body.productId,
          },
        }
      );
      if (body.quantity > product?.stock - orderedProductCount) {
        throw new Error(`${product.idescription} is out of stock`);
      }
      let obj = {
        ...body,
        orderId: orderId,
        orderStatus: "pending",
      };
      let result: any;
      const orderItem = await this.orderItemsRepository.upsert(obj, {
        transaction,
      });
      result = {
        ...orderItem[0].get({ plain: true }), // Convert orderItem to plain object
        productName: product.get("idescription"), // Add productName from product
      };
      return result;
    } catch (error) {
      throw new Error(error?.message);
    }
  }
}
