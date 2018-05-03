invoke-loader
==

Webpack loader, which invokes another loader with given options.

```js
import html from '!invoke-loader?loader=skeleton-loader&option=./path/to/my/options.js!raw-loader!./index.html'
```

Beta!
--

The tool is at the beta testing stage.

Author and license
--

Morulus <vladimirmorulus@gmail.com>

Under [MIT](./LICENSE) license, 2018

See also
--

- [git-commits-loader](https://github.com/morulus/git-commits-loader) Collect information about file commits
- [markdown-heading-loader](https://github.com/morulus/markdown-heading-loader) Just get primary heading of markdown document
- [markdown-feat-react-loader](https://github.com/morulus/markdown-feat-react-loader) Use React components directly in markdown
