import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, RefreshCw, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { sendChatMessage, useChatMessages } from '@/hooks/useChatMessages';
import ChatMessageItem from '@/components/chat/ChatMessageItem';

const MAX_LENGTH = 1000;

export default function FamilyChat() {
  const { member } = useApp();
  const { messages, status, reload } = useChatMessages();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setSendError(null);
    const sent = await sendChatMessage({ memberId: member.id, body });
    setSending(false);

    if (sent) {
      setDraft('');
    } else {
      setSendError('Az üzenet nem ment el. Próbáld újra.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-[420px] flex-col">
      <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gradient-to-b from-sky-50 via-white to-amber-50/60 px-4 py-3">
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Üzenetek betöltése...
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-rose-700">Nem sikerült betölteni a családi üzeneteket.</p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Újrapróbálom
            </button>
          </div>
        )}

        {status === 'ready' && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-600">
            Még nincs üzenet. Írj az első sort, vagy küldj egy útvonalat a sítervezőből.
          </p>
        )}

        {status === 'ready' && messages.map((message) => <ChatMessageItem key={message.id} message={message} />)}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3">
        {sendError && (
          <p role="alert" className="px-1 text-xs font-medium text-rose-700">
            {sendError}
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Írj a családnak..."
            aria-label="Üzenet"
            className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Küldés"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </form>
    </div>
  );
}
