#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ['node_modules', 'dist', '.git', 'coverage', 'logs'];
const CODE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.json'];

function shouldIncludeFile(filename) {
  const ext = path.extname(filename);
  return CODE_EXTENSIONS.includes(ext);
}

function countLinesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function analyzeDirectory(dirPath, stats = { files: 0, lines: 0, byExtension: {} }) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(entry.name)) {
        analyzeDirectory(fullPath, stats);
      }
    } else if (entry.isFile() && shouldIncludeFile(entry.name)) {
      const ext = path.extname(entry.name);
      const lines = countLinesInFile(fullPath);
      
      stats.files++;
      stats.lines += lines;
      stats.byExtension[ext] = (stats.byExtension[ext] || 0) + lines;
    }
  }

  return stats;
}

function analyzePackages() {
  const packagesDir = path.join(__dirname, 'packages');
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  console.log('📊 Project Statistics\n');
  console.log('=' .repeat(60));

  let totalFiles = 0;
  let totalLines = 0;
  const totalByExtension = {};
  const packageStats = [];

  for (const pkg of packages) {
    const pkgPath = path.join(packagesDir, pkg);
    const stats = analyzeDirectory(pkgPath);
    
    totalFiles += stats.files;
    totalLines += stats.lines;
    
    for (const [ext, lines] of Object.entries(stats.byExtension)) {
      totalByExtension[ext] = (totalByExtension[ext] || 0) + lines;
    }

    packageStats.push({ name: pkg, ...stats });
  }

  // Print per-package stats
  console.log('\n📦 Per Package:');
  packageStats
    .sort((a, b) => b.lines - a.lines)
    .forEach(pkg => {
      console.log(`\n  ${pkg.name}:`);
      console.log(`    Files: ${pkg.files}`);
      console.log(`    Lines: ${pkg.lines.toLocaleString()}`);
      
      const topExts = Object.entries(pkg.byExtension)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (topExts.length > 0) {
        console.log(`    Top: ${topExts.map(([ext, lines]) => `${ext}(${lines})`).join(', ')}`);
      }
    });

  // Print totals
  console.log('\n' + '=' .repeat(60));
  console.log('\n✨ Total:');
  console.log(`    Files: ${totalFiles}`);
  console.log(`    Lines: ${totalLines.toLocaleString()}`);
  
  console.log('\n📝 By Extension:');
  Object.entries(totalByExtension)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, lines]) => {
      const percentage = ((lines / totalLines) * 100).toFixed(1);
      console.log(`    ${ext}: ${lines.toLocaleString()} (${percentage}%)`);
    });

  console.log('\n' + '=' .repeat(60));
}

analyzePackages();
