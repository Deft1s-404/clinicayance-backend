import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeEntry, KnowledgeEntryStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeEntryDto } from './dto/create-knowledge-entry.dto';
import { ListKnowledgeEntriesDto } from './dto/list-knowledge-entries.dto';
import { UpdateKnowledgeEntryDto } from './dto/update-knowledge-entry.dto';
import { KnowledgeContextQueryDto } from './dto/knowledge-context-query.dto';

type KnowledgeContextEntry = Pick<
  KnowledgeEntry,
  | 'id'
  | 'title'
  | 'summary'
  | 'content'
  | 'tags'
  | 'category'
  | 'audience'
  | 'language'
  | 'priority'
  | 'sourceUrl'
  | 'status'
  | 'publishedAt'
  | 'updatedAt'
>;

export interface KnowledgeContextResponse {
  entries: KnowledgeContextEntry[];
  combinedText: string;
}

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListKnowledgeEntriesDto) {
    const {
      page = 1,
      limit = 20,
      status,
      tags,
      category,
      language,
      audience,
      search
    } = query;

    const normalizedTags = this.normalizeTags(tags);
    const searchFilters = this.buildSearchFilters(search);

    const where: Prisma.KnowledgeEntryWhereInput = {
      ...(status ? { status } : {}),
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(language ? { language: { equals: language, mode: 'insensitive' } } : {}),
      ...(audience ? { audience: { equals: audience, mode: 'insensitive' } } : {}),
      ...(normalizedTags?.length ? { tags: { hasSome: normalizedTags } } : {}),
      ...(searchFilters ? { OR: searchFilters } : {})
    };

    const [data, total] = await Promise.all([
      this.prisma.knowledgeEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }]
      }),
      this.prisma.knowledgeEntry.count({ where })
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`Conhecimento ${id} nao encontrado.`);
    }

    return entry;
  }

  async create(dto: CreateKnowledgeEntryDto) {
    const normalizedTags = this.normalizeTags(dto.tags, { allowEmpty: true }) ?? [];
    const normalizedSlug = dto.slug?.trim() || undefined;
    const now = new Date();
    const status = dto.status ?? KnowledgeEntryStatus.DRAFT;

    try {
      return await this.prisma.knowledgeEntry.create({
        data: {
          title: dto.title.trim(),
          slug: normalizedSlug,
          summary: dto.summary?.trim() || undefined,
          content: dto.content.trim(),
          tags: normalizedTags,
          category: dto.category?.trim() || undefined,
          audience: dto.audience?.trim() || undefined,
          language: dto.language?.trim() || undefined,
          status,
          priority: dto.priority ?? 0,
          sourceUrl: dto.sourceUrl?.trim() || undefined,
          metadata: dto.metadata ?? undefined,
          publishedAt: status === KnowledgeEntryStatus.PUBLISHED ? now : null
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateKnowledgeEntryDto) {
    const existing = await this.findById(id);
    const normalizedTags =
      dto.tags !== undefined
        ? this.normalizeTags(dto.tags, { allowEmpty: true }) ?? []
        : undefined;

    const nextStatus = dto.status ?? existing.status;
    let publishedAt: Date | null | undefined;

    if (dto.status !== undefined) {
      publishedAt =
        dto.status === KnowledgeEntryStatus.PUBLISHED
          ? existing.publishedAt ?? new Date()
          : null;
    }

    try {
      return await this.prisma.knowledgeEntry.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug?.trim() || null } : {}),
          ...(dto.summary !== undefined ? { summary: dto.summary?.trim() || null } : {}),
          ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
          ...(normalizedTags !== undefined ? { tags: normalizedTags } : {}),
          ...(dto.category !== undefined ? { category: dto.category?.trim() || null } : {}),
          ...(dto.audience !== undefined ? { audience: dto.audience?.trim() || null } : {}),
          ...(dto.language !== undefined ? { language: dto.language?.trim() || null } : {}),
          ...(dto.status !== undefined ? { status: nextStatus } : {}),
          ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
          ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl?.trim() || null } : {}),
          ...(dto.metadata !== undefined ? { metadata: dto.metadata } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {})
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.knowledgeEntry.delete({ where: { id } });
  }

  async getFilterOptions() {
    const entries = await this.prisma.knowledgeEntry.findMany({
      select: {
        tags: true,
        category: true,
        audience: true,
        language: true
      }
    });

    const tags = new Set<string>();
    const categories = new Set<string>();
    const audiences = new Set<string>();
    const languages = new Set<string>();

    entries.forEach((entry) => {
      entry.tags?.forEach((tag) => {
        if (tag) {
          tags.add(tag);
        }
      });

      if (entry.category) {
        categories.add(entry.category);
      }

      if (entry.audience) {
        audiences.add(entry.audience);
      }

      if (entry.language) {
        languages.add(entry.language);
      }
    });

    const sortStrings = (values: Set<string>) => Array.from(values).sort((a, b) => a.localeCompare(b));

    return {
      tags: sortStrings(tags),
      categories: sortStrings(categories),
      audiences: sortStrings(audiences),
      languages: sortStrings(languages)
    };
  }

  async buildContext(query: KnowledgeContextQueryDto): Promise<KnowledgeContextResponse> {
    const {
      tags,
      limit = 10,
      language,
      audience,
      category,
      includeDrafts,
      search,
      maxCharacters
    } = query;

    const normalizedTags = this.normalizeTags(tags);
    const searchFilters = this.buildSearchFilters(search);

    const where: Prisma.KnowledgeEntryWhereInput = {
      ...(includeDrafts ? {} : { status: KnowledgeEntryStatus.PUBLISHED }),
      ...(normalizedTags?.length ? { tags: { hasSome: normalizedTags } } : {}),
      ...(language ? { language: { equals: language, mode: 'insensitive' } } : {}),
      ...(audience ? { audience: { equals: audience, mode: 'insensitive' } } : {}),
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(searchFilters ? { OR: searchFilters } : {})
    };

    const maxItems = Math.min(50, Math.max(1, limit));

    const entries = await this.prisma.knowledgeEntry.findMany({
      where,
      take: maxItems,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        tags: true,
        category: true,
        audience: true,
        language: true,
        priority: true,
        sourceUrl: true,
        status: true,
        publishedAt: true,
        updatedAt: true
      }
    });

    const combinedText = this.composeCombinedText(entries);
    const limitedText =
      maxCharacters && combinedText.length > maxCharacters
        ? combinedText.slice(0, maxCharacters)
        : combinedText;

    return {
      entries,
      combinedText: limitedText
    };
  }

  private normalizeTags(
    tags?: string[],
    options?: { allowEmpty?: boolean }
  ): string[] | undefined {
    if (!tags) {
      return options?.allowEmpty ? [] : undefined;
    }

    const normalized = tags
      .map((tag) =>
        typeof tag === 'string' ? tag.trim().toLowerCase() : String(tag).trim().toLowerCase()
      )
      .filter((tag) => tag.length > 0);

    if (!normalized.length) {
      return options?.allowEmpty ? [] : undefined;
    }

    return Array.from(new Set(normalized));
  }

  private buildSearchFilters(search?: string): Prisma.KnowledgeEntryWhereInput[] | undefined {
    const normalized = search?.trim();
    if (!normalized) {
      return undefined;
    }

    const lowered = normalized.toLowerCase();

    return [
      { title: { contains: normalized, mode: 'insensitive' } },
      { summary: { contains: normalized, mode: 'insensitive' } },
      { content: { contains: normalized, mode: 'insensitive' } },
      { category: { contains: normalized, mode: 'insensitive' } },
      { audience: { contains: normalized, mode: 'insensitive' } },
      { tags: { has: lowered } }
    ];
  }

  private composeCombinedText(entries: KnowledgeContextEntry[]): string {
    const blocks = entries.map((entry) => {
      const header = `# ${entry.title}`;
      const summary = entry.summary ? `Resumo: ${entry.summary}` : null;
      const tags =
        entry.tags?.length > 0
          ? `Tags: ${entry.tags.map((tag) => `#${tag}`).join(' ')}`
          : null;
      const metaParts = [summary, tags, entry.category ? `Categoria: ${entry.category}` : null].filter(
        Boolean
      );
      const metadataBlock = metaParts.length ? `${metaParts.join(' | ')}` : null;

      return [header, metadataBlock, entry.content].filter(Boolean).join('\n\n');
    });

    return blocks.join('\n\n---\n\n');
  }

  private handlePrismaError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2002'
    ) {
      throw new BadRequestException('Slug em uso por outro registro.');
    }

    throw error;
  }
}
