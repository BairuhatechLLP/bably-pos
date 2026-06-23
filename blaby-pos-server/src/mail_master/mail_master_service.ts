import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CreateMailMasterDto } from './dto/mail_master_create';
import { MailMaster } from './mail_master_entity';
import { IsPhoneNumber } from 'class-validator';

@Injectable()
export class MailMasterService {
  constructor(
    @Inject('mailmasterRepository')
    private readonly mailmasterRepository: typeof MailMaster,
  ) {}

  async findAll() {
    try {
      const Mail = await this.mailmasterRepository.findAll<MailMaster>({});
      return Mail;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: number) {
    try {
      const Mail = await this.mailmasterRepository.findByPk<MailMaster>(
        id,
        {},
      );
      if (!MailMaster) {
        throw new HttpException('No User found', HttpStatus.NOT_FOUND);
      }
      return Mail.save();
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(CreateMailMasterDto: CreateMailMasterDto) {
    try {
      const Mail = new MailMaster();
      Mail.email = CreateMailMasterDto.email;
      return Mail.save();
    } catch (error) {
      console.log(error)
      throw error
    }
  }

   async getMail(id: number) {
    try {
      const Mail = await this.mailmasterRepository.findByPk<MailMaster>(id);
      if (!Mail) {
        throw new HttpException('No User found', HttpStatus.NOT_FOUND);
      }
      return Mail;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
