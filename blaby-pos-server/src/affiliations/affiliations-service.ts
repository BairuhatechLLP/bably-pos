import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Op, Sequelize } from "sequelize";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { Affiliations } from "./affiliations-model";
import { UpdateAffiliationsDto } from "./dto/affiliations-update-dto";
import { Countries } from "../countries/countries_model";
import { MailService } from "../mail/mail_service";

@Injectable()
export class AffiliationsService {
  constructor(
    @Inject("AffiliationsRepository")
    private readonly affiliationsService: typeof Affiliations,
    
    @Inject(MailService)
    private readonly mailService: MailService
  ) {}

  async findAllPages(data: any) {
    let meta = {
      page: Number(data?.page),
      take: Number(data?.take),
      totalCount: 0,
    };
    try {
      var whereCase: any = {};
      var queryCondition = {};

      if (data?.query) {
        const searchQuery = data.query.toLowerCase();
        const items = ["name", "email"].map((item) => {
          return Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col(item)),
            "LIKE",
            `%${searchQuery}%`
          );
        });
        queryCondition = { [Op.or]: items };
      }

      whereCase = { ...whereCase, ...queryCondition };
      var Total: any = await Affiliations.count({ where: whereCase });
      let datas = await Affiliations.findAll({
        where: whereCase,
        offset: (Number(data?.page) - 1) * Number(data?.take),
        limit: Number(data?.take),
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
        order: [["id", "DESC"]],
      });
      meta.totalCount = Total;
      let success = {
        datas,
        meta,
        status: true,
        message: "Affiliation  List",
      };
      return success;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getOne(id: number) {
    try {
      const affiliation = await this.affiliationsService.findOne<Affiliations>({
        where: { id },
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      if (!affiliation) {
        return new CommonResponseDto(null, false, "An Error Occured");
      }
      return new CommonResponseDto(affiliation, true, "Affiliate details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOneByCode(code: string) {
    try {
      const affiliation = await this.affiliationsService.findOne<Affiliations>({
        where: { affiliationCode: code },
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });
      if (!affiliation) {
        return new CommonResponseDto(null, false, "An Error Occured");
      }
      return new CommonResponseDto(affiliation, true, "Affiliate details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createDto: any) {
    try {
      const cart = new Affiliations();

      cart.name = createDto.name;
      cart.email = createDto.email;
      cart.phone = createDto.phone;
      cart.affiliationCode = createDto.affiliationCode;
      cart.image = createDto.image;
      cart.countryid = createDto.countryid;
      cart.noOfPersons = createDto.noOfPersons || 0;
      cart.rewardPercentage = createDto.rewardPercentage;
      cart.affiliationLink = createDto.affiliationLink || "";
      cart.amountEarned = createDto.amountEarned || 0;
      cart.details = createDto.details || [];

      const affiliatePerson = await cart.save();
      const createdDetails = await cart.reload({
        include: [
          {
            model: Countries,
            as: "countryInfo",
          },
        ],
      });

      if (affiliatePerson) {
        await this.mailService.sendAffiliateAgreement(affiliatePerson);
        return new CommonResponseDto(
          createdDetails,
          true,
          "Affiliate Created Successfully."
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Error in creating Affiliate."
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateAffiliationsDto) {
    try {
      const cart = await this.affiliationsService.findByPk<Affiliations>(id);
      if (!cart) {
        throw new HttpException("Failed to Update", HttpStatus.NOT_FOUND);
      }

      cart.name = updateDto.name || cart.name;
      cart.email = updateDto.email || cart.email;
      cart.phone = updateDto.phone || cart.phone;
      cart.affiliationLink = updateDto.affiliationLink || cart.affiliationLink;
      cart.affiliationCode = updateDto.affiliationCode || cart.affiliationCode;
      cart.noOfPersons = updateDto.noOfPersons || cart.noOfPersons;
      cart.details = updateDto.details || cart.details;
      cart.countryid = updateDto.countryid || cart.countryid;
      cart.rewardPercentage =
        updateDto.rewardPercentage || cart.rewardPercentage;
      cart.image = updateDto.image || cart.image;
      cart.amountEarned = updateDto.amountEarned || cart.amountEarned;

      const data = await cart.save();
      return new CommonResponseDto(data, true, "Affiliate details updated");
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async updateNumberOfAffiliation(id: number, updateDto: any) {
    try {
      const cart = await this.affiliationsService.findByPk<Affiliations>(id);
      if (!cart) {
        throw new HttpException("Failed to Update", HttpStatus.NOT_FOUND);
      }

      cart.affiliationCode = updateDto.affiliationCode || cart.affiliationCode;
      cart.noOfPersons = updateDto.noOfPersons || cart.noOfPersons;
      cart.amountEarned = updateDto.amountEarned || cart.amountEarned;
      cart.details = updateDto.details;
      const data = await cart.save();
      return new CommonResponseDto(data, true, "Affiliate details updated");
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async delete(id: number) {
    try {
      const deleteAffiliation =
        await this.affiliationsService.findByPk<Affiliations>(id);
      if (deleteAffiliation) {
        await deleteAffiliation.destroy();
        return new CommonResponseDto(
          deleteAffiliation,
          true,
          "Deleted successfully"
        );
      }
      return new CommonResponseDto(null, false, "Failed to delete affiliate");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
