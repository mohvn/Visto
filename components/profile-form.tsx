"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  initialUsername: string;
  initialAvatarUrl: string;
}

export function ProfileForm({
  initialUsername,
  initialAvatarUrl,
}: ProfileFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.profile.update({ username, avatarUrl });
      setMessage("Perfil atualizado!");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao atualizar perfil.";
      setMessage(msg);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Editar perfil</h2>

      {message && (
        <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-sm">
          {message}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Nome de usuário
        </label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="johndoe"
          minLength={3}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="avatar" className="text-sm font-medium">
          URL do avatar
        </label>
        <Input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://exemplo.com/avatar.jpg"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar
      </Button>
    </form>
  );
}
