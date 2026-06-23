import { Inject, Injectable } from "@nestjs/common";
import { DiningTable } from "./dining_table.entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateDiningTableDto } from "./dto/create.dto";

@Injectable()
export class DiningTableService {
  constructor(
    @Inject("DiningTableRepository")
    private readonly repository: typeof DiningTable
  ) {}

  async create(createDto: CreateDiningTableDto, userId: number) {
    try {
      const diningTableData = await this.repository.create({
        table_number: createDto?.table_number,
        capacity: createDto?.capacity,
        status: createDto?.status,
        section: createDto?.section,
        admin_id: userId,
        company_id: createDto?.company_id,
      });

      return new CommonResponseDto(
        diningTableData,
        true,
        "Dining table data added successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findListByCompanyId(companyid: number) {
    try {
      const tableList = await this.repository.findAll({
        where: {
          company_id: companyid,
        },
      });
      return new CommonResponseDto(
        tableList,
        true,
        "Dining table list fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
