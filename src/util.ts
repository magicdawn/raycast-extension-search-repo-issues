import { getPreferenceValues, showToast, Toast } from '@raycast/api'
import { Octokit } from 'octokit'

export function toastError(message: string, title = 'Error') {
  return showToast({
    style: Toast.Style.Failure,
    title,
    message,
  })
}

interface Preferences {
  repo: string
  ghToken?: string
}

const pref = getPreferenceValues<Preferences>()
const { repo, ghToken } = pref
console.log('[pref] = %O', pref)

export const REPO = repo || ''

export const octokit = new Octokit({
  auth: ghToken || undefined,
  request: {
    // agent,
  },
})
