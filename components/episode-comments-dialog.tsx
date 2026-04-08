"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type CommentData } from "@/lib/api";
import type { Episode } from "@/lib/tmdb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Heart,
  Loader2,
  MessageSquare,
  Reply,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeComment extends CommentData {
  replies: TreeComment[];
}

interface EpisodeCommentsDialogProps {
  episode: Episode;
  showId: number;
  showName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isWatched?: boolean;
}

export function EpisodeCommentsDialog({
  episode,
  showId,
  showName,
  open,
  onOpenChange,
  isWatched = false,
}: EpisodeCommentsDialogProps) {
  const [spoilerAccepted, setSpoilerAccepted] = useState(false);
  const [comments, setComments] = useState<TreeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSpoilerAccepted(false);
    } else if (isWatched) {
      setSpoilerAccepted(true);
    }
  }, [open, isWatched]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const { comments: raw, userId: uid } = await api.comments.list(
      showId,
      episode.season_number,
      episode.episode_number
    );
    setUserId(uid);

    const all: TreeComment[] = raw.map((c) => ({ ...c, replies: [] }));
    const byId = new Map<string, TreeComment>();
    const topLevel: TreeComment[] = [];
    for (const c of all) byId.set(c.id, c);
    for (const c of all) {
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies.push(c);
      } else {
        topLevel.push(c);
      }
    }
    setComments(topLevel);
    setLoading(false);
  }, [showId, episode.season_number, episode.episode_number]);

  useEffect(() => {
    if (spoilerAccepted) loadComments();
  }, [spoilerAccepted, loadComments]);

  async function handlePost() {
    if (!newComment.trim() || !userId) return;
    setPosting(true);
    await api.comments.create({
      showId,
      seasonNumber: episode.season_number,
      episodeNumber: episode.episode_number,
      parentId: replyTo?.id ?? null,
      content: newComment.trim(),
    });
    setNewComment("");
    setReplyTo(null);
    setPosting(false);
    await loadComments();
  }

  async function handleLike(commentId: string) {
    if (!userId) return;
    await api.comments.toggleLike(commentId);
    await loadComments();
  }

  async function handleDelete(commentId: string) {
    await api.comments.delete(commentId);
    setDeleteTarget(null);
    await loadComments();
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    return `${Math.floor(days / 30)}m`;
  }

  function CommentItem({ comment, isReply }: { comment: TreeComment; isReply?: boolean }) {
    const displayName = comment.username ?? "Usuário";
    const initial = displayName[0].toUpperCase();
    const isOwn = comment.user_id === userId;

    return (
      <div className={cn("space-y-2", isReply && "ml-10")}>
        <div className="flex gap-2.5">
          <div className={cn(
            "flex shrink-0 items-center justify-center rounded-full font-bold text-xs",
            isReply ? "h-7 w-7" : "h-8 w-8",
            isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            {initial}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{displayName}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            <div className="flex items-center gap-3 pt-0.5">
              <button onClick={() => handleLike(comment.id)}
                className={cn("flex cursor-pointer items-center gap-1 text-xs transition-colors",
                  comment.liked_by_me ? "text-red-400" : "text-muted-foreground hover:text-red-400")}>
                <Heart className={cn("h-3.5 w-3.5", comment.liked_by_me && "fill-red-400")} />
                {comment.likes_count > 0 && comment.likes_count}
              </button>
              {!isReply && (
                <button onClick={() => setReplyTo({ id: comment.id, username: displayName })}
                  className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Reply className="h-3.5 w-3.5" />
                  Responder
                </button>
              )}
              {isOwn && (
                <button onClick={() => setDeleteTarget(comment.id)}
                  className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
        {comment.replies.length > 0 && (
          <div className="space-y-3 pt-1">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[85vh]">
          <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b border-border text-left">
            <p className="text-xs text-muted-foreground">
              {showName} · S{String(episode.season_number).padStart(2, "0")}E
              {String(episode.episode_number).padStart(2, "0")}
            </p>
            <DialogTitle className="text-base leading-tight flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Comentários — {episode.name}
            </DialogTitle>
          </DialogHeader>

          {!spoilerAccepted ? (
            <div className="px-6 py-10 flex flex-col items-center text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <AlertTriangle className="h-7 w-7 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold">Alerta de spoilers</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Os comentários podem conter spoilers sobre este episódio e episódios anteriores.
                  Continue apenas se já assistiu.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Voltar</Button>
                <Button onClick={() => setSpoilerAccepted(true)}>Já assisti, continuar</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-5 min-h-0">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p className="text-sm">Nenhum comentário ainda</p>
                    <p className="text-xs">Seja o primeiro a comentar</p>
                  </div>
                ) : (
                  comments.map((c) => <CommentItem key={c.id} comment={c} />)
                )}
              </div>

              {userId ? (
                <div className="shrink-0 border-t border-border px-6 py-4 space-y-2 bg-background">
                  {replyTo && (
                    <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">
                        Respondendo a{" "}
                        <span className="font-semibold text-foreground">{replyTo.username}</span>
                      </span>
                      <button onClick={() => setReplyTo(null)}
                        className="cursor-pointer text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={replyTo ? `Responder ${replyTo.username}...` : "Escreva um comentário..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="resize-none flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); }
                      }}
                    />
                    <Button onClick={handlePost} disabled={posting || !newComment.trim()}
                      size="icon" className="shrink-0 self-end h-10 w-10 cursor-pointer">
                      {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="shrink-0 border-t border-border px-6 py-4 text-center text-sm text-muted-foreground bg-background">
                  Faça login para comentar
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
