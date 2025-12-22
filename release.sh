#!/bin/bash

# Quick Release Script für PflegeDMS
# Erstellt automatisch ein neues Release mit allen Installern

set -e

echo "🚀 Starting PflegeDMS Release Process..."

# Prüfe ob we're auf main branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
    echo "❌ Error: Must be on 'main' branch. Current: $current_branch"
    exit 1
fi

# Prüfe ob changes existieren
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Uncommitted changes exist. Commit or stash them first."
    git status --porcelain
    exit 1
fi

echo "📦 Bumping version..."
# Erhöhe Version automatisch (patch, minor, oder major)
version_type=${1:-"patch"}
npm version $version_type --no-git-tag-version

# Lese neue Version
new_version=$(node -p "require('./package.json').version")
echo "🆕 New version: $new_version"

echo "💾 Committing version bump..."
git add package.json package-lock.json
git commit -m "Bump version to $new_version"

echo "📤 Pushing to main..."
git push origin main

echo "🏷️  Creating tag v$new_version..."
git tag "v$new_version"

echo "📤 Pushing tag to trigger release..."
git push origin "v$new_version"

echo "✅ Release v$new_version triggered! GitHub Actions will now build all installers."
echo "⏱️  Check the Actions tab in ~5 minutes for build progress."
echo ""
echo "📦 Expected artifacts:"
echo "   • Windows: .exe installers"
echo "   • macOS: .dmg and .zip"
echo "   • Linux: .AppImage and .deb"
echo ""
echo "🔗 Go to GitHub Releases to download when done."