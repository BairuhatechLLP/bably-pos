import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { StockTransfer } from "./stock_transfer.entity";
import { CreateStockTransferDto } from "./dto/createStockTransfer.dto";
import { UpdateStockTransferDto } from "./dto/updateStockTransfer.dto";
import { ProductLocationMasterService } from "../product_location_master/product_location.service";
import { LocationMaster } from "../locations/location.entity";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { LocationService } from "../locations/location.services";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { OtherMasterService } from "../other_master/other_master.service";

@Injectable()
export class StockTransferService {
  constructor(
    @Inject("StockTransferRepository")
    private readonly StockTransferRepository: typeof StockTransfer,
    @Inject(ProductLocationMasterService)
    private readonly productLocationService: ProductLocationMasterService,
    @Inject(LedgerDetailsService)
    private readonly ledger_details: LedgerDetailsService,
    @Inject(LocationService)
    private readonly locationService: LocationService,
    @Inject(UserSettingsService)
    private readonly userSettings: UserSettingsService,
    @Inject(OtherMasterService)
    private readonly otherMasterService: OtherMasterService
  ) {}

  async findAll() {
    try {
      const StockTransfer =
        await this.StockTransferRepository.findAll<StockTransfer>({});
      return new CommonResponseDto(StockTransfer, true, "Stock Transfer List");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByCompany(companyid: number, adminid: number) {
    try {
      const StockTransfer =
        await this.StockTransferRepository.findAll<StockTransfer>({
          where: {
            companyId: companyid,
            adminId: adminid,
          },
          include: [
            {
              model: LocationMaster,
              as: "locationDetails",
            },
            {
              model: LocationMaster,
              as: "locationFromDetails",
            },
            {
              model: LocationMaster,
              as: "locationToDetails",
            },
          ],
        });
      return new CommonResponseDto(StockTransfer, true, "Stock Transfer List");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const transferData = await this.StockTransferRepository.findByPk(id, {
        include: [
          {
            model: LocationMaster,
            as: "locationDetails",
          },
          {
            model: LocationMaster,
            as: "locationFromDetails",
          },
          {
            model: LocationMaster,
            as: "locationToDetails",
          },
        ],
      });
      if (!transferData) {
        return new CommonResponseDto(null, false, "No resources found");
      }
      return new CommonResponseDto(
        transferData,
        true,
        "Stock transfer data fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(
    adminid: number,
    CreateStockTransferDto: CreateStockTransferDto
  ) {
    try {
      const transferData = new StockTransfer();
      transferData.seriesNo = CreateStockTransferDto.seriesNo;
      transferData.voucherNo = CreateStockTransferDto.voucherNo;
      transferData.locationFrom = CreateStockTransferDto.locationFrom;
      transferData.locationTo = CreateStockTransferDto.locationTo;
      transferData.transferDate = CreateStockTransferDto.transferDate;
      transferData.reference = CreateStockTransferDto.reference;
      transferData.companyId = CreateStockTransferDto.companyId;
      transferData.adminId = adminid;
      transferData.itemDetails = CreateStockTransferDto.itemDetails;
      transferData.charges = CreateStockTransferDto.charges;
      transferData.totalQuantity = CreateStockTransferDto.totalQuantity;
      transferData.totalCharge = CreateStockTransferDto.totalCharge;
      transferData.totalAmount = CreateStockTransferDto.totalAmount;

      let createdData = await transferData.save();

      if (createdData) {
        for (let i = 0; i < CreateStockTransferDto?.itemDetails?.length; i++) {
          const element = CreateStockTransferDto.itemDetails[i];
          const productDetails =
            await this.productLocationService.findOneByQuery({
              where: {
                locationId: CreateStockTransferDto.locationFrom,
                productId: element.productId,
                companyid: CreateStockTransferDto.companyId,
              },
            });

          const dataObj = {
            stock: Number(productDetails?.data?.stock) - Number(element.qty),
          };

          const updateDetails = await this.productLocationService.update(
            productDetails.data.id,
            dataObj
          );

          const productDetails2 =
            await this.productLocationService.findOneByQuery({
              where: {
                locationId: CreateStockTransferDto.locationTo,
                productId: element.productId,
                companyId: CreateStockTransferDto.companyId,
              },
            });
          if (productDetails2.status) {
            const dataObj2 = {
              stock: Number(productDetails2?.data.stock) + Number(element.qty),
            };

            const updateDetails2 = await this.productLocationService.update(
              productDetails2.data.id,
              dataObj2
            );
          } else {
            const locationToDetails = await this.locationService.findOne(
              CreateStockTransferDto.locationTo
            );

            const obj = {
              productId: element.productId,
              productName: element.productName,
              locationId: CreateStockTransferDto.locationTo,
              locationName: locationToDetails.data.location,
              stock: Number(element.qty),
              companyid: CreateStockTransferDto.companyId,
              adminid: adminid,
              is_deleted: false,
            };
            const newEntry = await this.productLocationService.create(obj);
          }
        }

        for (let i = 0; i < CreateStockTransferDto?.charges?.length; i++) {
          const element = CreateStockTransferDto?.charges[i];

          // Other Master Table Entry
          let otherDataObj = {
            adminId: adminid,
            companyId: createdData.companyId,
            total: element.amount,
            ledgerId: element.ledgerId,
            bankid: element.paidFrom,
            reference: element.notes,
            createdBy: adminid,
            date: new Date(),
            type: "Other Payment",
          };

          const otherData = await this.otherMasterService.create(otherDataObj);

          let dataObj1 = {
            otherid: "",
            credit: "0",
            debit: element.amount,
            total: element.amount,
            type: "Other Payment",
            description: "Other Payment",
            ledger: element.ledgerId,
            ledgercategory: "3",
            adminid: adminid,
            stockTransferId: createdData.id,
            cname: "",
            baseid: "",
            amount: element.amount,
            usertype: "user",
            userdate: new Date(),
            sdate: new Date(),
            ldate: new Date(),
            userid: adminid,
            companyid: createdData.companyId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result1: any = await this.ledger_details.create(dataObj1);

          let dataObj2 = {
            otherid: "",
            debit: "0",
            credit: element.amount,
            total: element.amount,
            type: "Other Payment",
            description: "Other Payment",
            ledger: element.paidFrom,
            ledgercategory: "3",
            adminid: adminid,
            stockTransferId: createdData.id,
            cname: "",
            baseid: "",
            amount: element.amount,
            usertype: "user",
            userdate: new Date(),
            sdate: new Date(),
            ldate: new Date(),
            userid: adminid,
            companyid: createdData.companyId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result2: any = await this.ledger_details.create(dataObj2);
        }

        await this.userSettings.updateLastInvoiceNo(
          adminid,
          createdData.companyId,
          createdData.seriesNo,
          "stockTransfer"
        );
      }

      return new CommonResponseDto(
        createdData,
        true,
        "Stock transfer created successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    id: number,
    adminid: number,
    UpdateStockTransferDto: UpdateStockTransferDto
  ) {
    try {
      const transferData = await this.StockTransferRepository.findByPk(id);

      if (transferData) {
        for (let i = 0; i < transferData?.itemDetails.length; i++) {
          const element = transferData?.itemDetails[i];

          const oldProductDetails =
            await this.productLocationService.findOneByQuery({
              where: {
                locationId: transferData.locationFrom,
                productId: element.productId,
                companyid: transferData.companyId,
              },
            });

          const dataObj = {
            stock: Number(oldProductDetails?.data?.stock) + Number(element.qty),
          };

          const updateDetails = await this.productLocationService.update(
            oldProductDetails.data.id,
            dataObj
          );

          const oldProductDetails2 =
            await this.productLocationService.findOneByQuery({
              where: {
                locationId: transferData.locationTo,
                productId: element.productId,
                companyid: transferData.companyId,
              },
            });

          const dataObj2 = {
            stock: Number(oldProductDetails?.data?.stock) - Number(element.qty),
          };

          const updateDetails2 = await this.productLocationService.update(
            oldProductDetails.data.id,
            dataObj
          );
        }

        transferData.seriesNo =
          UpdateStockTransferDto.seriesNo || transferData.seriesNo;
        transferData.voucherNo =
          UpdateStockTransferDto.voucherNo || transferData.voucherNo;
        transferData.locationFrom =
          UpdateStockTransferDto.locationFrom || transferData.locationFrom;
        transferData.locationTo =
          UpdateStockTransferDto.locationTo || transferData.locationTo;
        transferData.transferDate =
          UpdateStockTransferDto.transferDate || transferData.transferDate;
        transferData.reference =
          UpdateStockTransferDto.reference || transferData.reference;
        transferData.companyId =
          UpdateStockTransferDto.companyId || transferData.companyId;
        transferData.adminId =
          UpdateStockTransferDto.adminId || transferData.adminId;
        transferData.itemDetails =
          UpdateStockTransferDto.itemDetails || transferData.itemDetails;
        transferData.charges =
          UpdateStockTransferDto.charges || transferData.charges;
        transferData.totalQuantity =
          UpdateStockTransferDto.totalQuantity || transferData.totalQuantity;
        transferData.totalCharge =
          UpdateStockTransferDto.totalCharge || transferData.totalCharge;
        transferData.totalAmount =
          UpdateStockTransferDto.totalAmount || transferData.totalAmount;

        const updatedData = await transferData.save();

        if (updatedData) {
          const oldLedgerEntries = await this.ledger_details.findAllByQuery(
            {
              where: {
                stockTransferId: id,
                companyId: transferData.companyId
              },
            }
          );
          const ledgerEntries: any = await this.ledger_details.distroy({
            where: {
              stockTransferId: id,
              companyId: transferData.companyId,
            },
          });

          console.log("ledgerEntries===>",ledgerEntries)

          for (
            let i = 0;
            i < UpdateStockTransferDto?.itemDetails?.length;
            i++
          ) {
            const element = UpdateStockTransferDto.itemDetails[i];
            const productDetails =
              await this.productLocationService.findOneByQuery({
                where: {
                  locationId: UpdateStockTransferDto.locationFrom,
                  productId: element.productId,
                  companyid: UpdateStockTransferDto.companyId,
                },
              });

            const dataObj = {
              stock: Number(productDetails?.data?.stock) - Number(element.qty),
            };

            const updateDetails = await this.productLocationService.update(
              productDetails.data.id,
              dataObj
            );

            const productDetails2 =
              await this.productLocationService.findOneByQuery({
                where: {
                  locationId: UpdateStockTransferDto.locationTo,
                  productId: element.productId,
                  companyId: UpdateStockTransferDto.companyId,
                },
              });
            if (productDetails2.status) {
              const dataObj2 = {
                stock:
                  Number(productDetails2?.data.stock) + Number(element.qty),
              };

              const updateDetails2 = await this.productLocationService.update(
                productDetails2.data.id,
                dataObj2
              );
            } else {
              const locationToDetails = await this.locationService.findOne(
                UpdateStockTransferDto.locationTo
              );

              const obj = {
                productId: element.productId,
                productName: element.productName,
                locationId: UpdateStockTransferDto.locationTo,
                locationName: locationToDetails.data.location,
                stock: Number(element.qty),
                companyid: UpdateStockTransferDto.companyId,
                adminid: adminid,
                is_deleted: false,
              };
              const newEntry = await this.productLocationService.create(obj);
            }
          }

          for (let i = 0; i < UpdateStockTransferDto?.charges?.length; i++) {
            const element = UpdateStockTransferDto?.charges[i];

                // Other Master Table Entry
          let otherDataObj = {
            adminId: adminid,
            companyId: updatedData.companyId,
            total: element.amount,
            ledgerId: element.ledgerId,
            bankid: element.paidFrom,
            reference: element.notes,
            createdBy: adminid,
            date: new Date(),
            type: "Other Payment",
          };

          const otherData = await this.otherMasterService.update(Number(oldLedgerEntries[0]?.otherid),otherDataObj);

          let dataObj1 = {
            otherid: "",
            credit: "0",
            debit: element.amount,
            total: element.amount,
            type: "Other Payment",
            description: "Other Payment",
            ledger: element.ledgerId,
            ledgercategory: "3",
            adminid: adminid,
            stockTransferId: updatedData.id,
            cname: "",
            baseid: "",
            amount: element.amount,
            usertype: "user",
            userdate: new Date(),
            sdate: new Date(),
            ldate: new Date(),
            userid: adminid,
            companyid: updatedData.companyId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result1: any = await this.ledger_details.create(dataObj1);

          let dataObj2 = {
            otherid: "",
            debit: "0",
            credit: element.amount,
            total: element.amount,
            type: "Other Payment",
            description: "Other Payment",
            ledger: element.paidFrom,
            ledgercategory: "3",
            adminid: adminid,
            stockTransferId: updatedData.id,
            cname: "",
            baseid: "",
            amount: element.amount,
            usertype: "user",
            userdate: new Date(),
            sdate: new Date(),
            ldate: new Date(),
            userid: adminid,
            companyid: updatedData.companyId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result2: any = await this.ledger_details.create(dataObj2);
          }
        }

        return new CommonResponseDto(
          updatedData,
          true,
          "Stock transfer data updated successfully"
        );
      } else {
        return new CommonResponseDto(
          null,
          false,
          "Failed to update stock transfer data"
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const transferData = await this.StockTransferRepository.findByPk(id);
      const deletedData = await transferData.destroy();
      if (transferData) {
        const ledgerEntries: any = await this.ledger_details.distroy({
          where: {
            stockTransferId: id,
            companyId: transferData.companyId,
          },
        });
        for (let i = 0; i < transferData.itemDetails.length; i++) {
          const element = transferData.itemDetails[i];
          const productDetails =
            await this.productLocationService.findOneByQuery({
              where: {
                locationId: transferData.locationFrom,
                productId: element.productId,
                companyId: transferData.companyId,
              },
            });

          const dataObj = {
            stock: Number(productDetails?.data.stock) + Number(element.qty),
          };

          const updateDetails = await this.productLocationService.update(
            productDetails.data.id,
            dataObj
          );

          const productDetails2 =
            await this.productLocationService.findOneByQuery({
              where: {
                locationId: transferData.locationTo,
                productId: element.productId,
                companyId: transferData.companyId,
              },
            });
          const dataObj2 = {
            stock: Number(productDetails2?.data.stock) - Number(element.qty),
          };

          const updateDetails2 = await this.productLocationService.update(
            productDetails2.data.id,
            dataObj2
          );
        }
      }
      return new CommonResponseDto(
        deletedData,
        true,
        "Data deleted successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
