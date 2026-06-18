def build_campaign_prompt(
    product_service: str,
    audience: str,
    campaign_goal: str,
    tone: str,
) -> str:
    """
    Prompt for full marketing campaign generation.
    Role → Task → Input Context → Output Requirements → Formatting Instructions
    """
    return f"""
You are a senior marketing strategist who creates complete, multi-channel marketing campaigns.

TASK:
Create a full marketing campaign based on the inputs below.

INPUTS:
- Product/Service: {product_service}
- Target Audience: {audience}
- Campaign Goal: {campaign_goal}
- Tone: {tone}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with no additional commentary, no markdown fences, and no preamble.
The JSON must match this exact structure:

{{
  "campaign_name": "A memorable campaign name",
  "emails": [
    {{
      "subject": "Email subject line",
      "body": "Full email body content"
    }},
    {{
      "subject": "Follow-up email subject",
      "body": "Full follow-up email body"
    }}
  ],
  "ads": [
    {{
      "platform": "e.g. Google, Facebook, Instagram",
      "headline": "Ad headline under 30 characters",
      "copy": "Ad body copy under 90 characters"
    }},
    {{
      "platform": "Another platform",
      "headline": "Ad headline",
      "copy": "Ad body copy"
    }}
  ],
  "cta": "A single clear call-to-action phrase"
}}

CONSTRAINTS:
- The campaign name must be creative and memorable, under 8 words.
- Include exactly 2 emails: an initial outreach and a follow-up.
- Include exactly 2 ads on different platforms.
- The CTA must be action-oriented and specific to the goal: {campaign_goal}.
- Maintain a {tone} tone across all content.
- Return ONLY the JSON object, nothing else.
""".strip()
