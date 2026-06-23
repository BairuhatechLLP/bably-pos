import { Inject, Injectable } from '@nestjs/common';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { PayrollPaySHeetItemDTO } from './dto/paysheetItems.dto';
import { CreatePaysheetItemsDto } from './dto/paysheetItemscreate';
import { PayrollPaySheetItem } from './paysheetItemsEntity';
import { AccountMaster } from '../account_master/account_master';

@Injectable()
export class PaySheetItemsService {
  constructor(
    @Inject('paySheetItemsRepository')
    private readonly paySheetItemsRepository: typeof PayrollPaySheetItem,
  ) {}

  async findAll(): Promise<any> {
    try {
      const paySheetItemsCategory = await this.paySheetItemsRepository.findAll();
      return paySheetItemsCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllByPaysheet(id: any): Promise<any> {
    try {
      const paySheetItemsCategory = await this.paySheetItemsRepository.findAll({
        where: {
          paySheetId: parseInt(id),
        },
        raw:true
      });
      return paySheetItemsCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllByPaysheetId(id: any): Promise<any> {
    try {
      const paySheetItemsCategory = await this.paySheetItemsRepository.findAll({
        where: {
          paySheetId: parseInt(id),
        },
        include: [{ model: AccountMaster, as: 'payHead' }]
      });
      return paySheetItemsCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  

  async findAllUser(id: any): Promise<any> {
    try {
      const paySheetItemsCategory = await this.paySheetItemsRepository.findAll({
        where: { adminId: id },
      });
      return paySheetItemsCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async bulkPasheetItemCreate(array: any, transaction: any) {
    try {
      let response = await this.paySheetItemsRepository.bulkCreate(
        array,
        transaction,
      );
      return { success: true, data: response };
    } catch (error) {
      console.log(error)
      throw error
    }
  }


  async create(CreateProductCategoryDto: CreatePaysheetItemsDto) {
    try {
      const newPaySheetItem = new PayrollPaySheetItem();
      newPaySheetItem.adminId = CreateProductCategoryDto.adminId;
      newPaySheetItem.calculationType =
        CreateProductCategoryDto.calculationType;
      newPaySheetItem.calculationValue =
        CreateProductCategoryDto.calculationValue;
      newPaySheetItem.type = CreateProductCategoryDto.type;
      newPaySheetItem.percentageof =
        CreateProductCategoryDto.percentageof || '';

      let saveData = await newPaySheetItem.save();
      return new CommonResponseDto(
        new PayrollPaySHeetItemDTO(saveData),
        true,
        'Employee Category Created Successfully',
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(updatteProductCategoryDto: any, id: any) {
    try {
      const foundedCategory = await this.paySheetItemsRepository.findByPk(id);
      if (foundedCategory) {
        return new CommonResponseDto(null, false, 'No Pay Sheet Item found');
      }
      foundedCategory.calculationValue =
        updatteProductCategoryDto.calculationValue ||
        foundedCategory.calculationValue;
      let updated = await foundedCategory.save();
      return new CommonResponseDto(
        updated,
        true,
        'Pay Sheet Item Update Successfully',
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findCategory(userId): Promise<any> {
    try {
      const data =
      await this.paySheetItemsRepository.findAll<PayrollPaySheetItem>({
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

  async deleteByPaySheetId(id:any) {
    try {
      const items = await this.paySheetItemsRepository.destroy<PayrollPaySheetItem>({
        where: { paySheetId: id }
      });      
      if (items) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      throw err
    }
  }


  
  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data =
        await this.paySheetItemsRepository.findByPk<PayrollPaySheetItem>(id);

      if (!data) {
        return new CommonResponseDto(null, false, 'No Employee Category found');
      }

      await data.destroy();

      return new CommonResponseDto(
        null,
        true,
        'Employee Category Deleted Successfully',
      );
    } catch (error) {
      console.error('Error deleting paySheetItems category:', error);
      return new CommonResponseDto(
        null,
        false,
        'Error deleting paySheetItems category',
      );
    }
  }
}
