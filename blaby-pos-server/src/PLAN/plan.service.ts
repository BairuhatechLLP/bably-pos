import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PlanRepository } from "./plan.repository";
import { CreatePlanDto } from "./dto/plan.create.dto";
import { UpdatePlanDto } from "./dto/plan.update.dto";
import { PlanDto } from "./dto/plan.dto";
import { PageOptionsDto } from "../shared/dto/Page-Options-Dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { getErrorMessage } from "../shared/helpers/errormessage";

@Injectable()
export class PlanService {
  constructor(private readonly PlanRepository: PlanRepository) {}
  async findOne(id: number) {
    try {
      const plan = await this.PlanRepository.findOne(id);
      const data = new PlanDto(plan);
      return new CommonResponseDto(data, true, "Successfully fetched");
    } catch (err) {
     console.log(err)
     throw err
    }
  }

  async findWithPagination(pageOptionsDto: PageOptionsDto) {
    try {
      const { rows, count } = await this.PlanRepository.findAndCountAll(
        pageOptionsDto
      );
      const data = rows.map((item) => new PlanDto(item));
      return { data, status: true, message: "success" };
    } catch (err) {
      console.log(err)
     throw err
    }
  }

  async create(data: CreatePlanDto) {
    try {
      const plan = await this.PlanRepository.create(data);
      if (!plan) throw new InternalServerErrorException();
      const created = new PlanDto(plan);
      return new CommonResponseDto(created, true, "Successfully Created");
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async update(id: number, data: UpdatePlanDto) {
    try {
      const plan = await this.PlanRepository.update(id, data);
      return new CommonResponseDto(plan, true, "Successfully Updated");
    } catch (err) {
      console.log(err)
     throw err
    }
  }

  async delete(id: number) {
    try {
      const plan = await this.PlanRepository.delete(id);
      return new CommonResponseDto(plan, true, "Successfully Deleted");
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}
