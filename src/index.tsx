/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Action, ActionPanel, Icon, List } from '@raycast/api'
import { useMount } from 'ahooks'
import { useSnapshot } from 'valtio'
import type { Issue } from './define.js'
import { refreshAllIssues, state, webSearchIssues } from './store/index.js'
import { REPO } from './util.js'
import { SearchMode } from './enums/SearchMode.js'

console.log(process.versions)

function stringifyLabels(labels: Issue['labels']) {
  return (labels || [])
    .map((l) => (typeof l === 'string' ? l : l.name))
    .filter(Boolean)
    .join(', ')
}

const onAppMount = () => {
  if (state.mode === SearchMode.WebSearch) {
    return webSearchIssues('')
  }
  if (state.mode === SearchMode.LocalSearch) {
    return refreshAllIssues()
  }
}

const onModeChange = (newMode: SearchMode) => {
  state.mode = newMode
  onAppMount() // re-mount in new mode
}

const onSearchTextChange = (searchText: string) => {
  state.searchText = searchText

  if (state.mode === SearchMode.WebSearch) {
    webSearchIssues(searchText)
  }
  if (state.mode === SearchMode.LocalSearch) {
    // noop, use computed
  }
}

const onActionLocalRefreshAllIssues = () => {
  refreshAllIssues(true)
}

const onActionToggleMode = () => {
  const list = Object.values(SearchMode)
  const currentIndex = list.indexOf(state.mode)
  const next = list[(currentIndex + 1) % list.length] ?? list[0]
  onModeChange(next)
}

export default function Command() {
  useMount(onAppMount)

  const {
    //
    isLoading,
    mode,
    searchResultIssues,
    searchResultTotalCount,
    localFilteredIssues,
  } = useSnapshot(state)

  const issueList = mode === SearchMode.LocalSearch ? localFilteredIssues : searchResultIssues

  const subtitle =
    mode === SearchMode.LocalSearch
      ? `找到 ${issueList.length} 条`
      : searchResultTotalCount === searchResultIssues.length
        ? `找到 ${searchResultIssues.length} 条`
        : `找到 (${searchResultIssues.length}/${searchResultTotalCount}) 条`

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder='搜索 Issue'
      throttle
      onSearchTextChange={onSearchTextChange}
      searchBarAccessory={
        <List.Dropdown
          tooltip='Select Drink Type'
          value={mode}
          onChange={(newValue) => {
            onModeChange(newValue as SearchMode)
          }}
        >
          <List.Dropdown.Section title='搜索类型'>
            <List.Dropdown.Item
              key={SearchMode.LocalSearch as SearchMode}
              value={SearchMode.LocalSearch as SearchMode}
              title={'search with Local fzf filter'}
            />
            <List.Dropdown.Item
              key={SearchMode.WebSearch}
              value={SearchMode.WebSearch}
              title={'search with GitHub API'}
            />
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      <List.Section title='Results' subtitle={subtitle}>
        {issueList.map((issue) => {
          return (
            <List.Item
              key={issue.title}
              title={issue.title}
              subtitle={(issue.body || '').slice(0, 50)}
              accessories={[{ text: stringifyLabels(issue.labels) }]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser title='打开' url={issue.html_url} />
                    <Action.CopyToClipboard title='复制' content={issue.html_url} />
                  </ActionPanel.Section>

                  <ActionPanel.Section>
                    {!isLoading && mode === SearchMode.LocalSearch && (
                      <Action
                        icon={Icon.RotateClockwise}
                        title='刷新 issues (默认缓存一天)'
                        onAction={onActionLocalRefreshAllIssues}
                      />
                    )}
                    <Action.OpenInBrowser
                      icon={Icon.Book}
                      title='打开 Issues 列表'
                      url={`https://github.com/${REPO}/issues`}
                    />
                  </ActionPanel.Section>

                  <ActionPanel.Section>
                    <Action
                      icon={Icon.Switch}
                      title={`切换搜索模式 (to ${
                        mode === SearchMode.LocalSearch ? 'GitHub API' : 'Local filter'
                      })`}
                      onAction={onActionToggleMode}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          )
        })}
      </List.Section>
    </List>
  )
}
