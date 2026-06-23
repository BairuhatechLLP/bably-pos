import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
  
import { Public } from '../shared/decorators/public.decorator';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';
import { BlogMaster } from './blog.entity';
import { BlogService } from './blog.service';
import { BlogMasterDto } from './dto/blog_dto';
import { CreateBlogDto } from './dto/create_blog_dto';
import { UpdateBlogDto } from './dto/update_blog_dto';
import { BlogListQueryDto } from './dto/blogListQuery.dto';
  
  @Controller('blog')
  @Public()
  @ApiTags('Blog')
  @UseInterceptors(ErrorsInterceptor)
  export class BlogController {
    constructor(
      private readonly BlogService: BlogService,
    ) {}

    
  @Get()
  @ApiOkResponse({ type: CommonResponseDto })
  findAll(): Promise<CommonResponseDto> {
    return this.BlogService.findAll();
  }

  @Get('/lists')
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "skip", required: false })
  @ApiQuery({ name: "category", required: false })
  getLimitedBlogs(
    @Query() data: BlogListQueryDto
  ): Promise<CommonResponseDto> {
    return this.BlogService.getLimitedBlogs(data);
  }

  @Get(':id')
  @ApiOkResponse({ type: BlogMasterDto })
  @ApiParam({ name: 'id', required: true })
  findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CommonResponseDto> {
    return this.BlogService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: BlogMaster })
  create(
    @Body() CreateBlogDto: CreateBlogDto,
  ): Promise<CommonResponseDto> {
    return this.BlogService.create(CreateBlogDto);
  }

  @Put(':id')
  @ApiOkResponse({ type: BlogMaster })
  @ApiParam({ name: 'id', required: true })
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request,
    @Body() UpdateBlogDto: UpdateBlogDto,
  ): Promise<CommonResponseDto> {
    return this.BlogService.update(id, UpdateBlogDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BlogMaster })
  @ApiParam({ name: 'id', required: true })
  delete(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request,
  ): Promise<BlogMaster> {
    return this.BlogService.delete(id);
  }

  }