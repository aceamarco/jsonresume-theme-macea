const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const RESUME_JSON_URL = 'https://raw.githubusercontent.com/aceamarco/resume/master/resume.json';
const RESUME_JSON_FILE = 'resume.json';
const OUTPUT_DIR = 'output';

async function fetchResumeJson() {
  console.log('📥 Fetching resume.json from GitHub...');
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(RESUME_JSON_FILE);
    
    https.get(RESUME_JSON_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch resume.json: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✅ Successfully downloaded resume.json');
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(RESUME_JSON_FILE, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function generateResume() {
  console.log('🔄 Generating resume with json-resume CLI...');
  
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
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
  if (fs.existsSync(RESUME_JSON_FILE)) {
    fs.unlinkSync(RESUME_JSON_FILE);
  }
}

async function main() {
  try {
    console.log('🚀 Starting resume generation process...');
    console.log(`📡 Fetching from: ${RESUME_JSON_URL}`);
    
    await fetchResumeJson();
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

