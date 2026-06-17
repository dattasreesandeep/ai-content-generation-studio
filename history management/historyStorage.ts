import { HistoryEntry, ContentType, GenerationStatus } from '../types/history';

const STORAGE_KEY = 'ai_studio_history';

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'createdAt' | 'wordCount' | 'charCount'>
): HistoryEntry {
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    wordCount: entry.output.split(/\s+/).filter(Boolean).length,
    charCount: entry.output.length,
    isFavorite: false,
  };

  const existing = loadHistory();
  const updated = [newEntry, ...existing];
  saveHistory(updated);
  return newEntry;
}

export function deleteHistoryEntries(ids: string[]): HistoryEntry[] {
  const idSet = new Set(ids);
  const existing = loadHistory();
  const updated = existing.filter((e) => !idSet.has(e.id));
  saveHistory(updated);
  return updated;
}

export function toggleFavorite(id: string): HistoryEntry[] {
  const existing = loadHistory();
  const updated = existing.map((e) =>
    e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
  );
  saveHistory(updated);
  return updated;
}

export function updateHistoryEntry(
  id: string,
  patch: Partial<HistoryEntry>
): HistoryEntry[] {
  const existing = loadHistory();
  const updated = existing.map((e) =>
    e.id === id ? { ...e, ...patch } : e
  );
  saveHistory(updated);
  return updated;
}

export function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Seed demo data for development ---
const DEMO_ENTRIES: Omit<HistoryEntry, 'id' | 'wordCount' | 'charCount'>[] = [
  {
    title: 'Product Launch Blog Post',
    prompt: 'Write a 500-word blog post announcing our new AI writing tool for small businesses.',
    output:
      "We're thrilled to announce the launch of ContentAI Studio — the AI writing companion built specifically for small businesses who need great content without a full marketing team...",
    contentType: 'blog',
    model: 'claude-sonnet-4-6',
    tokensUsed: 820,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    tags: ['product', 'launch'],
    isFavorite: true,
  },
  {
    title: 'Twitter Campaign – Summer Sale',
    prompt: 'Generate 5 Twitter posts promoting our summer sale with 30% off.',
    output:
      "☀️ Summer is here and so are savings! Get 30% off everything in our store — today only. Use code SUMMER30 at checkout. 🛒 #SummerSale #Deals...",
    contentType: 'social',
    model: 'claude-sonnet-4-6',
    tokensUsed: 310,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    tags: ['social', 'sale'],
    isFavorite: false,
  },
  {
    title: 'Welcome Email Sequence',
    prompt: 'Write a 3-part welcome email sequence for new SaaS subscribers.',
    output:
      'Subject: Welcome aboard — your first step to better content\n\nHi {{first_name}},\n\nThank you for joining ContentAI Studio. Over the next few days, we want to help you get the most out of your new tool...',
    contentType: 'email',
    model: 'claude-sonnet-4-6',
    tokensUsed: 1100,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    tags: ['email', 'onboarding'],
    isFavorite: true,
  },
  {
    title: 'Facebook Ad – Free Trial',
    prompt: 'Write a compelling Facebook ad to drive free trial sign-ups for a SaaS product.',
    output:
      "Tired of staring at a blank page? ContentAI Studio writes your blogs, emails, and social posts in seconds. Try it free — no credit card needed. 👇",
    contentType: 'ad',
    model: 'claude-sonnet-4-6',
    tokensUsed: 210,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    tags: ['ad', 'trial'],
    isFavorite: false,
  },
  {
    title: 'Product Description – Wireless Earbuds',
    prompt: 'Write a compelling product description for premium wireless earbuds targeting gym-goers.',
    output:
      'Block the world out. Power through. Our ProSound X3 earbuds deliver 36-hour battery life, IPX7 sweat resistance, and deep bass tuned for high-intensity workouts...',
    contentType: 'product',
    model: 'claude-sonnet-4-6',
    tokensUsed: 490,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    tags: ['product', 'ecommerce'],
    isFavorite: false,
  },
  {
    title: 'YouTube Script – AI Tools Review',
    prompt: 'Write a 3-minute YouTube video script reviewing the top 5 AI writing tools in 2025.',
    output:
      "[HOOK] What if I told you that 80% of content marketers are using AI tools — but most are using the wrong ones? Today, I'm breaking down the top 5...",
    contentType: 'video-script',
    model: 'claude-sonnet-4-6',
    tokensUsed: 940,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    tags: ['video', 'review'],
    isFavorite: false,
  },
  {
    title: 'LinkedIn Post – Thought Leadership',
    prompt: 'Write a LinkedIn post about the future of AI in content marketing.',
    output: '',
    contentType: 'social',
    model: 'claude-sonnet-4-6',
    tokensUsed: 0,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    tags: ['linkedin'],
    isFavorite: false,
  },
];

export function seedDemoHistory(): void {
  const existing = loadHistory();
  if (existing.length === 0) {
    const seeded: HistoryEntry[] = DEMO_ENTRIES.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      wordCount: e.output.split(/\s+/).filter(Boolean).length,
      charCount: e.output.length,
    }));
    saveHistory(seeded);
  }
}
