import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MemberId } from '@/data/family';
import type { ChatMessage, ChatRoute } from '@/types/database';

const MESSAGE_LIMIT = 200;

export type ChatStatus = 'loading' | 'ready' | 'error';

export interface NewChatMessage {
  memberId: MemberId;
  body: string;
  route?: ChatRoute;
}

export async function sendChatMessage(message: NewChatMessage): Promise<boolean> {
  const { error } = await supabase.from('family_chat_messages').insert({
    member_id: message.memberId,
    body: message.body,
    route: message.route ?? null,
  });
  return !error;
}

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setStatus('loading');

    supabase
      .from('family_chat_messages')
      .select('id, member_id, body, route, created_at')
      .order('created_at', { ascending: true })
      .limit(MESSAGE_LIMIT)
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !Array.isArray(data)) {
          setStatus('error');
          return;
        }
        setMessages(data as ChatMessage[]);
        setStatus('ready');
      });

    const channel = supabase
      .channel('family-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'family_chat_messages' },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((current) =>
            current.some((message) => message.id === incoming.id) ? current : [...current, incoming],
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [reloadKey]);

  return { messages, status, reload };
}
