import { Injectable } from '@nestjs/common';
import Jimp from 'jimp';
import * as AWS from 'aws-sdk';
import { ConfigService } from '../shared/config/config.service';

@Injectable()
export class ImgcompressService {
  private s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3(this.configService.awsConfig);
  }

  async imgCompressAndUpload(imageBuffer: Buffer): Promise<any> {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Invalid image buffer.');
      }
      const image = await Jimp.read(imageBuffer);
      image.quality(80);
      const compressedImageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      const bucketName = this.configService.awsConfig.bucket;

      const dirName = 'taxgo/images';
      const params = {
        Bucket: bucketName,
        Key: `${dirName}/${Date.now()}.jpg`,
        Body: compressedImageBuffer,
        // ACL: 'public-read',
      };
      const data = await this.s3.upload(params).promise();
      return data;
    } catch (error) {
      console.error('Error compressing and uploading image:', error);
      throw error;
    }
  }

  async uploadToS3(file: Express.Multer.File): Promise<string> {
    try {
      const bucketName = this.configService.awsConfig.bucket;
      const dirName = 'taxgo/images';
      const params = {
        Bucket: bucketName,
        Key: `${dirName}/${file.originalname}`,
        Body: file.buffer,
        //ACL: 'public-read',
      };
      const data = await this.s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }
  async deleteFromS3(key: string) {
    try {
      const bucketName = this.configService.awsConfig.bucket;
      const params = {
        Bucket: bucketName,
        Key: key,
      };
      const image = await this.s3.headObject(params).promise();
      const deleted = await this.s3.deleteObject(params).promise();
      return deleted;
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
