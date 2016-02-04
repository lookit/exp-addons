# Exp-player

An Ember addon for the Experimenter player. This repo will eventually include:

- the core exp-player component
- exp- components to be used with the player

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

Use the exp-player like: `{{exp-player frames=[...]}}`
      
## Frame development

This addon includes blueprints for creating frames. If you want to create a frame in the shared addon project use:

`ember g addon-exp-frame exp-<name>`

otherwise to generate a project-specific frame use:

`ember g exp-frame exp-<name>`

which will create a new component and corresponding template for the new frame.


## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
