import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { LedgerCategory } from "./ledger_category_model";

import { LedgerCategoryDto } from "./dto/ledger_category_dto";

import { UpdateLedgerCategoryDto } from "./dto/ledger_category_update_dto";
import { CreateLedgerCategoryDto } from "./dto/ledger_category_create_dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "./../shared/dto";
import { CommonResponseDto } from "./../shared/dto/common-response.dto";
import { Op } from "sequelize";
import { LedgerCategoryGroup } from "../ledger_category_group/ledger_category_group_model";

@Injectable()
export class LedgerCategoryService {
  constructor(
    @Inject("LedgerCategoryRepository")
    private readonly cartRepository: typeof LedgerCategory
  ) {}

  async findAll() {
    try {
      const cart = await this.cartRepository.findAll<LedgerCategory>({
        where: {
          id: {
            [Op.ne]: 1, // bank and cash under current asset (duplicate one)
          },
        },
      });
      return cart.map((cart) => new LedgerCategoryDto(cart));
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async search(id, name) {
    try {
      let whereCase = {
        adminid: [id, -2],
        id: {
          [Op.ne]: 1, // bank and cash under current asset (duplicate one)
        },
      };
      if (name?.length) {
        whereCase["category"] = { [Op.like]: `${name}%` };
      }
      const cart = await this.cartRepository.findAll<LedgerCategory>({
        where: whereCase,
        limit: 20,
        raw: true,
      });
      return cart;
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async defaultLedgerCategory() {
    try {
      const query = {
        adminid: -2,
        id: {
          [Op.ne]: 1, // bank and cash under current asset (duplicate one)
        },
      };
      const cart = await this.cartRepository.findAll<LedgerCategory>({
        where: query,
      });
      return new CommonResponseDto(
        cart.map((cart) => new LedgerCategoryDto(cart)),
        true,
        "Default Ledger catagories"
      );
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async myLedgerCategory(adminid,companyid) {
    try {
      let query = {
            adminid: adminid,
            companyid

          }
      const cart = await this.cartRepository.findAll<LedgerCategory>({
        where: query,
      });
      return new CommonResponseDto(
        cart.map((cart) => new LedgerCategoryDto(cart)),
        true,
        "Default Ledger catagories"
      );
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async findAllByQuery(query) {
    try {
      const cart = await this.cartRepository.findAll<LedgerCategory>(query
      );
      return cart.map((cart) => new LedgerCategoryDto(cart));
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }
  async findAllPages(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp = await this.cartRepository.findAndCountAll<LedgerCategory>({
        where: {},
        limit: 10,
        offset: skip,
        order: [["id", pageOptionsDto.order]],
      });

      const entities = exp.rows.map((ctry) => new LedgerCategoryDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }
  async getOne(id: number) {
    try {
      const cart = await this.cartRepository.findByPk(id);
      if (!cart) {
        throw new HttpException(
          "cart with given id not found",
          HttpStatus.NOT_FOUND
        );
      }
      return new LedgerCategoryDto(cart);
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async findOne(id: number) {
    try {
      const cart = await this.cartRepository.findByPk(id);
      if (!cart) {
        throw new HttpException(
          "cart with given id not found",
          HttpStatus.NOT_FOUND
        );
      }
      return new CommonResponseDto(cart, true, "category details");
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async create(createDto: CreateLedgerCategoryDto) {
    try {
      const cart = new LedgerCategory();
      const category = await this.cartRepository.findOne({
        where: {
          adminid: createDto.adminid,
          category: createDto.category,
        },
      });
      if (category) {
        return {
          data: null,
          status: false,
          message: "Category Already Exist",
        };
      }
      cart.category = createDto.category;
      cart.adminid = createDto.adminid;
      cart.categorygroup = createDto.categorygroupid;
      cart.createdBy = createDto.createdBy;
      cart.companyid = createDto.companyid;
      let saveData = await cart.save();
      return {
        data: saveData,
        status: true,
        message: "Ledger Catagory created",
      };
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async update(id: number, updateDto: UpdateLedgerCategoryDto) {
    try {
      const cart = await this.cartRepository.findByPk<LedgerCategory>(id);
      if (!cart) {
        throw new HttpException("cart not found.", HttpStatus.NOT_FOUND);
      }
      cart.category = updateDto.category || cart.category;
      cart.adminid = updateDto.adminid || cart.adminid;
      cart.categorygroup = updateDto.categorygroupid || cart.categorygroup;
      cart.createdBy = updateDto.createdBy || cart.createdBy;
      cart.companyid = updateDto.companyid || cart.companyid;
      const data = await cart.save();
      return {
        data: data,
        status: true,
        message: "Ledger category updated successfully",
      };
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }

  async delete(id: number) {
    try {
      const cart = await this.cartRepository.findByPk<LedgerCategory>(id);
      await cart.destroy();
      return new LedgerCategoryDto(cart);
    } catch (error) {
      console.log("Error---->", error);
      throw error
    }
  }
}
