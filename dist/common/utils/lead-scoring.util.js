"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLeadScore = void 0;
const client_1 = require("@prisma/client");
const SOURCE_SCORES = {
    Instagram: 15,
    Facebook: 10,
    Indicacao: 20,
    Google: 12,
    WhatsApp: 18
};
const TAG_SCORES = {
    vip: 25,
    botox: 10,
    laser: 8,
    depilacao: 6
};
const calculateLeadScore = (input) => {
    let score = 50;
    if (input.source && SOURCE_SCORES[input.source]) {
        score += SOURCE_SCORES[input.source];
    }
    if (input.tags && input.tags.length > 0) {
        score += input.tags.reduce((acc, tag) => { var _a; return acc + ((_a = TAG_SCORES[tag.toLowerCase()]) !== null && _a !== void 0 ? _a : 5); }, 0);
    }
    if (input.status === client_1.ClientStatus.VIP) {
        score += 30;
    }
    if (input.stage === client_1.LeadStage.WON) {
        score += 40;
    }
    else if (input.stage === client_1.LeadStage.QUALIFIED) {
        score += 20;
    }
    return Math.min(score, 100);
};
exports.calculateLeadScore = calculateLeadScore;
//# sourceMappingURL=lead-scoring.util.js.map