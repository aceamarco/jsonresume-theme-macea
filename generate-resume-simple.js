const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const RESUME_JSON_URL = 'https://raw.githubusercontent.com/aceamarco/resume/master/resume.json';
const OUTPUT_DIR = 'output';

function downloadResumeJson() {
  console.log('📥 Downloading resume.json from GitHub...');
  
  try {
    // Try curl first (common on macOS/Linux)
    try {
      execSync(`curl -o resume.json "${RESUME_JSON_URL}"`, { stdio: 'inherit' });
      console.log('✅ Successfully downloaded resume.json using curl');
      return;
    } catch (curlError) {
      console.log('curl not available, trying PowerShell...');
    }
    
    // Try PowerShell (Windows)
    try {
      execSync(`powershell -Command "Invoke-WebRequest -Uri '${RESUME_JSON_URL}' -OutFile 'resume.json'"`, { stdio: 'inherit' });
      console.log('✅ Successfully downloaded resume.json using PowerShell');
      return;
    } catch (psError) {
      console.log('PowerShell failed, trying wget...');
    }
    
    // Try wget as fallback
    try {
      execSync(`wget -O resume.json "${RESUME_JSON_URL}"`, { stdio: 'inherit' });
      console.log('✅ Successfully downloaded resume.json using wget');
      return;
    } catch (wgetError) {
      throw new Error('Failed to download resume.json. Please ensure you have curl, PowerShell, or wget available.');
    }
    
  } catch (error) {
    console.error('❌ Error downloading resume.json:', error.message);
    process.exit(1);
  }
}

function generateResume() {
  console.log('🔄 Generating resume with json-resume CLI...');
  
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }
    
    // Check if resume.json exists
    if (!fs.existsSync('resume.json')) {
      throw new Error('resume.json not found. Please ensure the download was successful.');
    }
    
    // Generate HTML resume
    console.log('📄 Generating HTML resume...');
    execSync(`npx resume export ${OUTPUT_DIR}/resume.html --theme .`, { stdio: 'inherit' });
    
    // Generate PDF resume
    console.log('📄 Generating PDF resume...');
    execSync(`npx resume export ${OUTPUT_DIR}/resume.pdf --theme . --format pdf`, { stdio: 'inherit' });
    
    console.log('✅ Resume generated successfully!');
    console.log(`📁 Output files:`);
    console.log(`   - ${OUTPUT_DIR}/resume.html`);
    console.log(`   - ${OUTPUT_DIR}/resume.pdf`);
    
  } catch (error) {
    console.error('❌ Error generating resume:', error.message);
    process.exit(1);
  }
}

function cleanup() {
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync('resume.json')) {
    fs.unlinkSync('resume.json');
  }
}

function main() {
  try {
    console.log('🚀 Starting resume generation process...');
    console.log(`📡 Fetching from: ${RESUME_JSON_URL}`);
    
    downloadResumeJson();
    generateResume();
    cleanup();
    
    console.log('🎉 Resume generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    cleanup();
    process.exit(1);
  }
}

// Run the script
main();

