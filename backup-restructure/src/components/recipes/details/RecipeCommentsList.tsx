import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import RecipeCommentItem from './RecipeCommentItem';
import { RecipeComment } from '@/types/recipe';

interface RecipeCommentsListProps {
  comments: RecipeComment[];
  isLoading: boolean;
}

const RecipeCommentsList: React.FC<RecipeCommentsListProps> = ({ comments, isLoading }) => {
  const [showAllComments, setShowAllComments] = useState(false);

  const displayedComments = showAllComments ? comments : comments.slice(0, 4);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/6" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="space-y-4">
        {displayedComments.map(comment => (
          <RecipeCommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {comments.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground mt-4"
          onClick={() => setShowAllComments(!showAllComments)}
        >
          {showAllComments ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show more ({comments.length - 4} more comments)
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default RecipeCommentsList;
