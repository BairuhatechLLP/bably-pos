import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ProductLocationMaster } from "./product_location.entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { LocationMaster } from "../locations/location.entity";
import { ProductMaster } from "../product_master/product_master";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { ProductLocationMasterDto } from "./dto/product_location.dto";
import { CreateProductLocationDto } from "./dto/create_product_location.dto";
import { unit } from "../units/unit.entity";
import { ProductMasterService } from "../product_master/product_master_service";

@Injectable()
export class ProductLocationMasterService {
  constructor(
    @Inject("ProductLocationMasterRepository")
    private readonly ProductLocationMasterRepository: typeof ProductLocationMaster,
    @Inject(forwardRef(() => ProductMasterService))
    private readonly ProductMasterRepository: ProductMasterService
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp =
        await this.ProductLocationMasterRepository.findAndCountAll<ProductLocationMaster>(
          {
            include: [{ model: ProductMaster }, { model: LocationMaster }],
            limit: pageOptionsDto.take,
            offset: skip,
            order: [["productId", pageOptionsDto.order]],
          }
        );

      const entities = exp.rows.map(
        (ctry) => new ProductLocationMasterDto(ctry)
      );
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const product =
        await this.ProductLocationMasterRepository.findByPk<ProductLocationMaster>(
          id,
          {
            include: [
              { model: ProductMaster, as: "productDetails" },
              { model: LocationMaster, as: "locationDetails" },
            ],
          }
        );
      if (!product) {
        throw new HttpException(
          { message: "No user product location  found" },
          HttpStatus.OK
        );
      }
      return new CommonResponseDto(product, true, "Product Details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByQuery(query: any) {
    try {
      const data =
        await this.ProductLocationMasterRepository.findOne<ProductLocationMaster>(
          query
        );
      if (!data) {
        return new CommonResponseDto(null, false, "No data found");
      }
      return new CommonResponseDto(data, true, "Data");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findProductsByLocation(id: number) {
    try {
      const products =
        await this.ProductLocationMasterRepository.findAll<ProductLocationMaster>(
          {
            where: {
              locationId: id,
            },
            include: [
              { model: ProductMaster, include: [{ model: unit }] },
              { model: LocationMaster },
            ],
            order: [["locationId", "DESC"]],
          }
        );
      return new CommonResponseDto(
        products,
        true,
        "Product list fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getProductByLocation(productId: number, locationId: number) {
    try {
      const products =
        await this.ProductLocationMasterRepository.findOne<ProductLocationMaster>(
          {
            where: {
              locationId: locationId,
              productId: productId,
            },
            include: [
              { model: ProductMaster, include: [{ model: unit }] },
              { model: LocationMaster },
            ],
            order: [["locationId", "DESC"]],
          }
        );
      return new CommonResponseDto(
        products,
        true,
        "Product fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateProductLocationStock(
    productId: number,
    locationId: number,
    UpdateProductLocationDto: any,
    transaction?: any
  ) {
    try {
      const productDetails =
        await this.ProductLocationMasterRepository.findOne<ProductLocationMaster>(
          {
            where: {
              locationId: locationId,
              productId: productId,
            },
          }
        );

      if (!productDetails) {
        const newEntry = await this.create(UpdateProductLocationDto);
        return true;
      }

      productDetails.productId =
        UpdateProductLocationDto.productId || productDetails.productId;
      productDetails.productName =
        UpdateProductLocationDto.productName || productDetails.productName;
      productDetails.locationName =
        UpdateProductLocationDto.locationName || productDetails.locationName;
      productDetails.locationId =
        UpdateProductLocationDto.locationId || productDetails.locationId;
      productDetails.stock =
        UpdateProductLocationDto.stock || productDetails.stock;
      productDetails.companyid =
        UpdateProductLocationDto.companyid || productDetails.companyid;
      productDetails.adminid =
        UpdateProductLocationDto.adminid || productDetails.adminid;

      const updatedData = await productDetails.save({ transaction });
      return new CommonResponseDto(updatedData, true, "Updated successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createProductMasterDto: CreateProductLocationDto) {
    try {
      const product = new ProductLocationMaster();

      product.productId = createProductMasterDto.productId;
      product.productName = createProductMasterDto.productName;
      product.locationId = createProductMasterDto.locationId;
      product.locationName = createProductMasterDto.locationName;
      product.stock = createProductMasterDto.stock;
      product.companyid = createProductMasterDto.companyid;
      product.adminid = createProductMasterDto.adminid;

      let saveData = await product.save();

      return new CommonResponseDto(
        new ProductLocationMasterDto(saveData),
        true,
        "Product details added successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, UpdateProductLocationDto: any, transaction?:any) {
    try {
      const productDetails =
        await this.ProductLocationMasterRepository.findByPk<ProductLocationMaster>(
          id
        );

      productDetails.productId =
        UpdateProductLocationDto.productId || productDetails.productId;
      productDetails.productName =
        UpdateProductLocationDto.productName || productDetails.productName;
      productDetails.locationName =
        UpdateProductLocationDto.locationName || productDetails.locationName;
      productDetails.locationId =
        UpdateProductLocationDto.locationId || productDetails.locationId;
      productDetails.stock =
        UpdateProductLocationDto.stock || productDetails.stock;
      productDetails.companyid =
        UpdateProductLocationDto.companyid || productDetails.companyid;
      productDetails.adminid =
        UpdateProductLocationDto.adminid || productDetails.adminid;

      const updatedData = await productDetails.save({transaction});

      return new CommonResponseDto(
        updatedData,
        true,
        "Product details updated successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const product =
        await this.ProductLocationMasterRepository.findByPk<ProductLocationMaster>(
          id
        );
      await product.destroy();

      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findRetailProductsByLocation(body: any, pageOptionsDto: any) {
    try {
      const product =
        await this.ProductMasterRepository.findAllByAdminIdAndTypeRetail(
          body,
          pageOptionsDto
        );
      return product;
    } catch (err) {
      console.log(err);
    }
  }
}
