// src/excel-export/excel-export.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { ProductCategory } from "../product_category/product_category_entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import * as XLSX from "xlsx";
import { ExcelPriceData, ProductExcelData } from "./dto/excel_export.dto";
import { ProductMaster } from "../product_master/product_master";
import { Sequelize } from "sequelize";

@Injectable()
export class ExcelUpdateService {
  constructor(
    @Inject("productMasterRepository")
    private readonly productMasterRepository: typeof ProductMaster,
    @Inject("productCategoryRepository")
    private readonly productCategoryRepository: typeof ProductCategory,
    @Inject("SEQUELIZE") private readonly sequelize: Sequelize
  ) {}

  async generateProductExcel(companyId: number, userId?: number): Promise<any> {
    try {
      const whereClause: any = {
        companyid: companyId,
        is_deleted: false,
      };

      if (userId) {
        whereClause.userid = userId;
      }

      const products = await this.productMasterRepository.findAll({
        where: whereClause,
        include: [
          {
            model: ProductCategory,
            as: "productCategory",
            attributes: ["category"],
            required: false,
          },
        ],
        attributes: ["id", "idescription", "price"],
        order: [["id", "ASC"]],
      });

      if (!products || products.length === 0) {
        return new CommonResponseDto(
          null,
          false,
          "No products found for the given criteria"
        );
      }

      // Transform data for Excel
      const excelData: ProductExcelData[] = products.map((product, index) => ({
        si_number: index + 1,
        id: product.id,
        name: product.idescription || "",
        product_category: product.productCategory?.category || "",
        current_price: product.price || 0,
        new_price: "",
      }));

      // Create Excel workbook
      const workbook = XLSX.utils.book_new();

      const headers = [
        "SI Number",
        "ID",
        "Name",
        "Product Category",
        "Current Price",
        "New Price",
      ];

      // Convert data to worksheet format
      const worksheetData = [
        headers,
        ...excelData.map((item) => [
          item.si_number,
          item.id,
          item.name,
          item.product_category,
          item.current_price,
          item.new_price,
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      worksheet["!cols"] = [
        { width: 10 }, // SI Number
        { width: 10 }, // ID
        { width: 30 }, // Name
        { width: 20 }, // Product Category
        { width: 15 }, // Current Price
        { width: 15 }, // New Price
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      return {
        buffer: excelBuffer,
        filename: `products_${companyId}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    } catch (error) {
      console.error("Error generating Excel:", error);
      throw error;
    }
  }

  async bulkUpdatePrices(
    file: Express.Multer.File,
    companyId: any
  ): Promise<CommonResponseDto> {
    try {
      const BATCH_SIZE = 500; 

      const result = await this.productMasterRepository.sequelize.transaction(
        async (transaction) => {
          const workbook = XLSX.read(file.buffer, { type: "buffer" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          // Skip header row and process data
          const dataRows = jsonData.slice(1) as any[][];

          if (dataRows.length === 0) {
            return new CommonResponseDto(
              null,
              false,
              "No data found in Excel file"
            );
          }

          const priceUpdates: ExcelPriceData[] = [];

          const validationErrors = [];

          dataRows.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because we skipped header and arrays are 0-indexed
            if (
              !row ||
              row.length === 0 ||
              row.every(
                (cell) => cell === null || cell === undefined || cell === ""
              )
            ) {
              return; 
            }
            const id = Number(row[1]);
            const currentPriceRaw = row[4];
            const newPriceRaw = row[5];

            if (!id || isNaN(id)) {
              validationErrors.push(`Row ${rowNumber}: Invalid ID "${row[1]}"`);
              return; 
            }

            const currentPrice = Number(currentPriceRaw);
            if (isNaN(currentPrice)) {
              validationErrors.push(
                `Row ${rowNumber}: Invalid current price "${currentPriceRaw}" for product ID ${id}`
              );
              return; 
            }

            let newPrice = null;
            if (
              newPriceRaw !== null &&
              newPriceRaw !== undefined &&
              newPriceRaw !== ""
            ) {
              newPrice = Number(newPriceRaw);
              if (isNaN(newPrice)) {
                validationErrors.push(
                  `Row ${rowNumber}: Invalid new price "${newPriceRaw}" for product ID ${id}`
                );
                return; 
              }
            }

            priceUpdates.push({
              id,
              current_price: currentPrice,
              new_price: newPrice,
            });
          });

          if (validationErrors.length > 0) {
            return new CommonResponseDto(
              { errors: validationErrors },
              false,
              `Invalid data found in Excel file: ${validationErrors.join("; ")}`
            );
          }

          if (priceUpdates.length === 0) {
            return new CommonResponseDto(
              null,
              false,
              "No valid product data found in Excel file"
            );
          }

          const existingProductIds = priceUpdates.map((p) => p.id);
          const existingProducts = await this.productMasterRepository.findAll({
            where: {
              id: existingProductIds,
              companyid: companyId,
              is_deleted: false,
            },
            attributes: ["id", "price"],
            transaction,
          });

          if (existingProducts.length === 0) {
            return new CommonResponseDto(
              null,
              false,
              "No matching products found for the provided IDs"
            );
          }

          const existingProductMap = new Map(
            existingProducts.map((p) => [p.id, p.price])
          );

          const bulkUpdateData = priceUpdates
            .filter((update) => existingProductMap.has(update.id))
            .map((update) => {
              const finalPrice =
                update.new_price !== null && update.new_price !== undefined
                  ? update.new_price
                  : update.current_price;

              return {
                id: update.id,
                rate: finalPrice,
                price: finalPrice,
                costprice: finalPrice,
                sp_price: finalPrice,
                c_price: finalPrice,
              };
            });

          console.log("bulkUpdateData", bulkUpdateData);

          let updatedCount = 0;
          for (let i = 0; i < bulkUpdateData.length; i += BATCH_SIZE) {
            const batch = bulkUpdateData.slice(i, i + BATCH_SIZE);

            await this.productMasterRepository.bulkCreate(batch, {
              updateOnDuplicate: [
                "rate",
                "price",
                "costprice",
                "sp_price",
                "c_price",
              ],
              transaction,
            });

            updatedCount += batch.length;
          }

          return new CommonResponseDto(
            {
              totalProcessed: priceUpdates.length,
              totalUpdated: updatedCount,
              totalSkipped: priceUpdates.length - updatedCount,
            },
            true,
            `Successfully updated prices for ${updatedCount} products`
          );
        }
      );

      return result;
    } catch (error) {
      console.error("Error during bulk price update:", error);
      if (
        error.message &&
        error.message.includes("Invalid data found in Excel file")
      ) {
        return new CommonResponseDto(null, false, error.message);
      }
      throw new Error("Bulk price update failed. Please try again.");
    }
  }
}
