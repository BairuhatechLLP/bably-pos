import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ProductionMaster } from "./production_master.entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { getErrorMessage } from "../shared/helpers/errormessage";
import { CreateProductionMasterDto } from "./dto/createProductionMaster.dto";
import { Op, Sequelize, Transaction, col, fn } from "sequelize";
import { ProductMaster } from "../product_master/product_master";
import { CompanyMaster } from "../company_master/company_master_entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { Contractors } from "../shared/constants/constants";
import { LocationMaster } from "../locations/location.entity";
import { ProductLocationMaster } from "../product_location_master/product_location.entity";
import { ProductionItemsDto } from "./dto/productionMaster.dto";
import { ProductionItems } from "../production_items/production_items.entity";
import { AccountMaster } from "../account_master/account_master";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { BomMaster } from "../bom_master/bom_master.entity";
import { getProductionListQueryDto } from "./dto/ProductionMasterQuery.dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { unit } from "../units/unit.entity";
import { PageOptionsForTableDto } from "./dto/pageOptionsTable.dto";

@Injectable()
export class ProductionMasterService {
  constructor(
    @Inject("ProductionMasterRepository")
    private readonly productionMasterRepository: typeof ProductionMaster,
    private readonly ledger_details: LedgerDetailsService
  ) {}
  private checkForDuplicatesNumbers(numbers: number[]) {
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return true;
    }
    return false;
  }
  async create(body: CreateProductionMasterDto, userId: number) {
    try {
      const result =
        await this.productionMasterRepository.sequelize.transaction(
          async (transaction: Transaction) => {
            const bomDetails = await BomMaster.findByPk(body?.bomId);
            if (!bomDetails) {
              throw new Error("the BOM is Not Found@@");
            }
            const mainProduct = await ProductMaster.findOne({
              where: {
                companyid: body.companyId,
                adminid: userId,
                id: body?.productId,
              },
            });
            if (!mainProduct) {
              throw new Error("Production Product Not Found@@");
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
            const locations = await LocationMaster.findAll({
              where: {
                companyid: body.companyId,
                adminId: userId,
                [Op.or]: [
                  { id: body?.consumptionLocationId },
                  { id: body?.productionLocationId },
                ],
              },
            });

            const consumptionLocation = locations.find(
              (location) => location.id === body?.consumptionLocationId
            );
            const productionLocation = locations.find(
              (location) => location.id === body?.productionLocationId
            );

            if (!consumptionLocation) {
              throw new Error("InValid Consumption Location@@");
            }
            if (!productionLocation) {
              throw new Error("InValid Production Location@@");
            }
            let {
              compositeProductionItems,
              wastageProductionItems,
              expenseLedgerItems,
              productProductionItems,
              ...productionDetails
            } = body;
            let obj = {
              ...productionDetails,
              adminId: userId,
              totalCostPrice: 1,
              totalProductCostPrice: 1,
              totalProductSalesPrice: 1,
            };
            const createdProduction =
              await this.productionMasterRepository.create(obj, {
                transaction,
              });
            //calculation part and updating the product-location table
            let productionProductIds: number[] = [];
            let wastageProductionIds: number[] = [];
            let expenseLedgerIds: number[] = [];
            let updatedProductDetails: ProductMaster[] = [];
            let updatedProductLocationDetails: ProductLocationMaster[] = [];
            let totalCompsiteCostPrice = 0;
            let totalProductCostPrice = 0;
            let totalWasteCostPrice = 0;
            let productionItems: any[] = [];
            for (let item of compositeProductionItems) {
              productionProductIds.push(item?.productId);
              let totalQuantity =
                Number(body?.productionQuantity) * Number(item?.batchQuantity);
              const compositeProduct = await ProductMaster.findByPk(
                item?.productId
              );
              if (!compositeProduct)
                throw new Error("Invalid Composite Product@@");
              if (
                compositeProduct?.stock < totalQuantity
                //&& compositeProduct?.quantity < totalQuantity
              )
                throw new Error(
                  `'${compositeProduct?.idescription}' does not have enough stock available.@@`
                );
              //compositeProduct.quantity =
              //  compositeProduct.quantity - totalQuantity;
              compositeProduct.stock = compositeProduct.stock - totalQuantity;
              const updatedCompositeProduct = await compositeProduct.save({
                transaction,
              });
              updatedProductDetails.push(updatedCompositeProduct);
              const compositeProductLocation =
                await ProductLocationMaster.findOne({
                  where: {
                    productId: item?.productId,
                    locationId: body?.consumptionLocationId,
                    adminid: userId,
                    companyid: body?.companyId,
                  },
                });
              if (!compositeProductLocation)
                throw new Error(
                  `Product ${compositeProduct?.idescription} Not Found in the Consumption Location@@`
                );

              if (compositeProductLocation?.stock < totalQuantity)
                throw new Error(
                  `'${compositeProduct?.idescription}' does not have enough stock available in the Consumption Location.@@`
                );
              compositeProductLocation.stock =
                compositeProductLocation?.stock - totalQuantity;
              const updatedCompositeProductLocation =
                await compositeProductLocation.save({ transaction });
              updatedProductLocationDetails.push(
                updatedCompositeProductLocation
              );
              const totalPrice =
                Number(compositeProduct.costprice) * Number(totalQuantity);
              totalCompsiteCostPrice = totalCompsiteCostPrice + totalPrice;
              //assigning data for the production Items save
              const compositeProductDetails = new ProductionItemsDto({
                productionId: createdProduction.dataValues.id,
                productId: compositeProduct.id,
                batchQuantity: item?.batchQuantity,
                productionQuantity: body?.productionQuantity,
                unitCostPrice: Number(compositeProduct.costprice),
                unitSalesPrice: 0,
                totalCostPrice: totalPrice,
                type: "composite",
              });
              productionItems.push(compositeProductDetails);
            }
            if (wastageProductionItems?.length) {
              for (let item of wastageProductionItems) {
                wastageProductionIds.push(item?.productId);
                let totalQuantity = Number(item?.batchQuantity);
                let wastageProduct: ProductMaster;
                const updatedProduct = updatedProductDetails.findIndex(
                  (element: ProductMaster) => element.id == item?.productId
                );
                if (updatedProduct !== -1) {
                  wastageProduct = updatedProductDetails[updatedProduct];
                } else {
                  const wastageProductDetails = await ProductMaster.findByPk(
                    item?.productId
                  );
                  if (!wastageProductDetails)
                    throw new Error("Invalid Wastage Product@@");
                  wastageProduct = wastageProductDetails;
                }
                if (
                  wastageProduct?.stock < totalQuantity
                  //&&
                  //wastageProduct?.quantity < totalQuantity
                )
                  throw new Error(
                    `'${wastageProduct?.idescription}' does not have enough stock available.@@`
                  );
                //wastageProduct.quantity = wastageProduct.quantity - totalQuantity;
                wastageProduct.stock = wastageProduct.stock - totalQuantity;
                const updaedProductDetail = await wastageProduct.save({
                  transaction,
                });
                if (updatedProduct !== -1) {
                  updatedProductDetails[updatedProduct] = updaedProductDetail;
                } else {
                  updatedProductDetails.push(updaedProductDetail);
                }
                //product Location
                let wastageProductLocation: ProductLocationMaster;
                const updatedProductLocation =
                  updatedProductLocationDetails.findIndex(
                    (element: ProductLocationMaster) =>
                      element.productId == item?.productId
                  );
                if (updatedProductLocation !== -1) {
                  wastageProductLocation =
                    updatedProductLocationDetails[updatedProductLocation];
                } else {
                  const wastageProductLocationDetails =
                    await ProductLocationMaster.findOne({
                      where: {
                        productId: item?.productId,
                        locationId: body?.consumptionLocationId,
                        adminid: userId,
                        companyid: body?.companyId,
                      },
                    });
                  if (!wastageProductLocationDetails)
                    throw new Error(
                      `Product ${wastageProduct?.idescription} Not Found in the Consumption Location@@`
                    );
                  wastageProductLocation = wastageProductLocationDetails;
                }

                if (wastageProductLocation?.stock < totalQuantity)
                  throw new Error(
                    `'${wastageProduct?.idescription}' does not have enough stock available in the Consumption Location.@@`
                  );
                wastageProductLocation.stock =
                  wastageProductLocation?.stock - totalQuantity;
                const updatedProductLocationDetail =
                  await wastageProductLocation.save({ transaction });
                if (updatedProductLocation !== -1) {
                  updatedProductLocationDetails[updatedProductLocation] =
                    updatedProductLocationDetail;
                } else {
                  updatedProductLocationDetails.push(
                    updatedProductLocationDetail
                  );
                }
                const totalPrice =
                  Number(wastageProduct.costprice) * Number(totalQuantity);
                totalWasteCostPrice = totalWasteCostPrice + totalPrice;
                //assigning data for the production Items save
                const wastageProductDetails = new ProductionItemsDto({
                  productionId: createdProduction.dataValues.id,
                  productId: wastageProduct.id,
                  batchQuantity: item?.batchQuantity,
                  productionQuantity: 1,
                  unitCostPrice: Number(wastageProduct.costprice),
                  unitSalesPrice: 0,
                  totalCostPrice: totalPrice,
                  type: "wastage",
                });
                productionItems.push(wastageProductDetails);
              }
              if (this.checkForDuplicatesNumbers(wastageProductionIds)) {
                throw new Error(
                  "Same Product is Used More Than Once in Wastage Products@@"
                );
              }
            }
            if (expenseLedgerItems?.length) {
              for (let item of expenseLedgerItems) {
                expenseLedgerIds.push(item?.ledgerId);
                const expenseLedger = await AccountMaster.findByPk(
                  item?.ledgerId
                );
                if (!expenseLedger) {
                  throw new Error("Invalid Expense Ledger@@");
                }
                // let dataObj = {
                //   otherid: "",
                //   credit: "0",
                //   debit: item.amount,
                //   total: item.amount,
                //   type: "Stock Transfer",
                //   description: "Stock Transfer",
                //   ledger: item.paidFrom,
                //   ledgercategory: "3",
                //   adminid: userId,
                //   // stockTransferId: createdData.id,
                //   cname: "",
                //   baseid: "",
                //   amount: item.amount,
                //   usertype: "user",
                //   userdate: new Date(),
                //   sdate: new Date(),
                //   ldate: new Date(),
                //   userid: userId,
                //   companyid: body.companyId,
                //   createdAt: new Date(),
                //   updatedAt: new Date(),
                // };
                // const result1: any = await this.ledger_details.create(dataObj);
                // let dataObj2 = {
                //   otherid: "",
                //   credit: item.amount,
                //   debit: "0",
                //   total: item.amount,
                //   type: "Stock Transfer",
                //   description: "Stock Transfer",
                //   ledger: item.ledgerId,
                //   ledgercategory: "3",
                //   adminid: userId,
                //   // stockTransferId: createdData.id,
                //   cname: "",
                //   baseid: "",
                //   amount: item.amount,
                //   usertype: "user",
                //   userdate: new Date(),
                //   sdate: new Date(),
                //   ldate: new Date(),
                //   userid: userId,
                //   companyid: body.companyId,
                //   createdAt: new Date(),
                //   updatedAt: new Date(),
                // };
                // const result2: any = await this.ledger_details.create(dataObj2);
              }
              if (this.checkForDuplicatesNumbers(expenseLedgerIds)) {
                throw new Error("Same Expense Ledger is Used More Than Once@@");
              }
            }

            let mainProductTotalCost: number;
            let byProductTotalCost: number;
            for (let item of productProductionItems) {
              productionProductIds.push(item?.productId);
              let totalQuantity =
                Number(body?.productionQuantity) * Number(item?.batchQuantity);

              let productionProduct: ProductMaster;
              const updatedProduct = updatedProductDetails.findIndex(
                (element: ProductMaster) => element.id == item?.productId
              );
              if (updatedProduct !== -1) {
                productionProduct = updatedProductDetails[updatedProduct];
              } else {
                const productionProductDetails = await ProductMaster.findByPk(
                  item?.productId
                );
                if (!productionProductDetails)
                  throw new Error("Invalid Production Product@@");
                productionProduct = productionProductDetails;
              }
              if (item?.unitCostPrice > item?.unitSalesPrice) {
                throw new Error(
                  `The unit price should be greater than the unit sale price for the product: ${productionProduct.idescription}.@@`
                );
              }
              //productionProduct.quantity =
              //  productionProduct.quantity + totalQuantity;
              productionProduct.stock = productionProduct.stock + totalQuantity;
              productionProduct.costprice = item?.unitCostPrice;
              productionProduct.sp_price = item?.unitSalesPrice;
              const updaedProductDetail = await productionProduct.save({
                transaction,
              });
              if (updatedProduct !== -1) {
                updatedProductDetails[updatedProduct] = updaedProductDetail;
              } else {
                updatedProductDetails.push(updaedProductDetail);
              }

              let productionProductLocation: ProductLocationMaster;
              const updatedProductLocation =
                updatedProductLocationDetails.findIndex(
                  (element: ProductLocationMaster) =>
                    element.productId == item?.productId
                );
              if (updatedProductLocation !== -1) {
                productionProductLocation =
                  updatedProductLocationDetails[updatedProductLocation];
              } else {
                const productionProductLocationDetails =
                  await ProductLocationMaster.findOne({
                    where: {
                      productId: item?.productId,
                      locationId: body?.consumptionLocationId,
                      adminid: userId,
                      companyid: body?.companyId,
                    },
                  });
                if (!productionProductLocationDetails)
                  throw new Error(
                    `Product ${productionProduct?.idescription} Not Found in the Production Location@@`
                  );
                productionProductLocation = productionProductLocationDetails;
              }

              productionProductLocation.stock =
                productionProductLocation?.stock + totalQuantity;
              const updatedProductLocationDetail =
                await productionProductLocation.save({ transaction });
              if (updatedProductLocation !== -1) {
                updatedProductLocationDetails[updatedProductLocation] =
                  updatedProductLocationDetail;
              } else {
                updatedProductLocationDetails.push(
                  updatedProductLocationDetail
                );
              }
              const totalPrice =
                Number(item.unitCostPrice) * Number(totalQuantity);
              totalProductCostPrice = totalProductCostPrice + totalPrice;

              if (createdProduction.dataValues.productId == item.productId) {
                mainProductTotalCost = Number(item.unitCostPrice);
                createdProduction.totalProductCostPrice = Number(
                  item.unitCostPrice
                );
                createdProduction.totalProductSalesPrice = Number(
                  item.unitSalesPrice
                );
              } else {
                byProductTotalCost =
                  byProductTotalCost + Number(item.unitCostPrice);
              }
              //assigning data for the production Items save
              const productDetails = new ProductionItemsDto({
                productionId: createdProduction.dataValues.id,
                productId: productionProduct.id,
                batchQuantity: item?.batchQuantity,
                productionQuantity: Number(body?.productionQuantity),
                unitCostPrice: Number(item.unitCostPrice),
                unitSalesPrice: item?.unitSalesPrice,
                totalCostPrice: totalPrice,
                type: "product",
              });
              productionItems.push(productDetails);
            }
            if (this.checkForDuplicatesNumbers(productionProductIds)) {
              throw new Error("Same Product is Used More Than Once@@");
            }
            if (byProductTotalCost > mainProductTotalCost) {
              throw new Error(
                `byProduct Cost Price Shouldn,t be Greater than Main Product's Cost Price@@`
              );
            }
            if (
              Math.round(totalCompsiteCostPrice + totalWasteCostPrice) !==
              Math.round(totalProductCostPrice)
            )
              throw new Error(
                `the Total Cost Price of Composite Product and Wastage Product Should be equal to Generated Product@@`
              );
            createdProduction.totalProductCostPrice = Number(
              totalProductCostPrice
            );
            await createdProduction.save({ transaction });
            await ProductionItems.bulkCreate(productionItems, {
              transaction,
              validate: true,
            });
            return {};
          }
        );
      return new CommonResponseDto(
        result,
        true,
        "Successfully Created Product"
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }

  async findAllProductionCompany(
    userId: number,
    queryData: getProductionListQueryDto,
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
      let productWhereCondition = {};
      if (queryData?.search && queryData?.search !== "") {
        productWhereCondition = {
          idescription: { [Op.like]: `%${queryData.search}%` },
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

      const ProductionList =
        await this.productionMasterRepository.findAndCountAll({
          where: whereCondition,

          include: [
            {
              model: ProductionItems,
              as: "compositeProductionItems",
              include: [
                {
                  model: ProductMaster,
                  as: "productDetails",
                  attributes: ["id", "idescription"],
                },
              ],
            },
            {
              model: ProductionItems,
              as: "wastageProductionItems",
              include: [
                {
                  model: ProductMaster,
                  as: "productDetails",
                  attributes: ["id", "idescription"],
                },
              ],
            },
            {
              model: ProductionItems,
              as: "productProductionItems",
              include: [
                {
                  model: ProductMaster,
                  as: "productDetails",
                  attributes: ["id", "idescription"],
                },
              ],
            },
            {
              model: ProductMaster,
              as: "productDetails",
              where: productWhereCondition,
              attributes: ["id", "idescription"],
            },
            {
              model: LocationMaster,
              as: "consumptionLocation",
              attributes: ["id", "location"],
            },
            {
              model: LocationMaster,
              as: "productionLocation",
              attributes: ["id", "location"],
            },
          ],
          distinct: true, // Ensure distinct records
          col: "id",
          order: [["createdAt", pageOptions.order]],
          ...paginationQuery,
        });

      const entities = ProductionList.rows;
      const itemCount = ProductionList.count;
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
      const production = await this.productionMasterRepository.findOne({
        where: {
          adminId: userId,
          id: id,
          companyId: companyId,
        },
        attributes: {
          include: [
            [
              Sequelize.literal(`(
                SELECT SUM(\`totalCostPrice\`)
                FROM \`production_items\`
                WHERE \`production_items\`.\`productionId\` = \`ProductionMaster\`.\`id\`
                AND \`production_items\`.\`type\` = 'composite'
              )`),
              "compositeTotalCostPriceSum",
            ],
            [
              Sequelize.literal(`(
                SELECT SUM(\`totalCostPrice\`)
                FROM \`production_items\`
                WHERE \`production_items\`.\`productionId\` = \`ProductionMaster\`.\`id\`
                AND \`production_items\`.\`type\` = 'wastage'
              )`),
              "wastageTotalCostPriceSum",
            ],
            [
              Sequelize.literal(`(
                SELECT SUM(\`totalCostPrice\`)
                FROM \`production_items\`
                WHERE \`production_items\`.\`productionId\` = \`ProductionMaster\`.\`id\`
                AND \`production_items\`.\`type\` = 'product'
              )`),
              "productTotalCostPriceSum",
            ],
          ],
        },
        include: [
          {
            model: ProductionItems,
            as: "compositeProductionItems",
            include: [
              {
                model: ProductMaster,
                as: "productDetails",
                attributes: [
                  "id",
                  "idescription",
                  [
                    Sequelize.literal(
                      "`compositeProductionItems->productDetails->unitDetails`.`unit`"
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
            model: ProductionItems,
            as: "wastageProductionItems",
            include: [
              {
                model: ProductMaster,
                as: "productDetails",
                attributes: [
                  "id",
                  "idescription",
                  [
                    Sequelize.literal(
                      "`wastageProductionItems->productDetails->unitDetails`.`unit`"
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
            model: ProductionItems,
            as: "productProductionItems",
            include: [
              {
                model: ProductMaster,
                as: "productDetails",
                attributes: [
                  "id",
                  "idescription",
                  [
                    Sequelize.literal(
                      "`productProductionItems->productDetails->unitDetails`.`unit`"
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
            as: "productDetails",
            attributes: [
              "id",
              "idescription",
              [
                Sequelize.literal("`productDetails->unitDetails`.`unit`"),
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
          {
            model: LocationMaster,
            as: "consumptionLocation",
            attributes: ["id", "location"],
          },
          {
            model: LocationMaster,
            as: "productionLocation",
            attributes: ["id", "location"],
          },
        ],
      });

      if (!production) {
        return new CommonResponseDto({}, false, "Production is Not Found");
      }

      return new CommonResponseDto(production, true, "successfully Fetched");
    } catch (err) {
      // Handle error
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(getErrorMessage(err));
    }
  }
}
