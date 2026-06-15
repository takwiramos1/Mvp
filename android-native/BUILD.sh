#!/bin/bash
# TuckBook APK Build Script — builds without Gradle or Google SDK downloads
# Requires: aapt, javac, dx, zipalign, apksigner (all in android-sdk apt package)
set -e

ANDROID_SDK=/usr/lib/android-sdk
BUILD_TOOLS=$ANDROID_SDK/build-tools/29.0.3
BUILD_TOOLS_DEB=$ANDROID_SDK/build-tools/debian
PLATFORM=$ANDROID_SDK/platforms/android-23
PROJ=$(dirname "$0")
BUILD=$PROJ/build

echo "🔧 TuckBook APK Build"
echo "================================"

mkdir -p $BUILD/{gen,obj,dex,apk_unsigned}

# 1. Compile resources
echo "→ [1/7] Compiling resources..."
$BUILD_TOOLS/aapt package -f -m \
  -J $BUILD/gen \
  -M $PROJ/app/src/main/AndroidManifest.xml \
  -S $PROJ/app/src/main/res \
  -I $PLATFORM/android.jar

# 2. Compile Java
echo "→ [2/7] Compiling Java..."
find $PROJ/app/src/main/java -name "*.java" > /tmp/tb_sources.txt
echo "$BUILD/gen/com/tuckbook/app/R.java" >> /tmp/tb_sources.txt
javac -source 8 -target 8 \
  -cp $PLATFORM/android.jar \
  -d $BUILD/obj \
  @/tmp/tb_sources.txt

# 3. Convert to DEX
echo "→ [3/7] Converting to DEX bytecode..."
$BUILD_TOOLS_DEB/dx --dex \
  --output=$BUILD/dex/classes.dex \
  $BUILD/obj

# 4. Package APK
echo "→ [4/7] Packaging APK..."
$BUILD_TOOLS/aapt package -f \
  -M $PROJ/app/src/main/AndroidManifest.xml \
  -S $PROJ/app/src/main/res \
  -I $PLATFORM/android.jar \
  -F $BUILD/apk_unsigned/tuckbook-unsigned.apk \
  $BUILD/dex

# 5. Zipalign
echo "→ [5/7] Zipaligning..."
$BUILD_TOOLS/zipalign -f 4 \
  $BUILD/apk_unsigned/tuckbook-unsigned.apk \
  $BUILD/tuckbook-aligned.apk

# 6. Generate keystore (skip if exists)
if [ ! -f $BUILD/tuckbook.keystore ]; then
  echo "→ [6/7] Generating keystore..."
  keytool -genkeypair \
    -keystore $BUILD/tuckbook.keystore \
    -alias tuckbook -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass tuckbook123 -keypass tuckbook123 \
    -dname "CN=TuckBook, OU=App, O=TuckBook, L=Harare, S=Harare, C=ZW" \
    2>/dev/null
else
  echo "→ [6/7] Using existing keystore"
fi

# 7. Sign APK
echo "→ [7/7] Signing APK..."
java -jar $BUILD_TOOLS_DEB/apksigner.jar sign \
  --ks $BUILD/tuckbook.keystore \
  --ks-key-alias tuckbook \
  --ks-pass pass:tuckbook123 \
  --key-pass pass:tuckbook123 \
  --out $BUILD/tuckbook-release.apk \
  $BUILD/tuckbook-aligned.apk

# Verify
java -jar $BUILD_TOOLS_DEB/apksigner.jar verify $BUILD/tuckbook-release.apk

echo ""
echo "✅ BUILD COMPLETE"
echo "   APK: $BUILD/tuckbook-release.apk"
echo "   Size: $(du -h $BUILD/tuckbook-release.apk | cut -f1)"
echo ""
echo "📱 Install on device:"
echo "   adb install $BUILD/tuckbook-release.apk"
