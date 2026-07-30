"use client";

/**
 * Assistant web — fidélité mobile AssistantPage / AssistantHeroBlock.
 * IA : supabase.functions.invoke("admin-chat") — pas de réponses fictives.
 * Idle actions / suggestions chips : définies mobile mais NON affichées (non portées).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RefreshCw, X } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import AssistantIdleHero, {
  AssistantPupoFloatStyles,
} from "@/components/assistant/AssistantIdleHero";
import AssistantComposer, {
  type AssistantComposerAttachment,
} from "@/components/assistant/AssistantComposer";
import AssistantMascot from "@/components/assistant/AssistantMascot";
import AssistantDocumentPicker from "@/components/assistant/AssistantDocumentPicker";
import { invokeAdminChat, type AdminChatResult } from "@/lib/adminChat";
import { computeAdminScore } from "@/lib/adminScore";
import {
  assistantOutOfScopeReplyText,
  assistantSocialReplyText,
  isSimpleAssistantSocialPrompt,
  shouldDeclineAssistantPrompt,
} from "@/lib/assistantScopeGuard";
import { normCat } from "@/lib/documentCategories";
import { supabase } from "@/lib/supabase";
import {
  PAIPERS_ASSISTANT_CHAT,
  PAIPERS_COLORS,
  PAIPERS_SPACE,
} from "@/lib/paipersTheme";

const STORAGE_KEY = "paipers_assistant_chat_state_v3";
const PRO_PLACEHOLDER =
  "Ex : classe cette facture, active la relance impayée, crée un devis…";
const PERSONAL_PLACEHOLDER = "Que veux-tu que je fasse ?";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachmentTitle?: string;
  documentIds?: string[];
  externalActions?: { label: string; url: string }[];
  sources?: { url: string; title: string | null }[];
  helpActions?: { href: string; label: string }[];
};

type SessionStatus = "idle" | "active";

function mapHelpHref(href: string): string | null {
  // Routes mobile → web existantes uniquement
  if (href.includes("documents")) return "/documents";
  if (href.includes("generer")) return "/generer";
  if (href.includes("profil")) return "/profil";
  if (href.includes("assistant")) return "/assistant";
  if (href.startsWith("/")) return null;
  return null;
}

export default function AssistantPage() {
  const { showProTabs, loaded: spaceLoaded } = useNavSpace();
  const isProMode = showProTabs;

  const [firstName, setFirstName] = useState("toi");
  const [adminScore, setAdminScore] = useState<number | null>(100);
  const [session, setSession] = useState<SessionStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingDots, setThinkingDots] = useState(".");
  const [attachment, setAttachment] = useState<AssistantComposerAttachment | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [restored, setRestored] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const placeholder = isProMode ? PRO_PLACEHOLDER : PERSONAL_PLACEHOLDER;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          session?: SessionStatus;
          messages?: ChatMessage[];
        };
        if (parsed.session === "active" && Array.isArray(parsed.messages) && parsed.messages.length) {
          setSession("active");
          setMessages(parsed.messages);
        }
      }
    } catch {
      /* ignore */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    if (session === "idle" || messages.length === 0) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ session, messages }),
      );
    } catch {
      /* ignore */
    }
  }, [session, messages, restored]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", auth.user.id)
        .single();

      const full = (profile?.full_name || "").trim();
      const first = full.split(/\s+/)[0];
      setFirstName(first || "toi");

      const { count: reviewCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("needs_review", true);

      const { data: readyDocs } = await supabase
        .from("documents")
        .select("category")
        .eq("user_id", auth.user.id)
        .eq("is_ready", true);

      const unfiledCount = (readyDocs || []).filter(
        (d) => normCat((d as { category: string | null }).category) === "autres",
      ).length;

      setAdminScore(
        computeAdminScore({
          reviewCount: reviewCount || 0,
          unfiledCount,
          expiringWithin30Days: 0,
        }),
      );
    };
    void loadProfile();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = window.setInterval(() => {
      setThinkingDots((d) => (d === "." ? ".." : d === ".." ? "..." : "."));
    }, 420);
    return () => window.clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (session === "active" && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, session]);

  const resetConversation = useCallback(() => {
    setSession("idle");
    setMessages([]);
    setInput("");
    setAttachment(null);
    setLoading(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const appendAssistant = (msg: Omit<ChatMessage, "id" | "role">) => {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}-${Math.random()}`, role: "assistant", ...msg },
    ]);
  };

  const submitPrompt = async () => {
    const prompt = input.trim();
    if ((!prompt && !attachment) || loading) return;

    const userText = prompt || "Que peux-tu faire avec ce document ?";
    setInput("");
    setSession("active");
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: "user",
        text: userText,
        attachmentTitle: attachment?.title,
      },
    ]);

    const attachedId = attachment?.documentId;
    setAttachment(null);

    if (isSimpleAssistantSocialPrompt(userText) && !attachedId) {
      appendAssistant({
        text: assistantSocialReplyText(userText, firstName === "toi" ? undefined : firstName),
      });
      return;
    }

    if (shouldDeclineAssistantPrompt(userText) && !attachedId) {
      appendAssistant({ text: assistantOutOfScopeReplyText() });
      return;
    }

    setLoading(true);
    try {
      const result: AdminChatResult = await invokeAdminChat({
        message: userText,
        documentId: attachedId,
      });
      appendAssistant({
        text: result.answer,
        documentIds: result.documentIds,
        externalActions: result.externalActions,
        sources: result.sources,
        helpActions: result.helpActions,
      });
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Je n'ai pas réussi à traiter ta demande. Réessaie dans un instant.";
      appendAssistant({ text: msg });
    } finally {
      setLoading(false);
    }
  };

  const idleVisible = spaceLoaded && session === "idle";

  const headerTitle = useMemo(
    () => (session === "active" ? "Conversation" : "Pupo"),
    [session],
  );

  return (
    <Protected>
      <AppShell>
        <AssistantPupoFloatStyles />
        <div
          className="md:max-w-[1100px]"
          style={{
            padding: PAIPERS_SPACE.screenPad,
            paddingBottom: 96,
            margin: "0 auto",
            width: "100%",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            background:
              idleVisible ? PAIPERS_COLORS.personalGradientSoftStart : undefined,
            borderRadius: 24,
          }}
        >
          {toast ? (
            <div
              className="paipers-elevated-card"
              style={{
                position: "fixed",
                bottom: 96,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 90,
                padding: "12px 18px",
                fontWeight: 800,
                fontSize: 14,
                maxWidth: "90vw",
              }}
            >
              {toast}
            </div>
          ) : null}

          {!restored ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 240,
              }}
              aria-busy
              aria-label="Chargement"
            >
              <div
                className="assistant-spinner"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: `3px solid ${PAIPERS_COLORS.border}`,
                  borderTopColor: PAIPERS_COLORS.navy,
                }}
              />
            </div>
          ) : idleVisible ? (
            <AssistantIdleHero
              firstName={firstName}
              isProMode={isProMode}
              adminScore={isProMode ? null : adminScore}
              input={input}
              onChangeInput={setInput}
              onSubmit={() => void submitPrompt()}
              loading={loading}
              placeholder={placeholder}
              attachment={attachment}
              onRemoveAttachment={() => setAttachment(null)}
              onAttachClick={() => setPickerOpen(true)}
              onOpenPriorities={() =>
                showToast("Voir mes priorités : non disponible sur le web pour le moment.")
              }
            />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {headerTitle}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={resetConversation}
                    aria-label="Nouvelle conversation"
                    style={{
                      border: `1px solid ${PAIPERS_COLORS.border}`,
                      background: "#fff",
                      borderRadius: 999,
                      width: 40,
                      height: 40,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={18} color={PAIPERS_COLORS.navy} />
                  </button>
                  <button
                    type="button"
                    onClick={resetConversation}
                    aria-label="Fermer la conversation"
                    style={{
                      border: `1px solid ${PAIPERS_COLORS.border}`,
                      background: "#fff",
                      borderRadius: 999,
                      width: 40,
                      height: 40,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} color={PAIPERS_COLORS.navy} />
                  </button>
                </div>
              </div>

              <div
                ref={listRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  paddingBottom: 16,
                  minHeight: 280,
                  maxHeight: "calc(100vh - 260px)",
                }}
              >
                {messages.map((m) =>
                  m.role === "user" ? (
                    <UserBubble key={m.id} text={m.text} attachmentTitle={m.attachmentTitle} />
                  ) : (
                    <AssistantBubble key={m.id} message={m} />
                  ),
                )}
                {loading ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <AssistantMascot size={42} variant="avatar" />
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        padding: "12px 14px",
                        border: `1px solid ${PAIPERS_COLORS.border}`,
                        boxShadow: "-2px 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14 }}>
                        Paipers reflechit{thinkingDots}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <AssistantComposer
                  value={input}
                  onChange={setInput}
                  onSubmit={() => void submitPrompt()}
                  loading={loading}
                  placeholder="Écris ton message..."
                  variant="compact"
                  attachment={attachment}
                  onRemoveAttachment={() => setAttachment(null)}
                  onAttachClick={() => setPickerOpen(true)}
                />
              </div>
            </>
          )}

          <AssistantDocumentPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={(doc) =>
              setAttachment({ documentId: doc.documentId, title: doc.title })
            }
          />
        </div>
      </AppShell>
    </Protected>
  );
}

function UserBubble({
  text,
  attachmentTitle,
}: {
  text: string;
  attachmentTitle?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          maxWidth: "90%",
          background: PAIPERS_ASSISTANT_CHAT.userBubbleBg,
          color: PAIPERS_ASSISTANT_CHAT.userBubbleText,
          borderRadius: 16,
          padding: "12px 14px",
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 500,
        }}
      >
        {attachmentTitle ? (
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              fontWeight: 700,
              opacity: 0.85,
            }}
          >
            📎 {attachmentTitle}
          </p>
        ) : null}
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <AssistantMascot size={42} variant="avatar" />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "95%" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "12px 14px",
            border: `1px solid ${PAIPERS_COLORS.border}`,
            boxShadow: "-2px 2px 8px rgba(0,0,0,0.06)",
            fontSize: 14,
            lineHeight: "20px",
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.text}</p>
        </div>

        {message.documentIds && message.documentIds.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {message.documentIds.map((id) => (
              <Link
                key={id}
                href={`/documents/view?id=${id}`}
                style={{
                  display: "inline-flex",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: PAIPERS_ASSISTANT_CHAT.actionButtonBg,
                  color: PAIPERS_ASSISTANT_CHAT.actionButtonText,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Ouvrir le document
              </Link>
            ))}
          </div>
        ) : null}

        {message.externalActions && message.externalActions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {message.externalActions.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: PAIPERS_ASSISTANT_CHAT.actionButtonBg,
                  color: PAIPERS_ASSISTANT_CHAT.actionButtonText,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                {a.label}
              </a>
            ))}
          </div>
        ) : null}

        {message.sources && message.sources.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {message.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="paipers-text-muted"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {s.title || s.url}
              </a>
            ))}
          </div>
        ) : null}

        {message.helpActions && message.helpActions.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {message.helpActions.map((a) => {
              const webHref = mapHelpHref(a.href);
              if (!webHref) {
                return (
                  <span
                    key={`${a.href}-${a.label}`}
                    className="paipers-text-muted"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: `1px solid ${PAIPERS_COLORS.border}`,
                    }}
                    title="Lien mobile non porté sur le web"
                  >
                    {a.label}
                  </span>
                );
              }
              return (
                <Link
                  key={`${a.href}-${a.label}`}
                  href={webHref}
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "8px 10px",
                    borderRadius: 999,
                    background: PAIPERS_ASSISTANT_CHAT.actionButtonBg,
                    color: PAIPERS_ASSISTANT_CHAT.actionButtonText,
                    textDecoration: "none",
                  }}
                >
                  {a.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
