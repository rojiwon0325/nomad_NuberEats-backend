import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@user/entity/user.entity';
import * as AWS from 'aws-sdk';
import { DeleteToS3Output, UploadToS3Output } from './upload.dto';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  updateAWS() {
    AWS.config.update({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get('AWS_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET'),
      },
    });
  }

  async uploadToS3(
    user: User,
    file: Express.Multer.File,
  ): Promise<UploadToS3Output> {
    try {
      this.updateAWS();
      const { Location } = await new AWS.S3()
        .upload({
          Bucket: 'nubereats-rojiwon',
          Key: `${user.id}/${Date.now() + file.size}`,
          ACL: 'public-read',
          ContentType: file.mimetype,
          Body: file.buffer,
        })
        .promise();
      return { ok: true, url: Location };
    } catch (e) {
      console.log(e);
    }
    return { ok: false, error: '업로드하지 못했습니다.' };
  }

  async deleteToS3(url: string): Promise<DeleteToS3Output> {
    try {
      if (url === '') {
        return { ok: false, error: 'url을 입력해 주세요.' };
      }
      this.updateAWS();
      const Key = url.replace(
        'https://nubereats-rojiwon.s3.ap-northeast-2.amazonaws.com/',
        '',
      );
      await new AWS.S3()
        .deleteObject(
          { Bucket: 'nubereats-rojiwon', Key },
          (err, data) => err || data,
        )
        .promise();
      return { ok: true };
    } catch {}
    return { ok: false, error: '삭제하지 못했습니다.' };
  }
}
