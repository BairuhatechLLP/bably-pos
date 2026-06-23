import { Inject, Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import moment from "moment";
import * as mysql from "mysql2/promise";
import { AccountMasterService } from "../account_master/account_master_service";
import { CompanyMasterService } from "../company_master/company_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { LocationService } from "../locations/location.services";
import { EmployeeCategoryService } from "../payroll_employeeCategory/employeeCategoryServices";
import { EmployeesService } from "../payroll_employees/employeeServices";
import { ProductCategoryService } from "../product_category/product_category_services";
import { ProductMasterService } from "../product_master/product_master_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { TaxService } from "../tax_master/tax_master_service";
import { UnitService } from "../units/unit.services";
import { UserService } from "../users/user.services";
import { DataSynclogService } from "./datatransferlog.service";

dotenv.config();
@Injectable()
export class DataSyncService {
  constructor(
    @Inject(DataSynclogService)
    private readonly dataSynclogService: DataSynclogService,
    @Inject(LocationService)
    private readonly locationService: LocationService,
    @Inject(EmployeeCategoryService)
    private readonly employeeCategoryService: EmployeeCategoryService,
    @Inject(TaxService)
    private readonly taxService: TaxService,
    @Inject(ProductCategoryService)
    private readonly productCategoryService: ProductCategoryService,
    @Inject(UnitService)
    private readonly unitService: UnitService,
    @Inject(CompanyMasterService)
    private readonly CompanyMasterService: CompanyMasterService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(EmployeesService)
    private readonly employeesService: EmployeesService,
    @Inject(AccountMasterService)
    private readonly accountMasterService: AccountMasterService,
    @Inject(ProductMasterService)
    private readonly productMasterService: ProductMasterService,
    @Inject(ContactMasterService)
    private readonly contactMasterService: ContactMasterService
  ) {}
  // mysqlPools() {
  //   let pool = mysql.createPool({
  //     host:
  //       process.env.NEXT_DB_HOST ||
  //       "taxgo-v2.cu559qf92pte.eu-west-1.rds.amazonaws.com",
  //     user: process.env.NEXT_DB_USER_NAME || "admin",
  //     port: 3306,
  //     password: process.env.NEXT_DB_PASSWORD || "taxgov2_2202_2024_",
  //     database: "taxgo_dev_2025-26",
  //     waitForConnections: true,
  //     connectionLimit: 10,
  //     queueLimit: 0,
  //   });
  //   return pool;
  // }
  getnewurl() {
    let url = "http://localhost:8085/taxgov2/";
    return { url, urlName: "2025-26" };
  }

  async syncUser(id: any) {
//     try {
//       const pool = this.mysqlPools();
//       const connection = await pool.getConnection();
//       //user master=====>1
//       const user: any = await this.userService.findOneByAdminId(id);
//       // First, check if the email exists
//       let userInsertedId: any = null;
//       let userResult: any = null;
//       const emailCheckSql = `SELECT COUNT(*) AS emailCount FROM user WHERE email = '${user.email}'`;
//       const emailCheckResult: any = await connection.query(emailCheckSql);
//       const emailCount = emailCheckResult[0].emailCount;

//       if (emailCount > 0) {
//         console.log("Email already exists in the user table.");
//       } else {
//         const userSql = `
//     INSERT INTO user (
//         countryid, country_code, tokenid, firstname, lastname, email, password,
//         phonenumber, status, adminid, usertype, dob, companyid, active, verifycode,
//         emailverified, mobileverified
//     ) VALUES (
//         ${user.countryid || "NULL"}, '${user.country_code}', '${user.tokenid}',
//         '${user.firstname || ""}', '${user.lastname || ""}', '${user.email}',
//         '${user.password}', '${user.phonenumber || ""}', ${user.status},
//         ${user.adminid}, '${user.usertype}', '${
//           new Date(user.dob).toISOString() || "NULL"
//         }',
//         ${"NULL"}, ${user.active === undefined ? "NULL" : user.active},
//         '${user.verifycode || ""}', ${user.emailverified || "NULL"},
//         ${user.mobileverified || "NULL"}
//     )`;

//         userResult = await connection.query(userSql);
//         userInsertedId = userResult[0].insertId;
//         console.log("New user inserted with ID:", userInsertedId);
//       }

//       //company master=====>2
//       const companyMaster = await this.CompanyMasterService.findOneByAdminId(
//         id
//       );
//       const companyMasterSql = `
//     INSERT INTO company_master (
//        status, type, expiretime, bname, btype, registerno, rtype, rdate, expiredate, plan,
//         company, address1, address2, city, cemail, cphoneno, cperson, taxregno, tax, taxno,
//         logo, adminid, userid, bimage, bcategory, accounttype, defaultmail, defaultinvoice,
//         accplan, cusNotes, fulladdress, website, reporttype, endYear, defaultTerms, stripeKey,
//         defaultMerchant, defaultBank, financial_year_start, books_begining_from
//     ) VALUES (
//        ${companyMaster.status}, '${companyMaster.type}', '${
//         companyMaster.expiretime
//       }',
//         '${companyMaster.bname}', '${companyMaster.btype}', '${
//         companyMaster.registerno
//       }',
//         '${companyMaster.rtype}', '${
//         new Date(companyMaster.rdate).toISOString() || null
//       }',
//         '${new Date(companyMaster.expiredate).toISOString() || null}', '${
//         companyMaster.plan
//       }',
//         '${companyMaster.company}', '${companyMaster.address1}', '${
//         companyMaster.address2
//       }',
//         '${companyMaster.city}', '${companyMaster.cemail}', '${
//         companyMaster.cphoneno
//       }',
//         '${companyMaster.cperson}', '${companyMaster.taxregno}', '${
//         companyMaster.tax
//       }',
//         '${companyMaster.taxno}', '${companyMaster.logo}', ${userInsertedId},
//         ${userInsertedId}, '${companyMaster.bimage}', '${
//         companyMaster.bcategory
//       }',
//         '${companyMaster.accounttype}', '${companyMaster.defaultmail}',
//         '${companyMaster.defaultinvoice}', '${companyMaster.accplan}', '${
//         companyMaster.cusNotes
//       }',
//         '${companyMaster.fulladdress}', '${companyMaster.website}',
//         ${companyMaster.reporttype}, '${companyMaster.endYear}',
//         '${companyMaster.defaultTerms}', '${companyMaster.stripeKey}',
//         '${companyMaster.defaultMerchant}', ${companyMaster.defaultBank},
//         '${new Date(companyMaster.financial_year_start)}',
//         '${new Date(companyMaster.books_begining_from)}'
//     )
// `;

//       // Execute the SQL insert statement
//       const companiess: any = await connection.query(companyMasterSql);
//       const companyId = companiess[0].insertId;

//       //set company id
//       const updateUserSql = `
//     UPDATE user 
//     SET companyid = ${companyId}, adminid = ${userInsertedId}
//     WHERE id = ${userInsertedId}
// `;

//       // Execute the SQL update statement
//       const userUpdate = await connection.query(updateUserSql);
//       let responselog = {
//         usercreate: userResult,
//         companycreate: companiess,
//         userupdate: userUpdate,
//       };
//       console.log("Connected to MySQL Database");
//       this.dataSynclogService.createDataTransferLog({
//         adminId: id,
//         process1: "User&companysync",
//         process1status: "success",
//         process1response: responselog,
//       });
//       connection.release();
//       let res = new CommonResponseDto(
//         {
//           adminId: userInsertedId,
//           companyId: companyId,
//           url: this.getnewurl().url,
//           urlName: this.getnewurl().urlName,
//         },
//         true,
//         "Data synchronized successfully"
//       );
//       return res;
//     } catch (err) {
//       console.log("DBLINK", err);
//       let res = new CommonResponseDto({}, false, "failed to update data");
//       return res;
//     }
  }
  async syncSettings(id: any, companyid, adminId, newCompanyId) {
  //   try {
  //     const pool = this.mysqlPools();
  //     const connection = await pool.getConnection();
  //     //user master=====>1
  //     // ---location master--1
  //     const locations = await this.locationService.findListByCompany(
  //       id,
  //       companyid
  //     );
  //     let locationres: any;
  //     if (locations.data.length) {
  //       let locationSql =
  //         "INSERT INTO location_master (location, adminId,companyid) VALUES ";
  //       const locationValues = locations.data
  //         .map(
  //           (location) =>
  //             `('${location.location}', '${adminId}','${newCompanyId}')`
  //         )
  //         .join(",");
  //       locationSql += locationValues;
  //       locationres = await connection.query(locationSql);
  //     }

  //     // ---employeeCategory--2
  //     const employeeCategories: any =
  //       await this.employeeCategoryService.findListByCompany(id, companyid);
  //     let employeectres: any;
  //     if (employeeCategories.length) {
  //       let employeeCategorySql =
  //         "INSERT INTO payroll_employee_category (emplyeeCategory, adminId, isDleted,companyid) VALUES ";
  //       const employeeCategoryValues = employeeCategories
  //         .map(
  //           (category) =>
  //             `('${category.emplyeeCategory}', ${adminId}, ${category.isDeleted},${newCompanyId})`
  //         )
  //         .join(",");
  //       employeeCategorySql += employeeCategoryValues;
  //       employeectres = await connection.query(employeeCategorySql);
  //     }
  //     // ---taxes--2
  //     const taxes = await this.taxService.findAllByCompany(id, companyid);
  //     let taxres: any;
  //     if (taxes.data.length) {
  //       let taxSql =
  //         "INSERT INTO tax_master (type, percentage, adminid, countryid,companyid, created_at, updated_at) VALUES ";
  //       const taxValues = taxes.data
  //         .map(
  //           (tax) =>
  //             `('${tax.type}', ${tax.percentage}, ${adminId}, ${
  //               tax.countryid || "NULL"
  //             },${newCompanyId}, NOW(), NOW())`
  //         )
  //         .join(",");
  //       taxSql += taxValues;
  //       taxres = await connection.query(taxSql);
  //     }
  //     const productCategories = await this.productCategoryService.findAllUser(
  //       id,
  //       companyid
  //     );
  //     let productCategoriesres: any;
  //     if (productCategories.length) {
  //       let productCategorySql =
  //         "INSERT INTO product_category (category, userid,companyid, createdat, updatedat) VALUES ";
  //       const productCategoryValues = productCategories
  //         .map(
  //           (category) =>
  //             `('${category.category}',' ${adminId}','${newCompanyId}', NOW(), NOW())`
  //         )
  //         .join(",");
  //       productCategorySql += productCategoryValues;
  //       productCategoriesres = await connection.query(productCategorySql);
  //     }

  //     // For unit table
  //     const units = await this.unitService.findListByCompany(id, companyid);
  //     let unitres: any;
  //     if (units.data.length) {
  //       let unitSql =
  //         "INSERT INTO unit (unit, adminId, formalName, decimalValues,companyid, createdat, updatedat) VALUES ";
  //       const unitValues = units.data
  //         .map(
  //           (unit) =>
  //             `('${unit.unit}', ${adminId}, '${unit.formalName}', ${unit.decimalValues},${newCompanyId}, NOW(), NOW())`
  //         )
  //         .join(",");
  //       unitSql += unitValues;
  //       unitres = await connection.query(unitSql);
  //     }
  //     const payrollEmployees =
  //       await this.employeesService.findALlEmployeeOfUser(id, companyid);
  //     let payrollEmployeeres: any;
  //     if (payrollEmployees.length > 0) {
  //       const employeeValues = payrollEmployees
  //         .map(
  //           (employee) => `(
  //      '${employee.firstName}', 
  //      '${employee.lastName}', 
  //      '${employee.employeeNumber}', 
  //      '${employee.eircode}', 
  //      '${employee.phone}', 
  //      '${employee.email}', 
  //      '${employee.fullAddress}', 
  //      '${employee.Designation}', 
  //      '${employee.accountHolderName}', 
  //      '${employee.accountNumber}', 
  //      '${employee.branch}', 
  //      '${employee.IFSC}', 
  //      ${adminId}, 
  //      ${employee.employeeGroup}, 
  //      ${employee.salaryPackage}, 
  //      ${newCompanyId},
  //      '${new Date(employee.date_of_join).toISOString()}'
  //  )`
  //         )
  //         .join(",");

  //       const payrollEmployeeSql = `
  //      INSERT INTO payroll_employees (
  //          firstName, lastName, employeeNumber, eircode, phone, email, fullAddress,
  //          Designation, accountHolderName, accountNumber, branch, IFSC, adminId,
  //          employeeGroup, salaryPackage,companyid,date_of_join
  //      ) VALUES ${employeeValues}`;

  //       payrollEmployeeres = await connection.query(payrollEmployeeSql);
  //     }
  //     let responselog = {
  //       locationcreate: locationres,
  //       employeeCategoriescreate: employeectres,
  //       taxcreate: taxres,
  //       unitcreate: unitres,
  //       payrollEmployeecreate: payrollEmployeeres,
  //     };
  //     this.dataSynclogService.updateDataTransferLogadminId(id, {
  //       process2: "settingssync",
  //       process2status: "success",
  //       process2response: responselog,
  //     });
  //     connection.release();
  //     let res = new CommonResponseDto(
  //       { adminId: adminId },
  //       true,
  //       "Data synchronized successfully"
  //     );
  //     return res;
  //   } catch (err) {
  //     console.log("DBLINK", err);
  //     let res = new CommonResponseDto({}, false, "failed to update data");
  //     return res;
  //   }
  }
  async syncAccounts(id: any, companyid, adminId, newCompanyId) {
//     try {
//       const pool = this.mysqlPools();
//       const connection = await pool.getConnection();
//       const accountMasters = await this.accountMasterService.getAccountsOfAdmin(
//         id,
//         companyid
//       );
//       let result: any;
//       if (accountMasters.length > 0) {
//         const accountMasterValues = accountMasters
//           .map(
//             (accountMaster) => `(
//       '${accountMaster.nominalcode}', 
//       '${accountMaster.laccount}', 
//       ${accountMaster.category}, 
//       ${accountMaster.categorygroup}, 
//       '${accountMaster.acctype}', 
//       ${adminId}, 
//       '${accountMaster.accnum}', 
//       '${accountMaster.cardnum}', 
//       '${accountMaster.paidmethod}', 
//       '${accountMaster.sortcode1}', 
//       '${accountMaster.sortcode2}', 
//       '${accountMaster.sortcode3}', 
//       '${accountMaster.ibannum}', 
//       '${accountMaster.bicnum}', 
//       ${accountMaster.total}, 
//       ${0.0}, 
//       '${new Date(accountMaster.userdate).toISOString()}', 
//       ${accountMaster.type}, 
//       ${adminId}, 
//       ${accountMaster.visiblestatus}, 
//       ${accountMaster.visbank}, 
//       ${accountMaster.vissinvoice}, 
//       ${accountMaster.vispinvoice}, 
//       ${accountMaster.visotherreceipt}, 
//       ${accountMaster.vispayroll}, 
//       ${accountMaster.visotherpayment}, 
//       ${accountMaster.visjournal}, 
//       ${accountMaster.visreport}, 
//       ${accountMaster.showVatRate}, 
//       '${accountMaster.payheadType}', 
//       '${accountMaster.journals}', 
//       '${accountMaster.Purchase}', 
//       '${accountMaster.Sales}', 
//       ${accountMaster.calculationPeriod}, 
//       '${accountMaster.branch}', 
//       '${accountMaster.ifsc}', 
// '${newCompanyId}',
//       ${accountMaster.createdBy}
//   )`
//           )
//           .join(",");

//         const accountMasterSql = `
//       INSERT INTO account_master (
//           nominalcode, laccount, category, categorygroup, acctype, userid, accnum,
//           cardnum, paidmethod, sortcode1, sortcode2, sortcode3, ibannum, bicnum,
//           opening, total, userdate, type, adminid, visiblestatus, visbank, vissinvoice,
//           vispinvoice, visotherreceipt, vispayroll, visotherpayment, visjournal, visreport,
//           showVatRate, payheadType, journals, Purchase, Sales, calculationPeriod, branch,
//           ifsc,companyid, createdBy
//       ) VALUES ${accountMasterValues}`;

//         result = await connection.query(accountMasterSql);
//       }
//       let responselog = {
//         accountcreate: result,
//       };
//       this.dataSynclogService.updateDataTransferLogadminId(id, {
//         process3: "accountsync",
//         process3status: "success",
//         process3response: responselog,
//       });
//       console.log("Connected to MySQL Database");

//       connection.release();
//       let res = new CommonResponseDto(
//         {},
//         true,
//         "Data synchronized successfully"
//       );
//       return res;
//     } catch (err) {
//       console.log("DBLINK", err);
//       let res = new CommonResponseDto({}, false, "failed to update data");
//       return res;
//     }
  }
  async syncProducts(id: any, companyid, adminId, newCompanyId) {
  //   try {
  //     // const pool = this.mysqlPools();
  //     const connection = await pool.getConnection();
  //     const products = await this.productMasterService.getAllByAdminId(
  //       id,
  //       companyid
  //     );
  //     let result: any;
  //     if (products.length > 0) {
  //       const productValues = products
  //         .map(
  //           (product) => `(
  //     ${adminId}, 
  //     ${product.active}, 
  //     '${product.itemtype}', 
  //     '${product.icode}', 
  //     '${product.idescription}', 
  //     ${product.spname}, 
  //     ${product.ledgercategory}, 
  //     '${product.svrate}', 
  //     '${product.sicode}', 
  //     '${product.pdescription}', 
  //     '${product.pvrate}', 
  //     ${product.paccount}, 
  //     '${product.location}', 
  //     '${product.barcode}', 
  //     '${product.weight}', 
  //     '${product.notes}', 
  //     '${product.name}', 
  //     '${product.ptype}', 
  //     '${product.reason}', 
  //     '${new Date(product.userdate).toISOString()}', 
  //     '${product.pimage}', 
  //     '${new Date(product.qdate).toISOString()}', 
  //     '${new Date(product.date).toISOString()}', 
  //     '${new Date(product.expiredate).toISOString()}', 
  //     ${product.trade_price}, 
  //     ${product.wholesale}, 
  //     ${product.rate}, 
  //     ${product.quantity}, 
  //     ${product.stock}, 
  //     ${product.qtype}, 
  //     ${product.vatamt}, 
  //     ${product.includevat}, 
  //     ${product.price}, 
  //     ${product.costprice}, 
  //     ${product.rlevel}, 
  //     ${product.rquantity}, 
  //     ${product.sp_price}, 
  //     ${product.stock}, 
  //     ${product.cquantity}, 
  //     ${product.c_price}, 
  //     ${product.saccount}, 
  //     ${product.increase}, 
  //     ${product.decrease}, 
  //     ${product.netquantity}, 
  //     ${adminId}, 
  //     ${newCompanyId},
  //     ${product.vat}, 
  //     '${product.product_category}', 
  //     '${product.unit}', 
  //     ${product.is_deleted}, 
  //     ${product.createdBy}
  // )`
  //         )
  //         .join(",");

  //       const productSql = `
  //     INSERT INTO product_master (
  //         userid, active, itemtype, icode, idescription, spname, ledgercategory, 
  //         svrate, sicode, pdescription, pvrate, paccount, location, barcode, weight, 
  //         notes, name, ptype, reason, userdate, pimage, qdate, date, expiredate, 
  //         trade_price, wholesale, rate, quantity, stockquantity, qtype, vatamt, 
  //         includevat, price, costprice, rlevel, rquantity, sp_price, stock, cquantity, 
  //         c_price, saccount, increase, decrease, netquantity, adminid,companyid, vat, product_category, 
  //         unit, is_deleted, createdBy
  //     ) VALUES ${productValues}
  // `;

  //       result = await connection.query(productSql);
  //     }
  //     let responselog = {
  //       productcreate: result,
  //     };
  //     this.dataSynclogService.updateDataTransferLogadminId(id, {
  //       process4: "productsync",
  //       process4status: "success",
  //       process4response: responselog,
  //     });
  //     console.log("Connected to MySQL Database");

  //     connection.release();
  //     let res = new CommonResponseDto(
  //       {},
  //       true,
  //       "Data synchronized successfully"
  //     );
  //     return res;
  //   } catch (err) {
  //     console.log("DBLINK", err);
  //     let res = new CommonResponseDto({}, false, "failed to update data");
  //     return res;
  //   }
  }
  async syncContacts(id: any, companyid, adminId, newCompanyId) {
//     try {
//       const pool = this.mysqlPools();
//       const connection = await pool.getConnection();
//       const allContactsData = await this.contactMasterService.findAllByQuery({
//         where: { adminid: id, companyid },
//       });
//       let debtorsTotal = 0;
//       let creditorsTotal = 0;
//       let contactData = [];
//       let edate = new Date();
//       const enddate = moment(edate).endOf("day").toISOString();
//       if (allContactsData.length > 0) {
//         for (var i = 0; i < allContactsData.length; i++) {
//           let contact = allContactsData[i];

//           let data = await this.contactMasterService.getClosingOfContact(
//             id,
//             contact.id,
//             enddate
//           );

//           let closingBalance = data?.data;
//           if (contact.contractors_type === "customer") {
//             debtorsTotal = debtorsTotal + Number(closingBalance);
//           } else if (contact.contractors_type === "supplier") {
//             creditorsTotal = creditorsTotal + Number(closingBalance);
//           }

//           contactData.push({ ...contact, opening_balance: closingBalance });
//         }
//       }
//       let contactresult: any;
//       if (contactData.length > 0) {
//         // Check if there are any contacts available
//         const contactValues = contactData
//           .map(
//             (contact) => `(
//           '${contact.name}', 
//           '${contact.bus_name}', 
//           '${contact.email}', 
//           '${contact.mobile}', 
//           '${contact.telephone}', 
//           '${contact.address}', 
//           '${contact.city}', 
//           '${contact.postcode}', 
//           '${contact.acc_default}', 
//           '${contact.notes}', 
//           '${contact.reference}', 
//           '${contact.vat_number}', 
//           ${adminId}, 
//           ${adminId}, 
//           '${contact.userdate.toISOString()}', 
//           ${contact.active}, 
//           '${contact.contractors_type}', 
//           ${contact?.category || null}, 
//           ${contact.opening_balance}, 
//           ${newCompanyId},
//           NOW(), 
//           NOW(),
//           ${contact.is_deleted}, 
//           '${contact.password}', 
//           '${contact.staffId}', 
//           '${contact.image}',
//           '${contact.access}',
//           ${contact.createdBy}
//       )`
//           )
//           .join(",");

//         const contactSql = `
//           INSERT INTO contact_master (
//               name, bus_name, email, mobile, telephone, address, city, postcode, acc_default,
//               notes, reference, vat_number, userid, adminid, userdate, active, contractors_type,
//               ledger_category, opening_balance,companyid, createdat, updatedat, is_deleted, password, 
//               staffId, image, access, createdBy
//           ) VALUES ${contactValues}
//       `;

//         contactresult = await connection.query(contactSql);
//       }
//       let depterpayload = {
//         saleid: null,
//         sdate: new Date().toISOString(),
//         ldate: new Date().toISOString(),
//         ledger: "47",
//         cname: null,
//         total: debtorsTotal,
//         userid: adminId,
//         ledgercategory: "3",
//         adminid: adminId || 0,
//         userdate: new Date().toISOString(),
//         type: "Opening Balance",
//         totalamount: debtorsTotal,
//         credit: 0,
//         debit: debtorsTotal,
//         booleantype: "1",
//         usertype: "customer",
//         discount_status: "1",
//         invoiceno: "",
//         baseid: null,
//         companyid:newCompanyId,
//         createdBy: adminId,
//       };
//       const debtorsSql = `
//     INSERT INTO ledger_details (
//         saleid, sdate, ldate, ledger, cname, total, userid, ledgercategory,
//         adminid, userdate, type, totalamount, credit, debit, booleantype,
//         usertype, discount_status, invoiceno, baseid, companyid,createdBy
//     ) VALUES (
//         ${depterpayload.saleid},
//         '${depterpayload.sdate}',
//         '${depterpayload.ldate}',
//         ${depterpayload.ledger},
//         ${depterpayload.cname ? `'${depterpayload.cname}'` : null},
//         ${depterpayload.total},
//         ${depterpayload.userid},
//         ${depterpayload.ledgercategory},
//         ${depterpayload.adminid},
//         '${depterpayload.userdate}',
//         '${depterpayload.type}',
//         ${depterpayload.totalamount},
//         ${depterpayload.credit},
//         ${depterpayload.debit},
//         '${depterpayload.booleantype}',
//         '${depterpayload.usertype}',
//         '${depterpayload.discount_status}',
//         '${depterpayload.invoiceno}',
//         ${depterpayload.baseid},
//         ${depterpayload.companyid},
//         ${depterpayload.createdBy}
//     );
// `;
//       let debtorscreate = await connection.query(debtorsSql);

//       let crediterspayload = {
//         otherid: "",
//         debit: "0.00",
//         credit: creditorsTotal,
//         total: creditorsTotal,
//         type: "Opening Balance",
//         description: "Opening Balance",
//         ledger: "51",
//         ledgercategory: "4",
//         adminid: adminId,
//         cname: null,
//         baseid: "",
//         amount: creditorsTotal,
//         usertype: "user",
//         userdate: new Date(),
//         sdate: new Date(),
//         ldate: new Date(),
//         userid: adminId,
//         companyid:newCompanyId,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       const creditorsSql = `
//   INSERT INTO ledger_details (
//       otherid, debit, credit, total, type, description, ledger, ledgercategory,
//       adminid, cname, baseid, amount, usertype, userdate, sdate, ldate, userid,companyid,
//       createdAt, updatedAt
//   ) VALUES (
//       '${crediterspayload.otherid}',
//       '${crediterspayload.debit}',
//       ${crediterspayload.credit},
//       ${crediterspayload.total},
//       '${crediterspayload.type}',
//       '${crediterspayload.description}',
//       ${crediterspayload.ledger},
//       ${crediterspayload.ledgercategory},
//       ${crediterspayload.adminid},
//       ${crediterspayload.cname ? `'${crediterspayload.cname}'` : null},
//       '${crediterspayload.baseid}',
//       ${crediterspayload.amount},
//       '${crediterspayload.usertype}',
//       '${crediterspayload.userdate.toISOString()}',
//       '${crediterspayload.sdate.toISOString()}',
//       '${crediterspayload.ldate.toISOString()}',
//       ${crediterspayload.userid},
//       ${crediterspayload.companyid},
//       NOW(),
//       NOW()
//   );
// `;

//       let criditorscreate = await connection.query(creditorsSql);
//       let responselog = {
//         contactmastercreate: contactresult,
//         debtorscreate: debtorscreate,
//         criditorscreate: criditorscreate,
//       };
//       this.dataSynclogService.updateDataTransferLogadminId(id, {
//         process5: "contactssync",
//         process5status: "success",
//         process5response: responselog,
//       });
//       console.log("Connected to MySQL Database");

//       connection.release();
//       let res = new CommonResponseDto(
//         {},
//         true,
//         "Data synchronized successfully"
//       );
//       return res;
//     } catch (err) {
//       console.log("DBLINK", err);
//       let res = new CommonResponseDto({}, false, "failed to update data");
//       return res;
//     }
  }

  //// This function is used when year-end operations need to be performed on a url
  async syncDatas(id: any) {
//     try {
//       const pool = this.mysqlPools();
//       const connection = await pool.getConnection();
//       //user master=====>1
//       const user: any = await this.userService.findOneByAdminId(id);

//       const userSql = `
// INSERT INTO user (
//     countryid, country_code, tokenid, firstname, lastname, email, password,
//     phonenumber, status, adminid, usertype, dob, companyid, active, verifycode,
//     emailverified, mobileverified
// ) VALUES (
//     ${user.countryid || "NULL"}, '${user.country_code}', '${user.tokenid}',
//     '${user.firstname || ""}', '${user.lastname || ""}', '${user.email}',
//     '${user.password}', '${user.phonenumber || ""}', ${user.status},
//     ${user.adminid}, '${user.usertype}', '${
//         new Date(user.dob).toISOString() || "NULL"
//       }',
//     ${"NULL"}, ${user.active === undefined ? "NULL" : user.active},
//     '${user.verifycode || ""}', ${user.emailverified || "NULL"},
//     ${user.mobileverified || "NULL"}
// )`;
//       const userResult: any = await connection.query(userSql);
//       const userInsertedId = userResult[0].insertId;
//       //company master=====>2
//       const companyMaster = await this.CompanyMasterService.findOneByAdminId(
//         id
//       );
//       const companyMasterSql = `
//     INSERT INTO company_master (
//        status, type, expiretime, bname, btype, registerno, rtype, rdate, expiredate, plan,
//         company, address1, address2, city, cemail, cphoneno, cperson, taxregno, tax, taxno,
//         logo, adminid, userid, bimage, bcategory, accounttype, defaultmail, defaultinvoice,
//         accplan, cusNotes, fulladdress, website, reporttype, endYear, defaultTerms, stripeKey,
//         defaultMerchant, defaultBank, financial_year_start, books_begining_from
//     ) VALUES (
//        ${companyMaster.status}, '${companyMaster.type}', '${
//         companyMaster.expiretime
//       }',
//         '${companyMaster.bname}', '${companyMaster.btype}', '${
//         companyMaster.registerno
//       }',
//         '${companyMaster.rtype}', '${
//         new Date(companyMaster.rdate).toISOString() || null
//       }',
//         '${new Date(companyMaster.expiredate).toISOString() || null}', '${
//         companyMaster.plan
//       }',
//         '${companyMaster.company}', '${companyMaster.address1}', '${
//         companyMaster.address2
//       }',
//         '${companyMaster.city}', '${companyMaster.cemail}', '${
//         companyMaster.cphoneno
//       }',
//         '${companyMaster.cperson}', '${companyMaster.taxregno}', '${
//         companyMaster.tax
//       }',
//         '${companyMaster.taxno}', '${companyMaster.logo}', ${userInsertedId},
//         ${userInsertedId}, '${companyMaster.bimage}', '${
//         companyMaster.bcategory
//       }',
//         '${companyMaster.accounttype}', '${companyMaster.defaultmail}',
//         '${companyMaster.defaultinvoice}', '${companyMaster.accplan}', '${
//         companyMaster.cusNotes
//       }',
//         '${companyMaster.fulladdress}', '${companyMaster.website}',
//         ${companyMaster.reporttype}, '${companyMaster.endYear}',
//         '${companyMaster.defaultTerms}', '${companyMaster.stripeKey}',
//         '${companyMaster.defaultMerchant}', ${companyMaster.defaultBank},
//         '${new Date(companyMaster.financial_year_start)}',
//         '${new Date(companyMaster.books_begining_from)}'
//     )
// `;

//       // Execute the SQL insert statement
//       const companiess: any = await connection.query(companyMasterSql);
//       const companyId = companiess[0].insertId;

//       //set company id
//       const updateUserSql = `
//     UPDATE user 
//     SET companyid = ${companyId}
//     WHERE id = ${userInsertedId}
// `;

//       // Execute the SQL update statement
//       await connection.query(updateUserSql);

//       // ---location master--1
//       const locations = await this.locationService.findAllUser(id);
//       if (locations.length) {
//         let locationSql =
//           "INSERT INTO location_master (location, adminId) VALUES ";
//         const locationValues = locations
//           .map((location) => `('${location.location}', ${userInsertedId})`)
//           .join(",");
//         locationSql += locationValues;
//         await connection.query(locationSql);
//       }

//       // ---employeeCategory--2
//       const employeeCategories = await this.employeeCategoryService.findAllUser(
//         id
//       );
//       if (employeeCategories.length) {
//         let employeeCategorySql =
//           "INSERT INTO payroll_employee_category (emplyeeCategory, adminId, isDleted) VALUES ";
//         const employeeCategoryValues = employeeCategories
//           .map(
//             (category) =>
//               `('${category.emplyeeCategory}', ${userInsertedId}, ${category.isDeleted})`
//           )
//           .join(",");
//         employeeCategorySql += employeeCategoryValues;
//         await connection.query(employeeCategorySql);
//       }
//       // ---taxes--2
//       const taxes = await this.taxService.findAll(id);
//       if (taxes.length) {
//         let taxSql =
//           "INSERT INTO tax_master (type, percentage, adminid, countryid, created_at, updated_at) VALUES ";
//         const taxValues = taxes
//           .map(
//             (tax) =>
//               `('${tax.type}', ${tax.percentage}, ${userInsertedId}, ${
//                 tax.countryid || "NULL"
//               }, NOW(), NOW())`
//           )
//           .join(",");
//         taxSql += taxValues;
//         await connection.query(taxSql);
//       }
//       const productCategories = await this.productCategoryService.findAllUser(
//         id,
//         68754
//       );
//       if (productCategories.length) {
//         let productCategorySql =
//           "INSERT INTO product_category (category, userid, createdat, updatedat) VALUES ";
//         const productCategoryValues = productCategories
//           .map(
//             (category) =>
//               `('${category.category}', ${userInsertedId}, NOW(), NOW())`
//           )
//           .join(",");
//         productCategorySql += productCategoryValues;
//         await connection.query(productCategorySql);
//       }

//       // For unit table
//       const units = await this.unitService.findAllForUser(id);
//       if (units.length) {
//         let unitSql =
//           "INSERT INTO unit (unit, adminId, formalName, decimalValues, createdat, updatedat) VALUES ";
//         const unitValues = units
//           .map(
//             (unit) =>
//               `('${unit.unit}', ${userInsertedId}, '${unit.formalName}', ${unit.decimalValues}, NOW(), NOW())`
//           )
//           .join(",");
//         unitSql += unitValues;
//         await connection.query(unitSql);
//       }
//       const payrollEmployees =
//         await this.employeesService.findALlEmployeeOfUser(id, {});
//       if (payrollEmployees.length > 0) {
//         const employeeValues = payrollEmployees
//           .map(
//             (employee) => `(
//         '${employee.firstName}', 
//         '${employee.lastName}', 
//         '${employee.employeeNumber}', 
//         '${employee.eircode}', 
//         '${employee.phone}', 
//         '${employee.email}', 
//         '${employee.fullAddress}', 
//         '${employee.Designation}', 
//         '${employee.accountHolderName}', 
//         '${employee.accountNumber}', 
//         '${employee.branch}', 
//         '${employee.IFSC}', 
//         ${userInsertedId}, 
//         ${employee.employeeGroup}, 
//         ${employee.salaryPackage}, 
//         '${new Date(employee.date_of_join).toISOString()}'
//     )`
//           )
//           .join(",");

//         const payrollEmployeeSql = `
//         INSERT INTO payroll_employees (
//             firstName, lastName, employeeNumber, eircode, phone, email, fullAddress,
//             Designation, accountHolderName, accountNumber, branch, IFSC, adminId,
//             employeeGroup, salaryPackage, date_of_join
//         ) VALUES ${employeeValues}`;

//         const result = await connection.query(payrollEmployeeSql);
//       }

//       const accountMasters = await this.accountMasterService.getAccountsOfAdmin(
//         id,
//         {}
//       );

//       if (accountMasters.length > 0) {
//         const accountMasterValues = accountMasters
//           .map(
//             (accountMaster) => `(
//         '${accountMaster.nominalcode}', 
//         '${accountMaster.laccount}', 
//         ${accountMaster.category}, 
//         ${accountMaster.categorygroup}, 
//         '${accountMaster.acctype}', 
//         ${userInsertedId}, 
//         '${accountMaster.accnum}', 
//         '${accountMaster.cardnum}', 
//         '${accountMaster.paidmethod}', 
//         '${accountMaster.sortcode1}', 
//         '${accountMaster.sortcode2}', 
//         '${accountMaster.sortcode3}', 
//         '${accountMaster.ibannum}', 
//         '${accountMaster.bicnum}', 
//         ${accountMaster.total}, 
//         ${0.0}, 
//         '${accountMaster.userdate.toISOString()}', 
//         ${accountMaster.type}, 
//         ${userInsertedId}, 
//         ${accountMaster.visiblestatus}, 
//         ${accountMaster.visbank}, 
//         ${accountMaster.vissinvoice}, 
//         ${accountMaster.vispinvoice}, 
//         ${accountMaster.visotherreceipt}, 
//         ${accountMaster.vispayroll}, 
//         ${accountMaster.visotherpayment}, 
//         ${accountMaster.visjournal}, 
//         ${accountMaster.visreport}, 
//         ${accountMaster.showVatRate}, 
//         '${accountMaster.payheadType}', 
//         '${accountMaster.journals}', 
//         '${accountMaster.Purchase}', 
//         '${accountMaster.Sales}', 
//         ${accountMaster.calculationPeriod}, 
//         '${accountMaster.branch}', 
//         '${accountMaster.ifsc}', 
//         ${accountMaster.createdBy}
//     )`
//           )
//           .join(",");

//         const accountMasterSql = `
//         INSERT INTO account_master (
//             nominalcode, laccount, category, categorygroup, acctype, userid, accnum,
//             cardnum, paidmethod, sortcode1, sortcode2, sortcode3, ibannum, bicnum,
//             opening, total, userdate, type, adminid, visiblestatus, visbank, vissinvoice,
//             vispinvoice, visotherreceipt, vispayroll, visotherpayment, visjournal, visreport,
//             showVatRate, payheadType, journals, Purchase, Sales, calculationPeriod, branch,
//             ifsc, createdBy
//         ) VALUES ${accountMasterValues}`;

//         const result = await connection.query(accountMasterSql);
//       }

//       const products = await this.productMasterService.getAllByAdminId(id, {});

//       if (products.length > 0) {
//         const productValues = products
//           .map(
//             (product) => `(
//         ${userInsertedId}, 
//         ${product.active}, 
//         '${product.itemtype}', 
//         '${product.icode}', 
//         '${product.idescription}', 
//         ${product.spname}, 
//         ${product.ledgercategory}, 
//         '${product.svrate}', 
//         '${product.sicode}', 
//         '${product.pdescription}', 
//         '${product.pvrate}', 
//         ${product.paccount}, 
//         '${product.location}', 
//         '${product.barcode}', 
//         '${product.weight}', 
//         '${product.notes}', 
//         '${product.name}', 
//         '${product.ptype}', 
//         '${product.reason}', 
//         '${new Date(product.userdate).toISOString()}', 
//         '${product.pimage}', 
//         '${new Date(product.qdate).toISOString()}', 
//         '${new Date(product.date).toISOString()}', 
//         '${new Date(product.expiredate).toISOString()}', 
//         ${product.trade_price}, 
//         ${product.wholesale}, 
//         ${product.rate}, 
//         ${product.quantity}, 
//         ${product.stock}, 
//         ${product.qtype}, 
//         ${product.vatamt}, 
//         ${product.includevat}, 
//         ${product.price}, 
//         ${product.costprice}, 
//         ${product.rlevel}, 
//         ${product.rquantity}, 
//         ${product.sp_price}, 
//         ${product.stock}, 
//         ${product.cquantity}, 
//         ${product.c_price}, 
//         ${product.saccount}, 
//         ${product.increase}, 
//         ${product.decrease}, 
//         ${product.netquantity}, 
//         ${userInsertedId}, 
//         ${product.vat}, 
//         '${product.product_category}', 
//         '${product.unit}', 
//         ${product.is_deleted}, 
//         ${product.createdBy}
//     )`
//           )
//           .join(",");

//         const productSql = `
//         INSERT INTO product_master (
//             userid, active, itemtype, icode, idescription, spname, ledgercategory, 
//             svrate, sicode, pdescription, pvrate, paccount, location, barcode, weight, 
//             notes, name, ptype, reason, userdate, pimage, qdate, date, expiredate, 
//             trade_price, wholesale, rate, quantity, stockquantity, qtype, vatamt, 
//             includevat, price, costprice, rlevel, rquantity, sp_price, stock, cquantity, 
//             c_price, saccount, increase, decrease, netquantity, adminid, vat, product_category, 
//             unit, is_deleted, createdBy
//         ) VALUES ${productValues}
//     `;

//         const result = await connection.query(productSql);
//       }
//       const allContactsData = await this.contactMasterService.findAllByQuery({
//         where: { adminid: id },
//       });
//       let debtorsTotal = 0;
//       let creditorsTotal = 0;
//       let contactData = [];
//       let edate = new Date();
//       const enddate = moment(edate).endOf("day").toISOString();
//       if (allContactsData.length > 0) {
//         for (var i = 0; i < allContactsData.length; i++) {
//           let contact = allContactsData[i];

//           let data = await this.contactMasterService.getClosingOfContact(
//             id,
//             contact.id,
//             enddate
//           );

//           let closingBalance = data?.data;
//           if (contact.contractors_type === "customer") {
//             debtorsTotal = debtorsTotal + Number(closingBalance);
//           } else if (contact.contractors_type === "supplier") {
//             creditorsTotal = creditorsTotal + Number(closingBalance);
//           }

//           contactData.push({ ...contact, opening_balance: closingBalance });
//         }
//       }
//       if (contactData.length > 0) {
//         // Check if there are any contacts available
//         const contactValues = contactData
//           .map(
//             (contact) => `(
//             '${contact.name}', 
//             '${contact.bus_name}', 
//             '${contact.email}', 
//             '${contact.mobile}', 
//             '${contact.telephone}', 
//             '${contact.address}', 
//             '${contact.city}', 
//             '${contact.postcode}', 
//             '${contact.acc_default}', 
//             '${contact.notes}', 
//             '${contact.reference}', 
//             '${contact.vat_number}', 
//             ${userInsertedId}, 
//             ${userInsertedId}, 
//             '${contact.userdate.toISOString()}', 
//             ${contact.active}, 
//             '${contact.contractors_type}', 
//             ${contact?.category || null}, 
//             ${contact.opening_balance}, 
//             NOW(), 
//             NOW(),
//             ${contact.is_deleted}, 
//             '${contact.password}', 
//             '${contact.staffId}', 
//             '${contact.image}',
//             '${contact.access}',
//             ${contact.createdBy}
//         )`
//           )
//           .join(",");

//         const contactSql = `
//             INSERT INTO contact_master (
//                 name, bus_name, email, mobile, telephone, address, city, postcode, acc_default,
//                 notes, reference, vat_number, userid, adminid, userdate, active, contractors_type,
//                 ledger_category, opening_balance, createdat, updatedat, is_deleted, password, 
//                 staffId, image, access, createdBy
//             ) VALUES ${contactValues}
//         `;

//         const result = await connection.query(contactSql);
//       }
//       let depterpayload = {
//         saleid: null,
//         sdate: new Date().toISOString(),
//         ldate: new Date().toISOString(),
//         ledger: "47",
//         cname: null,
//         total: debtorsTotal,
//         userid: userInsertedId,
//         ledgercategory: "3",
//         adminid: userInsertedId || 0,
//         userdate: new Date().toISOString(),
//         type: "Opening Balance",
//         totalamount: debtorsTotal,
//         credit: 0,
//         debit: debtorsTotal,
//         booleantype: "1",
//         usertype: "customer",
//         discount_status: "1",
//         invoiceno: "",
//         baseid: null,
//         createdBy: userInsertedId,
//       };
//       const debtorsSql = `
//       INSERT INTO ledger_details (
//           saleid, sdate, ldate, ledger, cname, total, userid, ledgercategory,
//           adminid, userdate, type, totalamount, credit, debit, booleantype,
//           usertype, discount_status, invoiceno, baseid, createdBy
//       ) VALUES (
//           ${depterpayload.saleid},
//           '${depterpayload.sdate}',
//           '${depterpayload.ldate}',
//           ${depterpayload.ledger},
//           ${depterpayload.cname ? `'${depterpayload.cname}'` : null},
//           ${depterpayload.total},
//           ${depterpayload.userid},
//           ${depterpayload.ledgercategory},
//           ${depterpayload.adminid},
//           '${depterpayload.userdate}',
//           '${depterpayload.type}',
//           ${depterpayload.totalamount},
//           ${depterpayload.credit},
//           ${depterpayload.debit},
//           '${depterpayload.booleantype}',
//           '${depterpayload.usertype}',
//           '${depterpayload.discount_status}',
//           '${depterpayload.invoiceno}',
//           ${depterpayload.baseid},
//           ${depterpayload.createdBy}
//       );
//   `;
//       await connection.query(debtorsSql);

//       let crediterspayload = {
//         otherid: "",
//         debit: "0.00",
//         credit: creditorsTotal,
//         total: creditorsTotal,
//         type: "Opening Balance",
//         description: "Opening Balance",
//         ledger: "51",
//         ledgercategory: "4",
//         adminid: userInsertedId,
//         cname: null,
//         baseid: "",
//         amount: creditorsTotal,
//         usertype: "user",
//         userdate: new Date(),
//         sdate: new Date(),
//         ldate: new Date(),
//         userid: userInsertedId,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       const creditorsSql = `
//     INSERT INTO ledger_details (
//         otherid, debit, credit, total, type, description, ledger, ledgercategory,
//         adminid, cname, baseid, amount, usertype, userdate, sdate, ldate, userid,
//         createdAt, updatedAt
//     ) VALUES (
//         '${crediterspayload.otherid}',
//         '${crediterspayload.debit}',
//         ${crediterspayload.credit},
//         ${crediterspayload.total},
//         '${crediterspayload.type}',
//         '${crediterspayload.description}',
//         ${crediterspayload.ledger},
//         ${crediterspayload.ledgercategory},
//         ${crediterspayload.adminid},
//         ${crediterspayload.cname ? `'${crediterspayload.cname}'` : null},
//         '${crediterspayload.baseid}',
//         ${crediterspayload.amount},
//         '${crediterspayload.usertype}',
//         '${crediterspayload.userdate.toISOString()}',
//         '${crediterspayload.sdate.toISOString()}',
//         '${crediterspayload.ldate.toISOString()}',
//         ${crediterspayload.userid},
//         NOW(),
//         NOW()
//     );
// `;
//       await connection.query(creditorsSql);
//       console.log("Connected to MySQL Database");
//       connection.release();
//       let res = new CommonResponseDto(
//         {},
//         true,
//         "Data synchronized successfully"
//       );
//       return res;
//     } catch (err) {
//       console.log("DBLINK", err);
//       let res = new CommonResponseDto({}, false, "failed to update data");
//       return res;
//     }
  }
}
