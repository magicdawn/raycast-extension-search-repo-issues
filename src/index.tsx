/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import './typings/index.d.ts'
import './typings/valtio.d.ts'

import { Action, ActionPanel, Icon, List } from '@raycast/api'
import { useMount } from 'ahooks'
import { useSnapshot } from 'valtio'
import type { Issue } from './define.js'
import type { SearchMode } from './store/index.js'
import { refreshAllIssues, state, webSearchIssues } from './store/index.js'
import { REPO } from './util.js'

console.log(process.versions)

function stringifyLabels(labels: Issue['labels']) {
  return (labels || [])
    .map((l) => (typeof l === 'string' ? l : l.name))
    .filter(Boolean)
    .join(', ')
}

const onAppMount = () => {
  if (state.mode === 'web-search') {
    return webSearchIssues('')
  }
  if (state.mode === 'local-search') {
    return refreshAllIssues()
  }
}

const onModeChange = (newMode: SearchMode) => {
  state.mode = newMode
  onAppMount() // re-mount in new mode
}

const onSearchTextChange = (searchText: string) => {
  state.searchText = searchText

  if (state.mode === 'web-search') {
    webSearchIssues(searchText)
  }
  if (state.mode === 'local-search') {
    // noop, use computed
  }
}

const onActionLocalRefreshAllIssues = () => {
  refreshAllIssues(true)
}

const onActionToggleMode = () => {
  const newMode: SearchMode = state.mode === 'local-search' ? 'web-search' : 'local-search'
  onModeChange(newMode)
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

  const issueList = mode === 'local-search' ? localFilteredIssues : searchResultIssues

  const subtitle =
    mode === 'local-search'
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
              key={'local-search' as SearchMode}
              value={'local-search' as SearchMode}
              title={'search with Local fzf filter'}
            />
            <List.Dropdown.Item
              key={'web-search' as SearchMode}
              value={'web-search' as SearchMode}
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
                    {!isLoading && mode === 'local-search' && (
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
                        mode === 'local-search' ? 'GitHub API' : 'Local filter'
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
