# Experimenter Addons

A shared home for all of our shared addons

# Installation

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

## Development

To install locally without publishing these addons, `cd` into that addon directory and:

Locally link the module:
* `npm link`

And in the app you want to install the addon:
* `npm link exp-player`

And in your package.json add:
```json
{
  ...
  "dependencies": {
    "exp-player": "latest"
  }
}
```

__NOTE__: You will not be able to run `npm install` with these entries in your package.json. Until we find a workaround:

1. remove the linked modules from package.json
2. `npm install`
3. re-add the removed modules

:hearts: apologies in advance :hearts:

---

The linked package should automagically be updated in the destination project, but if you add
more files to the addon project, you may need to rerun the `npm link` process.

