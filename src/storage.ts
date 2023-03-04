/* eslint-disable @typescript-eslint/no-explicit-any */

import { environment } from '@raycast/api'
import Conf from 'conf'
import { IssueByList } from './define'

// dir already namespaced
const BASE_DIR = environment.supportPath
console.log(BASE_DIR)

type Data = {
  issues: IssueByList[]
  issuesUpdatedAt?: number
}
const defaultData: Data = {
  issues: [],
}

// schema
export const store = new Conf<Data>({
  cwd: BASE_DIR,
  defaults: defaultData,
})
