import React from 'react';

interface RecipeInstructionsProps {
  instructions: string[];
}

const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ instructions }) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Instructions</h3>
      <ol className="space-y-3 pl-5 list-decimal">
        {instructions.map((step, index) => (
          <li key={index} className="text-sm pl-1 pb-1">
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RecipeInstructions;
