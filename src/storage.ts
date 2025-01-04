/* eslint-disable @typescript-eslint/no-explicit-any */

import { environment } from '@raycast/api'
import Conf from 'conf'
import type { IssueByList } from './define.js'
import { SearchMode } from './store/state.js'

// dir already namespaced
const BASE_DIR = environment.supportPath
console.log(BASE_DIR)

/**
 * default config
 */

export type DefaultStorage = {
  mode: SearchMode
}

export const storage = new Conf<DefaultStorage>({
  cwd: BASE_DIR,
  configName: 'default',
  defaults: {
    mode: SearchMode.LocalSearch,
  },
})

/**
 * issues cache
 */

export type IssuesCacheData = {
  issues: IssueByList[]
  issuesUpdatedAt?: number
}
export const issuesCacheStorage = new Conf<IssuesCacheData>({
  cwd: BASE_DIR,
  configName: 'issues',
  defaults: {
    issues: [],
  },
})
