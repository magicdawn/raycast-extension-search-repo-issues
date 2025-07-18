import Fuse from 'fuse.js'
import { isEqual, pick } from 'es-toolkit'
import { useMemo } from 'react'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import type { IssueByList, IssueBySearch } from '../define.js'
import type { DefaultStorage } from '../storage.js'
import { storage } from '../storage.js'
import { SearchMode } from '../enums/SearchMode.js'

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
    return filterIssues(mode, searchText, listAllIssues /* force remove readonly */ as IssueByList[])
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

function filterIssues(mode: SearchMode, searchText: string, listAllIssues: IssueByList[]): IssueByList[] {
  console.log('runing filterIssues: mode:"%s" searchText:"%s"', mode, searchText)

  if (mode === SearchMode.WebSearch || !searchText) return listAllIssues

  function useFuse() {
    const fuse = new Fuse<IssueByList>(listAllIssues, {
      includeScore: true,
      keys: [
        { name: 'title', weight: 10 },
        { name: 'body', weight: 1 },
        {
          name: 'labels',
          weight: 0.5,
          getFn(issue) {
            return (issue.labels || [])
              .map((l) => (typeof l === 'string' ? l : l.name))
              .map((x) => x?.trim())
              .filter(Boolean)
          },
        },
      ],
    })
    const result = fuse.search(searchText)
    const list = result.map((resultItem) => resultItem.item)
    return list
  }

  return useFuse()
}

// useMemo for computed, example
export function useLocalFilteredIssues() {
  const { mode, listAllIssues, searchText } = useSnapshot(state)
  return useMemo(() => {
    return filterIssues(mode, searchText, listAllIssues)
  }, [mode, searchText, listAllIssues])
}
