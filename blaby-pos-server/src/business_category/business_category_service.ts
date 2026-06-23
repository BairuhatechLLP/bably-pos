import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { BusinessCategoryDto } from './dto/business_category_dto';
import { CreateBusinessCategoryDto } from './dto/create_business_category.dto';
import { UpdateBusinessCategoryDto } from './dto/update_business_category';
import { BusinessCategory } from './business_category_entity';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { Op } from 'sequelize';

@Injectable()
export class BusinessCategoryService {
  constructor(
    @Inject('BusinessCategoryRepository')
    private readonly BusinessCategoryRepository: typeof BusinessCategory,
  ) {}

  async findAll() {
    try {
      const business =
      await this.BusinessCategoryRepository.findAll<BusinessCategory>({});
    return new CommonResponseDto(
      business.map((business) => new BusinessCategoryDto(business)),
      true,
      'Business catagory List',
    );
    } catch (error) {
      console.log(error)
      throw error
    }
   
  }

  async findByAdminid(adminid:number){
    try {
      const business =
      await this.BusinessCategoryRepository.findAll<BusinessCategory>({
        where:{
          adminid:{
            [Op.or]:[adminid,-2]
          }
        }
      });
    return new CommonResponseDto(
      business.map((business) => new BusinessCategoryDto(business)),
      true,
      'Business catagory List',
    );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOneCategory(id: number) {
    const business =
      await this.BusinessCategoryRepository.findByPk<BusinessCategory>(id);
    return new BusinessCategoryDto(business);
  }

  async create(CreateBusinessCategoryDto: CreateBusinessCategoryDto) {
    try {
    
      const isExist = await BusinessCategory.findOne({ 
        where:{btitle:CreateBusinessCategoryDto.btitle} 
      });

      if (isExist) {
        return new CommonResponseDto(null, false, "Business category with the same title already exists");
      }
      const business = new BusinessCategory();
      business.btitle = CreateBusinessCategoryDto.btitle;
      business.status = CreateBusinessCategoryDto.status;
      business.adminid = CreateBusinessCategoryDto.adminid;
      let data =  business.save();
      if(data){
        return new CommonResponseDto(data,true,"Business category created successfully")
      }else{
        return new CommonResponseDto(data,false,"Failed to create business category")
      }

    } catch (error) {
      console.log(error)
      throw error
    }
  }

 async getBusinessCategory(id: number) {
    try {
      const business =
      await this.BusinessCategoryRepository.findByPk<BusinessCategory>(id);
    if (!business) {
      throw new HttpException(
        'No Business Category Found',
        HttpStatus.NOT_FOUND,
      );
    }
    return business;
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async update(id: number, UpdateBusinessCategoryDto: UpdateBusinessCategoryDto) {
    try {
      const business = await this.getBusinessCategory(id);
      if(business){
        business.btitle = UpdateBusinessCategoryDto.btitle || business.btitle;
        business.status = UpdateBusinessCategoryDto.status || business.status;
        business.adminid = UpdateBusinessCategoryDto.adminid || business.adminid;
        const updatedData =  business.save();
        return new CommonResponseDto(updatedData,true,"Business category updated successfully")
      }else{
        return new CommonResponseDto(null,false,"Failed to update business category")
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete(id: number) {
    try {
      const business = await this.getBusinessCategory(id);
      await business.destroy();
      return business;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
