# Root Makefile for Replate monorepo
# Minimal targets. Extend as needed in subprojects.

# Default input and output for PDF generation
README_MD ?= readme.md
README_PDF ?= readme.pdf
papersize = a4 # or letter

.PHONY: pdf help

help:
	@echo "Available targets:"
	@echo "  pdf   - Convert $${README_MD} to $${README_PDF} using pandoc"

pdf:
	@command -v pandoc >/dev/null 2>&1 || { echo >&2 "Error: pandoc is not installed. Install pandoc and retry. See https://pandoc.org/installing.html"; exit 1; }
	@echo "Generating $${README_PDF} from $${README_MD}..."
	@pandoc "${README_MD}" --from gfm --pdf-engine=pdflatex --metadata title="Replate README" -V papersize:$(papersize) --toc --output "${README_PDF}"
	@echo "Done: $${README_PDF}"
