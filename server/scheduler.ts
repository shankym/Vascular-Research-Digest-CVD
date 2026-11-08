import { db } from './db.ts';
import { discoverNextEligiblePaper } from './discovery.ts';
import { analyzePaperWithGemini, runAuthenticityWordCheckpoint } from './analyzer.ts';
import { extractPaperFigures } from './figureExtractor.ts';
import { verifyJournalQuality } from './journalMetrics.ts';
import { PaperRecord } from './types.ts';

let timerHandle: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function executeRadarCycle(triggerType: 'scheduled' | 'manual' = 'scheduled'): Promise<{
  success: boolean;
  message: string;
  paper?: PaperRecord;
}> {
  if (isProcessing) {
    return {
      success: false,
      message: 'A radar analysis cycle is already actively running. Please wait for it to complete.'
    };
  }

  isProcessing = true;
  const startTime = new Date();

  try {
    console.log(`[Radar Cycle] Starting ${triggerType} vascular research discovery cycle...`);

    // 1. Discover next eligible, previously unreviewed paper
    const discoveryResult = await discoverNextEligiblePaper();

    if (discoveryResult.status === 'none_eligible' || !discoveryResult.paper) {
      const msg = 'Hourly cycle executed: No eligible new paper found meeting strict journal quality thresholds (IF >= 10, Top 10%, or Whitelist). Thresholds maintained.';
      db.addLog({
        execution_time: startTime.toISOString(),
        execution_status: 'warning',
        selected_paper: 'None selected',
        journal: 'N/A',
        category: 'N/A',
        details: msg
      });
      db.updateSettings({
        last_run_time: startTime.toISOString(),
        next_run_time: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      });
      return { success: true, message: msg };
    }

    const paperMeta = discoveryResult.paper;

    // 2. Verify journal quality & publication details
    const quality = verifyJournalQuality(paperMeta.journal);
    if (!quality.isEligible) {
      const reason = `Rejected journal '${paperMeta.journal}' - failed quality verification criteria.`;
      db.addLog({
        execution_time: startTime.toISOString(),
        execution_status: 'warning',
        selected_paper: paperMeta.title,
        journal: paperMeta.journal,
        category: paperMeta.category,
        error_message: reason
      });
      return { success: false, message: reason };
    }

    // 3. Prevent duplicate check (idempotent guard)
    if (db.paperExists(paperMeta.doi, paperMeta.pmid)) {
      const reason = `Paper already processed (DOI: ${paperMeta.doi}). Skipping to avoid duplication.`;
      console.log(`[Radar Cycle] ${reason}`);
      return { success: false, message: reason };
    }

    // 4. Extract figures
    console.log(`[Radar Cycle] Extracting scientific figures for '${paperMeta.title}'...`);
    const figures = await extractPaperFigures(paperMeta);

    // 5. Analyse research using Gemini
    console.log(`[Radar Cycle] Performing in-depth scientific analysis with Gemini...`);
    const analysis = await analyzePaperWithGemini(paperMeta, figures);

    // 6. Pre-publishing Authenticity Checkpoint (verifying every word and claim against source)
    console.log(`[Radar Cycle] Running pre-publishing Authenticity Checkpoint for '${paperMeta.title}'...`);
    const authenticityCheckpoint = runAuthenticityWordCheckpoint(paperMeta, analysis);

    // 7. Construct complete PaperRecord
    const paperId = `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const paperRecord: PaperRecord = {
      paper_id: paperId,
      title: paperMeta.title,
      authors: paperMeta.authors,
      journal: quality.metric?.journalName || paperMeta.journal,
      publication_date: paperMeta.publicationDate,
      DOI: paperMeta.doi,
      PMID: paperMeta.pmid,
      article_type: paperMeta.articleType,
      category: paperMeta.category,
      subCategory: paperMeta.subCategory,
      abstract: paperMeta.abstract,
      full_text_status: paperMeta.fullTextAvailable ? 'available' : 'abstract_only',
      journal_metric: quality.metric?.impactFactor || 0,
      journal_metric_year: quality.metric?.impactFactorYear || 2024,
      journal_category: quality.metric?.category || 'Cardiovascular Medicine',
      verification_source: quality.metric?.verificationSource || 'Verified',
      analysis: analysis,
      figures: figures,
      citation_count: typeof paperMeta.citationCount === 'number' ? paperMeta.citationCount : 0,
      authenticity_checkpoint: authenticityCheckpoint,
      created_at: startTime.toISOString(),
      processed_cycle_id: `cycle-${startTime.getTime()}`
    };

    // 7. Save to persistent database
    db.addPaper(paperRecord);

    // 8. Log success
    const successMsg = `Successfully processed paper: "${paperRecord.title}" from ${paperRecord.journal} (IF: ${paperRecord.journal_metric}).`;
    db.addLog({
      execution_time: startTime.toISOString(),
      execution_status: 'success',
      selected_paper: paperRecord.title,
      journal: paperRecord.journal,
      category: paperRecord.category,
      details: successMsg
    });

    // 9. Update settings next_run_time
    const nextRun = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    db.updateSettings({
      last_run_time: startTime.toISOString(),
      next_run_time: nextRun
    });

    console.log(`[Radar Cycle] ${successMsg}`);
    return {
      success: true,
      message: successMsg,
      paper: paperRecord
    };

  } catch (err: any) {
    const errorMsg = `Radar cycle execution failed: ${err?.message || err}`;
    console.error('[Radar Cycle] Error:', err);
    db.addLog({
      execution_time: startTime.toISOString(),
      execution_status: 'error',
      selected_paper: 'Error during cycle',
      journal: 'N/A',
      category: 'N/A',
      error_message: errorMsg
    });
    return { success: false, message: errorMsg };
  } finally {
    isProcessing = false;
  }
}

export function startScheduler() {
  if (timerHandle) {
    clearInterval(timerHandle);
  }

  const settings = db.getSettings();
  const intervalMs = (settings.hourly_interval_minutes || 60) * 60 * 1000;

  console.log(`[Scheduler] Initializing hourly automated radar (Interval: ${settings.hourly_interval_minutes} minutes)...`);

  timerHandle = setInterval(() => {
    const currentSettings = db.getSettings();
    if (currentSettings.scheduling_enabled) {
      executeRadarCycle('scheduled').catch(err => {
        console.error('[Scheduler] Scheduled execution error:', err);
      });
    }
  }, intervalMs);

  // Unref so process can exit cleanly if needed
  if (timerHandle.unref) {
    timerHandle.unref();
  }
}

export function stopScheduler() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

export function getSchedulerStatus() {
  const settings = db.getSettings();
  return {
    isRunning: Boolean(timerHandle),
    isProcessing,
    intervalMinutes: settings.hourly_interval_minutes,
    schedulingEnabled: settings.scheduling_enabled,
    lastRunTime: settings.last_run_time,
    nextRunTime: settings.next_run_time
  };
}
