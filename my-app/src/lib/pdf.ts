import pdf from 'pdf-parse';

/**
 * Extracts text content from a PDF file buffer
 * @param buffer - The PDF file as a Buffer
 * @returns Promise<string> - The extracted text content
 * @throws Error if PDF parsing fails
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    
    // Clean up the extracted text by removing excessive whitespace and line breaks
    const cleanedText = data.text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('PDF appears to be empty or contains no readable text');
    }

    return cleanedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    } else {
      throw new Error('Failed to parse PDF: Unknown error occurred');
    }
  }
}

/**
 * Validates if a file is a valid PDF based on its buffer content
 * @param buffer - The file buffer to validate
 * @returns boolean - True if the file appears to be a valid PDF
 */
export function isValidPDF(buffer: Buffer): boolean {
  // Check for PDF magic number (PDF files start with %PDF-)
  const pdfHeader = buffer.slice(0, 5).toString();
  return pdfHeader === '%PDF-';
}

/**
 * Gets a summary of the PDF content including page count and text length
 * @param buffer - The PDF file as a Buffer
 * @returns Promise<{pageCount: number, textLength: number, preview: string}>
 */
export async function getPDFSummary(buffer: Buffer): Promise<{
  pageCount: number;
  textLength: number;
  preview: string;
}> {
  try {
    const data = await pdf(buffer);
    const cleanedText = data.text.replace(/\s+/g, ' ').trim();
    
    return {
      pageCount: data.numpages,
      textLength: cleanedText.length,
      preview: cleanedText.substring(0, 200) + (cleanedText.length > 200 ? '...' : '')
    };
  } catch (error) {
    throw new Error('Failed to get PDF summary');
  }
}