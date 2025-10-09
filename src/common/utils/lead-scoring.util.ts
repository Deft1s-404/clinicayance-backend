import { ClientStatus, LeadStage } from '@prisma/client';

interface ScoreInput {
  source?: string | null;
  tags?: string[];
  status?: ClientStatus;
  stage?: LeadStage;
}

const SOURCE_SCORES: Record<string, number> = {
  Instagram: 15,
  Facebook: 10,
  Indicacao: 20,
  Google: 12,
  WhatsApp: 18
};

const TAG_SCORES: Record<string, number> = {
  vip: 25,
  botox: 10,
  laser: 8,
  depilacao: 6
};

export const calculateLeadScore = (input: ScoreInput): number => {
  let score = 50;

  if (input.source && SOURCE_SCORES[input.source]) {
    score += SOURCE_SCORES[input.source];
  }

  if (input.tags && input.tags.length > 0) {
    score += input.tags.reduce((acc, tag) => acc + (TAG_SCORES[tag.toLowerCase()] ?? 5), 0);
  }

  if (input.status === ClientStatus.VIP) {
    score += 30;
  }

  if (input.stage === LeadStage.WON) {
    score += 40;
  } else if (input.stage === LeadStage.QUALIFIED) {
    score += 20;
  }

  return Math.min(score, 100);
};
