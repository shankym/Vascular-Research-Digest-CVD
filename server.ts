import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { startScheduler, executeRadarCycle, getSchedulerStatus } from './server/scheduler.ts';
import { VERIFIED_JOURNAL_DATABASE } from './server/journalMetrics.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes

// System and Scheduler Status
app.get('/api/status', (_req: Request, res: Response) => {
  const stats = db.getStats();
  const scheduler = getSchedulerStatus();
  res.json({
    status: 'healthy',
    stats,
    scheduler,
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Papers List with Filtering & Sorting
app.get('/api/papers', (req: Request, res: Response) => {
  const { search, category, journal, articleType, year, savedOnly, readOnly, sort } = req.query;
  const papers = db.getAllPapers({
    search: search as string,
    category: category as string,
    journal: journal as string,
    articleType: articleType as string,
    year: year as string,
    savedOnly: savedOnly === 'true',
    readOnly: readOnly === 'true',
    sort: sort as any
  });
  res.json({ papers, total: papers.length });
});

// Single Paper Details
app.get('/api/papers/:id', (req: Request, res: Response) => {
  const paper = db.getPaperById(req.params.id);
  if (!paper) {
    return res.status(404).json({ error: 'Paper not found in research archive' });
  }
  res.json(paper);
});

// Update Personal Notes
app.post('/api/papers/:id/notes', (req: Request, res: Response) => {
  const { notes } = req.body;
  const updated = db.updateHistory(req.params.id, { personal_notes: notes ?? '' });
  if (!updated) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  res.json(updated);
});

// Toggle Saved Status
app.post('/api/papers/:id/toggle-save', (req: Request, res: Response) => {
  const current = db.getPaperById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  const newSaved = !current.history?.saved_status;
  const updated = db.updateHistory(req.params.id, { saved_status: newSaved });
  res.json({ saved_status: newSaved, history: updated });
});

// Toggle Read Status
app.post('/api/papers/:id/toggle-read', (req: Request, res: Response) => {
  const current = db.getPaperById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  const newRead = !current.history?.read_status;
  const updated = db.updateHistory(req.params.id, { read_status: newRead });
  res.json({ read_status: newRead, history: updated });
});

// All Extracted Figures
app.get('/api/figures', (_req: Request, res: Response) => {
  const figures = db.getAllFigures();
  res.json({ figures, total: figures.length });
});

// Automation Execution Logs
app.get('/api/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string || '50', 10);
  const logs = db.getLogs(limit);
  res.json({ logs });
});

// System Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json(settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Manual Run Now Trigger
app.post('/api/automation/run', async (_req: Request, res: Response) => {
  try {
    const result = await executeRadarCycle('manual');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Cycle failed' });
  }
});

// Verified Journal Metrics
app.get('/api/journal-metrics', (_req: Request, res: Response) => {
  res.json({
    journals: Object.values(VERIFIED_JOURNAL_DATABASE)
  });
});

// Export DB Backup
app.get('/api/export', (_req: Request, res: Response) => {
  const backup = db.exportDatabase();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="vascular_research_radar_backup.json"');
  res.send(JSON.stringify(backup, null, 2));
});

// Start Background Hourly Scheduler
startScheduler();

// Vite Integration (Dev vs Prod)
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Vascular Research Radar] Server operational at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
