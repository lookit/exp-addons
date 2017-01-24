# Experimenter Addons

A shared home for all of our shared addons

# Installation

Before beginning, you will need to install [Yarn](https://yarnpkg.com/en/docs/install), a package manager (like npm). 


## Install the submodule:

This repo module should included as a submodule in the Ember project where you want to use these addons.
An example setup might be:
```
/<ember-project>
  /ext
    /exp-addons
  /app
    ...    
```

And the corresponding package.json entries are:

```json
{
  ...,
  "dependencies": {
    "exp-player": "file:./ext/exp-addons/exp-player",
    "exp-models": "file:./ext/exp-addons/exp-models"
  }
}

```

For example:

```bash
cd lib && \
git submodule init && \
git submodule update && \
cd exp-models && \
yarn install --pure-lockfile
```

## Development

If your work requires that you make changes to one of the exp-addon modules you can use `yarn link` for
local development. This allows you to make changes to the code without having to push to github. To do
this:

```bash
ROOT=`git rev-parse --show-toplevel`
cd $ROOT/ext/exp-addons/exp-player && \
yarn link && \
cd $ROOT/ext/exp-addons/exp-models && \
yarn link && \
cd $ROOT && \
yarn link exp-player && \
yarn link exp-models
```

### Adding dependencies on other packages
Sometimes, you will want to install an additional third-party package. In place of npm, this project uses `yarn`. 
Most of the [commands](https://yarnpkg.com/en/docs/managing-dependencies) are the same, but this alternative tool 
provides a way for two developers to guarantee they are using the same versions of underlying code. (by running 
`yarn install --pure-lockfile`) This can help avoid a situation where things break unexpectedly when run on a different 
computer.

Whenever you choose to update your dependencies (`yarn add x` or `yarn install`), make sure that code still runs, then
be sure to [commit](https://yarnpkg.com/en/docs/yarn-lock) the modified `yarn.lock` file, which represents the "current 
known working state" for your app. 


Any changes made in exp-player (except adding files, in which case you may need to relink the module) should
now be automagically reflected in the consuming project.

### COS is Hiring!

Want to help save science? Want to get paid to develop free, open source software? [Check out our openings!](http://cos.io/jobs)
