import { Injectable, Inject } from '@nestjs/common';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { HsnCode } from './hsn_code.entity';
import { CreateHsnCodeDto } from './dto/create_hsn_code.dto';
import { UpdateHsnCodeDto } from './dto/update_hsn_code.dto';

@Injectable()
export class HsnCodeService {
  constructor(
    @Inject('HsnCodeRepository')
    private readonly HsnCodeRepository: typeof HsnCode,
  ) {}

  async findAll(){
    try {
        const data = await this.HsnCodeRepository.findAll();
        return new CommonResponseDto(data,true,'HSN codes fetched successfully')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: any) {
    try {
        const data = await this.HsnCodeRepository.findByPk(id);
        return new CommonResponseDto(data,true,'HSN code fetched successfully')
    } catch (error) {
      console.log(error)
      throw error
    };
  }

  async findAllForUser(id: any) {
    try {
      const data = await this.HsnCodeRepository.findAll({
        where: {
          adminid: id,
        },
      });
      return new CommonResponseDto(data,true,'HSN code fetched successfully')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findListByCompany(adminid:number,companyid:number){
    try {
      const data = await this.HsnCodeRepository.findAll({
        where: {
          adminid,
          companyid
        },
      });
      return new CommonResponseDto(data,true,'HSN code fetched successfully')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(CreateHsnCodeDto: CreateHsnCodeDto) {
    try {
      const checkExists = await this.HsnCodeRepository.findOne({
        where: {
          hsn_code: CreateHsnCodeDto.hsn_code,
          adminid: CreateHsnCodeDto?.adminid,
          companyid:CreateHsnCodeDto.companyid
        },
      });
      if (checkExists) {
        return new CommonResponseDto(null, false, 'HSN/SAC Code Already Exist');
      }
      const hsn_code = new HsnCode();
      hsn_code.hsn_code = CreateHsnCodeDto.hsn_code;
      hsn_code.companyid = CreateHsnCodeDto.companyid;
      hsn_code.adminid = CreateHsnCodeDto.adminid;
      hsn_code.description = CreateHsnCodeDto.description;
      let saveData = await hsn_code.save();
      return new CommonResponseDto(saveData,true,'HSN code created successfully')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: number,UpdateHsnCodeDto: UpdateHsnCodeDto) {
    try {
      const code: any = await this.HsnCodeRepository.findByPk(id);
      if (code) {
        code.hsn_code = UpdateHsnCodeDto.hsn_code || code.hsn_code;
        code.companyid = UpdateHsnCodeDto.companyid || code.companyid;
        code.adminid = UpdateHsnCodeDto.adminid ||  code.adminid;
        code.description = UpdateHsnCodeDto.description || code.description;
        let updatedData = await code.save();
        return new CommonResponseDto(updatedData,true,'HSN code details updated successfully')
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }


  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data = await this.HsnCodeRepository.findByPk(id);

      if (!data) {
        return new CommonResponseDto(null, false, 'No hsn code found');
      }

      await data.destroy();

      return new CommonResponseDto(null, true, 'HSN code Deleted Successfully');
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
