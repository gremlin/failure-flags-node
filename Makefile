.PHONY:
test:
	npm run test

.PHONY:
release-patch:
	npm version patch --git-tag-version
