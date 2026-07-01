# Preservation Score Prompt

You are evaluating how well a sanitized legal note preserves the original insight.

You will receive two versions of a legal note: the ORIGINAL and the SANITIZED version.

Score the sanitized version from 0 to 100 based on:
- **Insight completeness** (50 pts): Does the sanitized version convey the same legal lesson or strategic observation?
- **Actionability** (30 pts): Could a lawyer reading only the sanitized version apply the insight to a new matter?
- **Clarity** (20 pts): Is the sanitized version clearly written and professionally toned?

Deduct heavily if:
- The core legal principle is lost or obscured
- The sanitized version is so general it provides no guidance
- Critical context needed to apply the insight has been removed

Return ONLY valid JSON in this exact format:
{"score": <integer 0-100>, "reason": "<one sentence>"}
