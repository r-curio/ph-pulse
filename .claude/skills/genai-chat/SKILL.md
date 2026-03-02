---
name: genai-chat
description: Use when building or modifying the Gemini API integration, writing chat prompts, or working on the natural language querying feature in genai/ or the /chat page.
---

# GenAI Chat Conventions for PH-Pulse

## Architecture
Lightweight RAG pattern without a vector database:
1. Query BigQuery for relevant context (mart_regional_summary, top 100 rows)
2. Format context as a text summary
3. Send context + user question to Gemini with a structured prompt
4. Return the answer alongside the source data rows used

## Prompt Template
```
You are a data analyst for Philippine socioeconomic data.
Answer the user's question using ONLY the data provided below.
Be specific — cite region names and actual numbers.
If the data does not answer the question, say so clearly.

DATA:
{context}

QUESTION: {user_question}
```

## Rules
- Model must answer using ONLY the provided data — no hallucinated statistics
- Always cite specific region names and numbers in responses
- Use gemini-1.5-flash (free tier at aistudio.google.com)
- If data doesn't answer the question, say so — never make up numbers
- Return both the AI answer and the underlying data rows it was based on

## Test Questions (must all work correctly)
1. "Which region has the highest poverty rate?"
2. "How has poverty in NCR changed over the past 5 years?"
3. "What is the relationship between income and poverty across regions?"
4. "Which regions are most at risk based on current trends?"
5. "Compare ARMM and CAR poverty rates"
