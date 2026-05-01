import { medicalFieldMap } from "./medicalFieldMap.js";

/**
 * Helper: extract visible text from a cell using textAnchor
 */
function getTextFromAnchor(anchor, fullText) {
  let text = "";
  if (!anchor || !anchor.textSegments) return text;

  for (const seg of anchor.textSegments) {
    text += fullText.substring(
      parseInt(seg.startIndex || 0),
      parseInt(seg.endIndex)
    );
  }

  return text.trim();
}

/**
 * Strategy 1: Extract from Document AI Tables
 */
export function extractMedicalValuesFromTables(document) {
  const result = {};
  const fullText = document.text || "";
  const pages = document.pages || [];

  for (const page of pages) {
    const tables = page.tables || [];
    for (const table of tables) {
      for (const row of table.bodyRows || []) {
        const cells = row.cells.map(cell =>
          getTextFromAnchor(cell.layout.textAnchor, fullText)
            .toLowerCase()
            .trim()
        );

        if (cells.length < 2) continue;

        const testName = cells[0];
        const valueText = cells[1];

        if (testName.includes("ratio")) continue;

        const numericValue = parseFloat(valueText.replace(/[^0-9.]/g, ""));
        if (isNaN(numericValue)) continue;

        for (const field in medicalFieldMap) {
          for (const keyword of medicalFieldMap[field]) {
            if (testName.includes(keyword)) {
              if (result[field] === undefined) {
                result[field] = numericValue;
              }
            }
          }
        }
      }
    }
  }
  return result;
}

/**
 * Strategy 2: Extract from raw text using regex (Fallback)
 */
export function extractMedicalValuesFromText(text) {
  const result = {};
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  for (const field in medicalFieldMap) {
    const keywords = medicalFieldMap[field];

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        if (line.includes(lowerKeyword)) {
          console.log(`[DEBUG] Found keyword "${keyword}" on line ${i}: "${lines[i]}"`);
          
          // Pattern A: Keyword followed by number (same line)
          // We look for the first number that isn't part of a range like (0.5-1.5)
          // But actually, the first number is usually the result.
          const matches = lines[i].match(/(\d+\.?\d*)/g);
          if (matches) {
            // If multiple numbers, try to pick the one that looks like a result
            // (not at the end of a range or inside parentheses if possible)
            let val = parseFloat(matches[0]);
            
            // If the line has something like "1.2 (0.5-1.5)", matches[0] is 1.2. Correct.
            // If " (0.5-1.5) 1.2", matches[0] is 0.5. We might want matches[2].
            if (lines[i].includes("(") && lines[i].indexOf("(") < lines[i].indexOf(matches[0])) {
               // The first number is inside or after a parenthesis? 
               // This is tricky. Let's try to find the one NOT in a range.
               for (const m of matches) {
                 if (!lines[i].includes(`-${m}`) && !lines[i].includes(`${m}-`)) {
                   val = parseFloat(m);
                   break;
                 }
               }
            }

            if (!isNaN(val)) {
                console.log(`[DEBUG] Found same-line value: ${val}`);
                result[field] = val;
                break;
            }
          }
          
          // Pattern B: Keyword on one line, number on NEXT line
          if (i + 1 < lines.length) {
            const nextLine = lines[i+1];
            const nextLineMatch = nextLine.match(/(\d+\.?\d*)/); 
            if (nextLineMatch) {
              const val = parseFloat(nextLineMatch[1]);
              if (!isNaN(val)) {
                console.log(`[DEBUG] Found next-line value: ${val}`);
                result[field] = val;
                break;
              }
            }
          }
          
          // Pattern C: Keyword on one line, number on NEXT NEXT line (skip units)
          if (i + 2 < lines.length) {
            const afterNextLine = lines[i+2];
            const afterNextLineMatch = afterNextLine.match(/(\d+\.?\d*)/);
            if (afterNextLineMatch) {
              const val = parseFloat(afterNextLineMatch[1]);
              if (!isNaN(val)) {
                console.log(`[DEBUG] Found after-next-line value: ${val}`);
                result[field] = val;
                break;
              }
            }
          }
        }
      }
      if (result[field] !== undefined) break;
    }
  }
  return result;
}

/**
 * Main Entry Point: Combined Strategy
 */
export function extractMedicalValues(document) {
  const fullText = document.text || "";
  console.log("--- STARTING COMBINED EXTRACTION ---");
  console.log("Full Text Length:", fullText.length);

  // 1. Try Tables
  let data = extractMedicalValuesFromTables(document);
  console.log("Table Data:", JSON.stringify(data));
  
  // 2. If tables are empty or missing fields, try Text Fallback
  const textData = extractMedicalValuesFromText(fullText);
  console.log("Text Data:", JSON.stringify(textData));
  
  // Merge results
  for (const field in textData) {
    if (data[field] === undefined) {
      data[field] = textData[field];
    }
  }
  
  console.log("Final Merged Data:", JSON.stringify(data));
  return data;
}
