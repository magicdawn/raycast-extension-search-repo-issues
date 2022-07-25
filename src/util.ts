import { getPreferenceValues, showToast, Toast } from '@raycast/api'
import { Agent } from 'http'
import { Octokit } from 'octokit'
import ProxyAgent from 'proxy-agent-tweak'

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
  httpProxy?: string
}

const pref = getPreferenceValues<Preferences>()
const { repo, ghToken, httpProxy } = pref
console.log('[pref] = %O', pref)

export const REPO = repo || ''

let agent: Agent | undefined
if (httpProxy) {
  agent = ProxyAgent(httpProxy)
}

export const octokit = new Octokit({
  auth: ghToken || undefined,
  request: {
    agent,
  },
})
