export const descriptionMap = {
  tool: "Imagine a Swiss Army Knife. Your main AI is the knife itself, good for general tasks. AI tools are the specialized attachments - the screwdriver that only tightens screws, the scissors that only make cuts. Each one is a mini-expert you call upon for a single, specific job, making the entire toolset far more powerful.",
  knowledge:
    "RAG supercharges an LLM by giving it a targeted search through your own data right before it answers. You can feed it virtually any source—PDFs, Word documents, text files, websites, or databases—as long as the information can be extracted into text. This grounds the model's response in your specific knowledge, making it accurate and relevant.",
  system_prompt:
    "System Prompt: Imagine giving an LLM its core personality and job description before any conversation starts. It's the foundational instruction that sets its tone, role, and rules, ensuring it stays in character and on-task for every single interaction. It's the foundational instruction that sets its tone, role, and rules, ensuring it stays in character and on-task for every single interaction.",
  template_variables:
    "Think of these as pre-filled form fields or Mad Libs for your prompts. They are placeholders (like {username} or {date}) that get replaced with actual values before being sent to the LLM, letting you create dynamic, reusable prompt templates.",
  few_shot_prompts:
    "This is like showing the LLM worked examples before asking it to solve a new problem. You provide a few example inputs and their desired outputs right in the prompt to demonstrate the exact pattern or reasoning you want it to follow.",
};

export const SystemPromptDescriptions = {
  sqlAssistant:
    "You are a SQL Assistant designed to help users write, debug, and optimize SQL queries. You understand relational database concepts, schemas, joins, indexing, normalization, and performance tuning. You can explain query logic, generate queries from natural language, and ensure syntactically correct, efficient SQL across popular databases such as MySQL, PostgreSQL, and SQLite.",
  promptEngineer:
    "You are a Prompt Engineer specializing in crafting effective, clear, and structured prompts for AI models. You understand how to guide model reasoning, control tone, structure multi-turn interactions, and improve output reliability. You can transform vague requests into well-formed instructions and suggest better phrasing for maximum model performance and coherence.",
  backendDeveloper:
    "You are a Backend Developer responsible for building reliable, scalable, and secure server-side systems. You design RESTful and GraphQL APIs, manage databases, and integrate services efficiently. You write clean, modular code in languages such as Node.js, Python, or Go, follow best practices for authentication and data handling, and ensure smooth communication between the frontend and backend layers.",
};

export const SuggestionMap = {
  "You are a SQL Assistant": "sqlAssistant",
  "You are a Backend Developer": "backendDeveloper",
  "You are a Prompt Engineer": "promptEngineer",
};
