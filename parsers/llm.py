"""LLM adapter for PDF parsing (stub implementation)."""
import os
from typing import Dict, Optional


def parse_pdf_with_llm(pdf_path: str, citation: str) -> Optional[str]:
    """
    Parse PDF section using LLM (requires OPENAI_API_KEY).
    
    This is a stub implementation. For MVP, returns None unless
    OPENAI_API_KEY is set and LLM integration is implemented.
    
    Args:
        pdf_path: Path to PDF file
        citation: Code section citation to extract
    
    Returns:
        Extracted text snippet or None
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    
    # Stub: LLM integration not implemented for MVP
    # In production, this would:
    # 1. Extract PDF text
    # 2. Send to LLM with prompt to find citation
    # 3. Return extracted section
    
    return None

