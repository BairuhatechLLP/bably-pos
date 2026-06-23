import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Countries } from './countries_model';

import { CountriesDto } from './dto/countries_dto';

import { UpdateCountriesDto } from './dto/countries_update_dto';
import { CreateCountriesDto } from './dto/countries_create_dto';
import { PageDto, PageMetaDto, PageOptionsDto } from './../shared/dto';
import { CommonResponseDto } from '../shared/dto/common-response.dto';

@Injectable()
export class CountriesService {
  constructor(
    @Inject('CountryRepository')
    private readonly cartRepository: typeof Countries,
  ) {}

  async findAll() {
    try {
      const cart = await this.cartRepository.findAll<Countries>({});
      return new CommonResponseDto(
        cart.map((cart) => new CountriesDto(cart)),
        true,
        'Country List',
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  
  }
  async findAllPages(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp = await this.cartRepository.findAndCountAll<Countries>({
        where: {},
        limit: 10,
        offset: skip,
        order: [['id', pageOptionsDto.order]],
      });
  
      const entities = exp.rows.map((ctry) => new CountriesDto(ctry));
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
      const cart = await this.cartRepository.findByPk<Countries>(id);
      if (!cart) {
        throw new HttpException(
          'cart with given id not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return new CountriesDto(cart);
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(createDto: CreateCountriesDto) {
    try {
      const cart = new Countries();
      cart.name = createDto.name;
      cart.code = createDto.code;
      return cart.save();
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: number, updateDto: UpdateCountriesDto) {
    try {
      const cart = await this.cartRepository.findByPk<Countries>(id);
      if (!cart) {
        throw new HttpException('cart not found.', HttpStatus.NOT_FOUND);
      }
  
      cart.name = updateDto.name || cart.name;
      cart.code = updateDto.code || cart.code;
      const data = await cart.save();
      return new CountriesDto(data);
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async delete(id: number) {
    try {
      const cart = await this.cartRepository.findByPk<Countries>(id);
      await cart.destroy();
      return new CountriesDto(cart);
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
