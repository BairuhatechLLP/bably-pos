import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProductCategoryDto } from "./dto/product_category_dto";
import { ProductCategory } from "./product_category_entity";
import {
  CategoryType,
  CreateProductCategoryDto,
} from "./dto/product_category_create";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { UpdateProductCategoryDto } from "./dto/product_category_update";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";

@Injectable()
export class ProductCategoryService {
  constructor(
    @Inject("productcategoryRepository")
    private readonly ProductCategoryRepository: typeof ProductCategory
  ) {}

  async findAll(): Promise<any> {
    try {
      const productCategories = await this.ProductCategoryRepository.findAll();
      return productCategories;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const productCategories = await this.ProductCategoryRepository.findByPk(
        id
      );
      return productCategories;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByCategoryName(companyid: number, productCategory: string,isExact?: any) {
    try {
      let whereCase = {
        companyid: companyid,
        isDeleted:false,
      }
      if(isExact){
        whereCase["category"] = productCategory
      
      }else{
        whereCase["category"] = {
          [Op.like]: `%${productCategory}%`,
        }
      }

      const category = await this.ProductCategoryRepository.findAll({
        where: whereCase,
        order: [["id", "DESC"]]
      });
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllUser(id: any, companyid: number): Promise<any> {
    try {
      const productCategories = await this.ProductCategoryRepository.findAll({
        where: { userid: id, companyid,isDeleted:false }, order: [["id", "DESC"]]
      });
      return new CommonResponseDto(
        productCategories,
        true,
        "Product category list fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(CreateProductCategoryDto: CreateProductCategoryDto) {
    try {
      const checkExists = await this.ProductCategoryRepository.findOne({
        where: {
          userid: CreateProductCategoryDto.userid,
          categoryType: CreateProductCategoryDto.categoryType,
          category: CreateProductCategoryDto.category,
          companyid: CreateProductCategoryDto.companyid,
          isDeleted:false
        },
      });
      if (checkExists) {
        return new CommonResponseDto(
          null,
          false,
          "Product category already exists"
        );
      }
      const productcategory = new ProductCategory();
      productcategory.category = CreateProductCategoryDto.category;
      productcategory.categoryType = CreateProductCategoryDto.categoryType;
      productcategory.userid = CreateProductCategoryDto.userid;
      productcategory.companyid = CreateProductCategoryDto.companyid;
      productcategory.id_short = CreateProductCategoryDto.id_short;
      productcategory.isDeleted = false;
      let saveData = await productcategory.save();
      return new CommonResponseDto(
        new ProductCategoryDto(saveData),
        true,
        "product category created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(updateProductCategoryDto: UpdateProductCategoryDto, id: number) {
    try {
      const productcategory = await this.ProductCategoryRepository.findByPk(id);
      if (!productcategory) {
        return new CommonResponseDto(null, false, "No Product Category found");
      }
      productcategory.category =
        updateProductCategoryDto.category || productcategory.category;
      productcategory.categoryType =
        updateProductCategoryDto.categoryType || productcategory.categoryType;
      let updated = await productcategory.save();
      return new CommonResponseDto(
        updated,
        true,
        "Employee Category Update Successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByCategoryType(
    companyId: number,
    categoryType: CategoryType
  ): Promise<any> {
    try {
      const data =
        await this.ProductCategoryRepository.findAll<ProductCategory>({
          where: {
            categoryType,
            companyid: companyId,
            isDeleted:false
          },
          order: [["category", "ASC"]],
        });
      if (!data) {
        throw new NotFoundException(
          "No categories found in this category type"
        );
      }
      return new CommonResponseDto(
        data,
        true,
        "Product categories fetched successsfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findCategory(userId): Promise<any> {
    try {
      const data =
        await this.ProductCategoryRepository.findAll<ProductCategory>({
          where: {
            userid: userId,
            isDeleted:false
          },
          order: [["id", "DESC"]],
        });
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findIdShorts(comapanyId:number){
    try {
      const groupedData = await this.ProductCategoryRepository.findAll({
        attributes: [
          'id_short'
        ],
        where: {
          companyid: comapanyId,
          isDeleted: false,
          id_short: {
            [Op.ne]: null
          }
        },
        group: ['id_short'],
        raw: true,
      });
    return new CommonResponseDto(groupedData,true,"categories fetched successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async softDelete(id: any): Promise<CommonResponseDto> {
    try {
      const productCategory =
        await this.ProductCategoryRepository.findByPk<ProductCategory>(id);

      if (!productCategory) {
        return new CommonResponseDto(null, false, "No Product Category found");
      }
      productCategory.isDeleted = true;
      const updatedData = await productCategory.save();

      return new CommonResponseDto(
        updatedData,
        true,
        "Product Category Deleted Successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data =
        await this.ProductCategoryRepository.findByPk<ProductCategory>(id);

      if (!data) {
        return new CommonResponseDto(null, false, "No Product Category found");
      }

      await data.destroy();

      return new CommonResponseDto(
        null,
        true,
        "Product Category Deleted Successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
