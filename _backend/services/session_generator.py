from __future__ import annotations

"""Session generator orchestrator."""

import json
import re
from pathlib import Path
from typing import Any

from config import config
from services.pdf_service import (
    extract_text_from_pdfs_in_directory,
    get_pdf_content,
    TEXT_EXTRACTION_MIN_LENGTH,
)
from services.ai_service import AIService
from services.mock_generator import generate_mock_questions


def load_curriculum() -> str:
    """Load the curriculum markdown file."""
    possible_paths = [
        Path(config.CONTEXT_PATH).parent / "_instructions" / "mandarin-teacher-curriculum.md",
        Path("../_instructions/mandarin-teacher-curriculum.md"),
        Path("../../_instructions/mandarin-teacher-curriculum.md"),
        Path("/Users/thagstn/Documents/vc-mandarin-course/_instructions/mandarin-teacher-curriculum.md"),
    ]
    for path in possible_paths:
        if path.exists():
            return path.read_text(encoding="utf-8")
    return ""


def get_curriculum_for_days(curriculum_text: str, selected_days: list[int]) -> str:
    """Extract curriculum sections relevant to the selected days."""
    if not curriculum_text:
        return ""

    modules = []
    module_pattern = r"(### Module \d+:.*?)(?=### Module \d+:|## |$)"
    for match in re.finditer(module_pattern, curriculum_text, re.DOTALL):
        modules.append(match.group(1))

    day_module_map = {}
    day_cursor = 1
    for i, module_text in enumerate(modules):
        module_num = i + 1
        duration_match = re.search(r"\*\*Estimated Duration:\*\*\s*(\d+)[–-]?(\d+)?\s*days", module_text)
        if duration_match:
            min_days = int(duration_match.group(1))
            max_days = int(duration_match.group(2)) if duration_match.group(2) else min_days
            avg_days = (min_days + max_days) // 2
        else:
            avg_days = 10

        for _ in range(avg_days):
            day_module_map[day_cursor] = (module_num, module_text)
            day_cursor += 1

    relevant_modules = set()
    relevant_texts = []
    for day in selected_days:
        if day in day_module_map:
            module_num, module_text = day_module_map[day]
            if module_num not in relevant_modules:
                relevant_modules.add(module_num)
                truncated = module_text[:4000]
                relevant_texts.append(truncated)

    return "\n\n---\n\n".join(relevant_texts)


def get_context_path() -> Path | None:
    """Find the _context directory."""
    if config.CONTEXT_PATH:
        p = Path(config.CONTEXT_PATH)
        if p.exists():
            return p

    possible_paths = [
        Path("../_context"),
        Path("../../_context"),
        Path("/Users/thagstn/Documents/vc-mandarin-course/_context"),
    ]
    for p in possible_paths:
        if p.exists():
            return p
    return None


def extract_images_from_day_folder(day_folder: Path) -> list[str]:
    """Extract base64-encoded images from a day folder.

    Returns list of base64 data URIs for JPEG/PNG files.
    """
    import base64

    images = []
    for ext in ("*.jpg", "*.jpeg", "*.png"):
        for img_file in day_folder.glob(ext):
            try:
                with open(img_file, "rb") as f:
                    data = f.read()
                b64 = base64.b64encode(data).decode("utf-8")
                mime = "image/jpeg" if img_file.suffix.lower() in (".jpg", ".jpeg") else "image/png"
                images.append(f"data:{mime};base64,{b64}")
            except Exception as e:
                print(f"Error reading image {img_file}: {e}")
    return images


def collect_day_materials(selected_days: list[int]) -> tuple[dict[str, Any], list[str]]:
    """Collect materials from selected day folders.

    Returns:
        (day_materials dict, list of all image data URIs)
    """
    context_path = get_context_path()
    if not context_path:
        return {}, []

    materials = {}
    all_images = []
    supporting_path = context_path / "supporting"
    if not supporting_path.exists():
        return materials, all_images

    for day in selected_days:
        day_folder = None
        for folder in supporting_path.iterdir():
            if folder.is_dir() and folder.name.lower() == f"day {day}".lower():
                day_folder = folder
                break

        if day_folder:
            # PDFs (text extraction)
            day_pdfs = extract_text_from_pdfs_in_directory(day_folder)
            if day_pdfs:
                materials[str(day)] = day_pdfs

            # Images (for vision)
            images = extract_images_from_day_folder(day_folder)
            all_images.extend(images)

    return materials, all_images


def collect_master_materials() -> tuple[dict[str, str], list[str]]:
    """Collect materials from master folder.

    Returns:
        (master_texts dict, list of image data URIs from scanned PDFs)
    """
    context_path = get_context_path()
    if not context_path:
        return {}, []

    master_path = context_path / "master"
    if not master_path.exists():
        return {}, []

    texts = {}
    images = []
    for pdf_file in master_path.glob("*.pdf"):
        content = get_pdf_content(pdf_file, max_pages_as_images=2)
        text = content.get("text", "")
        if text and len(text.strip()) >= TEXT_EXTRACTION_MIN_LENGTH:
            texts[pdf_file.name] = text[:8000]
        elif "images" in content:
            images.extend(content["images"])

    return texts, images


