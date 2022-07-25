# search-specific-issue

search-specific-issue

## use case

I use https://github.com/magicdawn/magicdawn/issues for knowledge management.
with this extension, I can open issue quickly.
But it's not bound to this task.

## usage

### config the extension

- repo in `<username>/<reponame>` format
- ghToken: your personal github token, may reuse the token for `octotree` / `Gitako` Browser extension. or just create a new one, see https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- http proxy: optional, if you need proxy github api calls

![image](https://user-images.githubusercontent.com/4067115/180842596-0e6e00fa-74f1-438f-9e0c-f44138e14f65.png)

### search

![image](https://user-images.githubusercontent.com/4067115/180842832-c70729eb-057e-4360-9d72-a9697f7ce283.png)

Two modes

- local filter: list all issues of the repo conffigured, and filter with local fzf search. initial list all is slow, but have a instant search experience later. (cache for 1d)
- github api search: search via github api every time

## License

the MIT license, http://magicdawn.mit-license.org
