import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { BomMaster } from "./bom_master.entity";
import { BomItemDto, CreateBomDto } from "./dto/createBomMaster.dto";
import { Model, Op, Sequelize, Transaction, col } from "sequelize";
import { BomItems } from "../bom_items/bom_items.entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { getErrorMessage } from "../shared/helpers/errormessage";
import { ProductMaster } from "../product_master/product_master";
import { LocationMaster } from "../locations/location.entity";
import { CompanyMaster } from "../company_master/company_master_entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { Contractors } from "../shared/constants/constants";
import { BomItemsService } from "../bom_items/bom_items.service";
import { getBomListQueryDto } from "./dto/BomMasterQuery.dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { UpdateBomMasterDto } from "./dto/updateBomMaster.dto";
import { unit } from "../units/unit.entity";
import { PageOptionsForTableDto } from "./dto/pageOptionsTable.dto";

@Injectable()
export class BomMasterService {
  constructor(
    @Inject("BomMasterRepository")
    private readonly bomMasterRepository: typeof BomMaster,
    private readonly bomItemsService: BomItemsService
  ) {}
  private checkForDuplicatesNumbers(numbers: number[]) {
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return true;
    }
    return false;
  }
  async create(body: CreateBomDto, userId: number) {
    try {
      const result = await this.bomMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          const duplicateBom = await this.bomMasterRepository.findOne({
            where: {
              companyId: body.companyId,
              adminId: userId,
              productId: body?.productId,
              quantity: body?.quantity,
            },
          });
          if (duplicateBom) {
            throw new Error("This BOM already Exist@@");
          }
          const product = await ProductMaster.findOne({
            where: {
              companyid: body.companyId,
              adminid: userId,
              id: body?.productId,
            },
          });
          if (!product) {
            throw new Error("Invalid Main Product@@");
          }
          const company = await CompanyMaster.findOne({
            where: {
              id: body.companyId,
              adminid: userId,
            },
          });
          if (!company) {
            throw new Error("Invalid Company@@");
          }
          if (body?.createdBy === "staff") {
            const staff = await ContactMaster.findOne({
              where: {
                id: body.staffId,
                adminid: userId,
                companyid: body.companyId,
                contractors_type: Contractors.Staff,
              },
            });
            if (!staff) {
              throw new Error("Invalid Staff@@");
            }
          }
          if (body.consumption_location) {
            const consumptionLocation = await LocationMaster.findOne({
              where: {
                companyid: body.companyId,
                adminId: userId,
                id: body?.consumption_location,
              },
            });
            if (!consumptionLocation) {
              throw new Error("InValid Consumption Location@@");
            }
          }
          if (body.production_location) {
            const productionLocation = await LocationMaster.findOne({
              where: {
                companyid: body.companyId,
                adminId: userId,
                id: body?.production_location,
              },
            });
            if (!productionLocation) {
              throw new Error("InValid Production Location@@");
            }
          }
          if (!body?.consumerItems?.length) {
            throw new Error(
              "No Composite Products are Selected, Please try again.@@"
            );
          }
          const { consumerItems, byproductItems, ...bomDetails } = body;
          let obj = {
            ...bomDetails,
            adminId: userId,
          };
          let productIds: number[] = [];
          const createdBom = await this.bomMasterRepository.create(obj, {
            transaction,
          });
          productIds.push(createdBom.productId);
          let consumerItemsSaved: BomItemDto[] = [];
          let byproductItemsSaved: BomItemDto[] = [];
          for (const item of consumerItems) {
            let obj = {
              ...item,
              bomId: createdBom.id,
              type: "composite",
            };
            const consumerItemSaved =
              await this.bomItemsService.createByBomMaster(
                obj,
                body.companyId,
                userId,
                transaction
              );
            productIds.push(consumerItemSaved.productId);
            consumerItemsSaved.push(consumerItemSaved);
          }
          if (byproductItems?.length !== 0) {
            for (const item of byproductItems) {
              // const consumerItemSaved = await this.orderItemsService.createByOrder(
              //   item,
              //   order.id,
              //   transaction
              // );
              let obj = {
                ...item,
                bomId: createdBom.id,
                type: "byProduct",
              };
              const byproductItemSaved =
                await this.bomItemsService.createByBomMaster(
                  obj,
                  body.companyId,
                  userId,
                  transaction
                );
              productIds.push(byproductItemSaved.productId);
              byproductItemsSaved.push(byproductItemSaved);
            }
          }
          if (this.checkForDuplicatesNumbers(productIds)) {
            throw new Error("Same Product is Used More Than Once@@");
          }
          return {};
        }
      );
      return new CommonResponseDto(result, true, "Successfully Created BOM");
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }

  async update(update: UpdateBomMasterDto, userId: number) {
    try {
      const result = await this.bomMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          if (!update?.consumerItems?.length) {
            throw new Error(
              "No Composite Products are Selected, Please try again.@@"
            );
          }
          const bom = await this.bomMasterRepository.findByPk(update.id);
          if (!bom) {
            throw new Error("BOM Not Found@@");
          }
          if (update?.productId) {
            const product = await ProductMaster.findOne({
              where: {
                companyid: update.companyId,
                adminid: userId,
                id: update?.productId,
              },
            });
            if (!product) {
              throw new Error("Invalid Main Product@@");
            }
          }

          const duplicateBom = await this.bomMasterRepository.findOne({
            where: {
              companyId: update.companyId,
              adminId: userId,
              productId: update?.productId,
              quantity: update?.quantity,
              id: {
                [Op.ne]: bom.id, // Exclude the record with the specific ID
              },
            },
          });
          if (duplicateBom) {
            throw new Error("This BOM already Exist@@");
          }

          // const { id, companyId, orderItems, ...obj } = update;
          let obj = {
            productId: update?.productId,
            quantity: update.quantity,
            consumption_location: update?.consumption_location,
            production_location: update?.production_location,
          };
          let productIds: number[] = [];

          const updatedBom = await bom.update(obj, {
            where: {
              id: update.id,
              adminId: userId,
              companyId: update.companyId,
            },
            transaction,
          });
          productIds.push(updatedBom?.productId);
          let { consumerItems, byproductItems } = update;
          let consumerItemsSaved: BomItems[] = [];
          let updatedConsumerItemsId: number[] = [];
          let byproductItemsSaved: BomItems[] = [];
          let updatedByproductItemsId: number[] = [];
          for (const item of consumerItems) {
            let obj = {
              ...item,
              type: "composite",
              bomId: update.id,
            };
            const bomItemSaved = await this.bomItemsService.updateByBomMaster(
              obj,
              update.companyId,
              userId,
              transaction
            );
            productIds.push(bomItemSaved?.productId);
            updatedConsumerItemsId.push(bomItemSaved.id);
            consumerItemsSaved.push(bomItemSaved);
          }
          for (const item of byproductItems) {
            let obj = {
              ...item,
              type: "byProduct",
              bomId: update.id,
            };
            const bomItemSaved = await this.bomItemsService.updateByBomMaster(
              obj,
              update.companyId,
              userId,
              transaction
            );
            productIds.push(bomItemSaved?.productId);
            updatedByproductItemsId.push(bomItemSaved.id);
            byproductItemsSaved.push(bomItemSaved);
          }
          if (this.checkForDuplicatesNumbers(productIds)) {
            throw new Error("Same Product is Used More Than Once@@");
          }
          const deleteOrderItems = await BomItems.destroy({
            where: {
              bomId: update?.id,
              id: {
                [Op.notIn]: [
                  ...updatedConsumerItemsId,
                  ...updatedByproductItemsId,
                ],
              },
            },
            transaction,
          });
          let result = {
            ...updatedBom.get({ plain: true }),
            consumerItems: consumerItemsSaved,
            byproductItems: byproductItemsSaved,
          };
          return result;
        }
      );
      return new CommonResponseDto(result, true, "Successfully Updated BOM");
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }

  async findAllBomByCompany(
    userId: number,
    queryData: getBomListQueryDto,
    pageOptions: PageOptionsForTableDto
  ) {
    try {
      // Add pagination options if pageOptions are provided
      let paginationQuery: any = {};
      if (pageOptions?.page && pageOptions?.take) {
        const skip = (pageOptions.page - 1) * pageOptions.take;
        paginationQuery.limit = pageOptions.take;
        paginationQuery.offset = skip;
      }

      let whereCondition = {
        adminId: userId,
        companyId: queryData.companyId,
      };

      // if (queryData.searchProduct && queryData.searchProduct !== "") {
      //   whereCondition[Op.or] = [
      //     {
      //       "$Product.idescription$": {
      //         [Op.like]: `%${queryData.searchProduct}%`,
      //       },
      //     },
      //     {
      //       "$ConsumptionLocation.location$": {
      //         [Op.like]: `%${queryData.searchProduct}%`,
      //       },
      //     },
      //     {
      //       "$ProductionLocation.location$": {
      //         [Op.like]: `%${queryData.searchProduct}%`,
      //       },
      //     },
      //   ];
      // }
      let productWhereCondition = {};
      if (queryData?.searchProduct && queryData?.searchProduct !== "") {
        productWhereCondition = {
          idescription: { [Op.like]: `%${queryData.searchProduct}%` },
        };
      }
      //for the purpose to work the selected row export from client side
      if (queryData?.ids) {
        const parsedNumbers = JSON.parse(decodeURIComponent(queryData?.ids));
        if (parsedNumbers?.length) {
          whereCondition["id"] = {
            [Op.in]: parsedNumbers,
          };
        }
      }
      const bomList = await this.bomMasterRepository.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: ProductMaster,
            as: "Product",
            where: productWhereCondition,
            attributes: ["id", "idescription"],
          },
          {
            model: LocationMaster,
            as: "ConsumptionLocation",
            attributes: ["id", "location"],
          },
          {
            model: LocationMaster,
            as: "ProductionLocation",
            attributes: ["id", "location"],
          },
          {
            model: BomItems,
            as: "compositeBomItems",

            include: [
              {
                model: ProductMaster,
                as: "Product",
                attributes: ["id", "idescription"],
              },
            ],
          },
          {
            model: BomItems,
            as: "byProductBomItems",
            include: [
              {
                model: ProductMaster,
                as: "Product",
                attributes: ["id", "idescription"],
              },
            ],
          },
        ],
        distinct: true, // Ensure distinct records
        col: "id",
        order: [["createdAt", pageOptions.order]],
        ...paginationQuery,
      });

      const entities = bomList.rows;
      const itemCount = bomList.count;
      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: pageOptions,
        itemCount,
      });
      const data = new PageDto(entities, pageMetaDto);
      return new CommonResponseDto(data, true, "fetched SucessFully");
    } catch (err) {
      // Handle error
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }
  async findAllBomForProduction(
    userId: number,
    queryData: getBomListQueryDto,
    pageOptions: PageOptionsDto
  ) {
    try {
      const skip = (pageOptions.page - 1) * pageOptions.take;
      let whereCondition = {
        adminId: userId,
        companyId: Number(queryData?.companyId),
      };
      let productWhereCondition = {};
      if (queryData.searchProduct && queryData.searchProduct !== "") {
        productWhereCondition = {
          idescription: { [Op.like]: `%${queryData.searchProduct}%` },
        };
      }
      const bomList = await this.bomMasterRepository.findAndCountAll({
        where: whereCondition,
        attributes: [
          "productId",
          [Sequelize.col("Product.idescription"), "productName"],
          [Sequelize.col("Product.unitDetails.unit"), "unit"],
          [
            Sequelize.literal(`
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', BomMaster.id,
                  'quantity', BomMaster.quantity
                )
              )
            `),
            "batches",
          ],
        ],
        group: ["BomMaster.productId"],
        include: [
          {
            model: ProductMaster,
            as: "Product",
            attributes: [],
            where: productWhereCondition,
            include: [
              {
                model: unit,
                as: "unitDetails",
                attributes: [],
              },
            ],
          },
        ],
        order: [["createdAt", pageOptions.order]],
        limit: pageOptions.take,
        offset: skip,
      });

      const entities = bomList.rows;
      const itemCount = bomList.count.length;
      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: pageOptions,
        itemCount,
      });

      const data = new PageDto(entities, pageMetaDto);
      return new CommonResponseDto(data, true, "fetched SucessFully");
    } catch (err) {
      // Handle error
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }

  async findOne(id: number, userId: number, companyId: number) {
    try {
      const bom = await this.bomMasterRepository.findOne({
        where: {
          adminId: userId,
          id: id,
          companyId: companyId,
        },
        include: [
          {
            model: BomItems,
            as: "compositeBomItems",
            include: [
              {
                model: ProductMaster,
                as: "Product",
                attributes: [
                  "id",
                  "idescription",
                  "costprice",
                  [
                    Sequelize.literal(
                      "`compositeBomItems->Product->unitDetails`.`unit`"
                    ),
                    "units",
                  ],
                ],
                include: [
                  {
                    model: unit,
                    as: "unitDetails",
                    attributes: [],
                  },
                ],
              },
            ],
          },
          {
            model: BomItems,
            as: "byProductBomItems",
            include: [
              {
                model: ProductMaster,
                as: "Product",
                attributes: [
                  "id",
                  "idescription",
                  "costprice",
                  [
                    Sequelize.literal(
                      "`byProductBomItems->Product->unitDetails`.`unit`"
                    ),
                    "units",
                  ],
                ],
                include: [
                  {
                    model: unit,
                    as: "unitDetails",
                    attributes: [],
                  },
                ],
              },
            ],
          },
          {
            model: ProductMaster,
            as: "Product",
            attributes: [
              "id",
              "idescription",
              "costprice",
              [Sequelize.literal("`Product->unitDetails`.`unit`"), "units"],
            ],
            include: [
              {
                model: unit,
                as: "unitDetails",
                attributes: [],
              },
            ],
          },
          {
            model: LocationMaster,
            as: "ConsumptionLocation",
            attributes: ["id", "location"],
          },
          {
            model: LocationMaster,
            as: "ProductionLocation",
            attributes: ["id", "location"],
          },
        ],
      });

      if (!bom) {
        return new CommonResponseDto({}, false, "BOM is Not Found");
      }

      return new CommonResponseDto(bom, true, "successfully Fetched");
    } catch (err) {
      // Handle error
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }
  async deleteOne(id: number, userId: number, companyId: number) {
    try {
      const bom = await this.bomMasterRepository.destroy({
        where: {
          adminId: userId,
          id: id,
          companyId: companyId,
        },
      });

      if (!bom) {
        return new CommonResponseDto({}, false, "BOM Not Found");
      }

      return new CommonResponseDto(bom, true, "successfully Deleted");
    } catch (err) {
      // Handle error
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }
}
