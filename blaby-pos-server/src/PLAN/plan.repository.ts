import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Plan } from "./plan.entity";
import { PageOptionsDto } from "../shared/dto/Page-Options-Dto";
import { CreatePlanDto } from "./dto/plan.create.dto";
import { UpdatePlanDto } from "./dto/plan.update.dto";

@Injectable()
export class PlanRepository {
  constructor(
    @Inject("PlanRepository")
    private readonly PlanRepo: typeof Plan
  ) {}
  async findOne(id: number) {
    try {
      const plan = await this.PlanRepo.findByPk(id);
      if (!plan) throw new NotFoundException();
      return plan;
    } catch (err) {
      throw err;
    }
  }

  async findAndCountAll(pageOptionsDto: PageOptionsDto) {
    try {
      return await this.PlanRepo.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit: pageOptionsDto.take,
        offset: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      });
    } catch (err) {
      throw err;
    }
  }

  async create(data: CreatePlanDto) {
    try {
      return await this.PlanRepo.create({
        name: data.name,
        company: data.company,
        counter: data.counter,
        retailXpressWithTaxgo: data.retailXpressWithTaxgo,
        period: data.period,
        soleTrader:data.soleTrader,
        currencyCode:data.currencyCode
      });
    } catch (err) {
      throw err;
    }
  }

  async update(id: number, data: UpdatePlanDto) {
    try {
      const [updated, updatedData] = await this.PlanRepo.update(data, {
        where: { id },
        returning: true,
      });
      if (updated == 0) throw new NotFoundException();
      return updatedData;
    } catch (err) {
      throw err;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.PlanRepo.destroy({
        where: { id },
      });
      if (deleted == 0) throw new NotFoundException();
      return deleted;
    } catch (err) {
      throw err;
    }
  }
}
