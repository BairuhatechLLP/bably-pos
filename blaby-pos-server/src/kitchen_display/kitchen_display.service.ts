import {
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
  } from "@nestjs/common";
  import { KitchenDisplay } from "./kitchen_display.entity";
  import { Op, Transaction } from "sequelize";
  import { CommonResponseDto } from "../shared/dto/common-response.dto";
  import { getErrorMessage } from "../shared/helpers/errormessage";
  import { CompanyMaster } from "../company_master/company_master_entity";
  import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { CreateKitchenDisplayDto, GetKitchenDisplayQueryDto, UpdateKitchenDisplayDto } from "./dto/display.dto";
  
  @Injectable()
  export class KitchenDisplayService {
    constructor(
      @Inject("KitchenDisplayRepository")
      private readonly kitchenDisplayRepository: typeof KitchenDisplay
    ) {}
  
    async create(body: CreateKitchenDisplayDto, userId: number) {
      try {
        const result = await this.kitchenDisplayRepository.sequelize.transaction(
          async (transaction: Transaction) => {
            // Validate company
            const company = await CompanyMaster.findOne({
              where: {
                id: body.company_id,
                adminid: userId,
              },
            });
            if (!company) {
              throw new Error("Invalid Company@@");
            }
  
            // Check for duplicate name within the same company
            const duplicateDisplay = await this.kitchenDisplayRepository.findOne({
              where: {
                name: body.name,
                company_id: body.company_id,
                admin_id: userId,
              },
            });
            if (duplicateDisplay) {
              throw new Error("Kitchen Display with this name already exists@@");
            }
  
            const kitchenDisplay = await this.kitchenDisplayRepository.create(
              {
                ...body,
                admin_id: userId,
              },
              { transaction }
            );
  
            return kitchenDisplay;
          }
        );
        return new CommonResponseDto(result, true, "Successfully Created Kitchen Display");
      } catch (err) {
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException(getErrorMessage(err));
      }
    }
  
    async update(update: UpdateKitchenDisplayDto, userId: number) {
      try {
        const result = await this.kitchenDisplayRepository.sequelize.transaction(
          async (transaction: Transaction) => {
            const kitchenDisplay = await this.kitchenDisplayRepository.findByPk(update.id);
            if (!kitchenDisplay) {
              throw new Error("Kitchen Display Not Found@@");
            }
  
            // Check for duplicate name within the same company (excluding current record)
            if (update.name) {
              const duplicateDisplay = await this.kitchenDisplayRepository.findOne({
                where: {
                  name: update.name,
                  company_id: update.company_id,
                  admin_id: userId,
                  id: {
                    [Op.ne]: update.id,
                  },
                },
              });
              if (duplicateDisplay) {
                throw new Error("Kitchen Display with this name already exists@@");
              }
            }
  
            const updatedDisplay = await kitchenDisplay.update(
              {
                name: update.name,
                company_id: update.company_id,
              },
              {
                where: {
                  id: update.id,
                  admin_id: userId,
                },
                transaction,
              }
            );
  
            return updatedDisplay;
          }
        );
        return new CommonResponseDto(result, true, "Successfully Updated Kitchen Display");
      } catch (err) {
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException(getErrorMessage(err));
      }
    }
  
    async findAllByCompany(
      userId: number,
      queryData: GetKitchenDisplayQueryDto,
      pageOptions: PageOptionsDto
    ) {
      try {
        // Add pagination options if pageOptions are provided
        let paginationQuery: any = {};
        if (pageOptions?.page && pageOptions?.take) {
          const skip = (pageOptions.page - 1) * pageOptions.take;
          paginationQuery.limit = Number(pageOptions.take);
          paginationQuery.offset = Number(skip);
        }
  
        let whereCondition = {
          admin_id: userId,
          company_id: queryData.companyId,
        };
  
        // Add search functionality
        if (queryData?.search && queryData?.search !== "") {
          whereCondition["name"] = {
            [Op.like]: `%${queryData.search}%`,
          };
        }
  
        const kitchenDisplayList = await this.kitchenDisplayRepository.findAndCountAll({
          where: whereCondition,
          attributes: ["id", "name", "company_id"],
          order: [["createdAt", pageOptions.order || "DESC"]],
          ...paginationQuery,
        });
  
        const entities = kitchenDisplayList.rows;
        const itemCount = kitchenDisplayList.count;
        const pageMetaDto = new PageMetaDto({
          pageOptionsDto: pageOptions,
          itemCount,
        });
        const data = new PageDto(entities, pageMetaDto);
        return new CommonResponseDto(data, true, "Fetched Successfully");
      } catch (err) {
        console.log(err);
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException(getErrorMessage(err));
      }
    }
  
    async findOne(id: number, userId: number, companyId: number) {
      try {
        const kitchenDisplay = await this.kitchenDisplayRepository.findOne({
          where: {
            admin_id: userId,
            id: id,
            company_id: companyId,
          },
        });
  
        if (!kitchenDisplay) {
          return new CommonResponseDto({}, false, "Kitchen Display Not Found");
        }
  
        return new CommonResponseDto(kitchenDisplay, true, "Successfully Fetched");
      } catch (err) {
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException(getErrorMessage(err));
      }
    }
  
    async deleteOne(id: number, userId: number, companyId: number) {
      try {
        const kitchenDisplay = await this.kitchenDisplayRepository.destroy({
          where: {
            admin_id: userId,
            id: id,
            company_id: companyId,
          },
        });
  
        if (!kitchenDisplay) {
          return new CommonResponseDto({}, false, "Kitchen Display Not Found");
        }
  
        return new CommonResponseDto(kitchenDisplay, true, "Successfully Deleted");
      } catch (err) {
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException(getErrorMessage(err));
      }
    }
  }