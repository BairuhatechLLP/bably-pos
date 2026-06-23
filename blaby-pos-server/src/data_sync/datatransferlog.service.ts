import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { DataTransferLog } from "./datatranferlog.entity";

@Injectable()
export class DataSynclogService {
  constructor(
    @Inject("dataTransferLogRepository")
    private readonly dataTransferLogModel: typeof DataTransferLog
  ) {}

  async createDataTransferLog(
    createDataTransferLogDto: any
  ): Promise<DataTransferLog> {
    try {
      const newDataTransferLog = await this.dataTransferLogModel.create(
        createDataTransferLogDto
      );
      return newDataTransferLog;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getAllDataTransferLogs(): Promise<DataTransferLog[]> {
    try {
      const allLogs = await this.dataTransferLogModel.findAll();
      return allLogs;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getDataTransferLogById(id: number): Promise<DataTransferLog> {
    try {
      const log = await this.dataTransferLogModel.findByPk(id);
      if (!log) {
        throw new NotFoundException("DataTransferLog not found");
      }
      return log;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateDataTransferLog(
    id: number,
    updateDataTransferLogDto: any
  ): Promise<DataTransferLog> {
    try {
      const log = await this.dataTransferLogModel.findByPk(id);
      if (!log) {
        throw new NotFoundException("DataTransferLog not found"); 
      }
      await log.update(updateDataTransferLogDto);
      return log;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateDataTransferLogadminId(
    id: number,
    updateDataTransferLogDto: any
  ): Promise<DataTransferLog> {
    try {
      const log = await this.dataTransferLogModel.findOne({
        where: {
          adminId: id,
        },
      });
      if (!log) {
        throw new NotFoundException("DataTransferLog not found");
      }
      await log.update(updateDataTransferLogDto);
      return log;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async deleteDataTransferLog(id: number): Promise<string> {
    try {
      const deletedRows = await this.dataTransferLogModel.destroy({
        where: { id },
      });
      if (deletedRows === 0) {
        throw new NotFoundException("DataTransferLog not found");
      }
      return "DataTransferLog deleted successfully";
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
