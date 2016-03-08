# Experimenter Addons

A shared home for all of our shared addons

# Installation

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
cd lib
git submodule init
git submodule update
cd exp-models
npm install
```

## Development

If your work requires that you make changes to one of the exp-addon modules you can use `npm link` for
local development. This allows you to make changes to the code without having to push to github. To do
this:

```bash
cd ext/exp-addons/exp-player
npm link
cd ../../..
npm link exp-player
```

Any changes made in exp-player (except adding files, in which case you may need to relink the module) should
now be automagically reflected in the consuming project.

### COS is Hiring!

Want to help save science? Want to get paid to develop free, open source software? [Check out our openings!](http://cos.io/jobs)
