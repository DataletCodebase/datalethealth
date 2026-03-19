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

        // Need at least: [test name, value]
        if (cells.length < 2) continue;

        const testName = cells[0];
        const valueText = cells[1];

        // ❌ Skip ratio rows (they break creatinine etc.)
        if (testName.includes("ratio")) continue;

        const numericValue = parseFloat(
          valueText.replace(/[^0-9.]/g, "")
        );

        if (isNaN(numericValue)) continue;

        for (const field in medicalFieldMap) {
          for (const keyword of medicalFieldMap[field]) {
            if (testName.includes(keyword)) {
              // ✅ Only set once (don’t overwrite correct value)
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








// import { medicalFieldMap } from "./medicalFieldMap.js";

// export function extractMedicalValuesFromTables(document) {
//   const result = {};

//   const pages = document.pages || [];

//   for (const page of pages) {
//     const tables = page.tables || [];

//     for (const table of tables) {
//       for (const row of table.bodyRows) {
//         const cells = row.cells.map(cell =>
//           cell.layout.textAnchor.textSegments
//             .map(seg => document.text.substring(seg.startIndex || 0, seg.endIndex))
//             .join("")
//             .trim()
//             .toLowerCase()
//         );

//         if (cells.length < 2) continue;

//         const testName = cells[0];
//         const value = cells[1];

//         for (const field in medicalFieldMap) {
//           for (const keyword of medicalFieldMap[field]) {
//             if (testName.includes(keyword)) {
//               const num = parseFloat(value.replace(/[^0-9.]/g, ""));
//               if (!isNaN(num)) {
//                 result[field] = num;
//               }
//             }
//           }
//         }
//       }
//     }
//   }

//   return result;
// }






// import { medicalFieldMap } from "./medicalFieldMap.js";

// export function extractMedicalValues(text) {
//   const result = {};
//   const lowerText = text.toLowerCase();

//   for (const field in medicalFieldMap) {
//     const keywords = medicalFieldMap[field];

//     for (const keyword of keywords) {
//       const regex = new RegExp(
//         `${keyword}\\s*[:\\-]?\\s*([0-9]+\\.?[0-9]*)`,
//         "i"
//       );

//       const match = lowerText.match(regex);

//       if (match) {
//         result[field] = parseFloat(match[1]);
//         break;
//       }
//     }
//   }

//   return result;
// }
