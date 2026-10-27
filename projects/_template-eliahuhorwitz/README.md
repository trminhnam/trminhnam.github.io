# Project Page Template

A starting point for a new project website at `https://trminhnam.github.io/projects/<name>/`,
built like the [GraphNIAH](../graphniah/) and [ViGLUE](../viglue/) pages on the
[Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template)
by Eliahu Horwitz.

This folder lives in the personal website repository, but it is not a project page itself:
Jekyll skips folders whose names start with `_`, so it is never published. Copy it, turn the
copy into its own repository, and add that repository back here as a submodule, following
the steps below.

## What's in this folder

| Path                            | What it is                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                    | The page: header with links, teaser figure, Key Findings, method, results, BibTeX, footer. Every part to fill in has a TODO. |
| `static/css/index.css`          | The template's stylesheet plus the sections the GraphNIAH and ViGLUE pages share. Add page styles after the last comment.    |
| `static/js/index.js`            | The template's script: More Works dropdown, BibTeX Copy button, scroll-to-top button, carousels.                             |
| `static/css/`, `static/js/`     | Bulma, Bulma carousel and slider, and Font Awesome, unchanged from the template.                                             |
| `static/images/`                | Empty. The page expects `favicon.ico`, `social_preview.png`, `teaser.svg`, `method.svg` and `result.png` (step 3).           |
| `.github/workflows/publish.yml` | Publishes the page to `projects/<name>/` on the personal website after every push to `main`.                                 |
| `.nojekyll`                     | Keeps GitHub from processing the page with Jekyll.                                                                           |
| `.gitignore`                    | Ignores `.DS_Store`, plus `manuscript/` and `old/` for source material you keep next to the page but do not publish.         |

The placeholders `PROJECT_SLUG`, `PROJECT_NAME` and `PAPER_TITLE` in `index.html`,
`static/css/index.css` and `publish.yml` are replaced in step 2.

## Step by step

The commands below use these shell variables. Set them once in your terminal; the
examples are for a project called MyBench:

```bash
export NAME=mybench                   # URL folder: trminhnam.github.io/projects/mybench/ (lowercase, no spaces)
export TITLE=MyBench                  # name shown on the page and in commit messages
export REPO=MyBench-project-website   # GitHub repository, like GraphNIAH-project-website
export PAPER="MyBench: A Benchmark for Something Important"   # full paper title
export SITE=~/Desktop/playground/trminhnam.github.io          # the personal website repository
```

### 1. Copy the template out of the website repository

The project page becomes its own repository, so work on the copy outside `$SITE`:

```bash
cp -R "$SITE/projects/_template-eliahuhorwitz" ~/Desktop/playground/$REPO
cd ~/Desktop/playground/$REPO
```

### 2. Fill in the placeholders

```bash
perl -pi -e 's/PROJECT_SLUG/$ENV{NAME}/g; s/PROJECT_NAME/$ENV{TITLE}/g; s/PAPER_TITLE/$ENV{PAPER}/g' \
  index.html static/css/index.css .github/workflows/publish.yml

# Should print nothing
grep -rn 'PROJECT_SLUG\|PROJECT_NAME\|PAPER_TITLE' --exclude=README.md .
```

This uses `perl` rather than `sed -i`, whose syntax differs between macOS and GNU sed. It
reads the values from the exported variables, so any character in the title is safe. If
the title contains `&`, change it to `&amp;` in `index.html` afterwards.

### 3. Write the page

1. Fill in every TODO in `index.html`: `grep -n TODO index.html` lists them. They cover
   the meta description and keywords, all authors (in the `<meta>` tags, the JSON-LD block
   and the header), the venue, the Code and Dataset buttons, the teaser caption, the Key
   Findings cards, the method and results sections, and the BibTeX entry. Add, remove or
   copy sections as the paper needs; `../graphniah/index.html` and `../viglue/index.html`
   (in the website repository) show tables, step lists, tabs, interactive Plotly figures
   and an embedded Hugging Face dataset viewer.
