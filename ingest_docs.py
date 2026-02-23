import os
import re
import json

doc_dirs = ["/Users/neerajk/CapDoc/docs", "/Users/neerajk/CapDoc/reference"]
output_file_extension = "/Users/neerajk/Desktop/UX-writer/docs_context.js"
output_file_figma = "/Users/neerajk/Desktop/UX-writer-figma/docs_context.js"

entities = set()
features = set()

# Regex to find Capitalized Product Names or Features
feature_pattern = re.compile(r'\*\*([^*]+)\*\*') # Bolded terms are often key features
entity_pattern = re.compile(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b')

# US English Standard from spelling_report.md
us_mapping = {
    "behaviour": "behavior", "analyse": "analyze", "programme": "program", 
    "organisation": "organization", "enrol": "enroll", "enrolment": "enrollment",
    "catalogue": "catalog", "centre": "center", "colour": "color",
    "customisation": "customization", "customise": "customize", "authorised": "authorized",
    "cancelled": "canceled", "standardisation": "standardization"
}

for doc_dir in doc_dirs:
    if not os.path.exists(doc_dir): continue
    for root, dirs, files in os.walk(doc_dir):
        for file in files:
            if file.endswith(".md"):
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Extract bolded features
                    bolded = feature_pattern.findall(content)
                    for b in bolded:
                        if len(b) > 4 and len(b) < 30: features.add(b)
                        
                    # Extract entities
                    found_entities = entity_pattern.findall(content)
                    for e in found_entities:
                        if len(e) > 3 and e not in ["Step", "Accept", "Return", "Create", "Update", "Post"]:
                            entities.add(e)

style_guide = {
    "core_principles": ["Clarity", "Conciseness", "Consistency", "User-Centeredness", "Actionability"],
    "terminology": {
        "plain_language": "Use simple, everyday language.",
        "avoid_jargon": "Minimize technical or industry-specific terms.",
        "positive": "Frame copy helpfully, focusing on solutions."
    },
    "tone": "Professional, respectful, empathetic, conversational but not overly casual.",
    "examples": [
        {"bad": "Reward member on the activities/engagements", "good": "Reward members for completing specific actions, like a purchase or a profile update"},
        {"bad": "Select the program name the promotion is part of", "good": "Select the loyalty program to link to the loyalty promotion"},
        {"bad": "Customers to be enrolled for promotion", "good": "Choose your audience"}
    ]
}

knowledge = {
    "product_entities": sorted(list(entities))[:150],
    "featured_terms": sorted(list(features))[:80],
    "us_standard": us_mapping,
    "style_guide": style_guide,
    "voice": "Professional, respectful, empathetic, conversational within reason, and brand-specific."
}

js_content = f"const DEEP_DOCS_CONTEXT = {json.dumps(knowledge, indent=4)};\nif (typeof module !== 'undefined') module.exports = DEEP_DOCS_CONTEXT;"

for out_path in [output_file_extension, output_file_figma]:
    with open(out_path, 'w') as out:
        out.write(js_content)

print(f"Documentation Knowledge Base generated for both Extension and Figma.")
