import { Inject, Injectable } from '@nestjs/common';
import { EmployeeCategoryDto } from './dto/employeeCategory.dto';
import { PayrollEmployeeCategory } from './employeeCategoryEntity';
import { CreateEmployeeCategoryDto } from './dto/employeeCategorycreate';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { UpdateEmployeeCategoryDto } from './dto/employeeCategory.update';
import { Op } from 'sequelize';

@Injectable()
export class EmployeeCategoryService {
  constructor(
    @Inject('productcategoryRepository')
    private readonly employeeCategoryRepository: typeof PayrollEmployeeCategory,
  ) {}

  async findAll(): Promise<any> {
    try {
      const employeeCategory = await this.employeeCategoryRepository.findAll({
        where: {
          isDleted: 0,
        },
      });
      return employeeCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async findOne(id: any): Promise<any> {
    try {
      const employeeCategory = await this.employeeCategoryRepository.findByPk(id);
      return employeeCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllUser(id: any): Promise<any> {
    try {
      const employeeCategory = await this.employeeCategoryRepository.findAll({
        where: { adminId: id, isDleted: 0 },
      });
      return employeeCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findListByCompany(adminid:number,companyid:number){
    try {
      const employeeCategory = await this.employeeCategoryRepository.findAll({
        where: { adminId: adminid, companyid },
      });
      return employeeCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(CreateProductCategoryDto: CreateEmployeeCategoryDto) {
    try {
      const checkNominalCode = await this.employeeCategoryRepository.findOne({
        where: {
          adminId: CreateProductCategoryDto.userid,
          emplyeeCategory: CreateProductCategoryDto.category,
        },
      });
      if (checkNominalCode) {
        return new CommonResponseDto(
          null,
          false,
          'Employee Category Already Exist',
        );
      }
      const employeeCategory = new PayrollEmployeeCategory();
      employeeCategory.emplyeeCategory = CreateProductCategoryDto.category;
      employeeCategory.adminId = CreateProductCategoryDto.userid;
      employeeCategory.companyid = CreateProductCategoryDto.companyid;
      employeeCategory.isDleted = 0;
      let saveData = await employeeCategory.save();
      return new CommonResponseDto(
        new EmployeeCategoryDto(saveData),
        true,
        'Employee Category Created Successfully',
      );
    } catch (err) {
      console.log('Expection in saving Employee Category details', err);
      throw err
    }
  }
  async update(
    updatteProductCategoryDto: any,
    id: number,
  ) {
    try {
      const foundedCategory = await this.employeeCategoryRepository.findByPk(
        id,
      );
      if (!foundedCategory) {
        return new CommonResponseDto(null, false, 'No Employee Category found');
      }
      foundedCategory.emplyeeCategory = updatteProductCategoryDto.category || foundedCategory.emplyeeCategory;
      let updated = await foundedCategory.save();
      return new CommonResponseDto(
        updated,
        true,
        'Employee Category Update Successfully',
      );
    } catch (err) {
      console.log('Expection in saving employee category details', err);
      throw err
    }
  }

  async findCategory(userId): Promise<any> {
    try {
      const data =
      await this.employeeCategoryRepository.findAll<PayrollEmployeeCategory>({
        where: {
          adminId: userId,
        },
      });
    return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data =
        await this.employeeCategoryRepository.findByPk<PayrollEmployeeCategory>(
          id,
        );

      if (!data) {
        return new CommonResponseDto(null, false, 'No Employee Category found');
      }

      data.isDleted = 1;
      let updated = await data.save();
      console.log(updated.isDleted);
      return new CommonResponseDto(
        null,
        true,
        'Employee Category Deleted Successfully',
      );
    } catch (error) {
      console.error('Error deleting employee category:', error);
      throw error
    }
  }
}