def build_multimodal_prompt(
    selected_days: list[int],
    config_dict: dict[str, Any],
    curriculum_text: str,
    day_materials: dict[str, Any],
    day_images: list[str],
    master_texts: dict[str, str],
    master_images: list[str],
) -> list[dict[str, Any]]:
    """Build a multimodal prompt with text and images.

    Returns a list of content blocks for the OpenAI/Moonshot API.
    """
    # Build text portion
    text_lines = []
    text_lines.append("# Session Generation Request")
    text_lines.append("")
    text_lines.append("## Configuration")
    text_lines.append(f"- Difficulty: {config_dict.get('difficulty', 'Beginner')}")
    text_lines.append(f"- AI Strictness: {config_dict.get('aiStrictness', 'Normal')}")
    text_lines.append(f"- Focus Area: {config_dict.get('focusArea', 'Balanced')}")
    text_lines.append(f"- Selected Days: {selected_days}")
    text_lines.append("")

    enabled_skills = []
    if config_dict.get("includeSpeaking"):
        enabled_skills.append("Speaking")
    if config_dict.get("includeReadingComprehension"):
        enabled_skills.append("Reading Comprehension")
    if config_dict.get("includeCharacterWriting"):
        enabled_skills.append("Character Writing")
    if config_dict.get("includeShortEssay"):
        enabled_skills.append("Essay Composition")
    text_lines.append(f"- Enabled Skills: {', '.join(enabled_skills)}")
    text_lines.append("")

    if curriculum_text:
        text_lines.append("## Curriculum Context")
        text_lines.append(curriculum_text[:6000])
        text_lines.append("")

    if master_texts:
        text_lines.append("## Textbook & Workbook Content")
        for filename, text in master_texts.items():
            text_lines.append(f"### {filename}")
            text_lines.append(text[:3000])
            text_lines.append("")

    if day_materials:
        text_lines.append("## Daily Learning Materials (Text)")
        for day_num, files in day_materials.items():
            text_lines.append(f"### Day {day_num}")
            for filename, text in files.items():
                text_lines.append(f"**{filename}**:")
                text_lines.append(text[:2000])
                text_lines.append("")

    if master_images:
        text_lines.append(f"## Textbook & Workbook Images")
        text_lines.append(f"({len(master_images)} pages from scanned textbooks/workbooks are attached below.)")
        text_lines.append("")

    if day_images:
        text_lines.append(f"## Daily Session Images")
        text_lines.append(f"({len(day_images)} images from class sessions are attached below.)")
        text_lines.append("")

    text_lines.append("## Instructions")
    text_lines.append("Generate review questions based on ALL the provided text and images.")
    text_lines.append("Return ONLY a valid JSON object matching the schema in your system instructions.")
    text_lines.append("Do not include markdown code blocks or any explanatory text.")

    # Build content blocks
    content_blocks: list[dict[str, Any]] = [
        {"type": "text", "text": "\n".join(text_lines)}
    ]

    # Add master PDF images (limit to first few to control token usage)
    for img_uri in master_images[:4]:
        content_blocks.append({
            "type": "image_url",
            "image_url": {"url": img_uri},
        })

    # Add day images (limit to first few)
    for img_uri in day_images[:6]:
        content_blocks.append({
            "type": "image_url",
            "image_url": {"url": img_uri},
        })

    return content_blocks


def parse_ai_response(raw_response: str) -> dict[str, Any]:
    """Parse and clean the AI response into a JSON dict."""
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    return json.loads(cleaned)


def generate_session(
    selected_days: list[int],
    config_dict: dict[str, Any],
) -> dict[str, Any]:
    """Generate a review session with AI-powered questions.

    Falls back to mock questions if the AI API fails or MOCK_MODE is enabled.
    """
    if config.MOCK_MODE:
        return generate_mock_questions(selected_days, config_dict)

    # Load curriculum
    curriculum = load_curriculum()
    curriculum_context = get_curriculum_for_days(curriculum, selected_days)

    # Collect materials
    day_materials, day_images = collect_day_materials(selected_days)
    master_texts, master_images = collect_master_materials()

    # Build multimodal prompt
    user_content = build_multimodal_prompt(
        selected_days=selected_days,
        config_dict=config_dict,
        curriculum_text=curriculum_context,
        day_materials=day_materials,
        day_images=day_images,
        master_texts=master_texts,
        master_images=master_images,
    )

    # Load system prompt
    prompt_path = Path(__file__).parent.parent / "prompts" / "session_generator.txt"
    system_prompt = prompt_path.read_text(encoding="utf-8")

    try:
        # Call AI
        ai = AIService()
        raw_response = ai.generate_questions(system_prompt, user_content, temperature=0.3)

        # Parse response
        result = parse_ai_response(raw_response)

        if "questions" not in result:
            raise ValueError("AI response missing 'questions' field")

        if "metadata" not in result:
            result["metadata"] = {
                "module": "Generated Session",
                "estimatedDuration": 45,
                "questionCount": len(result["questions"]),
            }

        return result

    except Exception as e:
        print(f"AI API failed ({e}), falling back to mock questions.")
        return generate_mock_questions(selected_days, config_dict)
