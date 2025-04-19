import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { testDalleImageGeneration } from '../../services/image/dalleService';

interface TestResult {
  title: string;
  tags: string[];
  success: boolean;
  imageUrl: string | null;
  error?: string;
}

export function DalleTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testCases = [
    {
      title: 'Classic Chocolate Cake',
      tags: ['dessert', 'baking', 'chocolate'],
    },
    {
      title: 'Fresh Mediterranean Salad',
      tags: ['healthy', 'vegetarian', 'salad'],
    },
    {
      title: 'Spicy Chicken Curry',
      tags: ['indian', 'spicy', 'dinner'],
    },
    {
      title:
        'Very Long Recipe Title That Might Cause Issues With DALL-E API Limits And Should Be Truncated',
      tags: ['test', 'long-title'],
    },
    {
      title: 'Special Characters! @#$%^&*()',
      tags: ['test', 'special-chars'],
    },
  ];

  const runTest = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      const newResults: TestResult[] = [];

      for (const testCase of testCases) {
        try {
          const imageUrl = await testDalleImageGeneration(testCase.title, testCase.tags);
          newResults.push({
            ...testCase,
            success: !!imageUrl,
            imageUrl,
          });
        } catch (error) {
          newResults.push({
            ...testCase,
            success: false,
            imageUrl: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Update results after each test case
        setResults([...newResults]);
      }
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">DALL-E Image Generation Test</h2>
      </div>
      <div className="mb-4">
        <Button onClick={runTest} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run DALL-E Tests'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className={result.success ? 'text-green-500' : 'text-red-500'}>
                  {result.success ? '✓' : '✗'}
                </span>
                <span>{result.title}</span>
                {result.error && <span className="text-red-500 text-sm">({result.error})</span>}
                {result.imageUrl && (
                  <a
                    href={result.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Image
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
