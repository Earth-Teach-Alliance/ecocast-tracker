import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CommentSection({ fieldNoteId, fieldNoteAuthor }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadComments();
    loadUser();
  }, [fieldNoteId]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadComments = async () => {
    const data = await base44.entities.Comment.filter(
      { field_note_id: fieldNoteId },
      "-created_date"
    );
    setComments(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Comment.create({
        field_note_id: fieldNoteId,
        content: newComment,
        user_name: user.full_name || user.email
      });

      // Create notification for field note author
      if (fieldNoteAuthor !== user.email) {
        await base44.entities.Notification.create({
          user_email: fieldNoteAuthor,
          type: "comment",
          content: `${user.full_name || user.email} commented on your field note`,
          related_id: fieldNoteId,
          from_user: user.email
        });
      }

      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="border-t border-cyan-900/30 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-cyan-400" />
        <h4 className="text-lg font-semibold text-white">
          Comments ({comments.length})
        </h4>
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="bg-cyan-900/20 text-white border-cyan-700 mb-2"
            rows={2}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-cyan-600 hover:bg-cyan-700"
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-cyan-900/10 rounded-lg p-3 border border-cyan-900/30"
          >
            <div className="flex items-start justify-between mb-2">
              <Link
                to={`${createPageUrl("Profile")}?email=${encodeURIComponent(comment.created_by)}`}
                className="font-semibold text-cyan-300 hover:text-cyan-100"
              >
                {comment.user_name || comment.created_by}
              </Link>
              <span className="text-xs text-cyan-500">
                {format(new Date(comment.created_date), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="text-cyan-100 text-sm">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-cyan-400 py-4 text-sm">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}