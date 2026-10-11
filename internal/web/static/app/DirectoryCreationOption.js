import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks'
import { apiFetch } from './api.js'

// Consent belongs to one preview of one input, never to a later path edit.
export function DirectoryCreationOption({ path, refresh, onChange }) {
  const [result, setResult] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    setResult(null)
    setChecked(false)
    onChange(null)
    if (!path) return
    const timer = setTimeout(async () => {
      try {
        const preview = await apiFetch('GET', '/api/session-directory?path=' + encodeURIComponent(path))
        if (active) setResult({ inputPath: path, ...preview })
      } catch (err) {
        if (active) setResult({ inputPath: path, error: err.message })
      }
    }, 200)
    return () => { active = false; clearTimeout(timer) }
  }, [path, refresh, onChange])

  if (!result || result.inputPath !== path) return null
  if (result.error) return html`<div role="status">${result.error}</div>`
  if (!result.missing.length) return null

  function choose(e) {
    setChecked(e.target.checked)
    onChange(e.target.checked ? result : null)
  }

  return html`
    <div role="status">
      <div>Folder does not exist.</div>
      <label style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
        <input type="checkbox" checked=${checked} onChange=${choose} style="width: auto;"/>
        Create this folder
      </label>
      <div>Directories to create:</div>
      <ul>${result.missing.map(dir => html`<li key=${dir}><code>${dir}</code></li>`)}</ul>
    </div>
  `
}
