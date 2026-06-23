import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Tax, Tax as tax } from './tax_master_entity';
import { TaxDto } from './dto/tax_master_dto';
import { PageDto, PageMetaDto, PageOptionsDto } from '../shared/dto';
import { CreateTaxMasterDto } from './dto/create_tax_master';
import { UpdateTaxMasterDto } from './dto/update_tax_master';
import { CommonResponseDto } from '../shared/dto/common-response.dto';

@Injectable()
export class TaxService {
  constructor(
    @Inject('TaxRepository')
    private readonly cartRepository: typeof Tax,
  ) { }

  async findAll(adminid: number) {
    try {
      const tax = await this.cartRepository.findAll<Tax>({
        where: { adminid: adminid },
        order: [['percentage', 'ASC']],
      });
      return tax.map((tax) => new TaxDto(tax));
    } catch (error) {
      console.log(error)
      throw error
    }
  }


  async findAllByCompany(adminid: number, companyid: number) {
    try {
      const tax = await this.cartRepository.findAll<Tax>({
        where: { adminid, companyid },
        order: [['percentage', 'ASC']],
      });
      return new CommonResponseDto(tax.map((tax) => new TaxDto(tax)), true, 'Tax list fetched successfully');
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllByCompanyAndTax(companyid: number, taxPercentage: any) {
    try {
      const tax = await this.cartRepository.findAll<Tax>({
        where: { companyid, percentage: taxPercentage },
        order: [['percentage', 'ASC']],
      });
      return tax.map((tax) => new TaxDto(tax));
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllByCountryId(countryId) {
    try {
      const tax = await this.cartRepository.findAll<Tax>({
        where: {
          countryid: countryId,
        },
        order: [['percentage', 'ASC']],
      });
      return new CommonResponseDto(
        tax.map((tax) => new TaxDto(tax)),
        true,
        'Tax List',
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllPage(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp = await this.cartRepository.findAndCountAll<Tax>({
        where: {},
        limit: 10,
        offset: skip,
        order: [['id', pageOptionsDto.order]],
      });
      const entities = exp.rows.map((ctry) => new TaxDto(ctry));
      const itemCount = exp.count;
      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getOne(id: number) {
    try {
      const tax = await this.cartRepository.findByPk<Tax>(id);
      if (!tax) {
        throw new HttpException(
          'Tax Master with given id not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return new TaxDto(tax);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(createDto: CreateTaxMasterDto) {
    let response;
    try {
      const checkExists = await this.cartRepository.findOne({
        where: {
          adminid: createDto.adminid,
          percentage: createDto.percentage,
          type: createDto.type,
          companyid: createDto.companyid
        },
      });
      if (checkExists) {
        return new CommonResponseDto(
          null,
          false,
          'Tax percentage already exists',
        );
      }

      const tax = new Tax();
      tax.adminid = createDto.adminid;
      tax.type = createDto.type;
      tax.percentage = createDto.percentage;
      tax.countryid = createDto.countryid;
      tax.companyid = createDto.companyid;
      const taxData = await tax.save();
      response = {
        data: taxData,
        status: true,
        message: 'Tax Percentage created successfully'
      }

    } catch (error) {
      console.log(error)
      throw error
    }
    return response
  }

  async update(id: number, updateDto: UpdateTaxMasterDto) {
    let response;
    try {
      const tax = await this.cartRepository.findByPk<tax>(id);
      if (!tax) {
        throw new HttpException('Tax Master not Found !', HttpStatus.NOT_FOUND);
      }
      tax.type = updateDto.type || tax.type;
      tax.percentage = updateDto.percentage || tax.percentage;
      tax.countryid = updateDto.countryid || tax.countryid;
      tax.adminid = updateDto.adminid || tax.adminid;
      tax.companyid = updateDto.companyid || tax.companyid;
      const data = await tax.save();
      response = {
        data: data,
        status: true,
        message: 'Tax percentage updated successfully'
      }
    } catch (error) {
      console.log(error)
      throw error
    }
    return response
  }

  async delete(id: number) {
    try {
      const tax = await this.cartRepository.findByPk<Tax>(id);
      await tax.destroy();
      return new TaxDto(tax);
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
