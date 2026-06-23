import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { BlogMaster } from './blog.entity';
import { BlogMasterDto } from './dto/blog_dto';
import { CreateBlogDto } from './dto/create_blog_dto';
import { UpdateBlogDto } from './dto/update_blog_dto';
import { error } from 'console';
import { BlogListQueryDto } from './dto/blogListQuery.dto';

@Injectable()
export class BlogService {
  constructor(
    @Inject('BlogRepository')
    private readonly BlogRepository: typeof BlogMaster,
  ) {}

  async findAll() {
    try {
      const blogs =
      await this.BlogRepository.findAll<BlogMaster>({});
    return new CommonResponseDto(
      blogs.map((blog) => new BlogMasterDto(blog)),
      true,
      'Blog List',
    );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: number) {
    try {
        const blog =
        await this.BlogRepository.findByPk<BlogMaster>(id);
        return new CommonResponseDto(blog,true,"Blog fetched successfully")
    } catch (error) {
        console.log(error)
        throw error
    }

  }
  
  async getLimitedBlogs(data:BlogListQueryDto){
    try {
      let whereCase = {};
      if(data?.category !== 'all'){
        whereCase = { category: data?.category };
      }
      const blogs = await this.BlogRepository.findAll<BlogMaster>({
        where: whereCase,
        offset: Number(data?.skip),
        limit: Number(data?.limit),
        order: [['createdAt', 'DESC']],
    });
    return new CommonResponseDto(
      blogs,
      true,
      'Blog List',
    );
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(CreateBlogDto: CreateBlogDto) {
    try {
      const blog = new BlogMaster();
      blog.title = CreateBlogDto.title;
      blog.image = CreateBlogDto.image;
      blog.category = CreateBlogDto.category;
      blog.status = CreateBlogDto.status;
      blog.content = CreateBlogDto.content;
      blog.date = CreateBlogDto.date;
      let createdData = await blog.save();
    
    return new CommonResponseDto(createdData,true,"Blog created successfully")
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: number, UpdateBlogDto: UpdateBlogDto) {
    try {
      const blog = await this.BlogRepository.findByPk(id);
      if(blog){
        blog.title = UpdateBlogDto.title || blog.title;
        blog.image = UpdateBlogDto.image || blog.image;
        blog.category = UpdateBlogDto.category || blog.category;
        blog.date = UpdateBlogDto.date || blog.date;
        blog.content = UpdateBlogDto.content || blog.content;
        blog.status = UpdateBlogDto.status || blog.status;
        const updatedData = await blog.save();

        return new CommonResponseDto(updatedData,true,"Blog updated successfully")
      }else{
        return new CommonResponseDto(null,false,"Failed to update blog")
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete(id: number) {
    try {
        const blog = await this.BlogRepository.findByPk(id);
      await blog.destroy();
      return blog;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
