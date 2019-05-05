#!/usr/bin/env bash

set -euo pipefail

REPO_URL="git@github.com:pryojs/environment.git"
BRANCH="replacement"
WORK_TREE=".publish-$BRANCH"
GIT_DIR=".publish-git-$BRANCH"
GIT="git --git-dir=$GIT_DIR --work-tree=$WORK_TREE"

# ========= initialize repo folder =========

cd $(git rev-parse --show-toplevel)

if [ ! -d $GIT_DIR ]; then
  git clone --bare --depth=1 --branch=$BRANCH $REPO_URL $GIT_DIR
fi

$GIT fetch --prune --prune-tags origin

mkdir -p $WORK_TREE
$GIT reset --hard

# ========= check the necessity =========

REPLACE_VERSION=$(node -e "console.log(require('./$WORK_TREE/package.json').replaceVersion)")

GIT_TAG="yeoman-environment-$REPLACE_VERSION"

if [ -n "$($GIT tag --list $GIT_TAG)" ]; then
  echo "Seems $GIT_TAG already published?"
  # exit 1
fi

# ========= generate files =========

PACK_FILE="pryo-environment.tgz"

yarn pack -f $PACK_FILE

tar -z --strip-components=1 --one-top-level=$WORK_TREE -xf $PACK_FILE

node -e "
const pkg = require('./$WORK_TREE/package.json');
pkg.name = 'yeoman-environment';
pkg.version = pkg.replaceVersion;
fs.writeFileSync('$WORK_TREE/package.json', JSON.stringify(pkg, null, '  '));
"

yarn
rm -rf $WORK_TREE/node_modules
mkdir -p $WORK_TREE/node_modules
cp -r node_modules/yeoman-environment $WORK_TREE/node_modules/

rm $PACK_FILE

exit

# ========= push history =========

if [ -n "$($GIT status -s)" ]; then
  $GIT add -A
  $GIT commit -m "$(date --rfc-3339 seconds) $(git show -s --format=%s HEAD)"
  $GIT tag $GIT_TAG
  $GIT push origin $BRANCH
  $GIT push origin $BRANCH --tags
fi
