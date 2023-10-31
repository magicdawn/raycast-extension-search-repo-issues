/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import ms from 'ms'
import reusePromiseExports from 'reuse-promise'
import { IssueByList } from '../define.js'
import { store } from '../storage.js'
import { octokit, REPO, toastError } from '../util.js'
import { state } from './state.js'

const reusePromise = reusePromiseExports.default

const maxAge = ms('1d')

export async function getAllIssues(force?: boolean): Promise<IssueByList[]> {
  // cache
  {
    if (!force) {
      const { issues, issuesUpdatedAt } = store.store
      if (issues.length && issuesUpdatedAt && Date.now() - issuesUpdatedAt < maxAge) {
        return issues
      }
    }
  }

  const [owner, repo] = REPO.split('/')

  const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    per_page: 100,
  })

  let issues: IssueByList[] = []
  for await (const res of iterator) {
    const currentIssues = res.data
    issues = issues.concat(currentIssues)
    console.log('currentIssues=%s issues=%s', currentIssues.length, issues.length)
  }

  issues = issues.filter((issue) => {
    if (issue.pull_request) return false
    if (issue.state === 'closed') return false
    return true
  })

  // persist
  store.set({ issues, issuesUpdatedAt: Date.now() })

  // use it
  return issues
}

export const getIssuesReused = reusePromise(getAllIssues)

export async function refreshAllIssues(force?: boolean) {
  state.isLoading = true
  try {
    const issues = await getIssuesReused(force)
    state.listAllIssues = issues
  } catch (e: any) {
    console.error(e)
    toastError(e.message)
  } finally {
    state.isLoading = false
  }
}
