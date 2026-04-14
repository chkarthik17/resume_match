import {
  Body,
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';

const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const resumeUpload = FileInterceptor('resume', {
  storage: diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(allowed.includes(ext) ? null : new Error(`Unsupported file type: ${ext}`), allowed.includes(ext));
  },
});

function cleanup(file?: Express.Multer.File) {
  if (!file?.path) return;
  try {
    fs.unlinkSync(file.path);
  } catch (_err) {}
}

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return this.appService.health();
  }

  @Get('docs')
  docs() {
    return this.appService.docs();
  }

  @Get('db/health')
  databaseHealth() {
    return this.appService.databaseHealth();
  }

  @Post('match')
  @UseInterceptors(resumeUpload)
  async match(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) throw new BadRequestException('Resume file is required.');

    try {
      return await this.appService.match(file, body);
    } finally {
      cleanup(file);
    }
  }

  @Post('parse/resume')
  @UseInterceptors(resumeUpload)
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Resume file is required.');

    try {
      return await this.appService.parseResumeFile(file);
    } finally {
      cleanup(file);
    }
  }

  @Post('parse/jd')
  parseJobDescription(@Body() body: { text: string; jobId?: string; role?: string }) {
    if (!body.text) throw new BadRequestException('text field is required.');
    return this.appService.parseJobDescription(body);
  }

  @Get('resumes')
  listResumes(@Query('limit') limit?: string) {
    return this.appService.listResumes(Number(limit || 50));
  }

  @Get('resumes/:id')
  async getResume(@Param('id') id: string) {
    const resume = await this.appService.getResume(id);
    if (!resume) throw new NotFoundException('Resume not found.');
    return resume;
  }

  @Get('jobs')
  listJobs(@Query('limit') limit?: string) {
    return this.appService.listJobs(Number(limit || 50));
  }

  @Post('jobs')
  saveJob(@Body() body: { text: string; jobId?: string; role?: string }) {
    if (!body.text) throw new BadRequestException('text field is required.');
    return this.appService.parseAndSaveJobDescription(body);
  }

  @Get('matches')
  listMatches(@Query('limit') limit?: string) {
    return this.appService.listMatches(Number(limit || 50));
  }

  @Get('matches/:id')
  async getMatch(@Param('id') id: string) {
    const match = await this.appService.getMatch(id);
    if (!match) throw new NotFoundException('Match run not found.');
    return match;
  }
}
