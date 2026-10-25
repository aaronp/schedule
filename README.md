# Team Scheduler

**[▶ Open the scheduler](https://aaronp.github.io/schedule/)** ·
[Riverside Hall example](https://aaronp.github.io/schedule/?src=examples/riverside-hall/schedule.md)

Shift scheduling driven by **one markdown file**: people, teams and each day's shifts.
This repo is the app. Your schedule can live in its own repo and be loaded with `?src=` (see
[Publishing your own schedule](#publishing-your-own-schedule)).

- **Swimlanes**: each team's shifts on a timeline. Drag a bar to move it and its edges to resize it, and drag people in from the roster.
- **Layout**: team cards on a floor plan at the time cursor. Drag people between teams to reassign them from that time.
- **Markdown** panel: the whole file. Edit it in place, **Open…**, **Copy** or **Download** it. Errors show their line number, and the views keep the last valid version until the error is fixed.
- **Open**: drop a `.md` file, choose one, or open one from a URL (GitHub file links work).
- Four themes: Night shift, Paper, Blueprint and Warm.

Changes are saved in the browser (localStorage). **The downloaded `.md` file is the real copy**, so keep it in git.

| Query | Shows |
| --- | --- |
| _(none)_ | The schedule saved in this browser, or the sample |
| `?src=<url>` | That markdown file (absolute, or relative to the page). It isn't autosaved, so it never overwrites your saved schedule. |
| `?theme=` | `night` (default), `paper`, `blueprint` or `warm`. This wins over the theme saved in the browser. |

Files on another host must allow CORS (GitHub Pages and raw.githubusercontent.com both do).

## The file format

The full format is in **[schema.md](schema.md)**.

```markdown
# Saturday shifts
hours: 09:00-17:00

## People
- dave: David Smith

## Teams
- Front Desk @ 24,24 #5b8def

## 2026-10-25
### Front Desk
- dave 09:00-13:00
```

## Viewing locally

```sh
make dev     # serves with Bun on http://localhost:8000/ and prints the example's URL
```

The app (`Main.dc.html`) is served at `/`, with the rest of the repo beside it as on GitHub Pages, so
`http://localhost:8000/?src=examples/riverside-hall/schedule.md` works.

## Hosting

`.github/workflows/pages.yml` runs the tests on pushes to `main` or `master`, then publishes the app as
`index.html` with `examples/` beside it. Set Settings → Pages → Source: **GitHub Actions**; the
`github-pages` environment must allow your branch. `.md` files are served raw, without Jekyll.

## Publishing your own schedule

Your schedule lives in its own data-only repo (`schedule.md`, a redirecting `index.html` and a Pages
workflow), and this repo stays the app. Create an empty repo on GitHub, then:

```sh
git clone https://github.com/aaronp/schedule.git
cd schedule/examples/riverside-hall
make clone REPO=you/your-schedule    # or ./clone.sh to be prompted
```

This copies the example to `../your-schedule` as a fresh repo on `main`, points its README link at
`https://you.github.io/your-schedule/` and sets the `origin` remote. Edit `schedule.md`, commit and
`git push -u origin main`, then set Settings → Pages → Source: **GitHub Actions**.

## Development

```sh
make test    # bun test: the parser, round-tripping, themes, saving and opening
```

| Path | What |
| --- | --- |
| `Main.dc.html` | The app: an `<x-dc>` template plus its logic class (parser, serializer, model operations, view model) |
| `support.js`, `vendor/` | The runtime that renders the template in a browser |
| `schema.md` | The markdown format |
| `examples/riverside-hall/` | A cloneable data-only repo that points back at this app |
| `app.test.ts` | Runs the logic class with the browser stubbed out |
