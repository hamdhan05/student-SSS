const { spawn, execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting automated report generation...\n');
console.log('This will:');
console.log('1. Start the dev server');
console.log('2. Capture all screenshots');
console.log('3. Generate PDF report\n');

let devServer;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServerReady(maxAttempts = 30) {
  const http = require('http');
  
  // Try both ports
  const ports = [3000, 3001, 3002];
  
  for (let i = 0; i < maxAttempts; i++) {
    for (const port of ports) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(`http://localhost:${port}`, (res) => {
            resolve(port);
          });
          req.on('error', reject);
          req.setTimeout(1000);
        });
        console.log(`✅ Server found on port ${port}`);
        process.env.BASE_URL = `http://localhost:${port}`;
        return port;
      } catch (error) {
        // Try next port
      }
    }
    console.log(`Waiting for server... (${i + 1}/${maxAttempts})`);
    await sleep(2000);
  }
  return null;
}

async function main() {
  try {
    // Step 1: Start dev server
    console.log('📦 Starting development server...');
    devServer = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      cwd: process.cwd()
    });

    devServer.stdout.on('data', (data) => {
      console.log(`[Dev Server] ${data.toString().trim()}`);
    });

    devServer.stderr.on('data', (data) => {
      console.error(`[Dev Server Error] ${data.toString().trim()}`);
    });

    // Wait for server to be ready
    console.log('⏳ Waiting for server to start...\n');
    const serverPort = await checkServerReady();
    
    if (!serverPort) {
      console.error('❌ Server failed to start within timeout');
      process.exit(1);
    }
    
    console.log(`✅ Server is ready on port ${serverPort}!\n`);
    await sleep(3000); // Extra wait for full initialization

    // Step 2: Capture screenshots
    console.log('📸 Capturing screenshots...\n');
    execSync('npx ts-node scripts/capture-screenshots.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ Screenshots captured!\n');

    // Step 3: Generate PDF
    console.log('📄 Generating PDF report...\n');
    execSync('node scripts/generate-pdf.js', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n🎉 All done!\n');
    console.log('✅ Screenshots: ./screenshots/');
    console.log('✅ Updated Report: ./PROJECT_REPORT_WITH_SCREENSHOTS.md');
    console.log('✅ PDF Report: ./Project_Report.pdf (if generation succeeded)\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    // Cleanup: Kill dev server
    if (devServer) {
      console.log('\n🛑 Stopping dev server...');
      devServer.kill();
      
      // On Windows, also kill the node process
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${devServer.pid} /T /F`, { stdio: 'ignore' });
        } catch (e) {
          // Ignore errors
        }
      }
    }
    
    process.exit(0);
  }
}

main();
