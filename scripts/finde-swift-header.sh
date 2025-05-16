#!/bin/bash
# scripts/find-swift-header.sh
# This script finds the correct Swift header name for your app

# Navigate to the iOS directory
cd ios

# Get the app name from the xcodeproj directory
APP_NAME=$(ls -d *.xcodeproj | sed 's/\.xcodeproj//')
echo "📱 App name appears to be: $APP_NAME"

# Check for Swift header variations
echo "🔍 Checking for Swift header files:"

# Check in the standard Xcode build directory
BUILD_DIR="DerivedData"
if [ -d "$BUILD_DIR" ]; then
  echo "  Checking in $BUILD_DIR..."
  find "$BUILD_DIR" -name "*-Swift.h" -print
fi

# Check in the Pods directory
if [ -d "Pods" ]; then
  echo "  Checking in Pods..."
  find "Pods" -name "*-Swift.h" -print
fi

# Check in the project directory itself
echo "  Checking in project directory..."
find . -maxdepth 3 -name "*-Swift.h" -print

echo "✅ Check complete. If any headers were found, use that name in VeloraPoseEstimation.m"
echo "Example: #import \"FOUND_NAME.h\""