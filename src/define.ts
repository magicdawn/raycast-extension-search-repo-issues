/* eslint-disable @typescript-eslint/no-explicit-any */

import { Octokit } from 'octokit'
type OctokitType = InstanceType<typeof Octokit>

// helper
export type ArrayInnerType<T extends any[]> = T extends Array<infer Inner> ? Inner : never

export type IssueBySearch = ArrayInnerType<
  Awaited<ReturnType<OctokitType['rest']['search']['issuesAndPullRequests']>>['data']['items']
>

export type IssueByList = ArrayInnerType<
  Awaited<ReturnType<OctokitType['rest']['issues']['listForRepo']>>['data']
>

// 使用 search
export type Issue = IssueBySearch | IssueByList
