/* eslint-disable @typescript-eslint/no-explicit-any */

import { Fzf } from 'fzf'
import { useMemo } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { IssueByList, IssueBySearch } from '../define.js'

export type Mode = 'web-search' | 'local-search'

export const state = proxy({
  isLoading: false,
  mode: 'local-search' as Mode,
  searchText: '',

  // web search
  searchResultTotalCount: undefined as number | undefined,
  searchResultIssues: [] as IssueBySearch[],

  // local search
  listAllIssues: [] as IssueByList[],
  // local search
  get localFilteredIssues() {
    const { mode, listAllIssues, searchText } = this
    return filterIssues(
      mode,
      searchText,
      listAllIssues /* force remove readonly */ as IssueByList[]
    )
  },
})

function filterIssues(mode: Mode, searchText: string, listAllIssues: IssueByList[]): IssueByList[] {
  console.log('runing filterIssues: mode:"%s" searchText:"%s"', mode, searchText)

  if (mode === 'web-search' || !searchText) return listAllIssues

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
