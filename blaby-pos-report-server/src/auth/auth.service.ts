import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SequelizeMultiDbConfig } from '../config/sequelize-multi-db.config';
import { QueryTypes } from 'sequelize';

// Interface for contact_master table
interface ContactMaster {
  id: number;
  companyid: number;
  name: string;
  email: string;
  password: string;
  mobile: string;
  active: number;
  contractors_type: string;
  staffAccess: string[] | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async emailLogin(email: string, password: string) {
    try {
      const branchConnections = SequelizeMultiDbConfig.getConnections();

      // Search all branch databases for this email
      for (const conn of branchConnections) {
        const { sequelize } = conn;

        const users = await sequelize.query<ContactMaster>(
          `SELECT * FROM contact_master WHERE email = :email AND active = 1 LIMIT 1`,
          {
            replacements: { email },
            type: QueryTypes.SELECT,
          },
        );

        if (!users || users.length === 0) continue;

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) continue;

        // Generate JWT token
        const payload = {
          sub: user.id,
          email: user.email,
          role: user.contractors_type || 'staff',
          name: user.name,
          companyId: user.companyid,
          staffAccess: user.staffAccess,
        };

        const token = this.jwtService.sign(payload);

        return {
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.contractors_type || 'staff',
              phone: user.mobile,
              companyId: user.companyid,
              staffAccess: user.staffAccess,
            },
          },
        };
      }

      throw new UnauthorizedException('Invalid email or password');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
