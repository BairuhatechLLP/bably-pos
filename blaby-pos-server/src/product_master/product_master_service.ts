import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { S3 } from "aws-sdk";
import { Op, where } from "sequelize";
import { DataType, Sequelize } from "sequelize-typescript";
import xlsx from "xlsx";
import { AccountMasterService } from "../account_master/account_master_service";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { InvoiceItemsService } from "../invoice_item/invoice_item_service";
import { MailService } from "../mail/mail_service";
import { ConfigService } from "../shared/config/config.service";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { unit } from "../units/unit.entity";
import { User } from "../users/user.entity";
import { CreateProductMasterDto } from "./dto/product_master_create";
import { ProductMasterDto } from "./dto/product_master_dto";
import { ProductMaster } from "./product_master";
import { ProductCategory } from "../product_category/product_category_entity";
import { ProductLocationMasterService } from "../product_location_master/product_location.service";
import { LocationMaster } from "../locations/location.entity";
import { CategoryType } from "../product_category/dto/product_category_create";
import { DatabaseService } from "../database/database.service";
@Injectable()
export class ProductMasterService {
  constructor(
    @Inject("ProductMasterRepository")
    private readonly ProductMasterRepository: typeof ProductMaster,
    private readonly configService: ConfigService,
    @Inject(MailService)
    private readonly mailService: MailService,
    @Inject("PurchaseInvoiceRepository")
    @Inject(InvoiceItemsService)
    private readonly invoiceItemsService: InvoiceItemsService,
    @Inject(forwardRef(() => AccountMasterService))
    private readonly defualt_ledger: AccountMasterService,
    @Inject(forwardRef(() => ProductLocationMasterService))
    private readonly productLocationService: ProductLocationMasterService,
    private readonly databaseService: DatabaseService
  ) {}

