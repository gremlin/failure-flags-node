# Copyright 2023 Gremlin, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

.PHONY:
test:
	npm run test

.PHONY:
# Sets package.json's version from the pushed release tag (e.g. VERSION=v1.2.3 or 1.2.3).
# The committed version field is a placeholder only - the git tag is authoritative.
set-version:
	npm version "$(patsubst v%,%,$(VERSION))" --no-git-tag-version --allow-same-version

publish:
	npm publish --access public
