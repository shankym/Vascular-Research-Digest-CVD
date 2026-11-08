export interface JournalMetric {
  journalName: string;
  aliases: string[];
  impactFactor: number;
  impactFactorYear: number;
  category: string;
  quartile: string;
  isTop10Percent: boolean;
  isWhitelisted: boolean;
  issn?: string;
  verificationSource: string;
}

export const VERIFIED_JOURNAL_DATABASE: Record<string, JournalMetric> = {
  "circulation": {
    journalName: "Circulation",
    aliases: ["circulation", "circ", "circulation (new york, n.y.)"],
    impactFactor: 37.8,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "0009-7322",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "european heart journal": {
    journalName: "European Heart Journal",
    aliases: ["european heart journal", "eur heart j", "ehj"],
    impactFactor: 37.6,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "0195-668X",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "journal of the american college of cardiology": {
    journalName: "Journal of the American College of Cardiology",
    aliases: ["journal of the american college of cardiology", "j am coll cardiol", "jacc"],
    impactFactor: 24.0,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "0735-1097",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "circulation research": {
    journalName: "Circulation Research",
    aliases: ["circulation research", "circ res"],
    impactFactor: 20.1,
    impactFactorYear: 2024,
    category: "Hematology / Peripheral Vascular Disease",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "0009-7330",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "nature reviews cardiology": {
    journalName: "Nature Reviews Cardiology",
    aliases: ["nature reviews cardiology", "nat rev cardiol"],
    impactFactor: 41.7,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "1759-5002",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "cardiovascular research": {
    journalName: "Cardiovascular Research",
    aliases: ["cardiovascular research", "cardiovasc res"],
    impactFactor: 10.2,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "0008-6363",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "hypertension": {
    journalName: "Hypertension",
    aliases: ["hypertension", "hypertension (dallas, tex. : 1979)"],
    impactFactor: 8.3,
    impactFactorYear: 2024,
    category: "Peripheral Vascular Disease",
    quartile: "Q1",
    isTop10Percent: false,
    isWhitelisted: true,
    issn: "0194-911X",
    verificationSource: "Clarivate JCR (Q1 Specialty Whitelist)"
  },
  "arteriosclerosis, thrombosis, and vascular biology": {
    journalName: "Arteriosclerosis, Thrombosis, and Vascular Biology",
    aliases: ["arteriosclerosis, thrombosis, and vascular biology", "arterioscler thromb vasc biol", "atvb"],
    impactFactor: 7.8,
    impactFactorYear: 2024,
    category: "Hematology / Vascular Biology",
    quartile: "Q1",
    isTop10Percent: false,
    isWhitelisted: true,
    issn: "1079-5642",
    verificationSource: "Clarivate JCR (Q1 Specialty Whitelist)"
  },
  "journal of hypertension": {
    journalName: "Journal of Hypertension",
    aliases: ["journal of hypertension", "j hypertens"],
    impactFactor: 4.5,
    impactFactorYear: 2024,
    category: "Peripheral Vascular Disease",
    quartile: "Q2",
    isTop10Percent: false,
    isWhitelisted: true,
    issn: "0263-6352",
    verificationSource: "Arterial Stiffness Specialty Whitelist"
  },
  "atherosclerosis": {
    journalName: "Atherosclerosis",
    aliases: ["atherosclerosis"],
    impactFactor: 5.3,
    impactFactorYear: 2024,
    category: "Peripheral Vascular Disease",
    quartile: "Q1",
    isTop10Percent: false,
    isWhitelisted: true,
    issn: "0021-9150",
    verificationSource: "Clarivate JCR (Specialty Whitelist)"
  },
  "european journal of preventive cardiology": {
    journalName: "European Journal of Preventive Cardiology",
    aliases: ["european journal of preventive cardiology", "eur j prev cardiol"],
    impactFactor: 8.4,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: false,
    isWhitelisted: true,
    issn: "2047-4873",
    verificationSource: "Clarivate JCR (Specialty Whitelist)"
  },
  "journal of the american heart association": {
    journalName: "Journal of the American Heart Association",
    aliases: ["journal of the american heart association", "j am heart assoc", "jaha"],
    impactFactor: 5.4,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: false,
    isWhitelisted: true,
    issn: "2047-9980",
    verificationSource: "Clarivate JCR (Specialty Whitelist)"
  },
  "the lancet": {
    journalName: "The Lancet",
    aliases: ["the lancet", "lancet"],
    impactFactor: 98.4,
    impactFactorYear: 2024,
    category: "Medicine, General & Internal",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "0140-6736",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "jacc: cardiovascular imaging": {
    journalName: "JACC: Cardiovascular Imaging",
    aliases: ["jacc: cardiovascular imaging", "jacc cardiovasc imaging"],
    impactFactor: 14.0,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "1936-878X",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  },
  "jacc: heart failure": {
    journalName: "JACC: Heart Failure",
    aliases: ["jacc: heart failure", "jacc heart fail"],
    impactFactor: 11.5,
    impactFactorYear: 2024,
    category: "Cardiac & Cardiovascular Systems",
    quartile: "Q1",
    isTop10Percent: true,
    isWhitelisted: true,
    issn: "2213-1779",
    verificationSource: "Clarivate Journal Citation Reports (JCR 2024)"
  }
};

export function verifyJournalQuality(journalTitle: string, userWhitelist?: string[]): {
  isEligible: boolean;
  metric?: JournalMetric;
  reason: string;
} {
  const normalized = (journalTitle || "").trim().toLowerCase();
  
  // Direct match or alias match
  for (const key of Object.keys(VERIFIED_JOURNAL_DATABASE)) {
    const entry = VERIFIED_JOURNAL_DATABASE[key];
    if (entry.aliases.some(alias => normalized === alias || normalized.includes(alias) || alias.includes(normalized))) {
      const meetsIF = entry.impactFactor >= 10.0;
      const meetsTop10 = entry.isTop10Percent;
      const meetsWhitelist = entry.isWhitelisted || (userWhitelist && userWhitelist.some(w => normalized.includes(w.toLowerCase())));

      if (meetsIF || meetsTop10 || meetsWhitelist) {
        return {
          isEligible: true,
          metric: entry,
          reason: meetsIF 
            ? `Verified JCR Impact Factor ${entry.impactFactor} (Threshold >= 10.0)`
            : meetsTop10 
              ? `Ranked in Top 10% of subject category (${entry.category})`
              : `Approved in specialty journal whitelist (${entry.verificationSource})`
        };
      }
    }
  }

  // Check custom user whitelist
  if (userWhitelist && userWhitelist.some(w => normalized.includes(w.toLowerCase()))) {
    return {
      isEligible: true,
      metric: {
        journalName: journalTitle,
        aliases: [normalized],
        impactFactor: 0,
        impactFactorYear: 2024,
        category: "Cardiovascular Medicine (Custom Whitelist)",
        quartile: "Unverified",
        isTop10Percent: false,
        isWhitelisted: true,
        verificationSource: "Administrator Whitelist"
      },
      reason: "Approved via Administrator Whitelist"
    };
  }

  return {
    isEligible: false,
    reason: `Journal '${journalTitle}' does not meet verified Impact Factor >= 10, Top 10% ranking, or approved whitelist criteria.`
  };
}
