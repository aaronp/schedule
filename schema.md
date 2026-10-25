# Schedule markdown format

A schedule is **one markdown file**. The app reads it, and every edit made in the UI writes it back.
Reading is strict: anything the app does not recognise is reported with its line number, and the views
keep showing the last valid version until the error is fixed.

## Minimal example

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

## Structure

The parts must come in this order:

1. `# Title`: the first line, and the only `#` heading.
2. **Settings**: `key: value` lines straight after the title.
3. `## People`: everyone who can be scheduled.
4. `## Teams`: where people can be scheduled.
5. `## YYYY-MM-DD` sections: one for each day, each with `### Team` headings listing that team's shifts.

Blank lines are ignored everywhere. Trailing spaces are ignored. Comments and other text are not allowed.

### Settings

| Key | Value | Required |
| --- | --- | --- |
| `hours` | The day's time range, e.g. `08:00-24:00`. Every shift must fit inside it. | Yes |
| `background` | The Layout view's background: `sample:floorplan`, `local` (an uploaded image, which is not stored in the file) or an image URL | No |
| `background-opacity` | `0` to `1` | Only with `background` |
| `background-scale` | `0.25` to `3`, scaled from the top-left | Only with `background` |

`background`, `background-opacity` and `background-scale` are set all together or not at all.

### `## People`

```markdown
- slug: Full Name
  - role: Bartender
  - color: #5b8def
  - available: 2026-10-25 12:00-22:00
  - unavailable: 2026-10-25 14:00-15:00
```

- **slug**: the person's id, used in shift lines. It uses letters, digits, `-` and `_`, starts with a letter or
  digit, and must be unique. Numbers work too: `- 1: Priya`.
- Attributes are indented by two or more spaces under their person. All of them are optional:

| Attribute | Value |
| --- | --- |
| `role` | Free text, shown under the name |
| `color` | A 6-digit hex colour, e.g. `#5b8def` |
| `available` | `YYYY-MM-DD <range>`. If a person has any `available` window on a day, they are only available in those windows. Can repeat. |
| `unavailable` | `YYYY-MM-DD <range>`: time they can't work. Can repeat. |

A shift that overlaps unavailable time is allowed, but it shows a warning.

### `## Teams`

```markdown
- Team Name @ x,y #hexcolor
```

`x,y` is where the team's card is placed in the Layout view, in pixels (dragging a card updates them).
Team names must be unique and can't contain `@`.

### Days: `## YYYY-MM-DD`

```markdown
## 2026-10-25
### Main Bar
- mia 12:00-18:00
- kofi 16:00-20:00, 21:00-24:00
```

- The date must be a real date, and each date can only appear once. Days are kept in date order.
- `### Team` must name a team listed under `## Teams`.
- Each shift line is `- slug <range>`. A colon after the slug is optional (`- mia: 12-6pm`). Separate several
  ranges for the same person with commas.
- A day with no shifts is allowed (`## 2026-10-27` on its own).

## Times and ranges

| Written | Means |
| --- | --- |
| `13:30`, `9`, `09:00` | 24-hour time. `24:00` is allowed as an end time. |
| `9am`, `1:30pm`, `12pm` | 12-hour time (`12am` is midnight) |
| `12:00-18:00`, `12–18`, `9am to 1pm` | A range: `-`, `–` or `to` between the times |
| `12-6pm` | A start with no am/pm takes the end's (12pm–6pm) if that is earlier than the end; otherwise it is am |

A range must end after it starts. Overnight ranges are not supported: end at `24:00`.

## Rules checked on every change

- Person ids and team names are unique.
- Shifts and availability refer to people and teams that are listed above them.
- Every shift fits inside `hours`.
- Nobody is double-booked: a person's shifts on the same day can't overlap, even across teams.

## How the app writes the file

Edits made in the UI (dragging shifts, adding people, moving cards) rewrite the whole file in a standard layout:

- times as `HH:MM-HH:MM` (so `12-6pm` becomes `12:00-18:00`)
- availability sorted by date and time
- each day's shifts grouped under their teams in `## Teams` order, with empty teams left out

`parse(serialize(model))` gives back the same model, so the standard layout round-trips.

## Complete example

`examples/riverside-hall/schedule.md` uses every feature: settings, roles, colours, availability windows,
two days, and 12-hour ranges.
