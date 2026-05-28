from __future__ import annotations

"""PDF text extraction and image conversion service."""

import base64
from io import BytesIO
from pathlib import Path

import fitz  # PyMuPDF


TEXT_EXTRACTION_MIN_LENGTH = 200  # If extracted text is shorter, treat as scanned PDF


def extract_text_from_pdf(pdf_path: str | Path) -> str:
    """Extract text from a PDF file using PyMuPDF.

    Args:
        pdf_path: Path to the PDF file.

    Returns:
        Extracted text content.
    """
    path = Path(pdf_path)
    if not path.exists():
        return ""

    try:
        text_parts = []
        with fitz.open(str(path)) as doc:
            for page in doc:
                text_parts.append(page.get_text())
        return "\n".join(text_parts)
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""


def pdf_pages_to_base64_images(
    pdf_path: str | Path,
    max_pages: int = 3,
    dpi: int = 150,
) -> list[str]:
    """Convert PDF pages to base64-encoded PNG images.

    Args:
        pdf_path: Path to the PDF file.
        max_pages: Maximum number of pages to convert.
        dpi: Resolution for rendering.

    Returns:
        List of base64-encoded PNG images (data URI format).
    """
    path = Path(pdf_path)
    if not path.exists():
        return []

    images = []
    try:
        with fitz.open(str(path)) as doc:
            zoom = dpi / 72
            mat = fitz.Matrix(zoom, zoom)
            for i, page in enumerate(doc):
                if i >= max_pages:
                    break
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("png")
                b64 = base64.b64encode(img_bytes).decode("utf-8")
                images.append(f"data:image/png;base64,{b64}")
        return images
    except Exception as e:
        print(f"Error converting PDF to images {pdf_path}: {e}")
        return []


def extract_text_from_pdfs_in_directory(directory: str | Path) -> dict[str, str]:
    """Extract text from all PDFs in a directory.

    Args:
        directory: Path to the directory.

    Returns:
        Dict mapping filename to extracted text.
    """
    dir_path = Path(directory)
    results = {}
    if not dir_path.exists():
        return results

    for pdf_file in dir_path.glob("*.pdf"):
        text = extract_text_from_pdf(pdf_file)
        if text.strip():
            results[pdf_file.name] = text
    return results


def get_pdf_content(
    pdf_path: str | Path,
    max_pages_as_images: int = 3,
) -> dict[str, str | list[str]]:
    """Get content from a PDF — text if available, otherwise images.

    Returns a dict with keys:
        - "text": extracted text (may be empty)
        - "images": list of base64 image strings (only if text is too short)
    """
    text = extract_text_from_pdf(pdf_path)
    result: dict[str, str | list[str]] = {"text": text}

    if len(text.strip()) < TEXT_EXTRACTION_MIN_LENGTH:
        images = pdf_pages_to_base64_images(pdf_path, max_pages=max_pages_as_images)
        if images:
            result["images"] = images

    return result
