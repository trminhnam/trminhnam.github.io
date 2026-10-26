# Shortcuts for developing and publishing the site. Run `make` or `make help` to list them.

BRANCH := $(shell git branch --show-current)
m ?= Update site ($(shell date +%Y-%m-%d))

.DEFAULT_GOAL := help
.PHONY: help install serve build check push pull clean distclean update-projects

help: ## List available commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-16s %s\n", $$1, $$2}'
	@echo ""
	@echo "  make push m=\"your message\"   commit with a custom message"

install: ## Install Ruby and JS dependencies, and fetch the project websites
	git submodule update --init
	bundle install
	npm ci

serve: ## Run the site locally at http://localhost:4000/ (auto-rebuilds on save)
	bundle exec jekyll serve --livereload

build: ## Build the site into _site/
	bundle exec jekyll build

pull: ## Pull the latest site code from GitHub, then the latest project websites
	@# --autostash keeps uncommitted edits (including moved submodules) out of the rebase's way
	git pull --rebase --autostash origin $(BRANCH)
	@$(MAKE) --no-print-directory update-projects

update-projects: ## Pull the latest version of every project website under projects/
	git submodule update --init --remote
	@git status --short projects

check: ## Check formatting and that the site builds (the same checks CI runs)
	npx prettier . --check
	bundle exec jekyll build --quiet

push: check ## Check, then commit everything and push to GitHub
	@git add -A
	@if git diff --cached --quiet; then \
		echo "Nothing new to commit."; \
	else \
		git status --short; \
		git commit -q -m "$(m)" && echo "Committed: $(m)"; \
	fi
	@# GitHub bots also commit (citation and table-of-contents updates), so take theirs first
	git pull --rebase origin $(BRANCH)
	git push origin $(BRANCH)

clean: ## Delete build output, caches and .DS_Store files
	@if pgrep -f "jekyll serve" >/dev/null; then \
		echo "Stop 'make serve' (Ctrl+C) first: cleaning would delete the _site/ it is serving."; exit 1; \
	fi
	rm -rf _site .jekyll-cache .jekyll-metadata .sass-cache .tweet-cache \
		al-folio-upgrade-report.md test-results output/playwright
	find . -name .DS_Store -not -path "./node_modules/*" -delete
	find . -name __pycache__ -type d -not -path "./node_modules/*" -prune -exec rm -rf {} +

distclean: clean ## Also delete installed dependencies (run `make install` afterwards)
	rm -rf node_modules .bundle vendor
