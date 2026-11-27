/**
 * pages/Home.jsx - the coreforge landing (the marketing pitch).
 *
 * The one-liner: one repo, every site - one brand file, zero drift. This page
 * sells that to four readers at once - the dev deciding whether to adopt the
 * rig, the maintainer tired of re-porting the same shell, the team lead asking
 * why it matters, and the agent asked to ship a site. Every claim links to a
 * receipt (the docs, the CLI, the gates).
 *
 * Shell conventions kept: usePageMeta lives in the component BODY (calling it
 * inside another effect was an invalid hook call - React #321 tore the tree
 * down; keep it here). Identity rides site.* so the template token pass stays
 * clean (the brand census never scans page body prose, but the generator still
 * tokenizes these bytes). The .code pre carries the token classes the docs
 * Rouge output shares (.k/.cm/.gp); CTAs compose .btn + a color modifier.
 */
import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta.js'
import site, { routeMeta } from '../site.js'

/** One "who it is for" card (an audience + the payoff). */
const AUDIENCE = [
  {
    glyph: '◧',
    title: 'A team shipping its first site',
    body: 'You get the landing rig, the docs rig, and the CI/release plumbing on day one - prerender, hydration parity, light/dark, search, pagefind, deploy - instead of a quarter of yak-shaving before the first real page.',
  },
  {
    glyph: '◨',
    title: 'A maintainer of many repos',
    body: 'One brand file per site, one nav vocabulary, one set of gates. A rebrand is an edit, not a hunt across three languages - and a fix to a gate reaches every adopter through npm update.',
  },
  {
    glyph: '⌘',
    title: 'A solo dev who wants it right',
    body: 'The correctness is paid for once, here: the theme has no flash, the prerender and the hydrated DOM agree byte-for-byte, the links are checked, the prose is checked. You inherit all of it.',
  },
  {
    glyph: '⇄',
    title: 'An agent asked to ship a site',
    body: 'Four verbs and a JSON answer file. coreforge create stamps a real, doctor-clean tree; the gates fail at cause with a file:line, so a red is a fix, not a mystery.',
  },
]

/** The four site verbs + the release ladder (PRD 6). */
const VERBS = [
  { glyph: '1', name: 'create', sig: 'create [dir]', what: 'stamp the shell into a repo from a site.json answer file or flags - never clobbering an existing file' },
  { glyph: '2', name: 'sync', sig: 'sync [dir]', what: 'regenerate the derived surfaces from site.config.js; --check refuses drift instead of writing' },
  { glyph: '3', name: 'build', sig: 'build [dir]', what: 'install the web deps if needed, then run the engine build (prerender plus the 404 repair)' },
  { glyph: '4', name: 'check', sig: 'check [dir]', what: 'run the gates over the tree - the verb CI calls' },
  { glyph: '✓', name: 'doctor', sig: 'doctor [dir]', what: 'the truth battery: config, placeholder residue, derived freshness, then the gates. Exit 0 is PASS only when nothing failed' },
]

/** The four-step adoption path. */
const STEPS = [
  { n: '01', title: 'Create', body: 'Answer three questions - name, url, repo - and coreforge stamps the whole shell: web/, docs/, site.config.js, the packs slot, and the two CI lanes that belong to you.' },
  { n: '02', title: 'Rebrand', body: 'Edit site.config.js once: the identity, the nav vocabulary, the routes. The JS surfaces import it; sync regenerates the rest. The census refuses a literal anywhere else.' },
  { n: '03', title: 'Write', body: 'Replace the sample pages with yours. Keep the route shape; the sitemap, the prerender list, and the per-page meta all read from the same route table.' },
  { n: '04', title: 'Gate it', body: 'npm run check runs the gates; the docs lane builds, seo-checks, and deploys on push. Generated green is never shipped - doctor proves it.' },
]

/** Why a team adopts the rig. */
const WHY_ADOPT = [
  { glyph: '◍', title: 'One file, zero drift', body: 'The landing, the docs, and the CI all read one brand file. A rebrand is one edit; the two surfaces cannot disagree about who they are.' },
  { glyph: '◧◨', title: 'Two sites, one shell', body: 'A prerendered React/Vite landing and a Jekyll docs rig, sharing one palette, one nav vocabulary, and one set of tokens - so the two look like one product.' },
  { glyph: '⬡', title: 'Gates, not memory', body: 'Frontmatter, links, style, fiction signatures, the Liquid filter trap, theme parity, the brand census - each a gate that names file:line. A bug caught twice becomes a gate the same day.' },
  { glyph: '⌁', title: 'Prerender that hydrates clean', body: 'prestruct bakes one directory per route; the theme bootstraps with no flash; both switch icons always render, so the baked bytes and the hydrated DOM agree exactly.' },
  { glyph: '⊞', title: 'CI and release plumbing included', body: 'A thin docs-deploy caller of the one family docs lane, a staging fast-forward, and an npm Trusted-Publishing release ladder - wired, pinned, and proven.' },
  { glyph: '✓', title: 'Receipts, not claims', body: 'Every extracted file names its source repo + SHA in MANIFEST.md; every engine pin is deliberate. The rig takes a fix FROM a sibling repo, never invents a shape from memory.' },
]

