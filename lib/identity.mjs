// lib/identity.mjs - validate the shape of the one identity file.
//
// site.config.js is authored once and read everywhere, so a malformed field
// there travels into every generated surface before anything notices. The
// load-bearing case is `docs.host`: docs/_config.yml's `url` and
// freestruct.config.yml's `site.url` take it verbatim, and the docs lane's
// strict link check reads a scheme-less `host/path` href as a RELATIVE path -
// so a missing scheme turns every internal doc link into a broken one at
// deploy time, far from the typo that caused it. Validate at the authoring
// point so the failure names the field and the fix.
//
// Both `coreforge create` (the answers it was handed) and `coreforge sync`
// (the committed config) call this, so the invariant holds on the way in and
// on every regeneration.

const isOrigin = (v) => typeof v === 'string' && /^https?:\/\/[^\s/]+$/.test(v)
const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\/[^\s]+$/.test(v)

// Returns an array of human-readable errors (empty = valid).
export function validateIdentity(site) {
  const errors = []
  if (!isHttpUrl(site.url)) {
    errors.push(`url must be an absolute http(s) URL, got ${JSON.stringify(site.url)}`)
  }
  if (!isOrigin(site.docs?.host)) {
    errors.push(
      `docs.host must be an absolute http(s) origin with no path, got ${JSON.stringify(site.docs?.host)} - ` +
        `e.g. https://docs.example.org (a missing scheme makes the docs lane read every internal link as a relative path)`
    )
  }
  if (!isHttpUrl(site.docs?.url)) {
    errors.push(`docs.url must be an absolute http(s) URL, got ${JSON.stringify(site.docs?.url)}`)
  }
  if (!/^\//.test(String(site.docs?.baseurl ?? ''))) {
    errors.push(`docs.baseurl must start with "/", got ${JSON.stringify(site.docs?.baseurl)}`)
  }
  return errors
}
