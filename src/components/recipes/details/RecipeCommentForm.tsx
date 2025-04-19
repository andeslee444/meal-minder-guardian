import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export interface RecipeCommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

const RecipeCommentForm: React.FC<RecipeCommentFormProps> = ({ onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onSubmit(content);
      setContent(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="mb-2 min-h-[100px]"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default RecipeCommentForm;
