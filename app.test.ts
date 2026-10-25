// Runs the app's logic class (Main.dc.html) with the browser stubbed out.
import { test, expect } from "bun:test";
import { join } from "node:path";

const html = await Bun.file(join(import.meta.dir, "Main.dc.html")).text();
const js = html.split("<script type=\"text/x-dc\" data-dc-script")[1].split(">").slice(1).join(">").split("</script>")[0];
// Like React: state merges, then componentDidUpdate.
class DCLogic { state: any; props: any; constructor(p: any) { this.props = p ?? {}; }
  setState(u: any) { this.state = { ...this.state, ...(typeof u === "function" ? u(this.state) : u) }; (this as any).componentDidUpdate?.(); } }

function load(search = "", store: Record<string, string> = {}, fetch?: (u: string) => Response) {
  const g = {
    location: { search, href: "https://x.test/app/" + search, pathname: "/app/", hash: "" },
    localStorage: { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v) },
    history: { replaceState: (_s: any, _t: string, u: string) => ((g.location as any).search = u.split("?")[1] ? "?" + u.split("?")[1] : "") },
    fetch: async (u: string) => fetch!(u), document: { getElementById: () => null }, setTimeout, clearTimeout,
  };
  const C = new Function("DCLogic", ...Object.keys(g), js + "\nreturn Component;")(DCLogic, ...Object.values(g));
  return { C, store, g };
}
const { C } = load();
const SEED = C.seed();

test("the sample, the example and schema.md's minimal example parse, and serialize round-trips", async () => {
  const docs = [SEED, await Bun.file(join(import.meta.dir, "examples/riverside-hall/schedule.md")).text(),
    /```markdown\n([\s\S]*?)```/.exec(await Bun.file(join(import.meta.dir, "schema.md")).text())![1]];
  for (const md of docs) { const m = C.parse(md); expect(C.parse(C.serialize(m))).toEqual(m); }
  expect(C.parse("# T\nhours: 0-24\n\n## People\n- a: A\n\n## Teams\n- X @ 0,0 #000000\n\n## 2026-01-02\n### X\n- a: 12am-1, 2–3pm\n").shifts.map(C.fmtRange)).toEqual(["00:00-01:00", "14:00-15:00"]);
});

test("every colour token the page uses is defined by every theme", () => {
  const used = new Set([...html.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(m => m[1]));
  const blocks = [...html.matchAll(/^(?::root,\.sb|\.sb\[data-theme="([a-z]+)"\])\{([^}]*)\}/gm)];
  expect(blocks.map(b => b[1] ?? "night")).toEqual(C.themes().map((t: any) => t.value));
  for (const b of blocks) for (const t of used) expect([b[1], t, b[2].includes(`--${t}:`)]).toEqual([b[1], t, true]);
});

test("the schedule is saved in the browser and restored; ?theme= wins over the saved theme", () => {
  const store: Record<string, string> = { [C.KEYS.theme]: "warm" };
  const a = new (load("", store).C)();
  expect(a.state.md).toBe(SEED); expect(a.state.theme).toBe("warm");
  a.setMd(SEED.replace("Riverside Hall", "Elsewhere"));
  expect(store[C.KEYS.md]).toContain("# Elsewhere");
  const b = new (load("?theme=blueprint", store).C)();
  expect(b.state.model.title).toMatch(/^Elsewhere/); expect(b.state.theme).toBe("blueprint");
  const bad = new (load("", { [C.KEYS.md]: "nope" }).C)();   // a broken saved file opens in the markdown panel with its error
  expect(bad.state.md).toBe("nope"); expect(bad.state.parseError).toMatch(/# Title/); expect(bad.state.panel).toBe("md");
});

test("?src= loads without autosaving; opening a file from the dialog replaces the saved copy and drops ?src=", async () => {
  const store: Record<string, string> = { [C.KEYS.md]: SEED };
  const remote = SEED.replace("Riverside Hall", "Remote");
  const { C: K, g } = load("?src=https://github.com/o/r/blob/main/s.md", store, u => {
    expect(u).toBe("https://raw.githubusercontent.com/o/r/main/s.md"); return new Response(remote); });
  const c = new K(); c.componentDidMount();
  await Bun.sleep(5);
  expect(c.state.model.title).toMatch(/^Remote/); expect(store[C.KEYS.md]).toBe(SEED);
  c.openFile(new File(["# Mine\nhours: 9-17\n"], "mine.md")); await Bun.sleep(5);
  expect(c.state.model.title).toBe("Mine"); expect(store[C.KEYS.md]).toBe("# Mine\nhours: 9-17\n"); expect(g.location.search).toBe("");
  c.openFile(new File(["x"], "pic.png")); expect(c.state.openError).toMatch(/not a markdown file/);
});

test("a failed URL keeps the dialog open with its error", async () => {
  const { C: K } = load("", {}, () => new Response("<!doctype html><p>404", { status: 200 }));
  const c = new K(); c.setState({ openOpen: true, openUrl: "https://x.test/s.md" });
  c.submitOpenUrl(); await Bun.sleep(5);
  expect(c.state.openOpen).toBe(true); expect(c.state.openError).toMatch(/not a markdown file/);
});
