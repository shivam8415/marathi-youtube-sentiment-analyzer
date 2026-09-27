import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Languages,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Youtube,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalysisResult = NonNullable<ReturnType<typeof trpc.analyzer.analyze.useMutation>["data"]>;

type NavItem = { label: string; icon: typeof BarChart3; active?: boolean };

const navItems: NavItem[] = [
  { label: "Overview", icon: BarChart3, active: true },
  { label: "Comments", icon: MessageCircle },
  { label: "Language signals", icon: Languages },
];

const sentimentCopy: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: "Positive", color: "#2ab673", bg: "#e9f8ef" },
  negative: { label: "Negative", color: "#ee6c4d", bg: "#fff0eb" },
  neutral: { label: "Neutral", color: "#9aa7b7", bg: "#f0f3f6" },
};

const emotionCopy: Record<string, { label: string; color: string }> = {
  happy: { label: "Happy", color: "#f2b84b" },
  sad: { label: "Sad", color: "#5e8ee4" },
  angry: { label: "Angry", color: "#ee6c4d" },
  fear: { label: "Fear", color: "#9b7ede" },
  surprise: { label: "Surprise", color: "#ef8ac5" },
  neutral: { label: "Neutral", color: "#9aa7b7" },
};

function formatNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function initials(name?: string) {
  if (!name) return "प्र";
  return name.trim().slice(0, 2);
}

function StatCard({ label, value, detail, icon: Icon, accent }: { label: string; value: string; detail: string; icon: typeof Eye; accent: string }) {
  return (
    <Card className="stat-card overflow-hidden border-0 bg-white/80 shadow-[0_10px_30px_rgba(44,73,58,0.05)]">
      <CardContent className="relative p-5">
        <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-[2.5rem] opacity-10" style={{ backgroundColor: accent }} />
        <div className="mb-4 flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#829187]">{label}</span>
          <span className="rounded-xl p-2" style={{ backgroundColor: `${accent}15`, color: accent }}><Icon size={17} /></span>
        </div>
        <div className="font-mono text-3xl font-medium tracking-[-0.05em] text-[#19342a]">{value}</div>
        <div className="mt-1 text-xs text-[#829187]">{detail}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onDemo, onFocus }: { onDemo: () => void; onFocus: () => void }) {
  return (
    <Card className="border-0 bg-white/80 shadow-[0_14px_40px_rgba(44,73,58,0.06)]">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center">
        <div className="relative mb-7">
          <div className="absolute inset-0 scale-150 rounded-full bg-[#d8f2e2] blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#e3f6ea] text-[#278351] shadow-inner">
            <Search size={31} strokeWidth={1.7} />
          </div>
        </div>
        <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[#5d9a73]">Ready when you are</p>
        <h2 className="max-w-md text-2xl font-semibold tracking-[-0.03em] text-[#19342a]">Paste a Marathi YouTube link to hear the audience signal.</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#718078]">We’ll fetch the public comments, identify Marathi language signals, and turn the conversation into a clear sentiment and emotion snapshot.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={onFocus} className="h-11 rounded-xl bg-[#246b45] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(36,107,69,0.2)] hover:bg-[#1d5939]">
            <Youtube size={16} className="mr-2" /> Analyze a video
          </Button>
          <Button onClick={onDemo} variant="outline" className="h-11 rounded-xl border-[#d9e7dc] bg-white px-5 text-sm font-semibold text-[#246b45] hover:bg-[#f5fbf6]">
            <Play size={16} className="mr-2" /> Try sample analysis
          </Button>
        </div>
        <div className="mt-7 flex items-center gap-2 text-[11px] text-[#91a098]"><ShieldCheck size={14} className="text-[#62a879]" /> No CSV upload required</div>
      </CardContent>
    </Card>
  );
}

function DistributionCard({ result }: { result: AnalysisResult }) {
  const sentimentTotal = Math.max(1, result.sentimentDistribution.reduce((sum, item) => sum + item.value, 0));
  return (
    <Card className="border-0 bg-white/80 shadow-[0_10px_30px_rgba(44,73,58,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <p className="section-kicker">Signal split</p>
          <CardTitle className="mt-2 text-lg text-[#19342a]">Sentiment balance</CardTitle>
        </div>
        <div className="rounded-xl bg-[#f0f8f2] p-2 text-[#2ab673]"><Activity size={18} /></div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          <div className="relative h-[158px] w-[158px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={result.sentimentDistribution} dataKey="value" nameKey="label" innerRadius={53} outerRadius={72} paddingAngle={3} stroke="none">
                  {result.sentimentDistribution.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value} comments`, "Volume"]} contentStyle={{ borderRadius: 12, border: "1px solid #e4ece6", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-medium text-[#19342a]">{result.analyzedCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#8a9a90]">comments</span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            {result.sentimentDistribution.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#53655b]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
                  <span className="font-mono text-[#19342a]">{Math.round((item.value / sentimentTotal) * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#edf2ee]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.value / sentimentTotal) * 100}%`, backgroundColor: item.color }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#f6faf7] px-3 py-2.5 text-xs text-[#607369]"><Sparkles size={14} className="text-[#f2b84b]" /> Dominant tone: <strong className="text-[#246b45]">{sentimentCopy[result.dominantSentiment]?.label ?? result.dominantSentiment}</strong></div>
      </CardContent>
    </Card>
  );
}

