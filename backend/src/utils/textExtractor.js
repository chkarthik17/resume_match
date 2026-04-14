const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract plain text from a file (PDF or DOCX).
 * @param {string} filePath - Absolute path to the file.
 * @returns {Promise<string>} Extracted text.
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });

    try {
      const data = await parser.getText();
      return data.text;
    } finally {
      await parser.destroy();
    }
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

/**
 * Normalize text: lowercase, collapse whitespace.
 */
function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Split text into lines, removing empty lines.
 */
function getLines(text) {
  return text.split(/\n/).map(l => l.trim()).filter(Boolean);
}

module.exports = { extractText, normalizeText, getLines };
