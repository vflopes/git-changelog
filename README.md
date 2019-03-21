# git-changelog

Do you ever wanted a tool to standardize your git commits? Also to generate the changelog based on commits? Here is **git-changelog**. This is a NodeJS project but we provide standalone builds that enhances the `git commit` command. You can use `git changelog` as you use `git commit` with the same arguments, except `-m`.



-----------------------------

### Installation

Go to releases

-----------------------------

### Customization

```json
{
	changelogFilename:'CHANGELOG.md',
	changelogTemplate:'default',
	commitTemplate:'karma',
	types:{
		feat:'new feature for the user, not a new feature for build script',
		fix:'bug fix for the user, not a fix to a build script',
		docs:'changes to the documentation',
		style:'formatting, missing semi colons, etc; no production code change',
		refactor:'refactoring production code, eg. renaming a variable',
		test:'adding missing tests, refactoring tests; no production code change',
		chore:'updating grunt tasks etc; no production code change'
	},
	scopes:[],
	labels:[
		'action',
		'version'
	],
	beforeCommit:[],
	afterCommit:[]
}
```