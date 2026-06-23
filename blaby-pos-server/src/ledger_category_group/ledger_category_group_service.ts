import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { LedgerCategoryGroup } from "./ledger_category_group_model";

import { LedgerCategoryGroupDto } from "./dto/ledger_category_group_dto";

import { UpdateLedgerCategoryGroupDto } from "./dto/ledger_category_group_update_dto";
import { CreateLedgerCategoryGroupDto } from "./dto/ledger_category_group_create_dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "./../shared/dto";

@Injectable()
export class LedgerCategoryGroupService {
  constructor(
    @Inject("LedgerCategoryRepository")
    private readonly cartRepository: typeof LedgerCategoryGroup
  ) {}

  async findAll() {
    try {
      const cart = await this.cartRepository.findAll<LedgerCategoryGroup>({});
      return cart.map((cart) => new LedgerCategoryGroupDto(cart));
    } catch (error) {
      console.log("Error---->", error);
      throw error;
    }
  }

  async findAllPages(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp =
        await this.cartRepository.findAndCountAll<LedgerCategoryGroup>({
          where: {},
          limit: 10,
          offset: skip,
          order: [["id", pageOptionsDto.order]],
        });

      const entities = exp.rows.map((ctry) => new LedgerCategoryGroupDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(id: number) {
    try {
      const cart = await this.cartRepository.findByPk<LedgerCategoryGroup>(id);
      if (!cart) {
        throw new HttpException(
          "cart with given id not found",
          HttpStatus.NOT_FOUND
        );
      }
      return new LedgerCategoryGroupDto(cart);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createDto: CreateLedgerCategoryGroupDto) {
    try {
      const cart = new LedgerCategoryGroup();
      cart.categorygroup = createDto.categorygroup;

      return cart.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateLedgerCategoryGroupDto) {
    try {
      const cart = await this.cartRepository.findByPk<LedgerCategoryGroup>(id);
      if (!cart) {
        throw new HttpException("cart not found.", HttpStatus.NOT_FOUND);
      }

      cart.categorygroup = updateDto.categorygroup || cart.categorygroup;
      const data = await cart.save();
      return new LedgerCategoryGroupDto(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const cart = await this.cartRepository.findByPk<LedgerCategoryGroup>(id);
      await cart.destroy();
      return new LedgerCategoryGroupDto(cart);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
