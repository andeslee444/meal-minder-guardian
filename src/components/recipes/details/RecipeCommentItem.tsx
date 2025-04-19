import React from 'react';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RecipeComment } from '@/types/recipe';
import { formatDistanceToNow } from 'date-fns';

interface RecipeCommentItemProps {
  comment: RecipeComment;
}

const RecipeCommentItem: React.FC<RecipeCommentItemProps> = ({ comment }) => {
  return (
    <Card className="p-4 transition-all duration-150">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
          <img
            src={
              comment.avatarUrl ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.username}`
            }
            alt={comment.username}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">{comment.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center bg-muted/40 px-2 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 mr-1 text-red-500 fill-red-500" />
              <span className="text-xs font-medium">{comment.likes || 0}</span>
            </div>
          </div>
          <p className="mt-2 text-sm">{comment.content}</p>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCommentItem;
