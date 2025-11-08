"""PDF text extraction with regex pattern matching and caching."""
import re
import json
from pathlib import Path
from typing import Dict, List, Optional
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    try:
        import pdfplumber
        PDF_AVAILABLE = True
        USE_PDFPLUMBER = True
    except ImportError:
        PDF_AVAILABLE = False
        USE_PDFPLUMBER = False


# Cache file path (relative to project root)
CACHE_FILE = Path(__file__).parent.parent / "cache" / "§-snippets.json"


def load_cache() -> Dict[str, str]:
    """Load cached PDF snippets."""
    if not CACHE_FILE.exists():
        return {}
    try:
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def save_cache(cache: Dict[str, str]):
    """Save cached PDF snippets."""
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=2)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file."""
    if not PDF_AVAILABLE:
        raise ImportError("PyPDF2 or pdfplumber required for PDF parsing")
    
    text = ""
    try:
        if USE_PDFPLUMBER:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        else:
            with open(pdf_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text += page.extract_text() or ""
    except Exception as e:
        raise IOError(f"Error reading PDF {pdf_path}: {e}")
    
    return text


def find_code_sections(text: str, pattern: str = r'§\d+-\d+-\d+') -> List[str]:
    """
    Find code section citations in text using regex.
    
    Args:
        text: PDF text content
        pattern: Regex pattern for section citations (default: §25-2-492 format)
    
    Returns:
        List of unique section citations found
    """
    matches = re.findall(pattern, text)
    return sorted(list(set(matches)))


def extract_section_text(text: str, citation: str, context_lines: int = 10) -> str:
    """
    Extract text around a code section citation.
    
    Args:
        text: Full PDF text
        citation: Section citation (e.g., "§25-2-492")
        context_lines: Number of lines to include after citation
    
    Returns:
        Extracted text snippet
    """
    lines = text.split('\n')
    snippet_lines = []
    found = False
    
    for i, line in enumerate(lines):
        if citation in line:
            found = True
            snippet_lines.append(line)
            # Include following context lines
            for j in range(i + 1, min(i + 1 + context_lines, len(lines))):
                snippet_lines.append(lines[j])
            break
    
    if not found:
        return f"{citation} (not found in text)"
    
    return '\n'.join(snippet_lines)


def parse_pdf_sections(pdf_path: str, use_cache: bool = True) -> Dict[str, str]:
    """
    Parse PDF and extract code sections.
    
    Args:
        pdf_path: Path to PDF file
        use_cache: Whether to use cached results
    
    Returns:
        Dict mapping citation to text snippet
    """
    cache = load_cache() if use_cache else {}
    
    # Check if we already have sections from this PDF
    pdf_key = Path(pdf_path).stem
    if use_cache and pdf_key in cache:
        return cache[pdf_key]
    
    # Extract text and find sections
    text = extract_text_from_pdf(pdf_path)
    citations = find_code_sections(text)
    
    # Extract snippets for each citation
    sections = {}
    for citation in citations:
        sections[citation] = extract_section_text(text, citation)
    
    # Update cache
    if use_cache:
        cache[pdf_key] = sections
        save_cache(cache)
    
    return sections


def get_citation_snippet(citation: str, pdf_paths: List[str], 
                        use_cache: bool = True) -> Optional[str]:
    """
    Get text snippet for a specific citation from PDFs.
    
    Args:
        citation: Section citation (e.g., "§25-2-492")
        pdf_paths: List of PDF file paths to search
        use_cache: Whether to use cached results
    
    Returns:
        Text snippet or None if not found
    """
    for pdf_path in pdf_paths:
        if not Path(pdf_path).exists():
            continue
        sections = parse_pdf_sections(pdf_path, use_cache)
        if citation in sections:
            return sections[citation]
    return None

