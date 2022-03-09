import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
import {
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@user/entity/user.entity';
import { UploadToS3Output } from './upload.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Role(['Any'])
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @AuthUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadToS3Output> {
    return this.uploadService.uploadToS3(user, file);
  }

  @Delete()
  deleteFile(@Query('url') url: string) {
    return this.uploadService.deleteToS3(url);
  }
}
