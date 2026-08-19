"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { generateApiToken, getApiTokens, revokeApiToken } from "@/app/actions/tokens";
import { toast } from "sonner";
import { Trash2, Copy } from "lucide-react";

export function SettingsPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [newTokenStr, setNewTokenStr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    const data = await getApiTokens();
    setTokens(data);
  };

  const handleGenerateToken = async () => {
    try {
      setIsLoading(true);
      const res = await generateApiToken("Automation Bot Token");
      setNewTokenStr(res.token);
      await fetchTokens();
      toast.success("Token generated successfully!");
    } catch (e: any) {
      toast.error("Failed to generate token. Are you logged in?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Are you sure you want to revoke this token? Your bot will immediately lose access.")) {
      try {
        await revokeApiToken(id);
        setNewTokenStr(null);
        await fetchTokens();
        toast.success("Token revoked!");
      } catch (e: any) {
        toast.error("Failed to revoke token");
      }
    }
  };

  const copyToClipboard = () => {
    if (newTokenStr) {
      navigator.clipboard.writeText(newTokenStr);
      toast.success("Copied to clipboard!");
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to completely reset all application data? This action cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application data and preferences."
      />

      <div className="max-w-3xl space-y-6">
        
        {/* API Tokens Section */}
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-foreground">Bot Automation Tokens</h3>
          <p className="text-sm text-text-secondary mt-1 mb-6">
            Generate Personal Access Tokens to connect your farming bots to Heian Tactics. 
            <strong className="text-red-400 block mt-2">⚠️ DO NOT SHARE THESE TOKENS! Anyone with this token can write data to your account.</strong>
          </p>

          {newTokenStr && (
            <div className="mb-6 p-4 border border-green-500/30 bg-green-500/10 rounded-md">
              <p className="text-sm font-bold text-green-400 mb-2">New Token Generated!</p>
              <p className="text-xs text-text-secondary mb-3">Copy this token now. You will not be able to see it again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background border border-border-ink text-accent-gold font-mono text-sm break-all">
                  {newTokenStr}
                </code>
                <Button variant="outline" onClick={copyToClipboard} className="shrink-0 gap-2">
                  <Copy size={16} /> Copy
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {tokens.length === 0 ? (
              <p className="text-sm text-text-secondary italic">No active tokens.</p>
            ) : (
              tokens.map(token => (
                <div key={token.id} className="flex items-center justify-between p-3 border border-border-ink bg-background rounded">
                  <div>
                    <p className="font-bold text-sm text-foreground">{token.name}</p>
                    <p className="text-xs text-text-secondary font-mono">
                      Created: {new Date(token.createdAt).toLocaleDateString()} 
                      {token.lastUsedAt && ` • Last Used: ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleRevoke(token.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button onClick={handleGenerateToken} disabled={isLoading} className="bg-accent-gold text-background hover:bg-yellow-600 font-bold">
            Generate New Token
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold ink text-red-500">Danger Zone</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">
            Permanently delete all your local planning data, rosters, projects, and activities.
          </p>
          <Button variant="destructive" onClick={handleReset}>
            Reset All Application Data
          </Button>
        </div>

      </div>
    </div>
  );
}