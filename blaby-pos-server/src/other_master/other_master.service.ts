import { Injectable, Inject } from "@nestjs/common";
import { OtherMaster } from "./other_master.entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateOtherMasterDto } from "./dto/other_master.create.dto";
import { UpdateOtherMasterDto } from "./dto/other_master.update.dto";

@Injectable()
export class OtherMasterService {
  constructor(
    @Inject("OtherMasterRepository")
    private readonly OtherMasterRepository: typeof OtherMaster
  ) {}

  async findAll() {
    try {
      const otherData =
      await this.OtherMasterRepository.findAll<OtherMaster>({});
    return new CommonResponseDto(
      otherData,
      true,
      'Other list fetched successfully',
    );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllByQuery(query: any) {
    try {
      const data = await this.OtherMasterRepository.findAll<OtherMaster>(query);
      return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: number) {
    try {
        const otherData =
        await this.OtherMasterRepository.findByPk<OtherMaster>(id);
        return new CommonResponseDto(otherData,true,"Other data fetched successfully")
    } catch (error) {
        console.log(error)
        throw error
    }

  }

  async create(createDto: CreateOtherMasterDto) {
    try {
      const otherData = new OtherMaster();
      otherData.type = createDto.type;
      otherData.adminId = createDto.adminId;
      otherData.companyId = createDto.companyId;
      otherData.total = createDto.total;
      otherData.bankid = createDto.bankid;
      otherData.cname = createDto.cname;
      otherData.ledgerId = createDto.ledgerId;
      otherData.reference = createDto.reference;
      otherData.createdBy = createDto.createdBy;
      otherData.date = createDto.date;
      let createdData = await otherData.save();
    
    return new CommonResponseDto(createdData,true,"Other data created successfully")
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: number, updateDto: UpdateOtherMasterDto) {
    try {
      const otherData = await this.OtherMasterRepository.findByPk(id);
      if(otherData){
        otherData.type = updateDto.type || otherData.type;
        otherData.adminId = updateDto.adminId || otherData.adminId;
        otherData.companyId = updateDto.companyId || otherData.companyId;
        otherData.total = updateDto.total || otherData.total;
        otherData.date = updateDto.date || otherData.date;
        otherData.bankid = updateDto.bankid || otherData.bankid;
        otherData.cname = updateDto.cname || otherData.cname;
        otherData.ledgerId = updateDto.ledgerId || otherData.ledgerId;
        otherData.reference = updateDto.reference || otherData.reference;
        otherData.createdBy = updateDto.createdBy || otherData.createdBy;
        const updatedData = await otherData.save();

        return new CommonResponseDto(updatedData,true,"Other data updated successfully")
      }else{
        return new CommonResponseDto(null,false,"Failed to update other data")
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete(id: number) {
    try {
        const otherData = await this.OtherMasterRepository.findByPk(id);
      await otherData.destroy();
      return otherData;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

}
