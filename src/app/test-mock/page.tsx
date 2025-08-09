"use client";

import { useState } from "react";
import ClearMockDataButton from "@/components/ClearMockDataButton";

export default function TestMockPage() {
  const [testResult, setTestResult] = useState<string>("");

  const verifyDatabase = async () => {
    try {
      setTestResult("Verifying database...");

      const response = await fetch("/api/verify-db");
      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  const testVariantStorage = async () => {
    try {
      setTestResult("Testing variant storage...");

      // Test the variant storage functionality
      const response = await fetch("/api/test-variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testVariants: [
            {
              id: "test_variant_1",
              audioUrl: "https://test.com/audio1.mp3",
              streamAudioUrl: "https://test.com/stream1",
              imageUrl: "https://test.com/image1.jpeg",
              prompt: "Test lyrics",
              modelName: "test-model",
              title: "Test Song",
              tags: "test",
              createTime: new Date().toISOString(),
              duration: 180,
            },
          ],
          selectedVariant: 0,
          addToLibrary: true,
        }),
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  const testDirectVariantStorage = async () => {
    try {
      setTestResult("Testing direct variant storage...");

      const response = await fetch("/api/verify-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: 1, // Use an existing song ID
          testVariants: [
            {
              id: "direct_test_variant_1",
              audioUrl: "https://test.com/direct_audio1.mp3",
              streamAudioUrl: "https://test.com/direct_stream1",
              imageUrl: "https://test.com/direct_image1.jpeg",
              prompt: "Direct test lyrics",
              modelName: "direct-test-model",
              title: "Direct Test Song",
              tags: "direct-test",
              createTime: new Date().toISOString(),
              duration: 180,
            },
          ],
        }),
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Mock Data
          </h1>

          <div className="space-y-4">
            <button
              onClick={verifyDatabase}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Verify Database
            </button>

            <button
              onClick={testVariantStorage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Test Variant Storage
            </button>

            <button
              onClick={testDirectVariantStorage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Test Direct Variant Storage
            </button>

            <ClearMockDataButton />

            {testResult && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Test Result:
                </h3>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
