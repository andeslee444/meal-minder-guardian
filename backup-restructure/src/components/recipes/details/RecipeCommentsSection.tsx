import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import RecipeCommentsList from './RecipeCommentsList';
import RecipeCommentForm from './RecipeCommentForm';
import { RecipeComment } from '@/types/recipe';

interface RecipeCommentsSectionProps {
  comments: RecipeComment[];
  isLoadingComments: boolean;
  onAddComment: (content: string) => Promise<void>;
}

const RecipeCommentsSection: React.FC<RecipeCommentsSectionProps> = ({
  comments,
  isLoadingComments,
  onAddComment,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle comment submission
  const handleSubmitComment = async (content: string) => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(content);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <MessageSquare className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
      </div>

      <Separator className="mb-4" />

      <RecipeCommentForm onSubmit={handleSubmitComment} isSubmitting={isSubmitting} />

      <RecipeCommentsList comments={comments} isLoading={isLoadingComments} />
    </div>
  );
};

export default RecipeCommentsSection;