function EmotionCard({ result }: { result: AnalysisResult }) {
  return (
    <Card className="border-0 bg-white/80 shadow-[0_10px_30px_rgba(44,73,58,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div><p className="section-kicker">Human response</p><CardTitle className="mt-2 text-lg text-[#19342a]">Emotion fingerprint</CardTitle></div>
        <div className="rounded-xl bg-[#fff7e8] p-2 text-[#f2b84b]"><Flame size={18} /></div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-baseline gap-2"><span className="text-2xl font-semibold capitalize tracking-[-0.03em] text-[#19342a]">{emotionCopy[result.dominantEmotion]?.label ?? result.dominantEmotion}</span><span className="text-xs text-[#839188]">is the leading emotion</span></div>
        <div className="h-[165px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.emotionDistribution} layout="vertical" margin={{ left: -12, right: 4, top: 4, bottom: 4 }} barCategoryGap={9}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={58} tick={{ fontSize: 10, fill: "#829187" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f6faf7" }} formatter={(value) => [`${value}`, "Comments"]} contentStyle={{ borderRadius: 12, border: "1px solid #e4ece6", fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {result.emotionDistribution.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentRow({ comment }: { comment: AnalysisResult["comments"][number] }) {
  const tone = sentimentCopy[comment.sentiment];
  return (
    <div className="group flex gap-3 border-b border-[#eef2ef] py-4 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f3eb] font-mono text-[10px] font-medium text-[#4e8c63]">{initials(comment.authorDisplayName)}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-[#385146]">{comment.authorDisplayName ?? "YouTube viewer"}</span><span className="text-[10px] text-[#a0aca4]">{comment.publishedAt ? formatDate(comment.publishedAt) : "recent comment"}</span></div>
        <p className="text-sm leading-6 text-[#53655b]">{comment.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: tone.bg, color: tone.color }}>{tone.label}</span><span className="rounded-full bg-[#f5f7f5] px-2 py-1 text-[10px] font-semibold text-[#89978f]">{emotionCopy[comment.emotion]?.label ?? comment.emotion}</span><span className="ml-auto flex items-center gap-1 text-[10px] text-[#9aa59e]"><ThumbsUp size={11} /> {comment.likeCount}</span></div>
      </div>
    </div>
  );
}

function ResultsView({ result }: { result: AnalysisResult }) {
  const positiveShare = Math.round(((result.sentimentDistribution.find((item) => item.label === "Positive")?.value ?? 0) / Math.max(1, result.analyzedCount)) * 100);
  const avgLabel = result.averageSentimentScore > 0 ? "leans positive" : result.averageSentimentScore < 0 ? "leans negative" : "balanced tone";
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-0 bg-[#1d4d35] text-white shadow-[0_15px_40px_rgba(27,75,48,0.18)]">
        <CardContent className="relative p-6 sm:p-7">
          <div className="absolute -right-12 -top-20 h-60 w-60 rounded-full border-[24px] border-white/5" /><div className="absolute right-20 top-10 h-24 w-24 rounded-full border border-[#a8dfb9]/20" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4"><div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-[#2e6948] sm:block">{result.video.thumbnail ? <img src={result.video.thumbnail} alt="Video thumbnail" className="h-full w-full object-cover opacity-90" /> : <div className="flex h-full items-center justify-center"><Youtube size={25} /></div>}</div><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a8dfb9]"><span className="rounded-full bg-white/10 px-2 py-1">{result.source === "demo" ? "Demo analysis" : "Live YouTube"}</span><span className="text-white/45">•</span><span>{result.languageMode === "marathi" ? "Marathi signal" : "All comments"}</span></div><h2 className="line-clamp-2 max-w-2xl text-xl font-semibold leading-snug tracking-[-0.03em] text-white">{result.video.title}</h2><p className="mt-2 flex items-center gap-2 text-xs text-[#c6e5cf]"><span>{result.video.channelTitle}</span><span className="text-white/35">•</span><span>{formatDate(result.video.publishedAt)}</span></p></div></div>
            <div className="flex shrink-0 items-center gap-3"><div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur"><div className="font-mono text-2xl font-medium">{positiveShare}%</div><div className="text-[10px] uppercase tracking-wider text-[#b9dfc3]">positive share</div></div><a href={result.video.url} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3c567] text-[#4d3b19] transition hover:bg-[#ffd982]" aria-label="Open video"><ExternalLink size={17} /></a></div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Comments analyzed" value={formatNumber(result.analyzedCount)} detail={`${formatNumber(result.totalFetched)} fetched from video`} icon={MessageCircle} accent="#2ab673" />
        <StatCard label="Video views" value={formatNumber(result.video.viewCount)} detail="public YouTube count" icon={Eye} accent="#5e8ee4" />
        <StatCard label="Average signal" value={`${result.averageSentimentScore > 0 ? "+" : ""}${result.averageSentimentScore}`} detail={avgLabel} icon={Activity} accent="#f2b84b" />
        <StatCard label="Language filter" value={result.languageMode === "marathi" ? "Marathi" : "All"} detail={`${result.skippedCount} comments outside signal`} icon={Languages} accent="#9b7ede" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2"><DistributionCard result={result} /><EmotionCard result={result} /></div>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-0 bg-white/80 shadow-[0_10px_30px_rgba(44,73,58,0.05)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1"><div><p className="section-kicker">Conversation sample</p><CardTitle className="mt-2 text-lg text-[#19342a]">What viewers are saying</CardTitle></div><span className="rounded-full bg-[#f0f8f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5d9a73]">{result.comments.length} shown</span></CardHeader><CardContent className="pt-1">{result.comments.slice(0, 5).map((comment) => <CommentRow key={comment.id} comment={comment} />)}</CardContent></Card>
        <Card className="border-0 bg-white/80 shadow-[0_10px_30px_rgba(44,73,58,0.05)]"><CardHeader className="pb-1"><p className="section-kicker">Lexical pulse</p><CardTitle className="mt-2 text-lg text-[#19342a]">Most repeated words</CardTitle></CardHeader><CardContent><div className="space-y-4 pt-3">{result.topWords.length ? result.topWords.map((item, index) => <div key={item.word}><div className="mb-1.5 flex items-center justify-between"><span className="font-mono text-xs text-[#4c6155]">{String(index + 1).padStart(2, "0")} <span className="ml-2 font-sans font-semibold text-[#29483a]">{item.word}</span></span><span className="font-mono text-[11px] text-[#91a098]">{item.count}×</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf2ee]"><div className="h-full rounded-full bg-[#66b77d]" style={{ width: `${Math.max(12, (item.count / result.topWords[0].count) * 100)}%` }} /></div></div>) : <p className="py-10 text-center text-sm text-[#829187]">No repeated words yet.</p>}</div><div className="mt-7 rounded-xl bg-[#f7faf7] p-3 text-xs leading-5 text-[#718078]"><FileText size={14} className="mb-1 text-[#5d9a73]" />Lexicon-based signals are designed to be transparent and easy to explain in your academic project.</div></CardContent></Card>
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=marathi-demo");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeNav, setActiveNav] = useState("Overview");
  const analyze = trpc.analyzer.analyze.useMutation({ onSuccess: (data) => setResult(data) });
  const isWorking = analyze.isPending;
  const hasValidInput = useMemo(() => url.trim().length > 8, [url]);

  const submit = (demo = false) => {
    if (!hasValidInput && !demo) return;
    analyze.mutate({ url: url.trim(), demo, maxComments: 200 });
  };

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-[#19342a]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[238px] border-r border-[#e5eee7] bg-[#f8fbf8] lg:flex lg:flex-col">
        <div className="flex h-[88px] items-center gap-3 px-7"><div className="brand-mark">व</div><div><div className="text-[13px] font-extrabold tracking-[-0.02em] text-[#1d4731]">Marathi Lens</div><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#86a190]">NLP studio</div></div></div>
        <div className="px-4"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aaa9f]">Workspace</div><nav className="space-y-1">{navItems.map((item) => { const Icon = item.icon; const isActive = activeNav === item.label; return <button key={item.label} onClick={() => setActiveNav(item.label)} className={`nav-item ${isActive ? "nav-item-active" : ""}`}><Icon size={16} />{item.label}{isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}</button>; })}</nav></div>
        <div className="mt-auto p-4"><div className="rounded-2xl bg-[#eaf6ed] p-4"><div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#ccebd5] text-[#28794a]"><ShieldCheck size={16} /></div><div className="text-xs font-semibold text-[#2e6744]">Built for your NLP minor project</div><p className="mt-1 text-[11px] leading-5 text-[#70917c]">URL in. Marathi signals out. No spreadsheet step.</p></div><div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-[#9aaa9f]"><Settings2 size={13} /> Rule-based baseline • v1.0</div></div>
      </aside>
      <main className="lg:pl-[238px]">
        <header className="sticky top-0 z-10 border-b border-[#e8efe9]/80 bg-[#f5f8f5]/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1420px] items-center justify-between px-5 sm:px-8"><div className="flex items-center gap-3 lg:hidden"><div className="brand-mark h-8 w-8 rounded-xl text-sm">व</div><span className="text-sm font-extrabold text-[#1d4731]">Marathi Lens</span></div><div className="hidden items-center gap-2 text-xs text-[#789082] lg:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-[#2ab673]" /> Analysis workspace <ChevronRight size={13} className="text-[#b1bdb5]" /> <span className="font-medium text-[#426652]">Overview</span></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#e0eae2] bg-white/60 px-3 py-1.5 text-[10px] text-[#829187] sm:flex"><Clock3 size={12} /> {result ? `Updated ${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(result.generatedAt))}` : "No analysis yet"}</div><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9efdf] font-mono text-[11px] font-medium text-[#34714b]">SY</div></div></div></header>
        <div className="mx-auto max-w-[1420px] px-5 pb-16 pt-8 sm:px-8">
          <section className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end"><div><p className="section-kicker mb-3">Marathi sentiment & emotion detection</p><h1 className="max-w-3xl text-[clamp(2rem,4vw,3.45rem)] font-semibold leading-[1.06] tracking-[-0.065em] text-[#17382a]">Hear what Marathi viewers are <span className="text-[#2ab673]">really saying.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#718078]">Analyze the public comment signal from any YouTube video. Designed to make your NLP project feel like a real product—not another CSV upload.</p></div><div className="hidden rounded-2xl border border-[#e1ece3] bg-white/60 p-3 text-right sm:block"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#93a39a]">Signal engine</div><div className="mt-1 flex items-center justify-end gap-1.5 text-xs font-semibold text-[#3e7552]"><span className="h-1.5 w-1.5 rounded-full bg-[#2ab673]" /> Online & explainable</div></div></section>
          <Card className="mb-7 overflow-hidden border-0 bg-white shadow-[0_14px_40px_rgba(44,73,58,0.08)]"><CardContent className="p-2 sm:p-3"><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c24b3e]" size={18} /><input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(false); }} placeholder="Paste a YouTube video URL…" className="h-14 w-full rounded-xl border border-transparent bg-[#f7faf7] pl-11 pr-4 text-sm text-[#29483a] outline-none transition placeholder:text-[#a6b2aa] focus:border-[#9fd2ae] focus:bg-white focus:ring-4 focus:ring-[#e2f4e7]" aria-label="YouTube video URL" /></div><Button onClick={() => submit(false)} disabled={isWorking || !hasValidInput} className="h-14 rounded-xl bg-[#246b45] px-6 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(36,107,69,0.16)] hover:bg-[#1d5939] disabled:opacity-60">{isWorking ? <><Loader2 size={17} className="mr-2 animate-spin" />Analyzing…</> : <><Search size={17} className="mr-2" />Analyze comments</>}</Button><Button onClick={() => submit(true)} disabled={isWorking} variant="outline" className="h-14 rounded-xl border-[#dce9df] bg-white px-5 text-sm font-semibold text-[#3e7552] hover:bg-[#f3faf5]"><Play size={16} className="mr-2" />Demo</Button></div><div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-1 pt-3 text-[11px] text-[#91a098]"><span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#62a879]" /> Public comments only</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#62a879]" /> Key stays server-side</span><span className="flex items-center gap-1.5"><RefreshCw size={13} className="text-[#62a879]" /> Up to 200 comments per scan</span></div></CardContent></Card>
          {analyze.isError && <Alert variant="destructive" className="mb-6 border-[#f3c9bd] bg-[#fff7f4] text-[#873a2c]"><AlertCircle className="h-4 w-4" /><AlertTitle>Couldn’t complete the analysis</AlertTitle><AlertDescription className="text-[#995244]">{analyze.error.message}<button onClick={() => analyze.reset()} className="ml-2 font-semibold underline underline-offset-2">Dismiss</button></AlertDescription></Alert>}
          {!result && !isWorking && <EmptyState onDemo={() => submit(true)} onFocus={() => document.querySelector<HTMLInputElement>("input[aria-label='YouTube video URL']")?.focus()} />}
          {isWorking && <Card className="border-0 bg-white/80 shadow-[0_14px_40px_rgba(44,73,58,0.06)]"><CardContent className="flex min-h-[420px] flex-col items-center justify-center text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e5f5e9] text-[#2ab673]"><Loader2 size={28} className="animate-spin" /></div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5d9a73]">Reading the room</p><h2 className="mt-2 text-xl font-semibold text-[#19342a]">Fetching comments and finding the signal…</h2><p className="mt-2 text-sm text-[#829187]">This usually takes a few seconds.</p></CardContent></Card>}
          {result && !isWorking && <ResultsView result={result} />}
          <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-[#e3ebe5] pt-5 text-[11px] text-[#96a39a] sm:flex-row"><span>Marathi Lens · academic NLP project workspace</span><span className="flex items-center gap-2"><FileText size={13} /> Transparent rule-based classification · For educational use</span></footer>
        </div>
      </main>
    </div>
  );
}
