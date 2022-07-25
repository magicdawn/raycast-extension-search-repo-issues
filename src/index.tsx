/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Action, ActionPanel, Icon, List } from '@raycast/api'
import { useMount } from 'ahooks'
import { useSnapshot } from 'valtio'
import { Issue, IssueByList } from './define'
import { state, Mode, refreshAllIssues, webSearchIssues } from './store'
import { REPO } from './util'

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

const onModeChange = (newMode: Mode) => {
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
  const newMode: Mode = state.mode === 'local-search' ? 'web-search' : 'local-search'
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

  const issueList =
    mode === 'local-search' ? (localFilteredIssues as IssueByList[]) : searchResultIssues

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
            onModeChange(newValue as Mode)
          }}
        >
          <List.Dropdown.Section title='搜索类型'>
            <List.Dropdown.Item
              key={'local-search' as Mode}
              value={'local-search' as Mode}
              title={'search with Local fzf filter'}
            />
            <List.Dropdown.Item
              key={'web-search' as Mode}
              value={'web-search' as Mode}
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
              accessoryTitle={stringifyLabels(issue.labels)}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser title='打开' url={issue.html_url} />
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
