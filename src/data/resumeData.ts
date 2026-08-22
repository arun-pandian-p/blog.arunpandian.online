export const resumeData = {
  personalInfo: {
    name: "Arun Pandian P",
    title: "Final-year B.Tech AI & Data Science student",
    summary: "Final-year B.Tech AI & Data Science student who works across the full data lifecycle – wrangling, EDA, dashboarding, and automation. Built end-to-end Excel/Power Query analyses on real-world job market data and an n8n-based AI automation pipeline. Comfortable turning messy structured and unstructured data into decisions.",
    phone: "8248960558",
    email: "arunpandi47777@gmail.com",
    linkedin: "https://linkedin.com/in/arunpandianp-dataanalyst",
    github: "https://github.com/shadow-byte-warrior",
    website: "https://arun-pandian.netlify.app",
    location: "Coimbatore, Tamil Nadu",
  },
  education: [
    {
      institution: "EASA College of Engineering & Technology",
      degree: "B.Tech, Artificial Intelligence & Data Science",
      location: "Coimbatore, Tamil Nadu",
      period: "Sep. 2022 – Mar. 2026"
    }
  ],
  projects: [
    {
      title: "Data Science Job Market Analysis",
      stack: ["Excel", "Power Query", "Power Pivot", "DAX"],
      github: "https://github.com/shadow-byte-warrior",
      bullets: [
        "Built an end-to-end Excel analysis on real 2023 job-posting data answering four salary/skills questions using Power Query ETL and a Power Pivot data model",
        "Wrote custom DAX measures comparing US vs. non-US median salaries and built combo PivotCharts linking skill demand to pay",
        "Found SQL and Python to be the highest-value skill combination by demand and salary across the dataset"
      ]
    },
    {
      title: "Data Jobs Salary Dashboard",
      stack: ["Excel", "Map Charts", "Array Formulas"],
      github: "https://github.com/shadow-byte-warrior",
      bullets: [
        "Built an interactive Excel dashboard to benchmark data-role salaries by title, country, and schedule type using dynamic array formulas (MEDIAN + FILTER)",
        "Designed dropdown-driven filters with data validation so charts update automatically without macros or Power Query"
      ]
    },
    {
      title: "AI Email Summarizer Workflow",
      stack: ["n8n", "Local LLM (Ollama)", "Google Sheets"],
      github: "https://github.com/shadow-byte-warrior",
      bullets: [
        "Automated Gmail extraction and 2-line AI summarization via a locally hosted LLM, logging structured results to Google Sheets",
        "Built the workflow entirely in n8n, connecting Gmail OAuth2, a local inference endpoint, and the Sheets API"
      ]
    }
  ],
  experience: [
    {
      title: "Software Engineer Intern",
      company: "Carpediem Tech Innovations",
      location: "Coimbatore",
      period: "Jan. 2026 – Mar. 2026",
      bullets: [
        "Built AI-powered data processing and automation workflows in Python to support business decision-making",
        "Developed REST APIs and backend services to move structured and unstructured data through analytical pipelines",
        "Collaborated on feature development, testing, and deployment using Git and agile practices"
      ]
    },
    {
      title: "Gen AI Intern",
      company: "Carpediem Tech Innovations",
      location: "Coimbatore",
      period: "Dec. 2025 – Jan. 2026",
      bullets: [
        "Built NLP data pipelines for automated text processing, reducing manual data-handling effort and improving workflow consistency",
        "Built automation scripts using N8N, chaining multi-step data workflows across APIs, databases, and third-party services",
        "Worked across the pipeline – preprocessing, feature engineering, output validation, and post-deployment monitoring"
      ]
    },
    {
      title: "AI Software Engineer",
      company: "AdSavvy",
      location: "Coimbatore",
      period: "Oct. 2025 – Dec. 2025",
      bullets: [
        "Integrated ML models into full-stack applications to improve ad performance, audience targeting, and data-driven decision-making"
      ]
    }
  ],
  skills: {
    "Languages & Querying": ["SQL (PostgreSQL)", "Python", "R"],
    "Data Analysis & Wrangling": ["Pandas", "NumPy", "EDA", "Data Cleaning"],
    "Visualization & BI": ["Power BI", "Power Query", "Power Pivot", "DAX", "Plotly", "Streamlit"],
    "Modelling": ["Scikit-learn", "TensorFlow", "PyTorch"],
    "Databases & Tools": ["PostgreSQL", "Supabase", "Git", "REST APIs", "N8N (automation)"]
  },
  certifications: [
    { title: "Data Analytics Job Simulation", issuer: "Deloitte Australia (Forage)" },
    { title: "GenAI Powered Data Analytics Job Simulation", issuer: "Tata (Forage)" },
    { title: "Data Labeling Job Simulation", issuer: "Forage Academy" },
    { title: "Introduction to AI", issuer: "" },
    { title: "HTML5 – The Language", issuer: "" }
  ]
};
