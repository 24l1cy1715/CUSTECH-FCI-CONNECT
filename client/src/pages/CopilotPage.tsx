import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  Briefcase,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { copilotApi, CopilotConversation, CopilotMessage, CopilotUsageStats } from '@/api/copilotApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
  { icon: Briefcase, text: 'What opportunities match my skills?', category: 'Career' },
  { icon: Compass, text: 'What skills should I learn next?', category: 'Skills' },
  { icon: Sparkles, text: 'Help me improve my profile.', category: 'Profile' },
  { icon: Zap, text: 'Find projects I can contribute to.', category: 'Projects' },
  { icon: Bot, text: 'What events should I attend?', category: 'Events' },
  { icon: ShieldCheck, text: 'Help me prepare for an internship.', category: 'Career' },
  { icon: Plus, text: 'Find students with skills complementary to mine.', category: 'Networking' },
  { icon: Compass, text: 'Create a learning roadmap for my goals.', category: 'Roadmap' },
];

export const CopilotPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<CopilotConversation[]>({
    queryKey: ['copilot-conversations'],
    queryFn: copilotApi.getConversations,
    enabled: isAuthenticated,
  });

  // Automatically select the most recent conversation or null
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // 2. Fetch active conversation details
  const {
    data: activeConversation,
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    refetch: refetchConversation,
  } = useQuery<CopilotConversation>({
    queryKey: ['copilot-conversation', activeConversationId],
    queryFn: () => copilotApi.getConversation(activeConversationId!),
    enabled: !!activeConversationId,
  });

  // 3. Fetch usage stats
  const { data: usage } = useQuery<CopilotUsageStats>({
    queryKey: ['copilot-usage'],
    queryFn: copilotApi.getUsage,
    enabled: isAuthenticated,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // 4. Mutations
  const createConversationMutation = useMutation({
    mutationFn: (title?: string) => copilotApi.createConversation(title),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['copilot-conversations'] });
      setActiveConversationId(newConv.id);
      setMobileSidebarOpen(false);
    },
    onError: () => {
      toast.error('Failed to create new conversation');
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => copilotApi.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['copilot-conversations'] });
      if (activeConversationId === deletedId) {
        const remaining = conversations.filter((c) => c.id !== deletedId);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success('Conversation deleted');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ convId, content }: { convId: string; content: string }) => {
      return copilotApi.sendMessage(convId, content);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['copilot-conversation', res.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['copilot-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['copilot-usage'] });
      setInputText('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to generate response. Please try again.';
      toast.error(msg);
    },
  });

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sendMessageMutation.isPending) return;

    if (!activeConversationId) {
      // Create new conversation first
      try {
        const newConv = await copilotApi.createConversation(text.slice(0, 32));
        queryClient.invalidateQueries({ queryKey: ['copilot-conversations'] });
        setActiveConversationId(newConv.id);
        sendMessageMutation.mutate({ convId: newConv.id, content: text });
      } catch {
        toast.error('Unable to initialize session');
      }
      return;
    }

    sendMessageMutation.mutate({ convId: activeConversationId, content: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    if (!activeConversationId) return;
    try {
      await copilotApi.submitFeedback({
        conversationId: activeConversationId,
        messageId,
        rating,
      });
      setFeedbackSubmitted((prev) => ({ ...prev, [messageId]: rating }));
      toast.success(rating === 5 ? 'Thanks for the positive feedback!' : 'Feedback received. We will refine future answers.');
    } catch {
      toast.error('Could not submit feedback');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* ── Top Header Banner ── */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open conversation history"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent/20 to-primary/40 text-accent flex items-center justify-center border border-accent/30 shadow-inner">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-primary dark:text-white">
                FCI Copilot
              </h1>
              <Badge variant="accent" size="sm" className="hidden sm:inline-flex">
                <Sparkles className="w-3 h-3" />
                AI Assistant
              </Badge>
            </div>
            <p className="text-xs text-text-muted hidden sm:block">
              Your personalized academic, technical roadmap &amp; career navigator for CUSTECH FCI.
            </p>
          </div>
        </div>

        {/* Usage quota pill */}
        <div className="flex items-center gap-3">
          {usage && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Daily Limit
              </span>
              <span className="text-xs font-mono font-bold text-accent">
                {usage.remainingToday} / {usage.dailyLimit} remaining
              </span>
            </div>
          )}

          <Button
            variant="accent"
            size="sm"
            onClick={() => createConversationMutation.mutate()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>

      {/* ── Main Workspace Body ── */}
      <div className="flex-1 flex gap-4 overflow-hidden pt-4 relative">
        {/* ── Conversation History Sidebar (Desktop & Mobile Drawer) ── */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface dark:bg-[#0A101D] border-r border-border p-4 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:p-0 lg:border-r-0 lg:bg-transparent ${
            mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pb-3 lg:hidden border-b border-border mb-3">
            <span className="font-bold text-sm text-text">Chat History</span>
            <Button variant="ghost" size="sm" onClick={() => setMobileSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-full flex flex-col space-y-2">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2">
              Recent Conversations
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {isLoadingConversations ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-surface-raised rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-muted">
                  No conversations yet. Start by asking a question!
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveConversationId(c.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                        isActive
                          ? 'bg-accent/15 text-accent font-bold border border-accent/30'
                          : 'text-text-secondary hover:bg-surface-raised hover:text-text'
                      }`}
                    >
                      <span className="truncate flex-1 mr-2">{c.title || 'Untitled Chat'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversationMutation.mutate(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-rose-500 transition-opacity p-1"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Provider indicator */}
            {usage && (
              <div className="p-2.5 rounded-xl bg-surface-raised/70 border border-border text-[11px] text-text-muted space-y-1">
                <div className="flex items-center justify-between">
                  <span>Engine:</span>
                  <span className="font-mono text-accent font-semibold">{usage.activeProvider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Queries:</span>
                  <span className="font-mono">{usage.requestsThisMonth} / {usage.monthlyLimit}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Main Chat Thread & Composer Area ── */}
        <div className="flex-1 flex flex-col bg-surface-raised/40 dark:bg-[#0E1726]/60 border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                <p className="text-xs text-text-muted">Loading your conversation...</p>
              </div>
            ) : isMessagesError ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-sm font-bold text-text">Failed to load conversation</p>
                <Button variant="outline" size="sm" onClick={() => refetchConversation()}>
                  Retry
                </Button>
              </div>
            ) : !activeConversation || !activeConversation.messages || activeConversation.messages.length === 0 ? (
              /* Empty state: Suggestions */
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6 py-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-accent to-amber-500 text-black flex items-center justify-center shadow-lg shadow-accent/20"
                >
                  <Bot className="w-8 h-8" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary dark:text-white">
                    How can I assist your journey in FCI today?
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Ask anything about internships, complementary teammates, skill roadmaps, or improving your digital presence.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                  {SUGGESTED_PROMPTS.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                      <motion.button
                        key={prompt.text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSend(prompt.text)}
                        className="p-3 rounded-xl bg-surface border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left flex items-start gap-3 group"
                      >
                        <div className="p-2 rounded-lg bg-surface-raised text-accent group-hover:scale-105 transition-transform shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {prompt.category}
                          </div>
                          <div className="text-xs font-semibold text-text group-hover:text-accent transition-colors">
                            "{prompt.text}"
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message List */
              activeConversation.messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-primary text-white'
                          : 'bg-accent/20 text-accent border border-accent/40'
                      }`}
                    >
                      {isUser ? user?.email.charAt(0).toUpperCase() || 'U' : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-surface border border-border text-text rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">
                        {message.content}
                      </div>

                      {/* Suggested Action Buttons if present */}
                      {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2 border-t border-border/50">
                          {message.suggestedActions.map((act, idx) => (
                            <a
                              key={idx}
                              href={act.url || '#'}
                              onClick={(e) => {
                                if (!act.url && act.payload?.prompt) {
                                  e.preventDefault();
                                  handleSend(act.payload.prompt);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-accent/15 text-accent hover:bg-accent/25 transition-colors border border-accent/30"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Assistant Message Footer */}
                      {!isUser && (
                        <div className="pt-1.5 flex items-center justify-between text-[10px] text-text-muted border-t border-border/30">
                          <span className="font-mono uppercase">{message.model || 'FCI Engine'}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(message.id, message.content)}
                              className="hover:text-accent transition-colors flex items-center gap-1"
                              title="Copy text"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Copy</span>
                            </button>

                            <button
                              onClick={() => handleFeedback(message.id, 5)}
                              className={`hover:text-emerald-500 transition-colors ${
                                feedbackSubmitted[message.id] === 5 ? 'text-emerald-500' : ''
                              }`}
                              title="Helpful"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleFeedback(message.id, 1)}
                              className={`hover:text-rose-500 transition-colors ${
                                feedbackSubmitted[message.id] === 1 ? 'text-rose-500' : ''
                              }`}
                              title="Not helpful"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Generating response indicator */}
            {sendMessageMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent border border-accent/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-surface border border-border p-3.5 rounded-2xl rounded-tl-none text-xs text-text-muted flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span>FCI Copilot is analyzing your academic profile &amp; generating insights...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Message Composer ── */}
          <div className="p-3 sm:p-4 bg-surface border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FCI Copilot (e.g., 'What skills should I learn for AI in 300L?')..."
                rows={1}
                className="flex-1 bg-surface-raised border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none max-h-32 min-h-[42px]"
              />

              <Button
                type="submit"
                variant="accent"
                disabled={!inputText.trim() || sendMessageMutation.isPending}
                className="h-[42px] px-4 shrink-0 font-bold"
                aria-label="Send message"
              >
                {sendMessageMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            <div className="mt-1.5 text-center text-[10px] text-text-muted">
              FCI Copilot uses platform-authorized context. Always confirm formal graduation criteria with departmental advisors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
