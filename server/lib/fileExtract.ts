// server/lib/fileExtract.ts
import {PDFParse} from 'pdf-parse';

export interface ExtractedFile {
  filename: string;
  content: string;
}

const MAX_CHARS_PER_FILE = 6000; // กันโดน quota ของ Qwen key หมดเร็วเกินไป

export async function extractFileContent(
  file: Express.Multer.File
): Promise<ExtractedFile> {
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  let text = '';

  try {
    if (ext === 'pdf') {
      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      text = result.text;
    } else {
      // .txt / .md — อ่านตรงๆ เป็น utf-8
      text = file.buffer.toString('utf-8');
    }
  } catch (err) {
    console.error(`Failed to extract content from ${file.originalname}:`, err);
    text = '';
  }

  return {
    filename: file.originalname,
    content: text.trim().slice(0, MAX_CHARS_PER_FILE)
  };
}