import fs from "fs";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

const client = new DocumentProcessorServiceClient({
  keyFilename: "key.json", // path to your service account key
  apiEndpoint: "us-documentai.googleapis.com"
});

const projectId = "ocr-test-project-485613";
const location = "us";
// const processorId = "259d9f8f9ec2abba";
const processorId = "792e505733bb0556";

export async function runOCR(filePath) {
  const file = fs.readFileSync(filePath);

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const [result] = await client.processDocument({
    name,
    rawDocument: {
      content: file,
      mimeType: "image/jpeg"
    }
  });

  // return result.document.text;
  return result.document;
}