export default function Home() {
  const meta = routeMeta('/')
  usePageMeta({ siteUrl: site.url, path: '/', title: meta.title, description: meta.description })
  return (
    <>
      {/* ---- hero ------------------------------------------------------- */}
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">
            {site.name} {site.badge} <span className="dot">·</span> {site.license} <span className="dot">·</span> the site rig for the struct family
          </p>
          <h1>
            One repo, every site:{' '}
            <span className="accent">one brand file, zero drift.</span>
          </h1>
          <p className="lede">
            This is the {site.name} rig: a prerendered landing, a Jekyll docs
            site, and the CI/release plumbing that keeps them honest - all
            driven from one brand file. Edit that one file and every surface
            follows. The correctness the family keeps re-porting (no-flash
            theme, hydration parity, pagefind search, the gates) is paid for
            once, here; a new site inherits it.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={`${site.docs.url}/cli/`}>Read the CLI</a>
            <a className="btn btn-ghost" href={site.npm}>Install from npm</a>
            <a className="btn btn-ghost" href={site.repo}>See the repo</a>
          </div>
          <pre className="code"><span className="gp">$</span> npx {site.name} create my-site{'\n\n'}<span className="cm"># answer three questions, get a real site</span>{'\n'}<span className="gp">$</span> cd my-site && npm install && npm run build{'\n'}<span className="cm"># {'>'} dist/, one directory per route, hydrates with zero mismatch</span></pre>
          <div className="chips">
            <span className="chip">prerendered</span>
            <span className="chip">no-flash theme</span>
            <span className="chip">pagefind search</span>
            <span className="chip">gates at cause</span>
            <span className="chip">one brand file</span>
          </div>
        </div>
      </section>

      {/* ---- the thesis band ------------------------------------------- */}
      <section className="band thesis">
        <div className="wrap">
          <p className="band-kicker">The thesis</p>
          <p className="band-line">
            Every site in a family needs the <span className="accent">same</span> shell:
            the same theme, the same docs chrome, the same deploy lane, the same
            correctness. Rebuilding it per repo means the same bugs get paid for
            over and over. The rig pays for them <span className="accent">once</span> and
            hands them down.
          </p>
        </div>
      </section>

      {/* ---- who it is for --------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <h2 className="section-title">Who it is for</h2>
          <p className="sub">
            The same rig pays off four ways. Pick the one that is your job.
          </p>
          <div className="grid">
            {AUDIENCE.map((a) => (
              <div className="card" key={a.title}>
                <h3><span className="glyph">{a.glyph}</span>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- why it is needed ------------------------------------------ */}
      <section className="section">
        <div className="wrap">
          <h2 className="section-title">Why it is needed</h2>
          <p className="sub">
            A landing site, a docs site, and the plumbing between them look like
            three jobs. Done separately, they are three chances to drift.
          </p>
          <div className="table-wrap">
            <table className="attacks">
              <thead>
                <tr><th>the surface</th><th>what goes wrong built alone</th><th>what the rig gives you</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mod">the landing</td>
                  <td><span className="what">A bespoke React app per repo.</span> <span className="why">A theme flash, a hydration mismatch, a sitemap nobody wired - each rediscovered from scratch.</span></td>
                  <td><span className="shipped">A prerendered shell</span> with a no-flash theme, hydration parity, and the route table driving the sitemap.</td>
                </tr>
                <tr>
                  <td className="mod">the docs</td>
                  <td><span className="what">A Jekyll tree with its own palette.</span> <span className="why">The docs and the landing drift apart, and the SEO layer gets re-implemented (or skipped).</span></td>
                  <td><span className="shipped">One palette, one nav vocabulary</span>, plus the freestruct SEO layer and pagefind search out of the box.</td>
                </tr>
                <tr>
                  <td className="mod">the plumbing</td>
                  <td><span className="what">Copy-pasted workflows per repo.</span> <span className="why">They fork, then drift (ruby versions, a floating pagefind scrape), and the fork is invisible until it breaks.</span></td>
                  <td><span className="shipped">One docs lane</span> called thinly, a staging fast-forward, and a pinned OIDC release ladder - never a fork.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---- what you get ---------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <h2 className="section-title">What you get</h2>
          <p className="sub">
            One command, five verbs, two surfaces, one identity file.
          </p>
          <div className="grid">
            {VERBS.map((v) => (
              <div className="card" key={v.name}>
                <h3><span className="glyph">{v.glyph}</span>{v.name}</h3>
                <p><code>{v.sig}</code> - {v.what}.</p>
              </div>
            ))}
          </div>
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="card">
              <h3><span className="glyph">◧</span> the landing rig</h3>
              <p>prestruct-prerendered React/Vite, tokens-only palette (dark + light), a nav/sidebar/footer from one vocabulary file, an island engine, and placeholder pages you replace.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">◨</span> the docs rig</h3>
              <p>A fixed header (search &gt; GitHub &gt; theme &gt; menu), a slide-out sidebar, pagefind modal search (Cmd+K), Rouge tokens shared with the landing, and the freestruct SEO layer.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">⇄</span> the plumbing</h3>
              <p>A thin caller of the one docs lane, the staging fast-forward, the npm Trusted-Publishing release ladder, and the gates CI runs - pinned, never floating.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- how it works ---------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <h2 className="section-title">How it works</h2>
          <p className="sub">
            Four steps from an empty repo to a shipped, gated site.
          </p>
          <div className="pipeline">
            {STEPS.map((s) => (
              <div className="pipe-step" key={s.n}>
                <span className="pipe-n">{s.n}</span>
                <div>
                  <strong>{s.title}</strong>{' '}
                  <span>{s.body}</span>
                </div>
              </div>
            ))}
          </div>
          <pre className="code" style={{ marginTop: 22 }}><span className="cm"># the identity, authored once (site.config.js)</span>{'\n'}<span className="k">export default</span> {'{'}{'\n'}  name: <span className="cm">'my-site'</span>,{'\n'}  url: <span className="cm">'https://my-site.example.com'</span>,{'\n'}  repo: <span className="cm">'https://github.com/me/my-site'</span>,{'\n'}  nav: [ {'{'} label: <span className="cm">'Home'</span>, to: <span className="cm">'/'</span> {'}'} ],{'\n'}{'}'}{'\n\n'}<span className="cm"># every other surface derives from it</span>{'\n'}<span className="gp">$</span> npx {site.name} sync    <span className="cm"># fan identity into the docs + static surfaces</span>{'\n'}<span className="gp">$</span> npx {site.name} doctor  <span className="cm"># the truth battery - generated green is never shipped</span></pre>
        </div>
      </section>

      {/* ---- why teams adopt ------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <h2 className="section-title">Why teams adopt it</h2>
          <p className="sub">
            Six reasons a family picks the rig up - and keeps every site on it.
          </p>
          <div className="grid">
            {WHY_ADOPT.map((w) => (
              <div className="card" key={w.title}>
                <h3><span className="glyph">{w.glyph}</span>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- proof / ecosystem ----------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <h2 className="section-title">It is not a one-site idea</h2>
          <p className="sub">
            The rig is the shell the whole struct family ships from - and the
            engines it composes are independent packages.
          </p>
          <div className="grid">
            <div className="card">
              <h3><span className="glyph">◈</span> the struct family</h3>
              <p>crashtest, packstruct, poststruct, eyestruct, govstruct, and more - each a site built from this rig, each advertising its own package on npm.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">◆</span> the engines</h3>
              <p>The rig depends on two, and neither depends on the rig: <code>prestruct</code> (prerender + hydrate) and <code>freestruct</code> (the docs SEO layer). The dependency points one way.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">▦</span> monoforge + railyard</h3>
              <p>monoforge stamps any fleet repo from proven blocks; railyard composes the forges into one service. coreforge is a species they build with, not a competitor.</p>
            </div>
          </div>
          <div className="cta-row" style={{ marginTop: 22 }}>
            <a className="btn btn-ghost" href={`${site.docs.url}/cli/`}>The CLI verbs</a>
            <a className="btn btn-ghost" href={`${site.docs.url}/`}>The docs rig</a>
            <a className="btn btn-ghost" href={site.repo}>MANIFEST + receipts</a>
          </div>
        </div>
      </section>

      {/* ---- final CTA ------------------------------------------------- */}
      <section className="band band-cta">
        <div className="wrap">
          <h2>Ship a real site. Keep one brand file.</h2>
          <p className="sub">
            One command to a prerendered landing, a searchable docs rig, and the
            CI that keeps them honest. {site.license}-licensed; the gates run on
            every publish.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={`${site.docs.url}/cli/`}>Read the on-ramp</a>
            <a className="btn btn-ghost" href={site.npm}>npm i {site.name}</a>
            <a className="btn btn-ghost" href={site.repo}>GitHub</a>
          </div>
        </div>
      </section>
    </>
  )
}
