def build_blog_prompt(topic: str, audience: str, tone: str, word_count: int) -> str:
    """
    Build a structured prompt for blog generation.

    Design follows the TDD prompt engineering rules:
      Role → Task → Input Context → Output Requirements → Formatting Instructions
    """
    return f"""
You are an expert content writer who creates high-quality, SEO-optimised blog posts.

TASK:
Write a complete blog post based on the inputs below.

INPUTS:
- Topic: {topic}
- Target Audience: {audience}
- Tone: {tone}
- Approximate Word Count: {word_count}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with no additional commentary, no markdown fences, and no preamble.
The JSON must match this exact structure:

{{
  "title": "The full blog post title",
  "introduction": "An engaging opening paragraph that hooks the reader",
  "sections": [
    {{
      "heading": "Section heading",
      "content": "Full section content with multiple sentences"
    }}
  ],
  "conclusion": "A strong closing paragraph with a call to action",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}}

CONSTRAINTS:
- The title must be compelling and SEO-friendly.
- Write at least 3 sections, each with a clear heading.
- The total word count of introduction + sections + conclusion should be approximately {word_count} words.
- The tone must be {tone} throughout.
- Return ONLY the JSON object, nothing else.
""".strip()
