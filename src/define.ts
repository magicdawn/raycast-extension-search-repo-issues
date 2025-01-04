/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Octokit } from 'octokit'
type OctokitType = InstanceType<typeof Octokit>

export type IssueBySearch = Awaited<
  ReturnType<OctokitType['rest']['search']['issuesAndPullRequests']>
>['data']['items'][number]

export type IssueByList = Awaited<
  ReturnType<OctokitType['rest']['issues']['listForRepo']>
>['data'][number]

// 使用 search
export type Issue = IssueBySearch | IssueByList
