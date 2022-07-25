/* eslint-disable @typescript-eslint/no-explicit-any */

import { Octokit } from 'octokit'
type OctokitType = InstanceType<typeof Octokit>

// helper
export type ArrayInnerType<T extends any[]> = T extends Array<infer Inner> ? Inner : never

type IssueArrayBySearch = Awaited<
  ReturnType<OctokitType['rest']['search']['issuesAndPullRequests']>
>['data']['items']
export type IssueBySearch = ArrayInnerType<IssueArrayBySearch>

type IssueArrayByList = Awaited<ReturnType<OctokitType['rest']['issues']['listForRepo']>>['data']
export type IssueByList = ArrayInnerType<IssueArrayByList>

// 使用 search
export type Issue = IssueBySearch | IssueByList
