import { Injectable, Inject } from '@nestjs/common';
import { PageDto, PageMetaDto, PageOptionsDto } from '../shared/dto';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { Contactus } from './contactus-model';
import { MailService } from '../mail/mail_service';

@Injectable()
export class ContactusService {
  @Inject(MailService)
  private readonly mailService: MailService;
  constructor(
    @Inject('ContactusRepository')
    private readonly contactusRepository: typeof Contactus,
  ) {}

  async findAllPages(pageOptionsDto: PageOptionsDto) {
    try {
      const skip =
      (Number(pageOptionsDto.page) - 1) * Number(pageOptionsDto.take);
    const exp = await this.contactusRepository.findAndCountAll<Contactus>({
      where: {},
      limit: Number(pageOptionsDto.take),
      offset: skip,
      order: [['id', pageOptionsDto.order]],
    });

    const entities = exp.rows.map((ctry) => ctry);
    const itemCount = exp.count;

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error)
      throw error
    }
   
  }
  async create(createDto: any) {
    let response: CommonResponseDto;
    try {
      const cart = new Contactus();
      cart.name = createDto.name;
      cart.email = createDto.email;
      cart.phone = createDto.phone;
      cart.message = createDto.message;
      cart.ContactOption = createDto.ContactOption;
      cart.timeZone = createDto.timeZone;
      cart.sdate = createDto.sdate;

      let createContactus: any = await cart.save();
      if (createContactus) {
        if( createDto.ContactOption == 'schedule'){
          this.mailService.scheduleDemoMail(createDto)
        }else{
          this.mailService.sendContactUsMail(createDto);
        }
      }
      response = {
        status: true,
        message: 'Your request submitted Successfully',
        data: createContactus,
      };
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }
}
