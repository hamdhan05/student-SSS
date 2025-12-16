const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up automated screenshot capture...\n');

// Install Playwright
console.log('📦 Installing Playwright...');
try {
  execSync('npm install -D @playwright/test playwright ts-node @types/node', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✓ Playwright installed\n');
} catch (error) {
  console.error('❌ Failed to install Playwright:', error.message);
  process.exit(1);
}

// Install Playwright browsers
console.log('🌐 Installing browser binaries...');
try {
  execSync('npx playwright install chromium', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✓ Browser installed\n');
} catch (error) {
  console.error('❌ Failed to install browsers:', error.message);
  process.exit(1);
}

// Create tsconfig for scripts if it doesn't exist
const tsconfigPath = path.join(process.cwd(), 'scripts', 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  const tsconfig = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "lib": ["ES2020"],
      "outDir": "./dist",
      "rootDir": ".",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "moduleResolution": "node"
    },
    "include": ["**/*.ts"],
    "exclude": ["node_modules", "dist"]
  };
  
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('✓ Created tsconfig.json for scripts\n');
}

console.log('✅ Setup complete!\n');
console.log('📝 Next steps:');
console.log('1. Start your dev server: npm run dev');
console.log('2. Run screenshot capture: npm run capture-screenshots');
console.log('3. Generate PDF: npm run generate-pdf\n');
