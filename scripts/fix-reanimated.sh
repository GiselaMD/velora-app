#!/bin/bash
# scripts/fix-reanimated.sh
# Fix React Native Reanimated setup issues

set -e
echo "🔧 Fixing React Native Reanimated setup..."

# Step 1: Check if we have the correct version of Reanimated
echo "📦 Checking React Native Reanimated version..."
INSTALLED_VERSION=$(npm list react-native-reanimated | grep react-native-reanimated | sed -E 's/.*@([0-9]+\.[0-9]+\.[0-9]+).*/\1/')

if [ -z "$INSTALLED_VERSION" ]; then
  echo "⚠️ React Native Reanimated not found in node_modules. Installing version 3.6.0..."
  npm install react-native-reanimated@3.6.0
else
  echo "✅ Found React Native Reanimated version $INSTALLED_VERSION"
fi

# Step 2: Update babel.config.js
echo "📝 Updating babel.config.js..."
BABEL_CONFIG="babel.config.js"

if [ ! -f "$BABEL_CONFIG" ]; then
  echo "❌ babel.config.js not found!"
  exit 1
fi

# Check if Reanimated plugin is already in babel.config.js
if ! grep -q "react-native-reanimated/plugin" "$BABEL_CONFIG"; then
  echo "📝 Adding Reanimated plugin to babel.config.js..."
  # Create a backup
  cp "$BABEL_CONFIG" "${BABEL_CONFIG}.bak"
  
  # Add the plugin to the plugins array
  if grep -q "plugins: \[\]" "$BABEL_CONFIG"; then
    # Empty plugins array
    sed -i '' 's/plugins: \[\]/plugins: ["react-native-reanimated\/plugin"]/' "$BABEL_CONFIG"
  elif grep -q "plugins: \[" "$BABEL_CONFIG"; then
    # Plugins array with content
    sed -i '' 's/plugins: \[/plugins: ["react-native-reanimated\/plugin", /' "$BABEL_CONFIG"
  else
    # No plugins array found, add it
    sed -i '' 's/presets: \[[^]]*\]/presets: [&], plugins: ["react-native-reanimated\/plugin"]/' "$BABEL_CONFIG"
  fi
else
  echo "✅ Reanimated plugin already in babel.config.js"
fi

echo "✅ Setup complete! Now run:"
echo "1. npm run clean"
echo "2. npm run prebuild"
echo "3. npm run ios"
echo "4. Navigate to the 'minimal-test' screen in your app"