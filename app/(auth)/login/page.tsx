"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Impossible d'envoyer le lien. Verifiez votre email.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">SnapShop</h1>
          <p className="text-muted-foreground text-sm">
            Click & Collect pour votre commerce
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">📧</div>
              <h2 className="text-lg font-semibold">Verifiez vos emails</h2>
              <p className="text-sm text-muted-foreground">
                Un lien de connexion a ete envoye a{" "}
                <strong>{email}</strong>
              </p>
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => setSent(false)}
              >
                Utiliser une autre adresse
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="marie@boulangerie.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="h-12 text-base"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? "Envoi..." : "Recevoir le lien de connexion"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Pas de mot de passe. On vous envoie un lien magique.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
