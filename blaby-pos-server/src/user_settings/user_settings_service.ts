import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  forwardRef,
} from '@nestjs/common';
import { UserService } from '../users/user.services';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { UserSettings } from './user_settings_entity';
import { InvoiceNoService } from '../invoiceno/invoiceno.service';

@Injectable()
export class UserSettingsService {
  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @Inject(InvoiceNoService)
  private readonly invoiceNoService: InvoiceNoService;

  constructor(
    @Inject('UserSettingsRepository')
    private readonly userSettingsRepository: typeof UserSettings,
  ) {}

  async findAllInvoiceNoConfig(adminid,companyid,locationId) {
    try {
      const user = await this.userService.getUser(adminid);
    if (!user) {
      throw new HttpException('No User found', HttpStatus.NOT_FOUND);
    }
    let settings: any = await this.userSettingsRepository.findOne<UserSettings>(
      {
        where: {
          type: 'invoice_number',
          adminid: adminid,
          companyid:companyid,
          locationId
        },
      },
    );

    if (!settings || settings.value.length === 0) {
      let defaultConfig = [];
      let index = 0;
      const invoiceTypes = [
        'sales',
        'purchase',
        'scredit',
        'pcredit',
        'proforma',
        'reccuring',
      ];
      for (let type of invoiceTypes) {
        index++;
        let defInvNo = 1;
        let defInvPrefix = type.substring(0, 2);
        let invResponse = await this.invoiceNoService.getInvoiceNo(
          adminid,
          companyid,
          locationId,
          type,
        );
        if (invResponse.status && invResponse.data) {
          let invNo = invResponse.data.split('-');
          defInvNo = Number(invNo[1]);
          defInvPrefix = invNo[0];
          let configObj = this.getDefaultInvObject(
            index,
            type,
            defInvPrefix,
            defInvNo,
            defInvNo - 1,
          );
          defaultConfig.push(configObj);
        }
      }
      if (defaultConfig && !settings) {
        let createConfig = await this.create(adminid,companyid,locationId, defaultConfig);
        if (createConfig.status) settings = createConfig.data;
      } else {
        settings.value = defaultConfig;
        let createConfig = await settings.save();
        if (createConfig.status) settings = createConfig.data;
      }
    }
    return settings;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  getDefaultInvObject(index, type, prefix, startNo, currentNo) {
    return {
      id: index,
      desc:
        type === 'sales'
          ? 'Sale Invoice'
          : type === 'purchase'
          ? 'Purchase Invoice'
          : type === 'scredit'
          ? 'Credit Note'
          : type === 'pcredit'
          ? 'Debit Note'
          : type === 'proforma'
          ? 'Proforma Invoice'
          : type === 'reccuring'
          ? 'reccuring sales'
          : '',
      type: type,
      prefix: prefix,
      startNumber: startNo,
      currentInvNumber: currentNo,
    };
  }

  async findOne(id: number) {
    try {
      const userSettings =
      await this.userSettingsRepository.findByPk<UserSettings>(id, {});
    if (!userSettings) {
      throw new HttpException('No User Settings found', HttpStatus.NOT_FOUND);
    }
    return userSettings;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(adminid, companyid,locationId,configObject) {
    try {
      const userSettings =
        await this.userSettingsRepository.create<UserSettings>({
          type: 'invoice_number',
          adminid: adminid,
          value: configObject,
          companyid:companyid,
          locationId:locationId
        });
      if (userSettings) {
        return new CommonResponseDto(
          userSettings,
          true,
          'Invoice No Config created successfully.',
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          'Error in creating Invoice No Config.',
        );
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateInvoiceConfig(
    adminid: any,
    companyid:number,
    locationId:number,
    updatedValues: any,
  ): Promise<UserSettings> {
    try {
      const user = await this.userService.getUser(adminid);
      if (!user) {
        throw new HttpException('No User found', HttpStatus.NOT_FOUND);
      }
      let settings = await this.userSettingsRepository.findOne<UserSettings>({
        where: {
          type: 'invoice_number',
          adminid: adminid,
          companyid,
          locationId
        },
      });
      if (
        !settings ||
        !Array.isArray(settings.value) ||
        settings.value.length === 0
      ) {
        throw new HttpException(
          'Settings not found or not an array',
          HttpStatus.NOT_FOUND,
        );
      }
      const idToUpdate = updatedValues.id;
      const indexToUpdate = settings.value.findIndex(
        (item) => item.id === idToUpdate,
      );
      if (indexToUpdate !== -1) {
        settings.value[indexToUpdate].desc = updatedValues.desc;
        settings.value[indexToUpdate].prefix = updatedValues.prefix;
        settings.value[indexToUpdate].startNumber = updatedValues.startNumber;
        settings.value[indexToUpdate].currentInvNumber =
          updatedValues.currentInvNumber;
        await this.userSettingsRepository.update(
          { value: settings.value },
          { where: { id: settings.id } },
        );
      } else {
        throw new HttpException(
          `Item with id ${idToUpdate} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return settings;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateById(adminid,locationId, changeObject) {
    try {
      const userSettings =
        await this.userSettingsRepository.findOne<UserSettings>({
          where: {
            type: 'invoice_number',
            adminid: adminid,
            locationId
          },
        });
      if (userSettings) {
        var invNoSettingsArray: any = userSettings.value;
        if (
          invNoSettingsArray.length > 0 &&
          changeObject.key &&
          changeObject.data
        ) {
          const indexOfObject = invNoSettingsArray.findIndex(
            (settings: any) => settings.id == changeObject.key,
          );
          let exsistObj = invNoSettingsArray[indexOfObject];
          let updatedObject = await { ...exsistObj, ...changeObject.data };
          invNoSettingsArray[indexOfObject] = updatedObject;
          userSettings.value = invNoSettingsArray;
          await this.userSettingsRepository.update(
            {
              value: invNoSettingsArray,
            },
            {
              where: {
                type: 'invoice_number',
                adminid: adminid,
              },
            },
          );
          return new CommonResponseDto(
            invNoSettingsArray,
            true,
            'Invoice No Config saved successfully.',
          );
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateLastInvoiceNo(adminid,companyid,locationId, type) {
    try {
      const userSettings =
        await this.userSettingsRepository.findOne<UserSettings>({
          where: {
            type: 'invoice_number',
            adminid: adminid,
            companyid,
            locationId
          },
        });
      if (userSettings) {
        var invNoSettingsArray: any = userSettings.value;
        if (invNoSettingsArray.length > 0 && type) {
          const indexOfObject = invNoSettingsArray.findIndex(
            (settings: any) => settings.type == type,
          );
          let exsistObj = invNoSettingsArray[indexOfObject];
          let changeObject = {};
          if (
            exsistObj?.startNumber != null &&
            exsistObj?.currentInvNumber != null
          ) {
            const latestInvoiceNo =
              exsistObj.startNumber >= exsistObj.currentInvNumber
                ? exsistObj.startNumber
                : exsistObj.currentInvNumber;
            changeObject = {
              currentInvNumber: Number(latestInvoiceNo) + 1,
              type: type,
            };
          }
          let updatedObject = await { ...exsistObj, ...changeObject };
          invNoSettingsArray[indexOfObject] = updatedObject;
          await this.userSettingsRepository.update(
            {
              value: invNoSettingsArray,
            },
            {
              where: {
                type: 'invoice_number',
                adminid: adminid,
                companyid:companyid
              },
            },
          );
          return new CommonResponseDto(
            invNoSettingsArray,
            true,
            'Last Invoice No updated successfully.',
          );
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async removeLastInvoiceNo(adminid,locationId, type) {
    try {
      const userSettings =
        await this.userSettingsRepository.findOne<UserSettings>({
          where: {
            type: 'invoice_number',
            adminid: adminid,
            locationId
          },
        });
      if (userSettings) {
        var invNoSettingsArray: any = userSettings.value;
        if (invNoSettingsArray.length > 0 && type) {
          const indexOfObject = invNoSettingsArray.findIndex(
            (settings: any) => settings.type == type,
          );
          let exsistObj = invNoSettingsArray[indexOfObject];
          let changeObject = {};
          if (
            exsistObj.startNumber != null &&
            exsistObj.currentInvNumber != null
          ) {
            const latestInvoiceNo =
              exsistObj.startNumber >= exsistObj.currentInvNumber
                ? exsistObj.startNumber
                : exsistObj.currentInvNumber;
            changeObject = {
              currentInvNumber: latestInvoiceNo - 1,
              type: type,
            };
          }
          let updatedObject = await { ...exsistObj, ...changeObject };
          invNoSettingsArray[indexOfObject] = updatedObject;
          await this.userSettingsRepository.update(
            {
              value: invNoSettingsArray,
            },
            {
              where: {
                type: 'invoice_number',
                adminid: adminid,
              },
            },
          );
          return new CommonResponseDto(
            invNoSettingsArray,
            true,
            'Last Invoice No removed successfully.',
          );
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getInvoiceNo(id:number,companyid:number,locationId:number, type:string) {
    let response: CommonResponseDto;
     try {
      let userSettings = await this.userSettingsRepository.findOne<UserSettings>({
        where: {
          type: 'invoice_number',
          adminid: id,
          companyid:companyid,
          locationId
        },
      });
      
      if (!userSettings) {
      await this.findAllInvoiceNoConfig(id,companyid,locationId);
      userSettings = await this.userSettingsRepository.findOne<UserSettings>({
        where: {
          type: 'invoice_number',
          adminid: id,
          companyid:companyid
        },
      });
    }

    if (userSettings) {
      let settingsArray: any = userSettings.value;
      const settings = settingsArray.find(
        (settings: any) => settings.type == type,
      );
   
      if (settings) {
        if (
          settings.currentInvNumber != null &&
          settings.startNumber != null &&
          settings.prefix != null
        ) {
          let newID: any =
            Number(settings.currentInvNumber) > Number(settings.startNumber)
              ? Number(settings.currentInvNumber)
              : Number(settings.startNumber);
          newID = settings.prefix + '-' + newID;
          // newID = settings.prefix + newID;
          response = {
            data: newID,
            status: true,
            message: 'Generating New Invoice ID',
          };
        } else {
          response = {
            data: null,
            status: false,
            message: 'Error Generating New Invoice ID',
          };
        }
      } else {
        response = {
          data: null,
          status: false,
          message: 'Error Generating New Invoice ID',
        };
      }
      return response;
    }
     } catch (error) {
      console.log(error)
      throw error
    
    }
  }
}