  async calculateOpeningingCost(adminid, sdate) {
    try {
      const products =
        await this.ProductMasterRepository.findAll<ProductMaster>({
          attributes: ["stock", "costprice", "vat"],
          where: {
            adminid: adminid,
            date: {
              [Op.lt]: sdate,
            },
          },
          raw: true,
        });
      const totalCost = products.map((product) => {
        let productCost =
          Number(product.costprice) +
          (Number(product.vat) * Number(product.costprice)) / 100;
        return Number(product.stock) * Number(productCost);
      });

      const sumTotalCost = totalCost.reduce(
        (acc, currentCost) => acc + currentCost,
        0
      );
      return sumTotalCost;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllList() {
    try {
      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        include: [
          {
            model: User,
            attributes: ["id", "name", "email", "mobile"],
          },
        ],
        where: { active: true, is_deleted: false },
      });

      return data.map((tmp) => new ProductMasterDto(tmp));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp =
        await this.ProductMasterRepository.findAndCountAll<ProductMaster>({
          include: [
            {
              model: User,
            },
          ],
          where: { active: true, is_deleted: false },
          limit: pageOptionsDto.take,
          offset: skip,
          order: [["userid", pageOptionsDto.order]],
        });

      const entities = exp.rows.map((ctry) => new ProductMasterDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto, true, "Success");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllByAdminId(id: number, companyid: any) {
    try {
      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: { adminid: id, companyid, is_deleted: false  },
      });
      return data.map((tmp) => new ProductMasterDto(tmp));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const product =
        await this.ProductMasterRepository.findByPk<ProductMaster>(id, {
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
            {
              model: ProductCategory,
              as: "productCategory",
            },
            {
              model: unit,
              as: "unitDetails",
            },
          ],
        });
      if (!product) {
        throw new HttpException(
          { message: "No user product  one found" },
          HttpStatus.OK
        );
      }
      return new CommonResponseDto(product, true, "Product Details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByHsnCode(companyid: number, hsnCode: string) {
    try {
      const productList = await this.findAllByQuery({
        where: {
          companyid,
          hsn_code: hsnCode,
          is_deleted: false 
        },
      });
      return new CommonResponseDto(
        productList,
        true,
        "Product list by hsn code"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByQuery(id: number, query: any) {
    try {
      const product =
        await this.ProductMasterRepository.findByPk<ProductMaster>(id, query);
      if (!product) {
        throw new HttpException(
          { message: "No user product one query found" },
          HttpStatus.OK
        );
      }
      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByQuery(query: any) {
    try {
      const data = await this.ProductMasterRepository.findAll<ProductMaster>(
        query
      );
      if (!data) {
        throw new HttpException(
          { message: "No user product all query found" },
          HttpStatus.OK
        );
      }
      return data.map((tmp) => new ProductMasterDto(tmp));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByAdminId(id: number, companyid: number) {
    try {
      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: { adminid: id, companyid, is_deleted: false },
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
          {
            model: ProductCategory,
            as: "productCategory",
          },
        ],
      });
      return new CommonResponseDto(data, true, "Product List");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByCompanyId(companyid: number, type: string) {
    try {
      let itemtype = {};
      if (type === "both") {
        itemtype = { [Op.or]: ["Stock", "Nonstock"] };
      } else if (type === "all") {
        itemtype = { [Op.or]: ["Stock", "Nonstock", "Service"] };
      } else {
        itemtype = type;
      }

      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: { itemtype: itemtype, companyid, is_deleted: false },
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
        order: [["id", "DESC"]],
      });
      return new CommonResponseDto(
        data.map((tmp) => new ProductMasterDto(tmp)),
        true,
        "Product List"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllStockAndnonstockvalue(id: number, companyid: number) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        companyid,
        itemtype: { [Op.in]: ["Nonstock", "Stock"] },
        [Op.or]: [
          { stock: { [Op.gt]: 0 } },
          { stockquantity: { [Op.gt]: 0 } },
          { is_deleted: null },
          { is_deleted: false },
        ],
      };
      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
      });
      return new CommonResponseDto(
        data.map((tmp) => new ProductMasterDto(tmp)),
        true,
        "Product List"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllStockAndnonstock1(id: number) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        is_deleted: {
          [Op.or]: [null, false],
        },
        itemtype: {
          [Op.or]: ["Stock", "Nonstock"],
        },
        stock: {
          [Op.gt]: 0,
        },
      };

      const products =
        await this.ProductMasterRepository.findAll<ProductMaster>({
          where: whereCondition,
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
          ],
        });

      if (products && products?.length) {
        let arr = [];
        let len = products?.length;

        for (let i = 0; i < len; i++) {
          let invoiceItems: any = await this.invoiceItemsService.findAllByQuery(
            {
              where: {
                idescription: products[i].id,
                type: ["Purchase Invoice", "Sales Invoice"],
              },
            }
          );

          let salesQuantity = invoiceItems
            ?.filter((item: any) => item?.type === "Sales Invoice")
            .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

          let purchaseQuantity = invoiceItems
            ?.filter((item: any) => item?.type === "Purchase Invoice")
            .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

          const salesPrice = invoiceItems
            .filter((item: any) => item.type === "Sales Invoice")
            .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

          const purchasePrice = invoiceItems
            .filter((item: any) => item.type === "Purchase Invoice")
            .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

          let obj = {
            salesQuantity,
            purchaseQuantity,
            salesPrice,
            purchasePrice,
          };
        }
      } else {
        return [];
      }

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllStockAndnonstock(id: number) {
    try {
      let whereCondition: any;
      whereCondition = {
        adminid: id,
        [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        itemtype: { [Op.or]: ["Stock", "Nonstock"] },
        stock: { [Op.gt]: 0 },
      };

      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
      });

      let arr = [];
      for (let i = 0; i < data.length; i++) {
        const datapurchase: any = await this.invoiceItemsService.findAllByQuery(
          {
            where: {
              idescription: data[i].id,
              type: ["Purchase Invoice", "Sales Invoice"],
            },
          }
        );

        const purchaseQuantity = datapurchase
          .filter((item: any) => item.type === "Purchase Invoice")
          .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

        const purchasecostprice = datapurchase
          .filter((item: any) => item.type === "Purchase Invoice")
          .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

        const salesQuantity = datapurchase
          .filter((item: any) => item.type === "Sales Invoice")
          .reduce((qty: any, item: any) => qty + Number(item.quantity), 0);

        const salescostprice = datapurchase
          .filter((item: any) => item.type === "Sales Invoice")
          .reduce((cost: any, item: any) => cost + Number(item.costprice), 0);

        let totalqty =
          Number(data[i].stock) +
          Number(purchaseQuantity) -
          Number(salesQuantity);

        let totalcostprice =
          Number(data[i].costprice) +
          Number(purchasecostprice) -
          Number(salescostprice);

        let totalrate = Number(totalcostprice) / Number(totalqty);
        let obj = {
          id: data[i].id,
          quantity: totalqty,
          costprice: totalcostprice,
          idescription: data[i].idescription,
          itemtype: data[i].product_category,
          rate: totalrate,
        };
        arr.push(obj);
      }
      return arr;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByAdminIdAndType(type: string, id: number, companyid: number) {
    try {
      let whereCondition = {};
      if (type === "Stock") {
        whereCondition = {
          adminid: id,
          itemtype: type,
          companyid,
          [Op.or]: [
            { stock: { [Op.gt]: 0 } },
            { stockquantity: { [Op.gt]: 0 } },
            { is_deleted: null },
            { is_deleted: false },
          ],
        };
      } else if (type === "both") {
        whereCondition = {
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          adminid: id,
          companyid,
          itemtype: { [Op.in]: ["Stock", "Nonstock"] },
        };
      } else if (type === "non-assets") {
        whereCondition = {
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          adminid: id,
          companyid,
          itemtype: { [Op.ne]: ["Asset"] },
        };
      } else if (type === "Nonstock") {
        whereCondition = {
          adminid: id,
          companyid,
          [Op.or]: [
            { itemtype: type },
            {
              itemtype: "Stock",
              stock: {
                [Op.lte]: 0,
              },
            },
            {
              itemtype: "Stock",
              stock: null,
            },
            { is_deleted: null },
            { is_deleted: false },
          ],
        };
      } else if (type === "Service") {
        whereCondition = {
          adminid: id,
          companyid,
          itemtype: "Service",
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        };
      } else {
        whereCondition = {
          adminid: id,
          companyid,
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        };
      }
      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
          {
            model: ProductCategory,
            as: "productCategory",
          },
          {
            model: unit,
            as: "unitDetails",
          },
        ],
        order: [["id", "DESC"]],
      });

      return new CommonResponseDto(data, true, "Product List");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findProductById(body: any) {
    try {
      const data = await this.ProductMasterRepository.findAll({
        where: {
          id: { [Op.in]: body },
        },
        raw: true,
      });
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findAllByAdminIdAndTypeRetail(
    body: any,
    pageOptionsDto: PageOptionsDto
  ) {
    try {
      const skip =
        Number(pageOptionsDto.page - 1) * Number(pageOptionsDto.take);
      let whereCondition = {
        [Op.and]: [
          { [Op.or]: [{ is_deleted: null }, { is_deleted: false }] },
          { adminid: body.id },
          { companyid: body?.companyid },
        ],
      };

      // if (body?.type === "Stock" && !body?.location) {
      //   return new CommonResponseDto([], false, "Location id not provided");
      // }
      if (body.barcode) {
        whereCondition["barcode"] = body.barcode;
      }
      // if (body?.location) {
      //   whereCondition["location"] = body?.location;
      // }
      if (body.category) {
        whereCondition["product_category"] = body.category;
      }
      if (body.name && body.type) {
        whereCondition[Op.or] = [
          {
            [Op.and]: [
              {
                [Op.or]: [
                  { idescription: { [Op.like]: `%${body.name}%` } },
                  { barcode: body?.name },
                ],
              },
              {
                itemtype:
                  body.type === "Stock"
                    ? "Stock"
                    : body.type === "Service"
                    ? "Service"
                    : { [Op.in]: ["Stock", "Nonstock"] },
              },
            ],
          },
        ];
      } else if (body.name) {
        whereCondition[Op.or] = [
          { idescription: { [Op.like]: `%${body.name}%` } },
          { barcode: body?.name },
        ];
      } else if (body.type === "Stock") {
        whereCondition["itemtype"] = "Stock";
        whereCondition[Op.or] = [{ stock: { [Op.gt]: 0 } }];
      }

      if (body.type === "both") {
        whereCondition["itemtype"] = { [Op.in]: ["Stock", "Nonstock"] };
      }
      if (body.type === "non-assets") {
        whereCondition["itemtype"] = { [Op.ne]: ["Asset"] };
      }
      if (body.type === "Nonstock") {
        whereCondition[Op.or] = [
          { itemtype: body.type },
          {
            itemtype: "Stock",
            stock: {
              [Op.lte]: 0,
            },
          },
          {
            itemtype: "Stock",
            stock: null,
          },
        ];
      }
      if (body.type === "Service") {
        whereCondition["itemtype"] = "Service";
      }
      if (body.category) {
        whereCondition["product_category"] = body.category;
      }
      if (body.description) {
        whereCondition["idescription"] = body.description;
      }
      const data =
        await this.ProductMasterRepository.findAndCountAll<ProductMaster>({
          attributes: [
            "id",
            "itemtype",
            "icode",
            "idescription",
            "product_category",
            "barcode",
            "userid",
            "quantity",
            "vatamt",
            "includevat",
            "costprice",
            "adminid",
            "vat",
            "is_deleted",
            "createdAt",
            "updatedAt",
            "rate",
            "pimage",
            "stockquantity",
            "stock",
            "vatamt",
            "unit",
            "parcel_charge",
          ],
          where: whereCondition,
          include: [{ model: unit }, { model: ProductCategory }],
          limit: Number(pageOptionsDto.take),
          offset: skip,
          order: [["id", pageOptionsDto.order]],
        });

      const entities = data.rows;
      const itemCount = data.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto, true, "Success");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findAllByKitchenOrder(body: any, pageOptionsDto: PageOptionsDto) {
    try {
      const skip =
        Number(pageOptionsDto.page - 1) * Number(pageOptionsDto.take);
      let whereCondition: any = {
        [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        adminid: body.id,
        companyid: body?.companyid,
      };

      if (body.category) {
        whereCondition["product_category"] = body.category;
      }
      if (body.name && body.type) {
        whereCondition[Op.or] = [
          {
            [Op.and]: [
              {
                [Op.or]: [
                  { idescription: { [Op.like]: `%${body.name}%` } },
                  { sp_price: body?.name },
                ],
              },
              {
                itemtype:
                  body.type === "Stock"
                    ? "Stock"
                    : body.type === "Service"
                    ? "Service"
                    : { [Op.in]: ["Stock", "Nonstock"] },
              },
            ],
          },
        ];
      } else if (body.name) {
        whereCondition[Op.or] = [
          { idescription: { [Op.like]: `%${body.name}%` } },
          { barcode: body?.name },
        ];
      } else if (body.type === "Stock") {
        whereCondition["itemtype"] = "Stock";
        whereCondition[Op.and] = [
          Sequelize.literal(`stock - IFNULL((
          SELECT SUM(oi.quantity)
          FROM order_items AS oi
          WHERE oi.productId = ProductMaster.id
          AND oi.orderStatus NOT IN ('cancelled', 'billed')
          GROUP BY oi.productId
      ), 0) > 0`),
        ];
      }

      if (body.type === "both") {
        whereCondition["itemtype"] = { [Op.in]: ["Stock", "Nonstock"] };
      }
      if (body.type === "non-assets") {
        whereCondition["itemtype"] = { [Op.ne]: ["Asset"] };
      }
      if (body.type === "Nonstock") {
        whereCondition[Op.or] = [
          { itemtype: body.type },
          {
            itemtype: "Stock",
            stock: {
              [Op.lte]: 0,
            },
          },
          {
            itemtype: "Stock",
            stock: null,
          },
        ];
      }
      if (body.type === "Service") {
        whereCondition["itemtype"] = "Service";
      }
      if (body.category) {
        whereCondition["product_category"] = body.category;
      }
      if (body.description) {
        whereCondition["idescription"] = body.description;
      }
      if (body.barcode) {
        whereCondition["barcode"] = { [Op.like]: `${body.barcode}%` };
      }
      const data =
        await this.ProductMasterRepository.findAndCountAll<ProductMaster>({
          attributes: {
            include: [
              "id",
              "itemtype",
              "icode",
              "idescription",
              "product_category",
              "barcode",
              "userid",
              "quantity",
              "vatamt",
              "includevat",
              "costprice",
              "adminid",
              "vat",
              "is_deleted",
              "createdAt",
              "updatedAt",
              "rate",
              "pimage",
              "stockquantity",
              "stock",
              "vatamt",
              "unit",
              "taxable_amount",
              [
                Sequelize.literal(`stock - IFNULL((
                    SELECT SUM(oi.quantity)
                    FROM order_items AS oi
                    WHERE oi.productId = ProductMaster.id
                      AND oi.orderStatus NOT IN ('cancelled', 'billed')
                    GROUP BY oi.productId
                  ), 0)`),
                "remainingStock",
              ],
            ],
          },
          distinct: true, // Ensure distinct records
          col: "id",
          where: whereCondition,
          include: { model: unit },
          limit: Number(pageOptionsDto.take),
          offset: skip,
          order: [["sp_price", "ASC"]],
          //logging: console.log,
        });

      const entities = data.rows;
      const itemCount = data.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto, true, "success");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findByProductList(type: string, id: number) {
    try {
      let whereCondition = {};
      if (type === "Stock") {
        whereCondition = {
          adminid: id,
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          itemtype: type,
          stock: {
            [Op.gt]: 0,
          },
        };
      } else if (type === "Nonstock") {
        whereCondition = {
          adminid: id,
          itemtype: type,
          stock: {
            [Op.or]: [
              {
                [Op.lte]: 0,
              },
              null,
            ],
          },
          is_deleted: { [Op.or]: [null, false] },
        };
      } else {
        whereCondition = {
          adminid: id,
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        };
      }

      const value = await this.ProductMasterRepository.findAll<ProductMaster>(
        {}
      );
      return new CommonResponseDto(
        value.map((tmp) => new ProductMasterDto(tmp)),
        true,
        "Product List"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByAdminIdAndTypeList(
    type: string,
    id: number,
    companyid: number,
    pageOptionsDto
  ) {
    try {
      const skip =
        (Number(pageOptionsDto.page) - 1) * Number(pageOptionsDto.take);
      let whereCondition = {};
      if (type === "Stock") {
        whereCondition = {
          adminid: id,
          itemtype: type,
          companyid,
          [Op.or]: [
            { stock: { [Op.gt]: 0 } },
            { stockquantity: { [Op.gt]: 0 } },
            { is_deleted: null },
            { is_deleted: false },
          ],
        };
      } else if (type === "Nonstock") {
        whereCondition = {
          adminid: id,
          itemtype: type,
          companyid,
          stock: {
            [Op.or]: [
              {
                [Op.lte]: 0,
              },
              null,
            ],
          },
          is_deleted: { [Op.or]: [null, false] },
        };
      } else if (type === "Service") {
        whereCondition = {
          adminid: id,
          companyid,
          itemtype: "Service",
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        };
      } else if (type === "Asset") {
        whereCondition = {
          adminid: id,
          itemtype: "Asset",
          companyid,
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        };
      } else {
        whereCondition = {
          adminid: id,
          companyid,
          [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
        };
      }
      const { rows: data, count: itemCount } =
        await this.ProductMasterRepository.findAndCountAll({
          where: whereCondition,
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
            {
              model: ProductCategory,
              attributes: ["id", "category"],
            },
            {
              model: unit,
              attributes: ["id", "unit"],
            },
          ],
          offset: Number(skip),
          order: [["id", pageOptionsDto.order]],
          limit: Number(pageOptionsDto.take),
        });
      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(
        data,
        pageMetaDto,
        true,
        "Products fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findStockSendMail(id: any, email: any) {
    try {
      const data: any = await this.findOne(id);
      const resultArray = [];
      if (data.data.stock <= Number(data.data.rquantity)) {
        resultArray.push({
          idescription: data.data.idescription,
          stock: data.data.stock,
        });
      }
      const mailobj = {
        email: email,
        stockLimit: resultArray,
      };
      if (resultArray.length) {
        this.mailService.sentProductLimit(mailobj);
      }
      return "Mail send success";
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findstock(type: string, stockname: string, email: string, id: number) {
    try {
      let whereCondition = {};
      if (type === "Stock") {
        whereCondition = {
          adminid: id,
          itemtype: type,
          stock: {
            [Op.gt]: 0,
          },
        };
        const data = await this.ProductMasterRepository.findAll<ProductMaster>({
          where: whereCondition,
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
          ],
        });
        const idescriptionArray = [];
        const stockArray = [];
        const resultArray = [];
        data.forEach((item, index) => {
          if (item.stock <= 3) {
            if (item.idescription === stockname) {
              idescriptionArray.push(item.idescription.trim());
              stockArray.push(item.stock);
              resultArray.push({
                idescription: item.idescription.trim(),
                stock: item.stock,
              });
            }
          }
        });
        const mailobj = {
          email: email,
          stockLimit: resultArray,
        };
        if (resultArray.length) {
          this.mailService.sentProductLimit(mailobj);
        }
      } else if (type === "Nonstock") {
        whereCondition = {
          adminid: id,
          [Op.or]: [
            { itemtype: type },
            {
              itemtype: "Stock",
              stock: {
                [Op.lte]: 0,
              },
            },
            {
              itemtype: "Stock",
              stock: null,
            },
          ],
        };
      } else {
        whereCondition = {
          adminid: id,
          itemtype: type,
        };
      }
      const data = await this.ProductMasterRepository.findAll<ProductMaster>({
        where: whereCondition,
        include: [
          {
            model: ContactMaster,
            as: "supplier",
          },
        ],
      });

      return new CommonResponseDto(
        data.map((tmp) => new ProductMasterDto(tmp)),
        true,
        "Product List"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const product =
        await this.ProductMasterRepository.findByPk<ProductMaster>(id, {
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
          ],
        });
      if (!product) {
        throw new HttpException(
          { message: "No user product by id found" },
          HttpStatus.OK
        );
      }
      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createProductMasterDto: CreateProductMasterDto) {
    try {
      const product = new ProductMaster();
      const checkNominalCode = await this.ProductMasterRepository.findOne({
        where: {
          is_deleted: false,
          idescription: createProductMasterDto.idescription,
          adminid: createProductMasterDto.adminid,
          companyid: createProductMasterDto.companyid,
        },
      });

      if (checkNominalCode) {
        return new CommonResponseDto(null, false, "Item name already exists");
      }

      if (createProductMasterDto.itemtype !== "Asset") {
        const checkICode = await this.ProductMasterRepository.findOne({
          where: {
            is_deleted: false,
            icode: createProductMasterDto.icode,
            adminid: createProductMasterDto.adminid,
            companyid: createProductMasterDto.companyid,
          },
        });
        if (checkICode) {
          return new CommonResponseDto(null, false, "Item code already exists");
        }
      }

      product.itemtype = createProductMasterDto.itemtype;
      product.icode = createProductMasterDto.icode;
      product.idescription = createProductMasterDto.idescription;
      product.spname = createProductMasterDto.spname;
      product.ledgercategory = createProductMasterDto.ledgercategory;
      product.svrate = createProductMasterDto.svrate;
      product.sicode = createProductMasterDto.sicode;
      product.pdescription = createProductMasterDto.pdescription;
      product.pvrate = createProductMasterDto.pvrate;
      product.paccount = createProductMasterDto.paccount;
      product.location = createProductMasterDto.location;
      product.barcode = createProductMasterDto.barcode;
      product.weight = createProductMasterDto.weight;
      product.notes = createProductMasterDto.notes;
      product.userid = createProductMasterDto.userid;
      product.name = createProductMasterDto.name;
      product.ptype = createProductMasterDto.ptype;
      product.reason = createProductMasterDto.reason;
      product.userdate = createProductMasterDto.userdate;
      product.pimage = createProductMasterDto.pimage;
      product.qdate = createProductMasterDto.qdate;
      product.date = createProductMasterDto.date;
      product.expiredate = createProductMasterDto.expiredate;
      product.trade_price = createProductMasterDto.trade_price;
      product.wholesale = createProductMasterDto.wholesale;
      product.rate = createProductMasterDto.rate;
      product.quantity = createProductMasterDto.quantity;
      product.qtype = createProductMasterDto.qtype;
      product.vatamt = createProductMasterDto.vatamt;
      product.includevat = createProductMasterDto.includevat;
      product.price = createProductMasterDto.price;
      product.costprice = createProductMasterDto.costprice;
      product.rlevel = createProductMasterDto.rlevel;
      product.rquantity = createProductMasterDto.rquantity;
      product.sp_price = createProductMasterDto.sp_price;
      product.stock = createProductMasterDto.stock;
      product.cquantity = createProductMasterDto.cquantity;
      product.c_price = createProductMasterDto.c_price;
      product.saccount = createProductMasterDto.saccount;
      product.increase = createProductMasterDto.increase;
      product.decrease = createProductMasterDto.decrease;
      product.netquantity = createProductMasterDto.netquantity;
      product.adminid = createProductMasterDto.adminid;
      product.stock = createProductMasterDto.existingstock
        ? createProductMasterDto.quantity
        : createProductMasterDto.stock;
      product.vat = createProductMasterDto.vat;
      product.product_category = createProductMasterDto.product_category;
      product.unit = createProductMasterDto.unit;
      product.stockquantity = createProductMasterDto.stockquantity;
      product.is_deleted = false;
      product.createdBy = createProductMasterDto.createdBy;
      product.companyid = createProductMasterDto.companyid;
      product.hsn_code = createProductMasterDto.hsn_code;
      product.is_direct_billing = createProductMasterDto.is_direct_billing;
      product.parcel_charge = createProductMasterDto.parcel_charge;
      product.variant_name = createProductMasterDto.variant_name;
      product.taxable_amount = createProductMasterDto.taxable_amount;

      let saveData = await product.save();

      if (
        saveData &&
        createProductMasterDto.itemtype !== "Service" &&
        createProductMasterDto.itemtype !== "Asset"
      ) {
        for (
          let i = 0;
          i < createProductMasterDto?.product_loctions?.length;
          i++
        ) {
          const element = createProductMasterDto.product_loctions[i];
          let locationElement = JSON.parse(element.location);
          let productObj = {
            productId: saveData.id,
            productName: saveData.idescription,
            locationId: locationElement.id,
            locationName: locationElement.location,
            stock:
              createProductMasterDto.itemtype === "Nonstock"
                ? 0
                : element.location_stock,
            companyid: createProductMasterDto.companyid,
            adminid: createProductMasterDto.adminid,
            is_deleted: false,
          };
          const productLocation = await this.productLocationService.create(
            productObj
          );
        }
      }

      if (createProductMasterDto.itemtype === "Stock") {
        let openingAmount =
          Number(createProductMasterDto.stockquantity) *
          Number(createProductMasterDto.costprice);
        const differenceOpeningLedger =
          await this.defualt_ledger.findAllByQuery({
            attributes: ["id", "total"],
            where: {
              nominalcode: "999",
              userid: createProductMasterDto.adminid,
            },
          });

        if (differenceOpeningLedger.length) {
          let accountData = {
            total:
              Number(differenceOpeningLedger[0]?.total) + Number(openingAmount),
          };
          const updateVatLedger = await this.defualt_ledger.update(
            differenceOpeningLedger[0]?.id,
            accountData
          );
        }
      }

      return new CommonResponseDto(
        new ProductMasterDto(saveData),
        true,
        "Product created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  calculateVat = (rate: number, vatPercent: number, includevat: string) => {
    let vatAmount = 0;
    let totalPrice = 0;
    if (rate && vatPercent) {
      vatAmount = Number(rate) * (Number(vatPercent) / 100);
      if (includevat === "yes") {
        vatAmount = (Number(rate) / (100 + Number(vatPercent))) * 100;
        let vatAmt = (Number(rate) - Number(vatAmount)).toFixed(2);
        vatAmount = Number(vatAmt);
        totalPrice = Number(rate.toFixed(2));
        rate = Number(rate) - Number(vatAmount);
      } else {
        totalPrice = Number(rate) + Number(vatAmount);
        let total = Number(totalPrice).toFixed(2);
        totalPrice = Number(total);
      }
    }
    return Number(vatAmount);
  };

  async bulkCreate(dto: any[], body: any) {
    try {
      const BATCH_SIZE = 500; // Define the batch size for processing

      const result = await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const unitMap = new Map<string, number>();
          const categoryMap = new Map<string, number>();
          const locationMap = new Map<string, number>();

          const newUnits = new Set<string>();
          const newCategories = new Set<string>();
          const newLocations = new Set<string>();

          const newProducts = dto.map((item) => {
            let qty = item["quantity(opening stock)"];
            const itemType =
              body.itemtype === "Service"
                ? "Service"
                : body.itemtype === "Asset"
                ? "Asset"
                : Number(qty) <= 0
                ? "Nonstock"
                : "Stock";

            // Add units, categories, and locations to respective sets
            if (item.unit) newUnits.add(item?.unit?.toLowerCase());
            if (item.category) newCategories.add(item?.category?.toLowerCase());
            if (item.location) newLocations.add(item?.location?.toLowerCase());
            let vatAmount = this.calculateVat(
              Number(item["sale price"]),
              Number(item["vat %"]),
              item["includevat"]
            );
            return {
              itemtype: itemType,
              icode: item["item code"],
              image: item["image"],
              saccount: 4000,
              price: item["sale price"],
              c_price: item["cost price(opening stock)"],
              trade_price: item["trade_price"],
              type: itemType,
              logintype: "user",
              paccount: 0,
              includevat: item["includevat"] === "yes" ? 1 : 0,
              userid: Number(body.userid),
              adminid: Number(body.adminid),
              companyid: Number(body.companyid),
              costprice: item["cost price(opening stock)"],
              wholesale: item["wholesale price"],
              rlevel: 1,
              quantity: item["quantity(opening stock)"],
              rquantity: 1,
              stock: item["quantity(opening stock)"],
              rate: item["sale price"],
              sp_price: item["sale price"],
              vat: item["vat %"],
              vatamt: Number(vatAmount),
              idescription: item["item name"],
              barcode: item["barcode"],
              date: new Date(),
              unit: item["unit"],
              product_category: item["category"],
              location: item["location"] || "Main",
              hsn_code: item["hsn code"],
            };
          });

          // Bulk insert units, categories, and locations
          if (newUnits.size > 0) {
            const createdUnits = await unit.bulkCreate(
              [...newUnits].map((u) => ({
                unit: u,
                adminId: body.adminid,
                companyid: body.companyid,
                formalName: u,
                decimalValues: 0,
                isDeleted: false,
              })),
              { transaction }
            );
            createdUnits.forEach((u) =>
              unitMap.set(u.unit.toLowerCase(), u.id)
            );
          }

          if (newCategories.size > 0) {
            const createdCategories = await ProductCategory.bulkCreate(
              [...newCategories].map((cat) => ({
                category: cat,
                categoryType:
                  body.itemtype === "Service"
                    ? CategoryType.Service
                    : CategoryType.Product,
                isDeleted: false,
                userid: body.adminid,
                companyid: body.companyid,
              })),
              { transaction }
            );
            createdCategories.forEach((cat) =>
              categoryMap.set(cat.category.toLowerCase(), cat.id)
            );
          }

          if (newLocations.size > 0) {
            const createdLocations = await LocationMaster.bulkCreate(
              [...newLocations].map((loc) => ({
                location: loc,
                locationCode: loc,
                adminId: body.adminid,
                companyid: body.companyid,
                isDeleted: false,
              })),
              { transaction }
            );
            createdLocations.forEach((loc) =>
              locationMap.set(loc.location.toLowerCase(), loc.id)
            );
          }

          // Batch process products
          for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
            const batch = newProducts.slice(i, i + BATCH_SIZE);

            const batchWithResolvedIds = batch.map((product) => {
              const unitId = unitMap.get(product.unit?.toLowerCase()) || null;
              const categoryId =
                categoryMap.get(product.product_category?.toLowerCase()) ||
                null;
              const locationId =
                locationMap.get(product.location?.toLowerCase()) || null;

              return {
                ...product,
                unit: unitId,
                product_category: categoryId,
                location: locationId,
              };
            });

            await ProductMaster.bulkCreate(
              batchWithResolvedIds.map((product) => ({
                ...product,
                location: product?.location?.toString(),
              })),
              {
                transaction,
                updateOnDuplicate: ["quantity", "stock", "price", "vatamt"],
              }
            );
          }

          return new CommonResponseDto(
            true,
            true,
            "Products uploaded successfully"
          );
        }
      );

      return result;
    } catch (error) {
      console.error("Error during bulk upload:", error);
      throw new Error("Bulk upload failed. Please try again.");
    }
  }

  // Separate method to handle unit, category, location logic
  async handleUnitCategoryLocation(item, body, transaction, existingItem) {
    let unitId;
    const existingUnit = await unit.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("unit")),
            Sequelize.fn("LOWER", item?.unit)
          ),
          { isDeleted: false, companyid: item?.companyid },
        ],
      },
    });
    unitId = existingUnit?.id;
    if (!existingUnit) {
      let newUnit = await unit.create({
        unit: item?.unit,
        adminId: item?.adminid,
        companyid: item?.companyid,
        formalName: item?.unit,
        decimalValues: 0,
        isDeleted: false,
      });
      unitId = newUnit?.id;
    }

    let productCategoryid;
    const existingProductCategory = await ProductCategory.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("category")),
            Sequelize.fn("LOWER", item?.product_category)
          ),
          { isDeleted: false, companyid: item?.companyid },
        ],
      },
    });
    productCategoryid = existingProductCategory?.id;

    if (!existingProductCategory) {
      let newProductCategory = await ProductCategory.create({
        category: item?.product_category,
        categoryType:
          body.itemtype == "Service"
            ? CategoryType.Service
            : CategoryType?.Product,
        isDeleted: false,
        userid: item?.adminid,
        companyid: item?.companyid,
      });
      productCategoryid = newProductCategory?.id;
    }

    let locationId;
    const existingLocation = await LocationMaster.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("location")),
            Sequelize.fn("LOWER", item?.location)
          ),
          { isDeleted: false, companyid: item?.companyid },
        ],
      },
    });
    locationId = existingLocation?.id;
    if (!existingLocation) {
      const newLocation = await LocationMaster.create({
        location: item?.location,
        locationCode: item?.location,
        adminId: item?.adminid,
        companyid: item?.companyid,
        isDeleted: false,
      });
      locationId = newLocation?.id;
    }
  }

  async createFromExcel(data: any, reqObj: any, userId: number) {
    try {
      const workbook = xlsx.read(data.buffer);
      const sheetnames = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetnames]);
      let body = JSON.parse(reqObj);
      return await this.bulkCreate(sheetData, { ...body, userId });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateProductMasterDto: any) {
    try {
      const product = await this.findById(id);
      let oldOpeningAmount =
        Number(product.stockquantity) * Number(product.costprice);

      product.itemtype = updateProductMasterDto.itemtype || product.itemtype;
      product.icode = updateProductMasterDto.icode || product.icode;
      product.idescription =
        updateProductMasterDto.idescription || product.idescription;
      product.spname = updateProductMasterDto.spname || product.spname;
      product.ledgercategory =
        updateProductMasterDto.ledgercategory || product.ledgercategory;
      product.svrate = updateProductMasterDto.svrate || product.svrate;
      product.sicode = updateProductMasterDto.sicode || product.sicode;
      product.pdescription =
        updateProductMasterDto.pdescription || product.pdescription;
      product.pvrate = updateProductMasterDto.pvrate || product.pvrate;
      product.paccount = updateProductMasterDto.paccount || product.paccount;
      product.location = updateProductMasterDto.location || product.location;
      product.barcode = updateProductMasterDto.barcode || product.barcode;
      product.weight = updateProductMasterDto.weight || product.weight;
      product.notes = updateProductMasterDto.notes || product.notes;
      product.userid = updateProductMasterDto.userid || product.userid;
      product.name = updateProductMasterDto.name || product.name;
      product.ptype = updateProductMasterDto.ptype || product.ptype;
      product.reason = updateProductMasterDto.reason || product.reason;
      product.userdate = updateProductMasterDto.userdate || product.userdate;
      product.pimage =
        updateProductMasterDto.pimage != null
          ? updateProductMasterDto.pimage
          : product.pimage;
      product.qdate = updateProductMasterDto.qdate || product.qdate;
      product.date = updateProductMasterDto.date || product.date;
      product.expiredate =
        updateProductMasterDto.expiredate || product.expiredate;
      product.trade_price =
        updateProductMasterDto.trade_price || product.trade_price;
      product.wholesale = updateProductMasterDto.wholesale || product.wholesale;
      product.rate = updateProductMasterDto.rate || product.rate;
      product.quantity = updateProductMasterDto.quantity || product.quantity;
      product.qtype = updateProductMasterDto.qtype || product.qtype;
      product.vatamt = updateProductMasterDto.vatamt || product.vatamt;
      product.includevat =
        updateProductMasterDto.includevat || product.includevat;
      product.price = updateProductMasterDto.price || product.price;
      product.costprice = updateProductMasterDto.costprice || product.costprice;
      product.rlevel = updateProductMasterDto.rlevel || product.rlevel;
      product.rquantity = updateProductMasterDto.rquantity || product.rquantity;
      product.sp_price = updateProductMasterDto.sp_price || product.sp_price;
      product.stock = updateProductMasterDto.stock || product.stock;
      product.cquantity = updateProductMasterDto.cquantity || product.cquantity;
      product.c_price = updateProductMasterDto.c_price || product.c_price;
      product.saccount = updateProductMasterDto.saccount || product.saccount;
      product.increase = updateProductMasterDto.increase || product.increase;
      product.decrease = updateProductMasterDto.decrease || product.decrease;
      product.taxable_amount =
        updateProductMasterDto.taxable_amount || product.taxable_amount;
      product.netquantity =
        updateProductMasterDto.netquantity || product.netquantity;
      product.adminid = updateProductMasterDto.adminid || product.adminid;
      product.vat = updateProductMasterDto.vat || product.vat;
      product.product_category =
        updateProductMasterDto.product_category || product.product_category;
      product.unit = updateProductMasterDto.unit || product.unit;
      product.stockquantity =
        updateProductMasterDto.stockquantity || product.stockquantity;
      product.createdBy = updateProductMasterDto.createdBy || product.createdBy;
      product.companyid = updateProductMasterDto.companyid || product.companyid;
      product.hsn_code = updateProductMasterDto.hsn_code || product.hsn_code;
      product.is_direct_billing =
        updateProductMasterDto.is_direct_billing || product.is_direct_billing;
      product.parcel_charge =
        updateProductMasterDto.parcel_charge || product.parcel_charge;

      const updatedProduct = await product.save();

      if (
        updatedProduct &&
        updateProductMasterDto.itemtype !== "Service" &&
        updateProductMasterDto.itemtype !== "Asset"
      ) {
        for (
          let i = 0;
          i < updateProductMasterDto?.product_loctions?.length;
          i++
        ) {
          let element =
            typeof updateProductMasterDto.product_loctions[i] === "string"
              ? JSON.parse(updateProductMasterDto.product_loctions[i])
              : updateProductMasterDto.product_loctions[i];
          let locationElement = JSON.parse(element.location);
          let productObj = {
            productId: updatedProduct.id,
            productName: updatedProduct.idescription,
            locationId: locationElement.id,
            locationName: locationElement.location,
            stock:
              updateProductMasterDto.itemtype === "Nonstock"
                ? 0
                : element.location_stock,
            companyid: updateProductMasterDto.companyid,
            adminid: updateProductMasterDto.adminid,
            is_deleted: false,
          };
          const productLocation =
            await this.productLocationService.updateProductLocationStock(
              updatedProduct.id,
              locationElement.id,
              productObj
            );
        }
      }

      if (updateProductMasterDto.itemtype === "Stock") {
        let openingAmount =
          Number(updateProductMasterDto.stockquantity) *
          Number(updateProductMasterDto.costprice);
        const differenceOpeningLedger =
          await this.defualt_ledger.findAllByQuery({
            attributes: ["id", "total"],
            where: {
              nominalcode: "999",
              userid: updateProductMasterDto.adminid,
            },
          });

        if (differenceOpeningLedger?.length) {
          let accountData = {
            total:
              Number(differenceOpeningLedger[0]?.total) +
              Number(openingAmount) -
              oldOpeningAmount,
          };
          const updateVatLedger = await this.defualt_ledger.update(
            differenceOpeningLedger[0]?.id,
            accountData
          );
        }
      }

      return new CommonResponseDto(
        updatedProduct,
        true,
        "Product updated successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByIdByAdminid(id: number, adminid: any) {
    try {
      const product = await this.ProductMasterRepository.findOne<ProductMaster>(
        {
          where: {
            id: id,
            adminid: adminid,
          },
          include: [
            {
              model: ContactMaster,
              as: "supplier",
            },
          ],
        }
      );

      if (!product) {
        throw new HttpException(
          { message: "No user product adminid found" },
          HttpStatus.NOT_FOUND
        );
      }

      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateRate(id: number, updateProductMasterDto: any) {
    try {
      const product = await this.findByIdByAdminid(
        id,
        updateProductMasterDto.adminid
      );
      product.costprice =
        product.costprice == 0
          ? updateProductMasterDto.costprice
          : product.costprice;
      return new CommonResponseDto(
        await product.save(),
        true,
        "Product updated successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateStock(id: number, updateStockDto: any, transaction?: any) {
    try {
      const product: any = await this.findById(id);
      product.quantity =
        updateStockDto.quantity === 0
          ? updateStockDto.quantity
          : updateStockDto.quantity || product.quantity;
      product.stockquantity =
        updateStockDto.stockquantity || product.stockquantity;
      product.stock =
        updateStockDto.stock == 0
          ? updateStockDto.stock
          : updateStockDto.stock || product.stock;
      if (updateStockDto.stock <= 0) {
        product.itemtype = "Nonstock"; //|| product.itemtype;
      }
      if (updateStockDto.stock > 0) {
        product.itemtype = "Stock"; //|| product.itemtype;
      }
      let save = await product.save({ transaction });
      return new CommonResponseDto(save, true, "Stock updated successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateCostPrice(id: number, updateCostPrice: any) {
    try {
      const product: any = await this.findById(id);
      product.c_price =
        product.c_price === "0.00" ? updateCostPrice : product.c_price;
      let save = await product.save();
      return new CommonResponseDto(
        save,
        true,
        "Cost Price updated successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const product = await this.findById(id);
      await product.destroy();

      const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
        attributes: ["id", "total"],
        where: {
          nominalcode: "999",
          userid: product.adminid,
        },
      });

      if (differenceOpeningLedger.length) {
        let total = Number(product.costprice) * Number(product.stockquantity);

        let accountData = {
          total: Number(differenceOpeningLedger[0]?.total) - Number(total),
        };
        const updateVatLedger = await this.defualt_ledger.update(
          differenceOpeningLedger[0]?.id,
          accountData
        );
      }

      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Delete(id: number) {
    try {
      const product = await this.findById(id);
      product.is_deleted = true;
      const data = await product.save();

      // const differenceOpeningLedger = await this.defualt_ledger.findAllByQuery({
      //   attributes: ["id", "total"],
      //   where: {
      //     nominalcode: "999",
      //     userid: product.adminid,
      //   },
      // });

      // if (differenceOpeningLedger.length) {
      //   let total = Number(product.costprice) * Number(product.stockquantity);

      //   let accountData = {
      //     total: Number(differenceOpeningLedger[0]?.total) - Number(total),
      //   };
      //   const updateVatLedger = await this.defualt_ledger.update(
      //     differenceOpeningLedger[0]?.id,
      //     accountData
      //   );
      // }
      let res = {
        data: data,
        status: true,
        message: `${product.itemtype} deleted successfully`,
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkifItemExist(
    adminid: any,
    companyid: number,
    type: any,
    item: any
  ) {
    try {
      const product = await this.ProductMasterRepository.findAll({
        where: {
          is_deleted: false,
          [type]: item,
          adminid: adminid,
          companyid: companyid,
        },
      });
      let itemType = type == "icode" ? "Item code" : "Item name";
      let message1 = `${itemType} already exists`;
      let message2 = "New Item";
      let res = {
        product: product.length ? product : [],
        status: product.length ? true : false,
        message: product.length ? message1 : message2,
      };

      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkSaccountList(adminid: any, saccount: any) {
    try {
      const product = await this.findAllByQuery({
        where: {
          saccount: saccount,
          adminid: adminid,
        },
      });
      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateProductImage(productid, file) {
    let response: CommonResponseDto;
    try {
      let productData: any =
        productid === "create" ? null : await this.findById(productid);
      if (productData) {
        const bucket_name =
          this.configService.awsConfig.bucket + "/company/productimage/icon";
        const time = new Date().getTime();
        const filename = "Product_" + productid + time + ".png";
        var params = { Bucket: bucket_name, Key: filename, Body: file.buffer };
        let _s3 = new S3(this.configService.awsConfig);
        const uploadData = await _s3.upload(params).promise();
        if (uploadData) {
          let imageData = {
            preview: uploadData.Location,
            name: filename,
          };
          let exsistImages: any;

          if (productData.pimage) {
            exsistImages = JSON.parse(productData.pimage);
            exsistImages.push(imageData);
          }
          productData.pimage =
            exsistImages && exsistImages.length > 0
              ? JSON.stringify(exsistImages)
              : JSON.stringify([imageData]);
          let product: any = await productData.save();
          const returnData = {
            location: uploadData.Location,
            filename,
            pimage: productData.pimage,
          };
          response = {
            status: true,
            message: "Product Image Updated successfully",
            data: returnData,
          };
        } else {
          response = {
            status: false,
            message: "Failed to update Product Image",
            data: null,
          };
        }
      } else if (productid === "create") {
        const bucket_name =
          this.configService.awsConfig.bucket + "/company/productimage/icon";
        const time = new Date().getTime();
        const filename = "Product_" + time + ".png";
        var params = { Bucket: bucket_name, Key: filename, Body: file.buffer };
        let _s3 = new S3(this.configService.awsConfig);
        const uploadData = await _s3.upload(params).promise();
        if (uploadData) {
          let imageData = {
            preview: uploadData.Location,
            name: filename,
          };
          const returnData = {
            location: uploadData.Location,
            filename,
            pimage: JSON.stringify([imageData]),
          };
          response = {
            status: true,
            message: "Image upload successfully",
            data: returnData,
          };
        } else {
          response = {
            status: false,
            message: "Failed to update Product Image",
            data: null,
          };
        }
      } else {
        response = {
          status: false,
          message: "Product not found",
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }
}