2. Add the images to `static/images/`, then delete `static/images/.gitkeep`:
   - `favicon.ico`: a small icon. For a two-letter icon in the page's blue:

     ```bash
     magick -size 64x64 xc:none -fill '#2563eb' -draw 'roundrectangle 0,0 63,63 12,12' \
       -fill white -font Helvetica-Bold -pointsize 30 -gravity center -annotate +0+0 'Mb' \
       -define icon:auto-resize=64,32 static/images/favicon.ico
     ```

   - `social_preview.png`: the 1200×630 image shown when the link is shared.
   - `teaser.svg`, `method.svg`, `result.png`: the figures used in `index.html`. Rename them
     as you like, and update `index.html` to match.
3. Put styles for this page at the end of `static/css/index.css`, after
   `/* <TITLE> page sections */`.
4. Keep every link to the page's own files relative (`static/images/x.png`, not
   `/static/images/x.png`): the page is served from `/projects/<name>/`, so a leading `/`
   points at the root of the personal website.
5. Replace this README with one about the project (see [the project README](#the-project-readme)).

Preview the page while you work:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

### 4. Create the GitHub repository

Create the repository and connect it, but do not push yet: the first push runs the
publish workflow, which needs the token from step 5.

```bash
git init -b main
git add -A
git commit -m "Add $TITLE project page"
gh repo create "trminhnam/$REPO" --private --source=. --remote=origin
```

`--private` matches the other project repositories. The page itself is still public once
published, because the personal website serves it.

### 5. Give the token access to the new repository

Two workflows use the same fine-grained personal access token, `PROJECT_SITES_TOKEN`:

- this repository's `publish.yml` uses it to write the page into the `gh-pages` branch of
  `trminhnam/trminhnam.github.io`;
- the personal website's **Deploy site** workflow uses it to fetch every project
  repository, which are private. If the token cannot read the new repository, **the whole
  site deploy fails**, not just this page.

1. Open [Settings → Developer settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens)
   and click the token used for `PROJECT_SITES_TOKEN`.
2. Click **Edit**. Under **Repository access**, keep **Only select repositories** and add
   `trminhnam/<REPO>`. Leave the permission at **Contents: Read and write**. Click
   **Update**. (If the token has access to **All repositories**, skip this.)
3. While you are there, check the expiration date. An expired token makes every publish
   and site deploy fail.
4. Add the token as an Actions secret in the new repository. `gh` reads the value from
   standard input, so it does not end up in your shell history:

   ```bash
   read -rs TOKEN       # paste the token, then press Enter
   printf %s "$TOKEN" | gh secret set PROJECT_SITES_TOKEN --repo "trminhnam/$REPO"
   ```

   Or use the web page: the new repository's **Settings → Secrets and variables →
   Actions → New repository secret**, named `PROJECT_SITES_TOKEN`.

GitHub shows a token's value only once, when it is created. If you no longer have it,
click **Regenerate token** on the token's page. That replaces the old value everywhere, so
set the new value in the personal website repository and in every project repository:

```bash
read -rs TOKEN
for r in trminhnam.github.io GraphNIAH-project-website ViGLUE-project-website "$REPO"; do
  printf %s "$TOKEN" | gh secret set PROJECT_SITES_TOKEN --repo "trminhnam/$r"
done
gh secret list --repo "trminhnam/$REPO"   # shows PROJECT_SITES_TOKEN with today's date
```

Add any newer project repository to that list too (`ls "$SITE/projects"`).

### 6. Publish the page

```bash
git push -u origin main
gh run watch --repo "trminhnam/$REPO"     # pick the "Publish to trminhnam.github.io" run
open "https://trminhnam.github.io/projects/$NAME/"
```

The workflow copies the page into `projects/$NAME/` of the website's `gh-pages` branch,
then waits until `https://trminhnam.github.io/projects/$NAME/version.txt` shows the pushed
commit. A green run means the page is live. From now on, every push to `main` publishes
the page the same way, in a minute or two, without rebuilding the rest of the website.

### 7. Add the page to the personal website repository

Without this step, the next full deploy of the website would not include the page. Do it
after step 6, so the submodule points at a published commit:

```bash
cd "$SITE"
git submodule add -b main "git@github.com:trminhnam/$REPO.git" "projects/$NAME"
```

Then, in `$SITE`:

1. **`README.md`:** add a row to the table under _Project websites_:
   ``| `/projects/<name>/` | [trminhnam/<REPO>](https://github.com/trminhnam/<REPO>) (`main`) |``.
2. **`_bibliography/papers.bib`:** add the page to the paper's entry, so the publications
   page shows a Website button:
   `website = {https://trminhnam.github.io/projects/<name>/},`.
3. **Projects page (optional):** copy `_projects/1_graphniah.md` to
   `_projects/<N>_<name>.md` and change `title`, `description`, `img`, `importance` (the
   card's position), `redirect` and `github`. Keep `published: true`: `_config.yml`
   unpublishes project cards by default. Add the card image at
   `assets/img/projects/<name>.png`.
4. **More Works (optional):** add the new page to the More Works dropdown of the other
   project pages. Edit each one in its own repository and push it there, not in
   `$SITE/projects/`.

Check that everything builds, then commit and push:

```bash
make check
make push m="Add $TITLE project website"
```

`make push` commits everything and pushes `master`, which runs **Deploy site** and
publishes the whole website.

## Updating the page later

Edit the page in its own repository (`~/Desktop/playground/$REPO`) and push to `main`; it
publishes itself. Do not edit `$SITE/projects/<name>/`: that is a submodule checkout, and
changes made there are not published. To see the latest version in the website repository,
run `make update-projects` there; committing the updated submodule is optional, because
**Deploy site** always fetches the latest commit of each project's `main`.

## Troubleshooting

| Symptom                                                                                 | Cause and fix                                                                                                                                        |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publish run fails at **Publish to trminhnam.github.io** with a 403 or "Bad credentials" | The secret is missing, expired, or the token cannot write to `trminhnam/trminhnam.github.io`. Redo step 5.                                           |
| **Deploy site** in the website repository fails at **Fetch latest project websites**    | The token cannot read the new repository. Add it to the token's repository access (step 5.2).                                                        |
| Publish run fails at **Wait for the page to go live** after 10 minutes                  | GitHub Pages did not finish publishing `gh-pages`. Check the website repository's **Actions → pages-build-deployment**, then re-run the publish job. |
| The page loads without styles, or images are missing                                    | A link starts with `/`. Make it relative (step 3.4).                                                                                                 |
| A change is pushed but the live page is unchanged                                       | Your browser cached the old page. Reload without the cache (Cmd+Shift+R), or check `projects/<name>/version.txt` on the live site.                   |

## The project README

The README of the new repository describes the project, not this template. Use this
outline; the GraphNIAH and ViGLUE READMEs are full examples:

````markdown
# <TITLE> Project Page

Project website for **<PAPER>** (<authors>), <venue>.
It is served at https://trminhnam.github.io/projects/<name>/.

- Paper: <link>
- Code: <link>
- Dataset: <link>

## Edit

All content is in `index.html`. Page styles are at the end of `static/css/index.css`,
after `/* <TITLE> page sections */`. <Where the figures come from and how to rebuild them.>

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

`.github/workflows/publish.yml` runs on every push to `main`. It copies this folder
(without `.git`, `.github`, `.gitignore` and this README) into the `gh-pages` branch of
`trminhnam/trminhnam.github.io` under `projects/<name>/`. It needs an Actions secret
`PROJECT_SITES_TOKEN`: a fine-grained token with "Contents: Read and write" access to
`trminhnam/trminhnam.github.io`.

## Acknowledgments

This page is built on the
[Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template),
which was adopted from the [Nerfies](https://nerfies.github.io/) project page.
The website is licensed under a
[Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).
````
