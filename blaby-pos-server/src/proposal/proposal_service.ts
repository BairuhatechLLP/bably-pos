import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Proposal } from './proposal_model';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { ProposalDto } from './dto/proposal_dto';
import { UpdateProposalDto } from './dto/update_proposal_dto';
import { CreateProposalDto } from './dto/proposal_create_dto';

@Injectable()
export class ProposalService {
  constructor(
    @Inject('ProposalRepository')
    private readonly proposalRepository: typeof Proposal,
  ) {}

  async findAll(id: any,companyid:number) {
    try {
      let whereCase = {
        adminid: id,
        companyid,
        is_deleted: false,
      };
      const cart = await this.proposalRepository.findAll<Proposal>({
        where: whereCase,
        limit: 20,
        raw: true,
      });
      return new CommonResponseDto(
        cart.map((cart) => new ProposalDto(cart)),
        true,
        'Proposal List',
      );
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const proposal = await this.proposalRepository.findByPk<Proposal>(id, {});
      if (!proposal) {
        throw new HttpException('No proposal found', HttpStatus.NOT_FOUND);
      }
      return { data: proposal, status: true, message: 'proposal details' };
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async create(createDto: CreateProposalDto) {
    try {
      const proposal = new Proposal();
      proposal.logo = createDto.logo;
      proposal.adminid = createDto.adminid;
      proposal.template = createDto.template;

      proposal.proposal_date = createDto.proposal_date;
      proposal.from_company_name = createDto.from_company_name;
      proposal.from_email = createDto.from_email;
      proposal.from_mobile = createDto.from_mobile;
      proposal.from_website = createDto.from_website;
      proposal.from_address = createDto.from_address;
      proposal.billing = createDto.billing;

      proposal.to_company_name = createDto.to_company_name;
      proposal.to_website = createDto.to_website;
      proposal.to_email = createDto.to_email;
      proposal.to_mobile = createDto.to_mobile;
      proposal.to_address = createDto.to_address;

      proposal.about__from_company = createDto.about__from_company;
      proposal.proposal_title = createDto.proposal_title;
      proposal.proposal_subtitle = createDto.proposal_subtitle;
      proposal.proposal_details = createDto.proposal_details;
      proposal.proposal_terms = createDto.proposal_terms;
      proposal.conclusion = createDto.conclusion;

      proposal.primary_color = createDto.primary_color;
      proposal.secondary_color = createDto.secondary_color;
      proposal.about_from_company_tag = createDto.about_from_company_tag;
      proposal.project_plan = createDto.project_plan;
      proposal.about_from_services = createDto.about_from_services;
      proposal.about_from_technologies = createDto.about_from_technologies;
      proposal.createdBy = createDto.createdBy;
      proposal.companyid = createDto.companyid;

      proposal.is_deleted = false;
      let createdProposal: any = await proposal.save();

      const response = {
        status: true,
        message: 'Proposal created sucessfully',
        data: createdProposal,
      };

      return response;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateProposalDto) {
    try {
      const proposal = await this.proposalRepository.findByPk<Proposal>(id);
      if (!proposal) {
        throw new HttpException('Proposal not found.', HttpStatus.NOT_FOUND);
      }
      proposal.adminid = updateDto.adminid || proposal.adminid;
      proposal.logo = updateDto.logo || proposal.logo;
      proposal.template = updateDto.template || proposal.template;

      proposal.proposal_date =
        new Date(updateDto.proposal_date) || new Date(proposal.proposal_date);
      proposal.from_company_name =
        updateDto.from_company_name || proposal.from_company_name;
      proposal.from_email = updateDto.from_email || proposal.from_email;
      proposal.from_mobile = updateDto.from_mobile || proposal.from_mobile;
      proposal.from_website = updateDto.from_website || proposal.from_website;
      proposal.from_address = updateDto.from_address || proposal.from_address;

      proposal.to_company_name =
        updateDto.to_company_name || proposal.to_company_name;
      proposal.to_website = updateDto.to_website || proposal.to_website;
      proposal.to_email = updateDto.to_email || proposal.to_email;
      proposal.to_mobile = updateDto.to_mobile || proposal.to_mobile;
      proposal.to_address = updateDto.to_address || proposal.to_address;

      proposal.about__from_company =
        updateDto.about__from_company || proposal.about__from_company;
      proposal.proposal_title =
        updateDto.proposal_title || proposal.proposal_title;
      proposal.proposal_subtitle =
        updateDto.proposal_subtitle || proposal.proposal_subtitle;
      proposal.proposal_details =
        updateDto.proposal_details || proposal.proposal_details;
      proposal.proposal_terms =
        updateDto.proposal_terms || proposal.proposal_terms;
      proposal.conclusion = updateDto.conclusion || proposal.conclusion;
      proposal.billing = updateDto.billing || proposal.billing;
      proposal.primary_color =
        updateDto.primary_color || proposal.primary_color;
      proposal.secondary_color =
        updateDto.secondary_color || proposal.primary_color;
      proposal.project_plan = updateDto.project_plan || updateDto.project_plan;
      proposal.about_from_company_tag =
        updateDto.about_from_company_tag || proposal.about_from_company_tag;
      proposal.about_from_services =
        updateDto.about_from_services || proposal.about_from_services;
      proposal.about_from_technologies =
        updateDto.about_from_technologies || proposal.about_from_technologies;
        proposal.createdBy = updateDto.createdBy || proposal.createdBy;
        proposal.companyid = updateDto.companyid || proposal.companyid;
      proposal.is_deleted = false;

      let updatedProposal: any = await proposal.save();

      const response = {
        status: true,
        message: 'Proposal updated sucessfully',
        data: updatedProposal,
      };

      return response;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const cart = await this.proposalRepository.findByPk<Proposal>(id);
      await cart.destroy();
      return new ProposalDto(cart);
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async Delete(id: number) {
    try {
      const proposal = await this.proposalRepository.findByPk<Proposal>(id);
      proposal.is_deleted = true;
      const data = await proposal.save();
      let res = {
        data: data,
        status: true,
        message: 'proposal deleted successfully',
      };
      return res;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }
}
