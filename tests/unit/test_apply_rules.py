"""Unit tests for apply_rules.py."""
import pytest
import yaml
import tempfile
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engine.apply_rules import (
    load_rules, get_zone_rules, apply_zone_rules,
    get_overlay_rules, get_crs_config
)


def test_load_rules():
    """Test loading rules YAML."""
    rules_yaml = """
version: 1
jurisdiction: austin_tx
crs:
  input: EPSG:4326
  internal: EPSG:2277
zones:
  SF-3:
    height_ft: 35
    far: 0.4
"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        f.write(rules_yaml)
        f.flush()
        rules = load_rules(f.name)
        assert rules['version'] == 1
        assert rules['jurisdiction'] == 'austin_tx'
        assert 'SF-3' in rules['zones']


def test_get_zone_rules():
    """Test getting zone rules."""
    rules = {
        'zones': {
            'SF-3': {'height_ft': 35, 'far': 0.4}
        }
    }
    
    zone_rules = get_zone_rules(rules, 'SF-3')
    assert zone_rules is not None
    assert zone_rules['height_ft'] == 35
    
    zone_rules = get_zone_rules(rules, 'UNKNOWN')
    assert zone_rules is None


def test_apply_zone_rules():
    """Test applying zone rules."""
    zone_rules = {
        'height_ft': 35,
        'far': 0.4,
        'lot_coverage_pct': 40,
        'setbacks_ft': {
            'front': 25,
            'side': 5,
            'rear': 10
        },
        'corner_lot': {
            'street_side_setback_ft': 15
        }
    }
    
    result = apply_zone_rules(zone_rules, is_corner_lot=False)
    assert result['height_ft'] == 35
    assert result['setbacks_ft']['street_side'] == 0
    
    result = apply_zone_rules(zone_rules, is_corner_lot=True)
    assert result['setbacks_ft']['street_side'] == 15


def test_get_overlay_rules():
    """Test getting overlay rules."""
    rules = {
        'overlays': {
            'floodplain': {
                'rules': {'notes': 'additional review required'}
            }
        }
    }
    
    overlay_rules = get_overlay_rules(rules, ['Floodplain'])
    assert len(overlay_rules['notes']) > 0


def test_get_crs_config():
    """Test getting CRS config."""
    rules = {
        'crs': {
            'input': 'EPSG:4326',
            'internal': 'EPSG:2277'
        }
    }
    
    crs_config = get_crs_config(rules)
    assert crs_config['input'] == 'EPSG:4326'
    assert crs_config['internal'] == 'EPSG:2277'

