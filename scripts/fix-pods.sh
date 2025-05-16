#!/bin/bash
# scripts/fix-pods.sh
# Fix ReactAppDependencyProvider issue and install pods

# Print commands as they're executed
set -x

# Check if iOS directory exists
if [ ! -d "ios" ]; then
  echo "❌ iOS directory not found. Running prebuild first..."
  npx expo prebuild --platform ios
fi

# Navigate to iOS directory
cd ios

# Create backup of original Podfile
cp Podfile Podfile.bak
echo "✅ Created backup of Podfile at ios/Podfile.bak"

# Check if source line exists and add it if not
if ! grep -q "source 'https://github.com/CocoaPods/Specs.git'" Podfile; then
  echo "Adding CocoaPods source to Podfile..."
  sed -i '' 's/platform :ios.*/&\nsource '"'"'https:\/\/github.com\/CocoaPods\/Specs.git'"'"'/' Podfile
fi

# Make sure MediaPipe is added correctly
if ! grep -q "pod 'MediaPipeTasksVision'" Podfile; then
  echo "Adding MediaPipe to Podfile..."
  sed -i '' '/target '"'"'veloraapp'"'"' do/a\'$'\n''  # MediaPipe dependency for pose estimation'$'\n''  pod '"'"'MediaPipeTasksVision'"'"', '"'"'0.10.12'"'"''$'\n' Podfile
fi

# Ensure we have the build settings in post_install
if ! grep -q "config.build_settings" Podfile; then
  sed -i '' '/post_install do |installer|/a\'$'\n''    # Set build settings for Swift and MediaPipe'$'\n''    installer.pods_project.targets.each do |target|'$'\n''      target.build_configurations.each do |config|'$'\n''        config.build_settings['"'"'SWIFT_VERSION'"'"'] = '"'"'5.0'"'"''$'\n''        config.build_settings['"'"'CLANG_ENABLE_MODULES'"'"'] = '"'"'YES'"'"''$'\n''        config.build_settings['"'"'ENABLE_BITCODE'"'"'] = '"'"'NO'"'"''$'\n''      end'$'\n''    end'$'\n' Podfile
fi

# Update repos and clean cache
echo "Updating CocoaPods repos and cleaning cache..."
pod repo update
pod cache clean --all

# Deintegrate and reinstall pods
echo "Removing Pods directory and Podfile.lock..."
rm -rf Pods
rm -f Podfile.lock

# Install pods with verbose output
echo "Installing pods..."
pod install --verbose

# Return to project root
cd ..

echo "✅ Pods have been updated. Now running setup script..."
node scripts/setup-native.js

echo "✅ All done! You can now run your app with:"
echo "npx expo run:ios"