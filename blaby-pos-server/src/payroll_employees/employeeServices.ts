import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PayrollEmployeeDTO } from "./dto/employee.dto";
import { PayrollEmployee } from "./employeeEntity";
import { CreateEmployeeDto } from "./dto/employeecreate";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { PayrollEmployeeCategory } from "../payroll_employeeCategory/employeeCategoryEntity";

@Injectable()
export class EmployeesService {
  constructor(
    @Inject("payrollEmployeeRepository")
    private readonly employeeRepository: typeof PayrollEmployee
  ) {}

  async findOneById(id: number): Promise<any> {
    try {
      const employee = await this.employeeRepository.findByPk(id);
      if (!employee) {
        throw new HttpException("No employee found", HttpStatus.NOT_FOUND);
      }
      return employee;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findEmployeeById(companyid: number, id: number) {
    let response;
    try {
      const employeeList = await this.employeeRepository.findOne({
        where: {
          id:id,
          companyid:companyid,
        },
      });
      if (!employeeList) {
        return (response = {
          data: {},
          status: true,
          message: "Employee Not Found",
        });
      }
      response = {
        data: employeeList,
        status: true,
        message: "Employee Details",
      };
    } catch (error) {
      console.log(error)
      throw error
    }

    return response;
  }

  async findAllByCompany(adminid: any,companyid:number): Promise<any> {
    try {
      const employeeCategory = await this.employeeRepository.findAll({
        include: [PayrollEmployeeCategory],
        where: { adminId: adminid, companyid},
      });
      return employeeCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findALlEmployeeOfUser(id: any, companyid: any): Promise<any> {
    try {
      const employeeCategory = await this.employeeRepository.findAll({
        where: { adminId: id, companyid },
      });
      return employeeCategory;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(CreateProductCategoryDto: CreateEmployeeDto) {
    try {
      const checkEmployee = await this.employeeRepository.findOne({
        where: {
          adminId: CreateProductCategoryDto.adminId,
          email: CreateProductCategoryDto.email,
        },
      });

      if (checkEmployee) {
        return new CommonResponseDto(null, false, "Employee Already Exists");
      }

      const newEmployee = new PayrollEmployee();
      newEmployee.accountHolderName =
        CreateProductCategoryDto?.accountHolderName || "";
      newEmployee.firstName = CreateProductCategoryDto.firstName;
      newEmployee.lastName = CreateProductCategoryDto.lastName;
      newEmployee.employeeNumber = CreateProductCategoryDto.employeeNumber;
      newEmployee.eircode = CreateProductCategoryDto.eircode;
      newEmployee.phone = CreateProductCategoryDto.phone;
      newEmployee.email = CreateProductCategoryDto.email;
      newEmployee.fullAddress = CreateProductCategoryDto.fullAddress;
      newEmployee.Designation = CreateProductCategoryDto.Designation;
      newEmployee.accountNumber = CreateProductCategoryDto?.accountNumber || "";
      newEmployee.branch = CreateProductCategoryDto?.branch || "";
      newEmployee.IFSC = CreateProductCategoryDto?.IFSC || "";
      newEmployee.adminId = CreateProductCategoryDto.adminId;
      newEmployee.employeeGroup = CreateProductCategoryDto.employeeGroup;
      newEmployee.salaryPackage = CreateProductCategoryDto.salaryPackage;
      newEmployee.date_of_join = CreateProductCategoryDto.date_of_join;
      newEmployee.companyid = CreateProductCategoryDto.companyid;
      newEmployee.createdBy = CreateProductCategoryDto.createdBy;

      let saveData = await newEmployee.save();
      return new CommonResponseDto(
        new PayrollEmployeeDTO(saveData),
        true,
        "Employee Created Successfully"
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(Dto: any, id: any) {
    try {
      const foundedCategory: any = await this.employeeRepository.findByPk(id);
      if (!foundedCategory) {
        return new CommonResponseDto(null, false, "No Employee found");
      }
      foundedCategory.employeeGroup =
        Dto.employeGroup || foundedCategory.employeeGroup;
      foundedCategory.accountHolderName =
        Dto.accountHolderName || foundedCategory.accountHolderName;
      foundedCategory.firstName = Dto.firstName || foundedCategory.firstName;
      foundedCategory.lastName = Dto.lastName || foundedCategory.lastName;
      foundedCategory.employeeNumber =
        Dto.employeeNumber || foundedCategory.employeeNumber;
      foundedCategory.eircode = Dto.eircode || foundedCategory.eircode;
      foundedCategory.phone = Dto.phone || foundedCategory.phone;
      foundedCategory.email = Dto.email || foundedCategory.email;
      foundedCategory.fullAddress =
        Dto.fullAddress || foundedCategory.fullAddress;
      foundedCategory.Designation =
        Dto.Designation || foundedCategory.Designation;
      foundedCategory.accountNumber =
        Dto.accountNumber || foundedCategory.accountNumber;
      foundedCategory.branch = Dto.branch || foundedCategory.branch;
      foundedCategory.IFSC = Dto.IFSC || foundedCategory.IFSC;
      foundedCategory.salaryPackage =
        Dto.salaryPackage || foundedCategory.salaryPackage;
      foundedCategory.date_of_join =
        Dto.date_of_join || foundedCategory.date_of_join;
      foundedCategory.companyid = Dto.companyid || foundedCategory.companyid;
      foundedCategory.createdBy = Dto.createdBy || foundedCategory.createdBy;
      let updated = await foundedCategory.save();
      return new CommonResponseDto(
        updated,
        true,
        "Employee Details Updated Successfully"
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findCategory(userId): Promise<any> {
    try {
      const data = await this.employeeRepository.findAll<PayrollEmployee>({
        where: {
          adminId: userId,
        },
      });
      return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async delete(id: any): Promise<CommonResponseDto> {
    try {
      const data = await this.employeeRepository.findByPk<PayrollEmployee>(id);

      if (!data) {
        return new CommonResponseDto(null, false, "No Employee Category found");
      }

      await data.destroy();

      return new CommonResponseDto(
        null,
        true,
        "Employee Category Deleted Successfully"
      );
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
