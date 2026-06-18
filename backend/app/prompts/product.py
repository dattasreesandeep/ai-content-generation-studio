def build_product_prompt(product_name: str, features: str, target_audience: str, tone: str) -> str:
    """
    Prompt for product description generation.
    Role → Task → Input Context → Output Requirements → Formatting Instructions
    """
    return f"""
You are an expert e-commerce copywriter who creates compelling, conversion-focused product descriptions.

TASK:
Write a complete product description based on the inputs below.

INPUTS:
- Product Name: {product_name}
- Features: {features}
- Target Audience: {target_audience}
- Tone: {tone}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with no additional commentary, no markdown fences, and no preamble.
The JSON must match this exact structure:

{{
  "headline": "A short, punchy headline that grabs attention",
  "description": "A compelling 2-3 paragraph product description that speaks to the target audience",
  "bullet_points": [
    "Key benefit or feature 1",
    "Key benefit or feature 2",
    "Key benefit or feature 3",
    "Key benefit or feature 4",
    "Key benefit or feature 5"
  ]
}}

CONSTRAINTS:
- The headline must be under 15 words and immediately convey the product's value.
- The description must be written in a {tone} tone and speak directly to {target_audience}.
- Include at least 4 bullet points highlighting distinct benefits, not just features.
- Return ONLY the JSON object, nothing else.
""".strip()
