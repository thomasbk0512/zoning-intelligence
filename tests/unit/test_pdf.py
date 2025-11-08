"""Unit tests for pdf.py."""
import pytest
import json
import tempfile
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from parsers.pdf import (
    load_cache, save_cache, find_code_sections,
    extract_section_text
)


def test_load_cache(tmp_path, monkeypatch):
    """Test loading cache."""
    from parsers import pdf
    
    # Mock cache file path
    cache_file = tmp_path / "cache" / "§-snippets.json"
    cache_file.parent.mkdir(parents=True)
    
    cache_data = {"§25-2-492": "test text"}
    with open(cache_file, 'w') as f:
        json.dump(cache_data, f)
    
    original_cache_file = pdf.CACHE_FILE
    pdf.CACHE_FILE = cache_file
    
    try:
        cache = load_cache()
        assert "§25-2-492" in cache
    finally:
        pdf.CACHE_FILE = original_cache_file


def test_save_cache(tmp_path, monkeypatch):
    """Test saving cache."""
    from parsers import pdf
    
    cache_file = tmp_path / "cache" / "§-snippets.json"
    cache_file.parent.mkdir(parents=True)
    
    original_cache_file = pdf.CACHE_FILE
    pdf.CACHE_FILE = cache_file
    
    try:
        cache = {"§25-2-492": "test text"}
        save_cache(cache)
        assert cache_file.exists()
        
        loaded = load_cache()
        assert loaded == cache
    finally:
        pdf.CACHE_FILE = original_cache_file


def test_find_code_sections():
    """Test finding code sections in text."""
    from parsers.pdf import find_code_sections
    
    text = "Section §25-2-492 describes setbacks. See also §25-2-500."
    sections = find_code_sections(text)
    assert "§25-2-492" in sections
    assert "§25-2-500" in sections


def test_extract_section_text():
    """Test extracting section text."""
    from parsers.pdf import extract_section_text
    
    text = """Some preamble text.
    §25-2-492 Setback requirements
    Front setback: 25 feet
    Side setback: 5 feet
    Rear setback: 10 feet
    Additional text here."""
    
    snippet = extract_section_text(text, "§25-2-492", context_lines=5)
    assert "§25-2-492" in snippet
    assert "Setback requirements" in snippet

