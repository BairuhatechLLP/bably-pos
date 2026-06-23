import { Inject, Injectable } from "@nestjs/common";
import { LocationMaster } from "./location.entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { CreateLocationDto } from "./dto/location.create";
import { LocationDto } from "./dto/location.dto";
import { UpdateLocationDto } from "./dto/location.update";
import { Op } from "sequelize";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { LocationListAllQueryDto } from "./dto/locationQuery.dto";
import { UserSettingsService } from "../user_settings/user_settings_service";

@Injectable()
export class LocationService {
  constructor(
    @Inject("locationRepository")
    private readonly locationRepository: typeof LocationMaster,
    @Inject(UserSettingsService)
    private readonly user_settings: UserSettingsService
  ) {}
  async findAll(): Promise<any> {
    try {
      const unitList = await this.locationRepository.findAll();
      return unitList;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const location = await this.locationRepository.findByPk(id);
      if(location){
        return new CommonResponseDto(location,true,"Location data fetched successfully")
      }else{
        return new CommonResponseDto(null,false,"Failed to fetch location data")
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllUser(id: any): Promise<any> {
    try {
      const unitList = await this.locationRepository.findAll({
        where: {
          adminId: id,
          isDeleted:false
        },
      });

      return unitList;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByName(companyid: number, name: string) {
    try {
      const unitList = await this.locationRepository.findAll({
        where: {
          companyid: companyid,
          location: {
            [Op.like]: `%${name}%`,
          },
          isDeleted:false
        },
        order: [["id", "DESC"]]
      });
      return unitList;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findListByCompany(adminid: number, companyid: number) {
    try {
      const loactionList = await this.locationRepository.findAll({
        where: {
          adminId: adminid,
          companyid,
          isDeleted:false
        },
        order: [["id", "DESC"]]
      });
      return new CommonResponseDto(
        loactionList,
        true,
        "Location list fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //find all location for a company with pagination
  async findallByCompany(
    userId: number,
    companyid: number,
    searchQuery: LocationListAllQueryDto,
    pageOptionsDto: PageOptionsDto
  ) {
    try {
      const skip =
        Number(pageOptionsDto.page - 1) * Number(pageOptionsDto.take);
      let whereCondition = {
        adminId: userId,
        companyid,
        isDeleted:false
      };
      if (searchQuery.searchLocaton && searchQuery.searchLocaton !== null) {
        whereCondition[Op.and] = [
          { location: { [Op.like]: `%${searchQuery.searchLocaton}%` } },
        ];
      }
      const loactionList = await this.locationRepository.findAndCountAll({
        where: whereCondition,
        distinct: true, // Ensure distinct records
        col: "id",
        limit: Number(pageOptionsDto.take),
        offset: skip,
        order: [["createdat", pageOptionsDto?.order]],
      });
      const entities = loactionList.rows;
      const itemCount = loactionList.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new CommonResponseDto(
        new PageDto(entities, pageMetaDto),
        true,
        "Location list fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(CreateLocationDto: CreateLocationDto) {
    try {
      const checkExists = await this.locationRepository.findOne({
        where: {
          [Op.or]: [
            { location: CreateLocationDto.location },
            { locationCode: CreateLocationDto.locationCode }
          ],
          adminId: CreateLocationDto.userid,
          companyid: CreateLocationDto.companyid,
          isDeleted:false
        }
      });
      
      if (checkExists) {
        if (checkExists.location === CreateLocationDto.location) {
          return new CommonResponseDto(null, false, "Location already exists");
        }
        if (checkExists.locationCode === CreateLocationDto.locationCode) {
          return new CommonResponseDto(null, false, "Location Code already exists");
        }
      }

      const location = new LocationMaster();
      location.location = CreateLocationDto.location;
      location.locationCode = CreateLocationDto.locationCode;
      location.adminId = CreateLocationDto.userid;
      location.companyid = CreateLocationDto.companyid;
      location.isDeleted = false;
      let saveData = await location.save();

      let values = [
        {
          id: 1,
          desc: "Sale Invoice",
          type: "sales",
          prefix: "SI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 2,
          desc: "Purchase Invoice",
          type: "purchase",
          prefix: "PI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 3,
          desc: "Credit Note",
          type: "scredit",
          prefix: "SCN",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 4,
          desc: "Debit Note",
          type: "pcredit",
          prefix: "PDN",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 5,
          desc: "Proforma Invoice",
          type: "proforma",
          prefix: "PRI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 6,
          desc: "reccuring sales",
          type: "reccuring",
          prefix: "PI",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 7,
          desc: "Purchase Order",
          type: "order",
          prefix: "PO",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 8,
          desc: "Stock Transfer",
          type: "stockTransfer",
          prefix: "ST",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 9,
          desc: "Purchase Asset",
          type: "purchaseAsset",
          prefix: "PA",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 10,
          desc: "Journal",
          type: "journal",
          prefix: "JRNL",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 11,
          desc: "Cash Receipt",
          type: "cashReceipt",
          prefix: "C-RCPT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 12,
          desc: "Cash Payment",
          type: "cashPayment",
          prefix: "C-PYMT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 13,
          desc: "Contra",
          type: "contra",
          prefix: "CT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 14,
          desc: "Bank Receipt",
          type: "bankReceipt",
          prefix: "B-RCPT",
          startNumber: 1,
          currentInvNumber: 0,
        },
        {
          id: 15,
          desc: "Bank Payment",
          type: "bankPayment",
          prefix: "B-PYMT",
          startNumber: 1,
          currentInvNumber: 0,
        },
      ];

      const companySettings = await this.user_settings.create(
        CreateLocationDto.userid,
        CreateLocationDto.companyid,
        saveData.id,
        values
      );

      return new CommonResponseDto(
        new LocationDto(saveData),
        true,
        " location created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(UpdateLocationDto: UpdateLocationDto, id: number) {
    try {
      const location = await this.locationRepository.findByPk(id);
      if (!location) {
        return new CommonResponseDto(null, false, "No location found");
      }
      location.location = UpdateLocationDto.location;
      location.locationCode = UpdateLocationDto.locationCode;
      let updated = await location.save();
      return new CommonResponseDto(
        updated,
        true,
        "location Update Successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async softDelete(id: any): Promise<CommonResponseDto> {
    try {
      const locationData = await this.locationRepository.findByPk<LocationMaster>(id);

      if (!locationData) {
        return new CommonResponseDto(null, false, "No location found");
      }

      locationData.isDeleted = true;
      const updatedData = await locationData.save();

      return new CommonResponseDto(
        updatedData,
        true,
        "Location Deleted Successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data = await this.locationRepository.findByPk<LocationMaster>(id);

      if (!data) {
        return new CommonResponseDto(null, false, "No location found");
      }

      await data.destroy();

      return new CommonResponseDto(
        null,
        true,
        "Location Deleted Successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
