/**
 * pages/Home.jsx - the shell's placeholder landing. Replace the copy, keep
 * the structure: usePageMeta lives in the component BODY (calling it inside
 * another effect was an invalid hook call - React #321 tore the tree down on
 * the live crashtest site; transcribed fix, see labs/TASKS.md), the .code
 * pre carries the token classes the docs Rouge output shares (.k/.cm), and
 * CTAs compose .btn + a color modifier (the base class carries geometry).
 */
import usePageMeta from '../hooks/usePageMeta.js'
import site, { routeMeta } from '../site.js'

export default function Home() {
  const meta = routeMeta('/')
  usePageMeta({ siteUrl: site.url, path: '/', title: meta.title, description: meta.description })
  return (
    <section className="hero">
      <div className="wrap">
        <p className="eyebrow">{site.name} shell</p>
        <h1>
          One repo, every site:{' '}
          <span className="accent">one brand file, zero drift.</span>
        </h1>
        <p className="lede">
          This is the coreforge rig: a landing site, a docs site, and the CI/release
          plumbing that keeps them honest, all driven from one brand file. Edit that one
          file and every surface follows - replace the tokens, the nav vocabulary, and the
          copy, and the shell carries the paid-for correctness (prerender, hydration
          parity, light/dark switch, search, pagefind, deploy workflows).
        </p>
        <div className="cta-row">
          <a className="btn btn-primary" href={site.repo}>See the repo</a>
          <a className="btn btn-ghost" href={`${site.docs.url}/`}>Read the docs</a>
        </div>
        <pre className="code"><span className="cm"># 60 seconds - the shell is real pages, not a prototype</span>{'\n'}npx <span className="k">prestruct</span> <span className="k">build</span>{'\n'}<span className="cm"># {'>'} dist/, one directory per route, hydrates with zero mismatch</span></pre>
      </div>
    </section>
  )
}
