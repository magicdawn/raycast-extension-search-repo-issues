/* eslint-disable @typescript-eslint/no-explicit-any */

import { IssueBySearch } from '../define'
import { octokit, REPO, toastError } from '../util'
import { state } from './state'

let abortControler: AbortController | undefined
export async function webSearchIssues(searchText: string) {
  state.searchText = searchText
  state.isLoading = true

  // abort existing
  abortControler?.abort()
  abortControler = new AbortController()

  try {
    const ret = await webSearchIssueRequest(searchText, abortControler.signal)
    if (ret) {
      state.searchResultTotalCount = ret.totalCount
      state.searchResultIssues = ret.issues
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // err
    console.error(err)
    toastError(err.message || err)
  } finally {
    // do not set isLoading adter onsolete request
    if (searchText === state.searchText) {
      state.isLoading = false
    }
  }
}

type Ret = { totalCount: number; issues: IssueBySearch[] }
const cache: Record<string, Ret> = {}

/**
 * 带缓存的 issue 搜索
 * https://docs.github.com/cn/search-github/searching-on-github/searching-issues-and-pull-requests
 */

async function webSearchIssueRequest(searchText: string, signal: AbortSignal) {
  if (cache[searchText]?.issues?.length) {
    return cache[searchText]
  }

  let ret: Ret | undefined = undefined
  try {
    const json = await octokit.rest.search.issuesAndPullRequests({
      request: { signal: signal },
      owner: 'magicdawn',
      repo: 'magicdawn',
      q: `${searchText} type:issue state:open repo:${REPO}`,
      sort: 'updated',
    })

    const { total_count: totalCount, items } = json.data
    ret = { totalCount, issues: items }
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return
    } else {
      throw e
    }
  }

  // cache
  cache[searchText] = ret
  return ret
}
