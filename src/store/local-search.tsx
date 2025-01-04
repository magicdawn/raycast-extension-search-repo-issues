/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import ms from 'ms'
import type { IssueByList } from '../define.js'
import { issuesCacheStorage } from '../storage.js'
import { octokit, REPO, toastError } from '../util.js'
import { state } from './state.js'
import pMemoize from 'p-memoize'

const maxAge = ms('1d')

const fetchAllIssues = pMemoize(async () => {
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
  issuesCacheStorage.set({ issues, issuesUpdatedAt: Date.now() })

  // use it
  return issues
})

export async function getAllIssues(force?: boolean): Promise<IssueByList[]> {
  // cache
  const { issues, issuesUpdatedAt } = issuesCacheStorage.store
  const shouldReuse =
    !force && issues.length && issuesUpdatedAt && Date.now() - issuesUpdatedAt < maxAge
  if (shouldReuse) return issues
  return fetchAllIssues()
}

export async function refreshAllIssues(force?: boolean) {
  state.isLoading = true
  try {
    const issues = await getAllIssues(force)
    state.listAllIssues = issues
  } catch (e: any) {
    console.error(e)
    toastError(e.message)
  } finally {
    state.isLoading = false
  }
}
