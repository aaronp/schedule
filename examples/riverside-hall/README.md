# Riverside Hall — event staffing

**[▶ View the schedule](https://aaronp.github.io/schedule-example/)**

The data lives in [`schedule.md`](schedule.md) (format:
[schema.md](https://github.com/aaronp/schedule/blob/master/schema.md)). The UI comes from
[aaronp/schedule](https://github.com/aaronp/schedule).

## Using this as a template

1. Create an empty repo on GitHub, then from this directory run
   `make clone REPO=you/your-repo` (or `./clone.sh`, which prompts).
   It copies the files to `../your-repo`, points the View link above at
   your Pages site and sets the git remote.
2. Edit `schedule.md` (or edit it in the scheduler and use **Markdown → Download**),
   then commit and push.
3. On GitHub: Settings → Pages → Source: **GitHub Actions**.
4. Optional: on the repo page, open About (⚙) → tick **Use your GitHub Pages
   website** so the link also shows in the sidebar.

The workflow deploys from `main` or `master`. "Branch … is not allowed to
deploy to github-pages"? Add your branch under Settings → Environments →
github-pages → Deployment branches and tags.

Your site redirects to the scheduler with `?src=` pointing at your `schedule.md`.
Any query params you add are passed on, e.g. `?theme=paper`.

No Pages? Link straight to the file:
`https://aaronp.github.io/schedule/?src=https://github.com/<you>/<repo>/blob/<branch>/schedule.md`
