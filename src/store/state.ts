/* eslint-disable @typescript-eslint/no-explicit-any */

import { Fzf } from 'fzf'
import { isEqual, pick } from 'lodash-es'
import { useMemo } from 'react'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import type { IssueByList, IssueBySearch } from '../define.js'
import type { DefaultStorage } from '../storage.js'
import { storage } from '../storage.js'

export enum SearchMode {
  WebSearch = 'web-search',
  LocalSearch = 'local-search',
}

const { mode } = storage.store
export const state = proxy({
  isLoading: false,
  mode,
  searchText: '',

  // web search
  searchResultTotalCount: undefined as number | undefined,
  searchResultIssues: [] as IssueBySearch[],

  /**
   * local search
   */
  listAllIssues: [] as IssueByList[],
  get localFilteredIssues() {
    const { mode, listAllIssues, searchText } = this
    return filterIssues(
      mode,
      searchText,
      listAllIssues /* force remove readonly */ as IssueByList[],
    )
  },
})

/**
 * persist when needed
 */
let lastPicked: Partial<DefaultStorage> | undefined
subscribe(state, () => {
  const picked = pick(snapshot(state), ['mode']) as Partial<DefaultStorage>
  if (!lastPicked || !isEqual(lastPicked, picked)) {
    storage.set(picked)
  }
  lastPicked = picked
})

function filterIssues(
  mode: SearchMode,
  searchText: string,
  listAllIssues: IssueByList[],
): IssueByList[] {
  console.log('runing filterIssues: mode:"%s" searchText:"%s"', mode, searchText)

  if (mode === SearchMode.WebSearch || !searchText) return listAllIssues

  const fzf = new Fzf<IssueByList[]>(listAllIssues, {
    selector: (issue: IssueByList) =>
      [
        issue.title,
        issue.body,
        ...(issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name)),
      ]
        .filter(Boolean)
        .join(' '),
  })
  const result = fzf.find(searchText)
  const list = result.map((resultItem: any) => resultItem.item)
  return list
}

// useMemo for computed, example
export function useLocalFilteredIssues() {
  const { mode, listAllIssues, searchText } = useSnapshot(state)
  return useMemo(() => {
    return filterIssues(mode, searchText, listAllIssues)
  }, [mode, searchText, listAllIssues])
}
