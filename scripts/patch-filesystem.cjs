const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/@capacitor/filesystem/android/src/main/kotlin/com/capacitorjs/plugins/filesystem/LegacyFilesystemImplementation.kt');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('return File(u.path)')) {
    content = content.replace('return File(u.path)', 'return File(u.path ?: "")');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched LegacyFilesystemImplementation.kt');
  } else {
    console.log('LegacyFilesystemImplementation.kt already patched or modified');
  }
} else {
  console.log('LegacyFilesystemImplementation.kt not found');
}
