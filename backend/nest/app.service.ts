import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { extractText } from '../src/utils/textExtractor';
import { parseResume } from '../src/parsers/resumeParser';
import { parseJD } from '../src/parsers/jdParser';
import { matchResumeToJDs } from '../src/matchers/matcher';

type JdInput = {
  jobId?: string;
  role?: string | null;
  text: string;
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { status: 'ok', version: '1.0.0', backend: 'nestjs' };
  }

  docs() {
    return {
      name: 'Resume Matcher API',
      version: '1.0.0',
      backend: 'Nest.js + Prisma',
      endpoints: [
        'GET /api/health',
        'GET /api/db/health',
        'POST /api/match',
        'POST /api/parse/resume',
        'POST /api/parse/jd',
        'GET /api/resumes',
        'GET /api/resumes/:id',
        'GET /api/jobs',
        'POST /api/jobs',
        'GET /api/matches',
        'GET /api/matches/:id',
      ],
    };
  }

  async databaseHealth() {
    if (!this.prisma.isEnabled()) {
      return {
        enabled: false,
        connected: false,
        message: 'Set DATABASE_URL to enable Postgres persistence.',
      };
    }

    const rows = await this.prisma.$queryRawUnsafe<Array<{ now: Date }>>('SELECT NOW() AS now');
    return { enabled: true, connected: true, now: rows[0]?.now };
  }

  async parseResumeFile(file: Express.Multer.File) {
    const text = await extractText(file.path);
    return parseResume(text);
  }

  parseJobDescription(body: { text: string; jobId?: string; role?: string }) {
    return parseJD(body.text, body.jobId || 'JD001', body.role || null);
  }

  async parseAndSaveJobDescription(body: { text: string; jobId?: string; role?: string }) {
    const parsedJD = this.parseJobDescription(body);

    if (!this.prisma.isEnabled()) {
      return { databaseEnabled: false, parsedJD };
    }

    const job = await this.prisma.jobDescription.create({
      data: {
        jobId: parsedJD.jobId,
        role: parsedJD.role,
        aboutRole: parsedJD.aboutRole,
        salary: parsedJD.salary,
        yearsExperience: parsedJD.yearsOfExperience,
        requiredSkills: parsedJD.requiredSkills,
        optionalSkills: parsedJD.optionalSkills,
        allSkills: parsedJD.allSkills,
        rawText: body.text,
        parsedJson: parsedJD,
      },
      select: { id: true },
    });

    return { jobDescriptionId: job.id, parsedJD };
  }

  async match(file: Express.Multer.File, body: any) {
    const resumeText = await extractText(file.path);
    const parsedResume = parseResume(resumeText);
    const { jdInputs, parsedJDs } = this.parseJdInputs(body);
    const result = matchResumeToJDs(parsedResume, parsedJDs);

    if (this.prisma.isEnabled()) {
      const saved = await this.saveMatchRun({
        fileName: file.originalname,
        resumeText,
        parsedResume,
        jdInputs,
        parsedJDs,
        result,
      });

      result.resumeId = saved.resumeId;
      result.matchRunId = saved.matchRunId;
    }

    return result;
  }

  async listResumes(limit = 50) {
    if (!this.prisma.isEnabled()) return [];

    return this.prisma.resume.findMany({
      orderBy: { createdAt: 'desc' },
      take: this.cleanLimit(limit),
      select: {
        id: true,
        fileName: true,
        candidateName: true,
        email: true,
        phone: true,
        yearsExperience: true,
        resumeSkills: true,
        createdAt: true,
      },
    });
  }

  async getResume(id: string) {
    if (!this.prisma.isEnabled()) return null;
    return this.prisma.resume.findUnique({ where: { id } });
  }

  async listJobs(limit = 50) {
    if (!this.prisma.isEnabled()) return [];

    return this.prisma.jobDescription.findMany({
      orderBy: { createdAt: 'desc' },
      take: this.cleanLimit(limit),
    });
  }

  async listMatches(limit = 50) {
    if (!this.prisma.isEnabled()) return [];

    const runs = await this.prisma.matchRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: this.cleanLimit(limit),
      include: {
        resume: { select: { candidateName: true } },
        results: { select: { matchingScore: true } },
      },
    });

    return runs.map(run => ({
      id: run.id,
      resumeId: run.resumeId,
      candidateName: run.resume.candidateName,
      jobCount: run.results.length,
      bestScore: Math.max(0, ...run.results.map(result => result.matchingScore)),
      createdAt: run.createdAt,
    }));
  }

  async getMatch(id: string) {
    if (!this.prisma.isEnabled()) return null;

    return this.prisma.matchRun.findUnique({
      where: { id },
      include: {
        resume: true,
        results: {
          orderBy: { matchingScore: 'desc' },
          include: { jobDescription: true },
        },
      },
    });
  }

  private parseJdInputs(body: any): { jdInputs: JdInput[]; parsedJDs: any[] } {
    if (body.jds) {
      let raw: JdInput[];
      try {
        raw = JSON.parse(body.jds) as JdInput[];
      } catch {
        throw new BadRequestException('jds must be valid JSON.');
      }

      return {
        jdInputs: raw,
        parsedJDs: raw.map((jd, i) =>
          parseJD(jd.text, jd.jobId || `JD${String(i + 1).padStart(3, '0')}`, jd.role || null),
        ),
      };
    }

    if (body.jdText) {
      const jdInputs = [{ jobId: 'JD001', role: body.role || null, text: body.jdText }];
      return {
        jdInputs,
        parsedJDs: [parseJD(body.jdText, 'JD001', body.role || null)],
      };
    }

    throw new BadRequestException('Provide jds (JSON array) or jdText field.');
  }

  private async saveMatchRun(args: {
    fileName: string;
    resumeText: string;
    parsedResume: any;
    jdInputs: JdInput[];
    parsedJDs: any[];
    result: any;
  }) {
    return this.prisma.$transaction(async tx => {
      const resume = await tx.resume.create({
        data: {
          fileName: args.fileName,
          candidateName: args.parsedResume.name || 'Unknown',
          email: args.parsedResume.email,
          phone: args.parsedResume.phone,
          yearsExperience: args.parsedResume.yearOfExperience,
          resumeSkills: args.parsedResume.resumeSkills || [],
          rawText: args.resumeText,
          parsedJson: args.parsedResume,
        },
        select: { id: true },
      });

      const jobIds = new Map<string, string>();

      for (let i = 0; i < args.parsedJDs.length; i += 1) {
        const parsedJD = args.parsedJDs[i];
        const job = await tx.jobDescription.create({
          data: {
            jobId: parsedJD.jobId,
            role: parsedJD.role,
            aboutRole: parsedJD.aboutRole,
            salary: parsedJD.salary,
            yearsExperience: parsedJD.yearsOfExperience,
            requiredSkills: parsedJD.requiredSkills,
            optionalSkills: parsedJD.optionalSkills,
            allSkills: parsedJD.allSkills,
            rawText: args.jdInputs[i]?.text || '',
            parsedJson: parsedJD,
          },
          select: { id: true },
        });

        jobIds.set(`${parsedJD.jobId}:${parsedJD.role}`, job.id);
        jobIds.set(parsedJD.jobId, job.id);
      }

      const run = await tx.matchRun.create({
        data: {
          resumeId: resume.id,
          outputJson: args.result,
        },
        select: { id: true },
      });

      for (const job of args.result.matchingJobs || []) {
        const jobDescriptionId = jobIds.get(`${job.jobId}:${job.role}`) || jobIds.get(job.jobId);

        if (!jobDescriptionId) continue;

        await tx.matchResult.create({
          data: {
            matchRunId: run.id,
            jobDescriptionId,
            jobId: job.jobId,
            role: job.role,
            salary: job.salary,
            yearsExperience: job.yearsOfExperience,
            aboutRole: job.aboutRole,
            matchingScore: job.matchingScore,
            matchedSkillCount: job.matchedSkillCount || 0,
            totalJdSkills: job.totalJDSkills || 0,
            skillsAnalysis: job.skillsAnalysis || [],
          },
        });
      }

      return { resumeId: resume.id, matchRunId: run.id };
    });
  }

  private cleanLimit(limit: number) {
    return Math.max(1, Math.min(200, Number(limit) || 50));
  }
}
