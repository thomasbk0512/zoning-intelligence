.PHONY: test unit golden clean generate-samples

test: unit golden

unit:
	pytest tests/unit/ -v

golden:
	python3 tests/test_zoning.py

generate-samples:
	python3 scripts/generate_samples.py .

clean:
	find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache
	rm -rf tests/golden/*_actual.json

