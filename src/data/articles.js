export const articlesData = [
  {
    id: '1',
    title: 'What 2023 job-posting data taught me about data hiring',
    date: 'Jul 8, 2026',
    readTime: '5 min read',
    category: 'Analysis & ETL',
    tags: ['Excel', 'Power Query', 'DAX', 'Power Pivot'],
    image: 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/4bzfqm82kmd_1784187994669.png',
    description: 'Answering four salary-and-skills questions with nothing but Excel, Power Query and a Power Pivot model.',
    content: `### The question
Which skills actually move the salary needle for data roles? I took a real 2023 job-posting dataset and let the data answer.

### The build
1. **Power Query ETL** to clean and reshape messy posting data.
2. **Power Pivot model** so relationships and measures live in one place.
3. **Custom DAX** comparing US vs. non-US median salaries and linking skill demand to pay.

### The finding
SQL + Python is the highest-value pairing in the dataset — top of the pile on both demand and median salary.`,
    href: '/#blog',
  },
  {
    id: '2',
    title: 'A salary dashboard with zero macros',
    date: 'Jul 8, 2026',
    readTime: '4 min read',
    category: 'Spreadsheet Modeling',
    tags: ['Excel', 'Dynamic Arrays', 'Dashboards'],
    image: 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/t8bk7q5eg7g_1784188043415.png',
    description: 'How dynamic array formulas (MEDIAN + FILTER) let me build an interactive Excel dashboard anyone can maintain.',
    content: `### Why no macros?
Macros and add-ins break the moment a dashboard leaves your machine. I wanted something a hiring manager could just open.

### The approach
Everything runs on **dynamic array formulas** — MEDIAN + FILTER recompute as you change dropdowns wired with data validation. No Power Query refresh, no VBA.

### The payoff
Benchmark pay by title, country and schedule type instantly — a spreadsheet that behaves like an app.`,
    href: '/#blog',
  },
  {
    id: '3',
    title: 'Summarizing my inbox with a local LLM + n8n',
    date: 'Jul 8, 2026',
    readTime: '4 min read',
    category: 'Automation & Local AI',
    tags: ['n8n', 'Local LLM', 'Ollama', 'Google Sheets'],
    image: 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/bl6o93ym18c_1784188015054.png',
    description: 'A private email-summarization pipeline that never leaves my machine — Gmail, Ollama and Google Sheets.',
    content: `### The itch
I didn't want to hand my email to a cloud API just to get the gist of a thread.

### The workflow
Built end-to-end in **n8n**: Gmail OAuth2 pulls messages, a locally hosted **Ollama** model writes a 2-line summary, and results land in **Google Sheets** via the API.

### The result
Inbox triage on a local model — useful summaries, zero data sent to a third party.`,
    href: '/#blog',
  },
];
