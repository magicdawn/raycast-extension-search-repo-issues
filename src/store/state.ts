/* eslint-disable @typescript-eslint/no-explicit-any */

import { Fzf } from 'fzf'
import { proxyWithComputed } from 'valtio/utils'
import { IssueByList, IssueBySearch } from '../define'

export type Mode = 'web-search' | 'local-search'

export const state = proxyWithComputed(
  {
    isLoading: false,
    mode: 'local-search' as Mode,
    searchText: '',

    // web search
    searchResultTotalCount: undefined as number | undefined,
    searchResultIssues: [] as IssueBySearch[],

    // local search
    listAllIssues: [] as IssueByList[],
  },
  {
    // local search
    localFilteredIssues: ({ mode, listAllIssues: allIssues, searchText }) => {
      if (mode === 'web-search' || !searchText) return allIssues

      const fzf = new Fzf<IssueByList[]>(allIssues as any, {
        selector: (issue) =>
          [
            issue.title,
            issue.body,
            ...(issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name)),
          ]
            .filter(Boolean)
            .join(' '),
      })
      const result = fzf.find(searchText)
      const list = result.map((resultItem) => resultItem.item)
      return list
    },
  }
)
