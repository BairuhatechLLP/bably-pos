import { Inject, Injectable } from '@nestjs/common';
import { unit } from './unit.entity';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { CreateUnit } from './dto/unit.create';
import { UnitDto } from './dto/unit.dto';
import { UpdateUnitDto } from './dto/unit.update';
import { Op } from 'sequelize';

@Injectable()
export class UnitService {
  constructor(
    @Inject('unitRepository')
    private readonly unitRepository: typeof unit,
  ) {}
  async findAll(): Promise<any> {
    try {
      const unitList = await this.unitRepository.findAll();
      return unitList;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const location = await this.unitRepository.findByPk(id);
      return location;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllForUser(id: any): Promise<any> {
    try {
      const unitList = await this.unitRepository.findAll({
        where: {
          adminId: id,
          isDeleted:false
        },
      });
      return unitList;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findByUnitAndCompany(companyid: number,unit:any): Promise<any> {
    try {
      const unitList = await this.unitRepository.findAll({
        where: {
          companyid: companyid,
          unit: {
            [Op.like]: `%${unit}%`
          },
          isDeleted:false
        },
      });
    return unitList
    }catch(error){
      console.log(error)
      throw error
    }
  }

  async findListByCompany(adminid:number,companyid:number){
    try {
      const unitList = await this.unitRepository.findAll({
        where: {
          adminId: adminid,
          companyid,
          isDeleted:false
        },
        order: [["id", "DESC"]]
      });
      return new CommonResponseDto(unitList,true,'Unit list fetched successfully');
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(createUnits: CreateUnit) {
    try {
      const checkNominalCode = await this.unitRepository.findOne({
        where: {
          unit: createUnits.unit,
          adminId: createUnits?.userid,
          companyid:createUnits.companyid,
          isDeleted:false
        },
      });
      if (checkNominalCode) {
        return new CommonResponseDto(null, false, 'Unit already exists');
      }
      const unitEntity = new unit();
      unitEntity.unit = createUnits.unit;
      unitEntity.companyid = createUnits.companyid;
      unitEntity.adminId = createUnits.userid;

      unitEntity.decimalValues = createUnits.decimalValues;
      unitEntity.formalName = createUnits.formalName;
      unitEntity.isDeleted = false;
      let saveData = await unitEntity.save();
      return new CommonResponseDto(
        new UnitDto(saveData),
        true,
        ' Unit created successfully',
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(updatteProductCategoryDto: UpdateUnitDto, id: number) {
    try {
      const foundedCategory: any = await this.unitRepository.findByPk(id);
      if (foundedCategory) {
        foundedCategory.unit = updatteProductCategoryDto.unit;
        foundedCategory.formalName = updatteProductCategoryDto.formalName;
        foundedCategory.decimalValues = updatteProductCategoryDto.decimalValues;
        let updated = await foundedCategory.save();
        return new CommonResponseDto(
          updated,
          true,
          'Employee Category Update Successfully',
        );
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async softDelete(id: any): Promise<CommonResponseDto> {
    try {
      const unitData = await this.unitRepository.findByPk<unit>(id);

      if (!unitData) {
        return new CommonResponseDto(null, false, 'No unit found');
      }

      unitData.isDeleted = true;
      const updatedData = await unitData.save();

      return new CommonResponseDto(updatedData, true, 'Unit Deleted Successfully');
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data = await this.unitRepository.findByPk<unit>(id);

      if (!data) {
        return new CommonResponseDto(null, false, 'No unit found');
      }

      await data.destroy();

      return new CommonResponseDto(null, true, 'Unit Deleted Successfully');
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
