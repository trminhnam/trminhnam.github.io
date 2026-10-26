# trminhnam.github.io

Source for my personal academic website, **[trminhnam.github.io](https://trminhnam.github.io)**, built with [Jekyll](https://jekyllrb.com/) on the [al-folio](https://github.com/alshedivat/al-folio) v1 starter.

## Everyday commands

Run `make` to list these.

| Command                 | What it does                                                                   |
| ----------------------- | ------------------------------------------------------------------------------ |
| `make serve`            | Run the site at <http://localhost:4000/>; the browser refreshes when you save  |
| `make push m="message"` | Check formatting and the build, then commit everything and push to GitHub      |
| `make check`            | Run the formatting check and a test build (the same checks GitHub runs)        |
| `make build`            | Build the site into `_site/`                                                   |
| `make clean`            | Delete build output, caches, and `.DS_Store` files                             |
| `make pull`             | Pull the latest site code from GitHub, then the latest project websites        |
| `make update-projects`  | Pull the latest version of each project website in `projects/`                 |
| `make install`          | Install the Ruby and JavaScript dependencies, and fetch the project websites   |
| `make distclean`        | `clean`, plus delete the installed dependencies (run `make install` afterward) |

`make push` stops before committing if the check fails, so a broken site is never pushed. Without `m=`, the commit message is `Update site (<date>)`. Changes to `_config.yml` are not picked up by a running `make serve`; restart it.

## Setting up a new machine (macOS)

The Ruby setup follows [this guide](https://george-gca.github.io/blog/2022/running-local-al-folio/), adapted for macOS and zsh.

1. **Homebrew packages.** ImageMagick generates the responsive `.webp` images; `libyaml` and `openssl@3` are needed to compile Ruby.

   ```bash
   brew install imagemagick libyaml openssl@3
   ```

2. **Ruby via rbenv.** Install rbenv and the ruby-build plugin from source:

   ```bash
   git clone https://github.com/rbenv/rbenv.git ~/.rbenv
   mkdir -p ~/.rbenv/plugins
   git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
   ```

   Add this to `~/.zshrc`, then open a new terminal:

   ```bash
   # enable rbenv
   if [ -d "$HOME/.rbenv/" ]; then
     export PATH="$HOME/.rbenv/bin:$PATH"
     eval "$(rbenv init - zsh)"
   fi
   ```

   Install Ruby and Bundler (`rbenv install --list` shows newer versions):

   ```bash
   rbenv install 3.3.12
   rbenv global 3.3.12
   gem install bundler
   ```

3. **Node.js** (for Prettier, which `make check` and GitHub use to check formatting). Any current LTS works; with [nvm](https://github.com/nvm-sh/nvm):

   ```bash
   nvm install --lts
   ```

4. **Project dependencies.** From the repository root:

   ```bash
   make install
   make serve
   ```

5. **Optional: Jupyter**, only needed for blog posts written as notebooks. Install `jupyter` and `nbconvert` into any Python on your `PATH` (e.g. `conda install jupyter nbconvert`, or `pipx install jupyter`). Without them the build prints a warning and skips notebooks.

Docker is an alternative to steps 2–5: `docker compose up -d` serves the site at <http://localhost:8080/>.

## Where the content lives

| What                             | File                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Name, site URL, global settings  | `_config.yml`                                                                   |
| Email, GitHub, LinkedIn, Scholar | `_data/socials.yml`                                                             |
| Home page (bio, photo)           | `_pages/about.md`, photo in `assets/img/avatar.jpg`                             |
| Publications                     | `_bibliography/papers.bib`, preview images in `assets/img/publication_preview/` |
| Teaching                         | `_pages/teaching.md`                                                            |
| CV page                          | `assets/json/resume.json`, PDF in `assets/pdf/tran_minh_nam_cv.pdf`             |
| Navbar order                     | `nav_order` at the top of each file in `_pages/`                                |

Pages with `published: false` at the top (blog, projects, and the template's demo pages) are not built. The template's example posts, books, and courses are hidden by the `defaults` section of `_config.yml`.

## Project websites

Each project website is its own repository, added here as a git submodule under `projects/` and published unchanged (its scripts are not minified) at `/projects/<name>/`:

| Route                  | Repository                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `/projects/graphniah/` | [trminhnam/GraphNIAH-project-website](https://github.com/trminhnam/GraphNIAH-project-website) (`main`) |
| `/projects/viglue/`    | [trminhnam/ViGLUE-project-website](https://github.com/trminhnam/ViGLUE-project-website) (`main`)       |

Edit a project website in its own repository, not in `projects/`. Each project repository publishes itself: its `.github/workflows/publish.yml` copies its files into this site's published `gh-pages` branch under `projects/<name>/` after every push, in seconds and without rebuilding this site. This site's own **Deploy site** workflow fetches the latest commit of each project's branch too, so a full deploy publishes the same version. To see the latest version locally, run `make update-projects`; committing the updated submodule is optional.

Because the project repositories are private, both workflows need a token:

1. Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) with access to this repository and every project website repository, with the **Contents: Read and write** permission.
2. Add it as an Actions secret named `PROJECT_SITES_TOKEN` in this repository (Settings → Secrets and variables → Actions), and in each project website repository.

For a new project website, copy [`projects/graphniah/.github/workflows/publish.yml`](https://github.com/trminhnam/GraphNIAH-project-website/blob/main/.github/workflows/publish.yml) into its repository and change `target-folder` to `projects/<name>`.

To add another project website:

```bash
git submodule add -b main git@github.com:trminhnam/<repo>.git projects/<name>
```

Its links to its own files must be relative (`static/...`, not `/static/...`), since it is served from `/projects/<name>/`.

## Deployment

Pushing to `master` runs the **Deploy site** GitHub Action, which builds the site and publishes it to the `gh-pages` branch; GitHub Pages serves that branch. Progress is under the repository's **Actions** tab.

## Template documentation

All layouts, styles, and features come from versioned al-folio plugin gems pinned in the `Gemfile`, not from files in this repository. For customization and troubleshooting, see the template docs in [`docs/`](docs/README.md), especially [CUSTOMIZE.md](docs/CUSTOMIZE.md), [FAQ.md](docs/FAQ.md), and [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## License

Based on [al-folio](https://github.com/alshedivat/al-folio), available under the [MIT License](LICENSE).
