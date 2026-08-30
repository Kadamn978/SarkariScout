import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CompetitorDiscoveryAgent } from './competitor-discovery.agent';
import { SourceResolverAgent, ResolvedJob } from './source-resolver.agent';
import { SourceManagerAgent } from './source-manager.agent';
import { OfficialScraperAgent, ScrapedOfficialJob } from './official-scraper.agent';
import { JobValidatorAgent } from './job-validator.agent';

export interface PipelineResult {
  step1_discovery: {
    competitorJobs: number;
    sitesScanned: string[];
  };
  step2_resolution: {
    resolved: number;
    unresolved: number;
    alreadyTracked: number;
    newSourcesNeeded: number;
  };
  step3_sourceManagement: {
    added: string[];
    alreadyExists: string[];
    unresolved: string[];
  };
  step4_officialScraping: {
    officialJobsFound: number;
    sourcesScraped: string[];
  };
  step5_validation: {
    inserted: number;
    skipped: number;
    duplicates: number;
  };
  duration: number;
}

@Injectable()
export class CompetitorPipeline {
  private readonly logger = new Logger(CompetitorPipeline.name);

  constructor(
    private prisma: PrismaService,
    private sourceManager: SourceManagerAgent,
    private validator: JobValidatorAgent,
  ) {}

  async run(): Promise<PipelineResult> {
    const startTime = Date.now();
    this.logger.log('=== Competitor Pipeline Started ===');

    // Step 1: Discover jobs from competitor sites
    this.logger.log('Step 1: Discovering competitor jobs...');
    const discoveryAgent = new CompetitorDiscoveryAgent();
    const competitorJobs = await discoveryAgent.discoverAll();

    // Step 2: Resolve official sources
    this.logger.log('Step 2: Resolving official sources...');
    const resolverAgent = new SourceResolverAgent();
    const trackedSources = await this.prisma.source.findMany({
      select: { baseUrl: true },
    });
    const trackedDomains = trackedSources.map(s => {
      try { return new URL(s.baseUrl).hostname; } catch { return ''; }
    }).filter(Boolean);

    const resolved = await resolverAgent.resolveAll(competitorJobs, trackedDomains);

    const alreadyTracked = resolved.filter(r => r.isAlreadyTracked);
    const needsNewSource = resolved.filter(r => !r.isAlreadyTracked && r.officialDomain);
    const unresolved = resolved.filter(r => !r.officialDomain);

    // Step 3: Add missing official sources to DB
    this.logger.log('Step 3: Adding missing official sources...');
    const sourceResult = await this.sourceManager.addMissingSources(needsNewSource);

    // Step 4: Scrape newly added official sources for jobs
    this.logger.log('Step 4: Scraping official sources...');
    const scraperAgent = new OfficialScraperAgent(this.prisma);
    const officialJobs = await scraperAgent.scrapeSourceJobs(needsNewSource);

    // Step 5: Validate and insert jobs
    this.logger.log('Step 5: Validating and inserting jobs...');
    const validationResult = await this.validator.validateAndInsert(officialJobs);

    const duration = Date.now() - startTime;
    this.logger.log(`=== Pipeline Complete in ${duration}ms ===`);

    return {
      step1_discovery: {
        competitorJobs: competitorJobs.length,
        sitesScanned: ['SarkariResult', 'FreeJobAlert', 'FreshersLive', 'JagranJosh'],
      },
      step2_resolution: {
        resolved: resolved.length,
        unresolved: unresolved.length,
        alreadyTracked: alreadyTracked.length,
        newSourcesNeeded: needsNewSource.length,
      },
      step3_sourceManagement: sourceResult,
      step4_officialScraping: {
        officialJobsFound: officialJobs.length,
        sourcesScraped: [...new Set(officialJobs.map(j => j.officialDomain))],
      },
      step5_validation: {
        inserted: validationResult.inserted,
        skipped: validationResult.skipped,
        duplicates: validationResult.duplicates,
      },
      duration,
    };
  }

  async getPipelineStats() {
    const totalSources = await this.prisma.source.count();
    const competitorSources = await this.prisma.source.count({
      where: { configJson: { contains: '"isCompetitor":true' } },
    });
    const discoveredSources = await this.prisma.source.count({
      where: { configJson: { contains: '"isDiscovered":true' } },
    });
    const totalJobs = await this.prisma.job.count();

    return {
      totalSources,
      competitorSources,
      discoveredSources,
      officialSources: totalSources - competitorSources,
      totalJobs,
    };
  }
}
