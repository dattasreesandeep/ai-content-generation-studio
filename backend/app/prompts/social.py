PLATFORM_GUIDELINES = {
    "linkedin": "professional, insight-driven, 1200–1500 characters, no more than 3 hashtags",
    "instagram": "visual, emotional, engaging, 150–300 characters caption, 10–15 hashtags",
    "x": "punchy, conversational, under 280 characters, 1–3 hashtags",
    "facebook": "friendly, community-oriented, 100–250 characters, 3–5 hashtags",
}


def build_social_prompt(platform: str, topic: str, tone: str) -> str:
    """
    Prompt for social media post generation.
    Role → Task → Input Context → Output Requirements → Formatting Instructions
    """
    guidelines = PLATFORM_GUIDELINES.get(
        platform.lower(),
        "platform-appropriate length and style"
    )

    return f"""
You are an expert social media strategist who creates high-engagement platform-specific content.

TASK:
Write a social media post for {platform.upper()} based on the inputs below.

INPUTS:
- Platform: {platform}
- Topic: {topic}
- Tone: {tone}

PLATFORM GUIDELINES FOR {platform.upper()}:
{guidelines}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with no additional commentary, no markdown fences, and no preamble.
The JSON must match this exact structure:

{{
  "post": "The full post content optimised for {platform}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}}

CONSTRAINTS:
- The post must strictly follow the platform guidelines above.
- Hashtags must NOT include the # symbol — just the word.
- The tone must be {tone} throughout.
- Return ONLY the JSON object, nothing else.
""".strip()
