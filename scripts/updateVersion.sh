#!/bin/bash

# Extract the current version from package.json
current_version=$(node -p "require('./package.json').version")

# Extract the major, minor, and patch parts of the version
major=$(echo "$current_version" | cut -d. -f1)
minor=$(echo "$current_version" | cut -d. -f2)
patch=$(echo "$current_version" | cut -d. -f3)

# Increment the patch level
patch=$((patch + 1))

# Construct the new version number
new_version="$major.$minor.$patch"

# Update the package version
npm version "$new_version"

# Amend the commit message with the updated version
git commit --amend -m "chore: v$new_version"
