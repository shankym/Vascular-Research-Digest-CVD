export interface ResultsTableRow {
  parameter: string;
  finding: string;
  effectSizeOrValue: string;
  confidenceInterval: string;
  pValue: string;
  clinicalSignificance?: string;
}

export interface PaperFigure {
  id: string;
  figureNumber: string;
  caption: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  sourceType: 'pmc_open_access' | 'europe_pmc' | 'publisher_preview';
  fullArticleUrl?: string;
  explanation: {
    demonstrates: string;
    axesAndVariables: string;
    statisticalComparisons: string;
    relevanceToFindings: string;
  };
}

export interface ScientificPaperAnalysis {
  paperInformation: {
    title: string;
    authors: string[];
    journal: string;
    publicationDate: string;
    doi: string;
    pmid?: string;
    articleType: string;
    studyCountry: string;
    fullTextAvailability: 'Full Text (PMC Open Access)' | 'Full Text (Publisher Open)' | 'Abstract Only (Paywall)';
    journalQualityVerification: string;
    doiUrl: string;
    pubMedUrl?: string;
  };
  researchAim: {
    researchQuestion: string;
    studyRationale: string;
    knowledgeGapAddressed: string;
    primaryHypothesis: string;
  };
  methodology: {
    studyDesign: string;
    sampleSize: string;
    populationCharacteristics: string;
    inclusionExclusionCriteria: string;
    variablesStudied: string;
    measurementTechniques: string;
    statisticalAnalysis: string;
    primaryAndSecondaryOutcomes: string;
  };
  results: {
    primaryFindings: string;
    secondaryFindings: string;
    numericalResultsSummary: string;
    structuredResultsTable: ResultsTableRow[];
  };
  discussion: {
    authorsInterpretation: string;
    agreementWithPriorLiterature: string;
    physiologicalMechanisms: string;
    clinicalImplications: string;
    strengthsAndLimitations: string;
    futureResearchDirections: string;
  };
  criticalAppraisal: {
    studyDesignQuality: string;
    riskOfBiasAssessment: string;
    sampleRepresentativeness: string;
    measurementReliability: string;
    statisticalAppropriateness: string;
    confoundingFactors: string;
    generalisability: string;
    clinicalRelevanceScore: string;
  };
  researchersTakeaway: {
    threeKeyLessons: [string, string, string];
    twoUnansweredQuestions: [string, string];
    oneFollowUpStudy: string;
    contributionToVascularKnowledge: string;
  };
}

export interface ReadingHistoryItem {
  paper_id: string;
  processed_at: string;
  read_status: boolean;
  personal_notes: string;
  saved_status: boolean;
}

export interface AuthenticityCheckpoint {
  status: 'passed' | 'flagged';
  verifiedAt: string;
  sourceRepository: string;
  doiVerified: boolean;
  pmidVerified: boolean;
  journalQualityVerified: boolean;
  verbatimConcordanceScore: number;
  claimsCrossReferenced: number;
  numericalIntegrityPassed: boolean;
  hallucinationCheckPassed: boolean;
  verdictSummary: string;
  auditSignature: string;
}

export interface PaperRecord {
  paper_id: string;
  title: string;
  authors: string[];
  journal: string;
  publication_date: string;
  DOI: string;
  PMID?: string;
  article_type: string;
  category: 'Arterial Stiffness' | 'Endothelial Function' | 'Cardiovascular Disease' | 'Related Research';
  subCategory?: string;
  abstract: string;
  full_text_status: 'available' | 'abstract_only' | 'open_access_pmc';
  journal_metric: number;
  journal_metric_year: number;
  journal_category: string;
  verification_source: string;
  analysis: ScientificPaperAnalysis;
  figures: PaperFigure[];
  citation_count?: number;
  authenticity_checkpoint?: AuthenticityCheckpoint;
  created_at: string;
  history?: ReadingHistoryItem;
}

export interface AutomationLog {
  id: string;
  execution_time: string;
  execution_status: 'success' | 'warning' | 'error' | 'skipped';
  selected_paper: string;
  journal: string;
  category: string;
  error_message?: string;
  details?: string;
}

export interface SystemSettings {
  journal_whitelist: string[];
  impact_factor_threshold: number;
  research_categories: string[];
  scheduling_enabled: boolean;
  hourly_interval_minutes: number;
  last_run_time: string;
  next_run_time: string;
  notification_preferences: {
    emailAlerts: boolean;
    highImpactOnly: boolean;
  };
}

export interface SystemStats {
  totalPapers: number;
  totalCitations?: number;
  categoryCounts: Record<string, number>;
  journalCounts: Record<string, number>;
  totalFigures: number;
  readCount: number;
  savedCount: number;
  lastRunTime: string;
  nextRunTime: string;
  schedulingEnabled: boolean;
}

export interface SchedulerStatus {
  isRunning: boolean;
  isProcessing: boolean;
  intervalMinutes: number;
  schedulingEnabled: boolean;
  lastRunTime: string;
  nextRunTime: string;
}

export interface SystemStatusResponse {
  status: string;
  stats: SystemStats;
  scheduler: SchedulerStatus;
  apiKeyConfigured: boolean;
}

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
