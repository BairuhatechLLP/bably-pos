import {
    Table,
    PrimaryKey,
    Model,
    AutoIncrement,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
  } from 'sequelize-typescript';
  
  @Table({
    tableName: 'blog_master',
  })
  export class BlogMaster extends Model<BlogMaster> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;
  
    @Column(DataType.STRING(500))
    title: string;

    @Column(DataType.STRING(250))
    image: string;

    @Column(DataType.STRING(2500))
    content: string;

    @Column(DataType.STRING(200))
    category: string;

    @Column(DataType.BOOLEAN) 
    status: boolean;

    @Column(DataType.DATE) 
    date: Date;
  
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt: Date;
  
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt: Date;

  }
  