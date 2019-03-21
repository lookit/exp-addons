# Experimenter Addons

*This repo is deprecated.* It has been merged into 
[ember-lookit-frameplayer](https://github.com/lookit/ember-lookit-frameplayer), and 
definitions of specific frames for use in Lookit experiments are now defined there along
with the frame player. 

To use with old versions of ember-lookit-frameplayer that have exp-addons as a subrepo, 
you will need to include exp-addons as a subrepo in the `lib` directory, install 
dependencies via yarn and bower, and use yarn link if working locally so that your updates
are reflected.

```bash
cd lib
git submodule init
git submodule update
cd exp-player
yarn install --pure-lockfile
bower install
yarn link
cd ../..
yarn link exp-player
```

This repo contained documentation of components generated using YUIdoc (`yarn run docs`).