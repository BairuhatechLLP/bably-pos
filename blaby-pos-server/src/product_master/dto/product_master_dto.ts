import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/user.entity";
import { ProductMaster } from "../product_master";
import { ContactMaster } from "../../contactMaster/contactMasterModel";

export class ProductMasterDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly itemtype: string;
  @ApiProperty() readonly icode: string;
  @ApiProperty() readonly idescription: string;
  @ApiProperty() readonly variant_name: string;
  @ApiProperty() readonly spname: number;
  @ApiProperty() readonly ledgercategory: number;
  @ApiProperty() readonly active?: boolean;
  @ApiProperty() readonly svrate: string;
  supplier: ContactMaster;
  @ApiProperty() readonly sicode: string;
  @ApiProperty() readonly pdescription: string;
  @ApiProperty() readonly pvrate: string;
  @ApiProperty() readonly paccount: number;
  @ApiProperty() readonly location: string;
  @ApiProperty() readonly barcode: string;
  @ApiProperty() readonly weight: string;
  @ApiProperty() readonly notes: string;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly ptype: string;
  @ApiProperty() readonly reason: string;
  @ApiProperty() readonly pimage: string;
  @ApiProperty() readonly qdate: Date;
  @ApiProperty() readonly date: Date;
  @ApiProperty() readonly expiredate: Date;
  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly trade_price: number;
  @ApiProperty() readonly wholesale: number;
  @ApiProperty() readonly rate: number;
  @ApiProperty() readonly taxable_amount: number;
  @ApiProperty() readonly quantity: number;
  @ApiProperty() readonly stockquantity: number;
  @ApiProperty() readonly qtype: number;
  @ApiProperty() readonly vatamt: number;
  @ApiProperty() readonly includevat: number;
  @ApiProperty() readonly price: number;
  @ApiProperty() readonly costprice: number;
  @ApiProperty() readonly rlevel: number;
  @ApiProperty() readonly rquantity: number;
  @ApiProperty() readonly sp_price: number;
  @ApiProperty() readonly stock: number;
  @ApiProperty() readonly cquantity: number;
  @ApiProperty() readonly c_price: number;
  @ApiProperty() readonly saccount: number;
  @ApiProperty() readonly increase: number;
  @ApiProperty() readonly decrease: number;
  @ApiProperty() readonly netquantity: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly vat: number;
  @ApiProperty() readonly stockvalue: number;
  @ApiProperty() readonly product_category: number;//string;
  @ApiProperty() readonly unit: number;//string;
  @ApiProperty() readonly is_deleted: boolean;
  @ApiProperty() readonly cost_price_with_vat: number;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly hsn_code: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly user: User;

  constructor(tmp: ProductMaster) {
    this.id = tmp.id;
    this.itemtype = tmp.itemtype;
    this.icode = tmp.icode;
    this.idescription = tmp.idescription;
    this.spname = tmp.spname;
    this.active = tmp.active;
    this.ledgercategory = tmp.ledgercategory;
    this.svrate = tmp.svrate;
    this.sicode = tmp.sicode;
    this.pdescription = tmp.pdescription;
    this.pvrate = tmp.pvrate;
    this.paccount = tmp.paccount;
    this.location = tmp.location;
    this.barcode = tmp.barcode;
    this.weight = tmp.weight;
    this.notes = tmp.notes;
    this.userid = tmp.userid;
    this.name = tmp.name;
    this.ptype = tmp.ptype;
    this.reason = tmp.reason;
    this.userdate = tmp.userdate;
    this.pimage = tmp.pimage;
    this.qdate = tmp.qdate;
    this.date = tmp.date;
    this.expiredate = tmp.expiredate;
    this.trade_price = tmp.trade_price;
    this.wholesale = tmp.wholesale;
    this.rate = tmp.rate;
    this.taxable_amount = tmp.taxable_amount;
    this.quantity = tmp.quantity;
    this.stockquantity = tmp.stockquantity;
    this.qtype = tmp.qtype;
    this.vatamt = tmp.vatamt;
    this.includevat = tmp.includevat;
    this.price = tmp.price;
    this.costprice = tmp.costprice;
    this.rlevel = tmp.rlevel;
    this.rquantity = tmp.rquantity;
    this.sp_price = tmp.sp_price;
    this.stock = tmp.stock;
    this.cquantity = tmp.cquantity;
    this.c_price = tmp.c_price;
    this.saccount = tmp.saccount;
    this.increase = tmp.increase;
    this.decrease = tmp.decrease;
    this.netquantity = tmp.netquantity;
    this.adminid = tmp.adminid;
    this.vat = tmp.vat;
    this.supplier = tmp.supplier;
    this.product_category = tmp.product_category;
    this.unit = tmp.unit;
    this.is_deleted = tmp.is_deleted;
    this.createdAt = tmp.created_at;
    this.updatedAt = tmp.updated_at;
    //this.stockvalue = (Number(tmp.stock) || 0) * (Number(tmp.sp_price) || 0);
    this.stockvalue = (Number(tmp.stock) || 0) * (Number(tmp.c_price) || 0);
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid;
    this.hsn_code = tmp.hsn_code
  }
}
