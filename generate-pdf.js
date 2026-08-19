import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const htmlPath = path.resolve('./report.html').replace(/\\/g, '/');
const pdfPath = path.resolve('./UCS503_Project_Progress_Report_MOM0817.pdf').replace(/\\/g, '/');
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const cmd = `"${edgePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath}"`;

console.log("Running command:", cmd);

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error("Error generating PDF:", err);
    return;
  }
  console.log("Stdout:", stdout);
  console.log("Stderr:", stderr);

  setTimeout(() => {
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`✅ SUCCESS: PDF generated at ${pdfPath} (${stats.size} bytes)`);
    } else {
      console.error("❌ PDF file not found!");
    }
  }, 1000);
});
