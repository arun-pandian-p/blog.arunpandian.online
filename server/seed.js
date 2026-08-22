require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Blog = require('./models/Blog');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arun_portfolio';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await Project.deleteMany({});
    await Blog.deleteMany({});

    // Seed Projects
    const GH = "https://github.com/shadow-byte-warrior";
    const projects = [
      {
        title: "Data Science Job Market Analysis",
        problem: "Job seekers struggle to know which skills actually pay. Postings are broad and generic, so it's hard to tell which tech stacks drive salary for data roles.",
        data: "Real 2023 data-science job-posting dataset — titles, skill requirements, salary ranges, countries and schedule types.",
        process: "Built an end-to-end Excel analysis: Power Query ETL to clean and shape the data, a Power Pivot data model, and custom DAX measures comparing US vs. non-US median salaries. Linked skill demand to pay with combo PivotCharts.",
        insight: "SQL and Python are the highest-value skill combination — the pairing tops the dataset on both demand and median salary.",
        tags: ["Excel", "Power Query", "Power Pivot", "DAX"],
        githubLink: GH,
        order: 1
      },
      {
        title: "Data Jobs Salary Dashboard",
        problem: "Comparing data-role pay across titles, countries and schedule types usually means fragile macros or heavy tooling that non-analysts can't maintain.",
        data: "The same 2023 data-jobs dataset, benchmarked by job title, country and schedule type.",
        process: "Built an interactive Excel dashboard driven entirely by dynamic array formulas (MEDIAN + FILTER) and dropdown filters with data validation — charts update automatically with no macros or Power Query.",
        insight: "A fully formula-driven dashboard anyone can open, filter and trust — no add-ins, no refresh steps, no black boxes.",
        tags: ["Excel", "Dynamic Arrays", "Map Charts", "Data Validation"],
        githubLink: GH,
        order: 2
      },
      {
        title: "AI Email Summarizer Workflow",
        problem: "Long email threads eat time. Reading every message to extract the point is repetitive, manual work.",
        data: "Gmail messages pulled via OAuth2, summarized text, and structured rows written to Google Sheets.",
        process: "Built the workflow entirely in n8n — Gmail extraction, 2-line AI summarization through a locally hosted LLM (Ollama), and structured logging to the Sheets API via a local inference endpoint.",
        insight: "A private, no-cost summarization pipeline that runs on a local model — inbox triage without sending data to a third-party API.",
        tags: ["n8n", "Ollama (Local LLM)", "Google Sheets", "Automation"],
        githubLink: GH,
        order: 3
      }
    ];

    // Seed Blogs
    const blogs = [
      {
        title: "What 2023 job-posting data taught me about data hiring",
        slug: "2023-job-posting-analysis",
        excerpt: "Answering four salary-and-skills questions with nothing but Excel, Power Query and a Power Pivot model.",
        content: `### The question
Which skills actually move the salary needle for data roles? I took a real 2023 job-posting dataset and let the data answer.

### The build
1. **Power Query ETL** to clean and reshape messy posting data.
2. **Power Pivot model** so relationships and measures live in one place.
3. **Custom DAX** comparing US vs. non-US median salaries and linking skill demand to pay.

### The finding
SQL + Python is the highest-value pairing in the dataset — top of the pile on both demand and median salary.`,
        tags: ["Excel", "Power Query", "DAX"],
        readTime: "5 min read"
      },
      {
        title: "A salary dashboard with zero macros",
        slug: "excel-dynamic-array-dashboard",
        excerpt: "How dynamic array formulas (MEDIAN + FILTER) let me build an interactive Excel dashboard anyone can maintain.",
        content: `### Why no macros?
Macros and add-ins break the moment a dashboard leaves your machine. I wanted something a hiring manager could just open.

### The approach
Everything runs on **dynamic array formulas** — MEDIAN + FILTER recompute as you change dropdowns wired with data validation. No Power Query refresh, no VBA.

### The payoff
Benchmark pay by title, country and schedule type instantly — a spreadsheet that behaves like an app.`,
        tags: ["Excel", "Dynamic Arrays", "Dashboards"],
        readTime: "4 min read"
      },
      {
        title: "Summarizing my inbox with a local LLM + n8n",
        slug: "n8n-ollama-email-summarizer",
        excerpt: "A private email-summarization pipeline that never leaves my machine — Gmail, Ollama and Google Sheets.",
        content: `### The itch
I didn't want to hand my email to a cloud API just to get the gist of a thread.

### The workflow
Built end-to-end in **n8n**: Gmail OAuth2 pulls messages, a locally hosted **Ollama** model writes a 2-line summary, and results land in **Google Sheets** via the API.

### The result
Inbox triage on a local model — useful summaries, zero data sent to a third party.`,
        tags: ["n8n", "Local LLM", "Automation"],
        readTime: "4 min read"
      }
    ];

    await Project.insertMany(projects);
    await Blog.insertMany(blogs);

    console.log('Database successfully seeded!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
