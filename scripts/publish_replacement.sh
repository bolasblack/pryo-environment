#!/usr/bin/env bash

REPO_URL="git@github.com:pryojs/environment.git"
BRANCH="replacement"
WORK_TREE=".publish-$BRANCH"
GIT_DIR=".publish-git-$BRANCH"
GIT="git --git-dir=$GIT_DIR --work-tree=$WORK_TREE"

cd $(git rev-parse --show-toplevel)

test=<<EOF
if [ ! -d $GIT_DIR ]; then
  git clone --bare --depth=1 --branch=$BRANCH $REPO_URL $GIT_DIR
fi

$GIT fetch origin
$GIT reset --hard
EOF

PACK_FILE="pryo-environment.tgz"
echo $SCRIPT
yarn pack -f $PACK_FILE
tar -z --strip-components=1 --one-top-level=$WORK_TREE -xf $PACK_FILE
node -e "
const pkg = require('./$WORK_TREE/package.json');
pkg.name = 'yeoman-environment';
pkg.version = pkg.replaceVersion;
console.log('pkg', pkg);
fs.writeFileSync('$WORK_TREE/package.json', JSON.stringify(pkg));
"

exit

if [ -n "$($GIT status -s)" ]; then
  $GIT add -A
  $GIT commit -m "$(date --rfc-3339 seconds) $(git show -s --format=%s HEAD)"
  $GIT push origin $BRANCH
fi
