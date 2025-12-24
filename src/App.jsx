import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  MessageSquare,
  Search,
  Plus,
  Coffee,
  Beer,
  Baby,
  ShoppingBag,
  Trees,
  Info,
  Clock,
  ThumbsUp,
  ChevronRight,
  Filter,
  Sparkles,
  Loader,
  ArrowLeft,
  User,
  LogOut,
  Send,
  Shield,
  Trash2
} from 'lucide-react';
import { supabase } from './supabaseClient';

/* --- GEMINI API HELPER --- */
const callGemini = async (prompt, systemInstruction = "") => {
  const apiKey = ""; // Injected by runtime environment
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Gemini API Error');

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate that right now.";
  } catch (error) {
    console.error(error);
    return "Sorry, I'm having trouble connecting to the local brain right now. Please try again.";
  }
};

/* --- UTILITY FUNCTIONS --- */
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString();
};

/* --- MOCK DATA --- */

const PLACES = [
  {
    id: 1,
    name: "Riverhouse Barn",
    category: "Culture",
    area: "Walton Lane",
    price: "£-££",
    tags: ["Arts", "Cafe", "Accessible"],
    summary: "A converted 18th-century barn offering a robust calendar of arts, jazz, and a fantastic community café. Great for a quiet work spot during the day.",
    hours: "10am - 4pm",
    bg: "bg-amber-100"
  },
  {
    id: 2,
    name: "The Minnow",
    category: "Pub",
    area: "Thames Street",
    price: "££",
    tags: ["River View", "Good for Kids", "Sunday Roast"],
    summary: "Reliable gastropub right on the river. The terrace is unbeatable in summer, but book ahead for Sunday lunch as it fills up with families.",
    hours: "11am - 11pm",
    bg: "bg-emerald-100"
  },
  {
    id: 3,
    name: "Aromas",
    category: "Coffee",
    area: "Town Centre",
    price: "£",
    tags: ["Laptop Friendly", "Pastries"],
    summary: "Best independent coffee in town. Staff are incredibly friendly and they use high-quality beans. Limited seating during peak morning rush.",
    hours: "7am - 5pm",
    bg: "bg-orange-100"
  },
  {
    id: 4,
    name: "Brooklands Museum",
    category: "Kids",
    area: "Brooklands",
    price: "£££",
    tags: ["History", "Outdoors", "Planes"],
    summary: "Essential for families. The Concorde experience is extra, but the general entry covers hours of exploring. Great cafe on site too.",
    hours: "10am - 5pm",
    bg: "bg-sky-100"
  },
  {
    id: 5,
    name: "Oatlands Park Hotel",
    category: "Restaurant",
    area: "Oatlands",
    price: "£££",
    tags: ["High Tea", "Date Night", "View"],
    summary: "Grand historic setting. Go for the afternoon tea or a special occasion dinner. The grounds are beautiful for a post-meal walk.",
    hours: "12pm - 10pm",
    bg: "bg-purple-100"
  }
];

const EVENTS = [
  {
    id: 1,
    title: "Weybridge Farmers Market",
    date: "Sunday, 24th Oct",
    time: "10:00 AM - 2:00 PM",
    location: "Monument Green",
    type: "Market",
    summary: "Fresh produce, artisan bread, and local crafts. Rain or shine."
  },
  {
    id: 2,
    title: "Jazz on the Green",
    date: "Sunday, 24th Oct",
    time: "3:00 PM - 6:00 PM",
    location: "Oatlands Recreation Ground",
    type: "Music",
    summary: "Free community concert. Bring a picnic blanket."
  },
  {
    id: 3,
    title: "Toddler Story Time",
    date: "Tuesday, 26th Oct",
    time: "10:30 AM",
    location: "Weybridge Library",
    type: "Kids",
    summary: "Interactive storytelling for under-5s. No booking required."
  }
];

/* --- COMPONENTS --- */

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${active ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

const CategoryPill = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all ${
      active
      ? 'bg-teal-700 border-teal-700 text-white shadow-md'
      : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
    }`}
  >
    {Icon && <Icon size={14} />}
    <span>{label}</span>
  </button>
);

const PlaceCard = ({ place }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className={`h-24 ${place.bg} relative flex items-center justify-center`}>
       <span className="text-slate-500/30 text-4xl font-black uppercase tracking-widest">{place.category}</span>
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm">
        {place.category}
      </div>
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{place.name}</h3>
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin size={12} className="mr-1" />
            {place.area} • {place.price}
          </div>
        </div>
      </div>

      {/* Editorial Summary - The "Value Add" */}
      <div className="bg-teal-50 p-3 rounded-lg mb-3 border border-teal-100/50">
        <p className="text-sm text-teal-900 italic">"{place.summary}"</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {place.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const EventRow = ({ event }) => (
  <div className="flex bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-3">
    <div className="flex flex-col items-center justify-center bg-teal-50 text-teal-800 rounded-lg w-16 h-16 mr-4 shrink-0 border border-teal-100">
      <span className="text-xs font-bold uppercase">{event.date.split(',')[0]}</span>
      <span className="text-xl font-black">{event.date.split(' ')[1]}</span>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-slate-900">{event.title}</h3>
        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{event.type}</span>
      </div>
      <div className="flex items-center text-slate-500 text-sm mt-1 mb-2">
        <Clock size={12} className="mr-1" />
        {event.time} • {event.location}
      </div>
      <p className="text-sm text-slate-600 line-clamp-2">{event.summary}</p>
    </div>
  </div>
);

const ThreadRow = ({ thread, onClick, isAdmin, onDelete }) => (
  <div onClick={onClick} className="bg-white p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">{thread.board}</span>
        <span>• Posted by {thread.author_username}</span>
        <span>• {formatTimeAgo(thread.created_at)}</span>
      </div>
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(thread.id);
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
          title="Delete thread"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
    <h3 className="font-bold text-slate-800 mb-1">{thread.title}</h3>
    <p className="text-slate-600 text-sm mb-2 line-clamp-1">{thread.content}</p>
    <div className="flex items-center text-slate-400 text-xs">
      <MessageSquare size={12} className="mr-1" />
      {thread.reply_count || 0} replies
    </div>
  </div>
);

const ReplyCard = ({ reply, isAdmin, onDelete }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
          <User size={16} className="text-teal-700" />
        </div>
        <div>
          <span className="font-bold text-slate-800 text-sm">{reply.author_username}</span>
          <span className="text-slate-400 text-xs ml-2">{formatTimeAgo(reply.created_at)}</span>
        </div>
      </div>
      {isAdmin && (
        <button
          onClick={() => onDelete(reply.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
          title="Delete reply"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
    <p className="text-slate-700 text-sm leading-relaxed">{reply.content}</p>
  </div>
);

const ThreadDetail = ({ thread, onBack, user, onReplySubmit, isAdmin, onDeleteReply }) => {
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReplies();
  }, [thread.id]);

  const loadReplies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setReplies(data);
    }
    setLoading(false);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('forum_replies')
      .insert([{
        thread_id: thread.id,
        content: replyContent.trim(),
        author_id: user.id,
        author_username: user.email.split('@')[0]
      }]);

    if (!error) {
      setReplyContent('');
      await loadReplies();
      if (onReplySubmit) onReplySubmit();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center text-teal-700 font-bold text-sm mb-3 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Forum
        </button>
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
          <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">{thread.board}</span>
          <span>• Posted by {thread.author_username} • {formatTimeAgo(thread.created_at)}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">{thread.title}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Original Post */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center">
              <User size={20} className="text-teal-800" />
            </div>
            <div>
              <span className="font-bold text-slate-900">{thread.author_username}</span>
              <span className="text-slate-500 text-xs ml-2">{formatTimeAgo(thread.created_at)}</span>
            </div>
          </div>
          <p className="text-slate-800 leading-relaxed">{thread.content}</p>
        </div>

        {/* Replies */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide flex items-center">
            <MessageSquare size={14} className="mr-1" />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              <Loader className="animate-spin mx-auto mb-2" size={24} />
              <p className="text-sm">Loading replies...</p>
            </div>
          ) : (
            replies.map(reply => (
              <ReplyCard key={reply.id} reply={reply} isAdmin={isAdmin} onDelete={onDeleteReply} />
            ))
          )}
        </div>

        {/* Reply Form */}
        {user ? (
          <form onSubmit={handleReplySubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              {isSubmitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
            <p className="text-slate-500 text-sm italic">Sign in to reply to this thread</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isSignUp ? 'Sign Up' : 'Sign In'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="••••••••"
            required
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-teal-600 text-sm font-medium hover:text-teal-800"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </Modal>
  );
};

/* --- MAIN APP --- */

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState('event');
  const [selectedThread, setSelectedThread] = useState(null);

  // Auth state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Forum state
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadBoard, setNewThreadBoard] = useState('Town Talk');

  // AI State
  const [plannerQuery, setPlannerQuery] = useState('');
  const [plannerResponse, setPlannerResponse] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);

  const [submitDetails, setSubmitDetails] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // Filter Logic
  const filteredPlaces = selectedCategory === 'All'
    ? PLACES
    : PLACES.filter(p => p.category === selectedCategory || p.tags.includes(selectedCategory));

  // Load user profile (includes role)
  const loadUserProfile = async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  // Check if current user is admin
  const isAdmin = userProfile?.role === 'admin';

  // Delete thread with moderation logging
  const handleDeleteThread = async (threadId, reason = 'Deleted by admin') => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    // Log the deletion
    await supabase
      .from('moderation_log')
      .insert([{
        action: 'delete_thread',
        content_type: 'forum_thread',
        content_id: threadId,
        moderator_id: user.id,
        reason: reason
      }]);

    // Delete the thread
    const { error } = await supabase
      .from('forum_threads')
      .delete()
      .eq('id', threadId);

    if (!error) {
      await loadThreads();
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
    } else {
      alert('Failed to delete thread: ' + error.message);
    }
  };

  // Delete reply with moderation logging
  const handleDeleteReply = async (replyId, reason = 'Deleted by admin') => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    // Log the deletion
    await supabase
      .from('moderation_log')
      .insert([{
        action: 'delete_reply',
        content_type: 'forum_reply',
        content_id: replyId,
        moderator_id: user.id,
        reason: reason
      }]);

    // Delete the reply
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', replyId);

    if (!error) {
      // Reload threads to update reply count
      await loadThreads();
    } else {
      alert('Failed to delete reply: ' + error.message);
    }
  };

  // Check auth on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load threads
  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        reply_count:forum_replies(count)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const threadsWithCount = data.map(thread => ({
        ...thread,
        reply_count: thread.reply_count?.[0]?.count || 0
      }));
      setThreads(threadsWithCount);
    }
    setLoadingThreads(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateThread = async () => {
    if (!user || !newThreadTitle.trim() || !newThreadContent.trim()) return;

    const { error } = await supabase
      .from('forum_threads')
      .insert([{
        board: newThreadBoard,
        title: newThreadTitle.trim(),
        content: newThreadContent.trim(),
        author_id: user.id,
        author_username: user.email.split('@')[0]
      }]);

    if (!error) {
      setNewThreadTitle('');
      setNewThreadContent('');
      setIsSubmitOpen(false);
      await loadThreads();
    }
  };

  /* --- GEMINI HANDLERS --- */

  const handleAIPlanner = async () => {
    if (!plannerQuery.trim()) return;
    setIsPlanning(true);
    setPlannerResponse('');

    const placesContext = PLACES.map(p => `${p.name} (${p.category}, ${p.price}): ${p.summary}`).join('\n');
    const eventsContext = EVENTS.map(e => `${e.title} (${e.type}, ${e.date}): ${e.summary}`).join('\n');

    const prompt = `
      User Query: "${plannerQuery}"

      Available Places in Weybridge:
      ${placesContext}

      Upcoming Events:
      ${eventsContext}

      You are the "ByTheWey" local concierge. Suggest a short, friendly itinerary or recommendation list based on the user's query and the available local data.
      If the user asks for something not in the data, feel free to suggest general types of places (e.g. "a walk by the river") that fit Weybridge, UK.
      Keep it concise (under 150 words) and format with bullet points. Use emojis.
    `;

    const response = await callGemini(prompt);
    setPlannerResponse(response);
    setIsPlanning(false);
  };

  const handleMagicPolish = async () => {
    if (!submitDetails.trim()) return;
    setIsPolishing(true);

    const prompt = `
      Rewrite the following text to be more engaging, professional, and concise (under 50 words) for a community event listing or local business description.
      Text to polish: "${submitDetails}"
    `;

    const response = await callGemini(prompt);
    setSubmitDetails(response.replace(/"/g, ''));
    setIsPolishing(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-8 pb-32 animate-in fade-in duration-300">
            {/* Hero */}
            <div className="bg-teal-800 text-white p-6 rounded-2xl shadow-lg mx-4 mt-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-700 rounded-full translate-x-10 -translate-y-10 opacity-50"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-600 rounded-full -translate-x-10 translate-y-10 opacity-30"></div>
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-1">Good morning, Weybridge.</h1>
                <p className="text-teal-100 opacity-90 text-sm">Here is what's happening in town today.</p>
              </div>
            </div>

            {/* AI Planner CTA */}
            <div className="px-4">
              <button
                onClick={() => setIsPlannerOpen(true)}
                className="w-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-indigo-200 p-4 rounded-xl flex items-center justify-between group shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                    <Sparkles className="text-indigo-600" size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-indigo-900 text-sm">Plan My Weekend</h3>
                    <p className="text-indigo-700 text-xs">Ask the AI Concierge for ideas</p>
                  </div>
                </div>
                <ChevronRight className="text-indigo-400 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>

            {/* Quick Links */}
            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Calendar className="mr-2 text-teal-600" size={20} />
                  Happening Soon
                </h2>
                <button onClick={() => setActiveTab('events')} className="text-xs font-bold text-teal-600 flex items-center">View All <ChevronRight size={14}/></button>
              </div>

              <div className="space-y-2">
                {EVENTS.slice(0, 2).map(evt => <EventRow key={evt.id} event={evt} />)}
              </div>
            </div>

            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <ThumbsUp className="mr-2 text-teal-600" size={20} />
                  Editor's Picks
                </h2>
                <button onClick={() => setActiveTab('guide')} className="text-xs font-bold text-teal-600 flex items-center">Open Guide <ChevronRight size={14}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {PLACES.slice(0, 2).map(place => <PlaceCard key={place.id} place={place} />)}
              </div>
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="pb-32 animate-in slide-in-from-right-4 duration-300">
            <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 p-4 border-b border-slate-200 shadow-sm">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Find coffee, pubs, plumbers..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                <CategoryPill label="All" active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} />
                <CategoryPill icon={Coffee} label="Coffee" active={selectedCategory === 'Coffee'} onClick={() => setSelectedCategory('Coffee')} />
                <CategoryPill icon={Beer} label="Pub" active={selectedCategory === 'Pub'} onClick={() => setSelectedCategory('Pub')} />
                <CategoryPill icon={Baby} label="Kids" active={selectedCategory === 'Kids'} onClick={() => setSelectedCategory('Kids')} />
                <CategoryPill icon={ShoppingBag} label="Shopping" active={selectedCategory === 'Shopping'} onClick={() => setSelectedCategory('Shopping')} />
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map(place => (
                  <PlaceCard key={place.id} place={place} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-400">
                  <p>No places found in this category yet.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="pb-32 p-4 animate-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">What's On</h1>
                <p className="text-slate-500 text-sm">Curated events for the week ahead.</p>
              </div>
              <button className="flex items-center text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full">
                <Filter size={12} className="mr-1"/> Filter
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center">
                  This Weekend <div className="h-px bg-slate-200 flex-1 ml-3"></div>
                </h3>
                {EVENTS.slice(0, 2).map(evt => <EventRow key={evt.id} event={evt} />)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center">
                  Next Week <div className="h-px bg-slate-200 flex-1 ml-3"></div>
                </h3>
                {EVENTS.slice(2, 3).map(evt => <EventRow key={evt.id} event={evt} />)}
              </div>
            </div>
          </div>
        );

      case 'forum':
        if (selectedThread) {
          return <ThreadDetail
            thread={selectedThread}
            onBack={() => {
              setSelectedThread(null);
              loadThreads();
            }}
            user={user}
            onReplySubmit={() => loadThreads()}
            isAdmin={isAdmin}
            onDeleteReply={handleDeleteReply}
          />;
        }

        return (
          <div className="pb-32 animate-in slide-in-from-right-4 duration-300">
             <div className="p-4 bg-white border-b border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">Community</h1>
                  <p className="text-slate-500 text-sm">Ask locals, get answers. Moderated daily.</p>
                </div>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2 py-1 rounded"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100"
                  >
                    <User size={12} />
                    Sign In
                  </button>
                )}
              </div>

              <div className="flex mt-4 space-x-2 overflow-x-auto no-scrollbar">
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold whitespace-nowrap">All Boards</span>
                <span className="text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap">Recs</span>
                <span className="text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap">What's On</span>
                <span className="text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap">Town Talk</span>
              </div>
            </div>

            <div className="bg-white">
              {loadingThreads ? (
                <div className="text-center py-12 text-slate-400">
                  <Loader className="animate-spin mx-auto mb-2" size={32} />
                  <p className="text-sm">Loading threads...</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare className="mx-auto mb-2" size={32} />
                  <p className="text-sm">No threads yet. Be the first to post!</p>
                </div>
              ) : (
                threads.map(thread => (
                  <ThreadRow
                    key={thread.id}
                    thread={thread}
                    onClick={() => setSelectedThread(thread)}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteThread}
                  />
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-slate-50 md:shadow-2xl overflow-hidden font-sans md:border-x border-slate-200 relative">

      {/* Top Header (only for non-home pages to keep home clean) */}
      {activeTab !== 'home' && activeTab !== 'guide' && activeTab !== 'forum' && (
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center">
           <span className="font-bold text-teal-800 tracking-tight">bythewey<span className="text-teal-500">.com</span></span>
        </div>
      )}

      {/* Main Content Scroll Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      {/* FAB (Floating Action Button) for Submit */}
      <button
        onClick={() => {
          if (activeTab === 'forum' && !user) {
            setIsAuthOpen(true);
            return;
          }
          setIsSubmitOpen(true);
          setSubmissionType(activeTab === 'events' ? 'event' : activeTab === 'forum' ? 'thread' : 'place');
        }}
        className="absolute bottom-24 right-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-teal-900/20 transition-all hover:scale-105 active:scale-95 z-20"
        aria-label="Add new"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full z-20">
        <nav className="bg-white border-t border-slate-200 flex items-center justify-around px-2 pt-2 pb-3">
          <NavItem
            icon={Trees}
            label="Home"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavItem
            icon={MapPin}
            label="Guide"
            active={activeTab === 'guide'}
            onClick={() => setActiveTab('guide')}
          />
          <NavItem
            icon={Calendar}
            label="Events"
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          />
          <NavItem
            icon={MessageSquare}
            label="Forum"
            active={activeTab === 'forum'}
            onClick={() => setActiveTab('forum')}
          />
        </nav>
        {/* Extra padding for Safari URL bar + safe area for home indicator */}
        <div className="bg-white pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}></div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => loadThreads()}
      />

      {/* Submission Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title={submissionType === 'event' ? 'Submit an Event' : submissionType === 'thread' ? 'Start Discussion' : 'Suggest Place'}
      >
        {submissionType === 'thread' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Board</label>
              <select
                value={newThreadBoard}
                onChange={(e) => setNewThreadBoard(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option>Recommendations</option>
                <option>Town Talk</option>
                <option>What's On</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
              <input
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="What's your question?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Details</label>
              <textarea
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                placeholder="Provide more context..."
              />
            </div>
            <button
              onClick={handleCreateThread}
              disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
              className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Thread
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
              Thanks for contributing! All submissions are reviewed by a human to keep Weybridge spam-free.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title / Name</label>
              <input className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="e.g. Charity Bake Sale" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Details</label>
                <button
                  onClick={handleMagicPolish}
                  disabled={isPolishing || !submitDetails}
                  className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${isPolishing ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                >
                  {isPolishing ? <Loader size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                  {isPolishing ? 'Polishing...' : 'Magic Polish'}
                </button>
              </div>
              <textarea
                value={submitDetails}
                onChange={(e) => setSubmitDetails(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                placeholder="Draft your details here, then hit Magic Polish!"
              />
            </div>
            <button
              onClick={() => {
                alert("Thanks! Your submission has been sent for moderation.");
                setIsSubmitOpen(false);
                setSubmitDetails('');
              }}
              className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all"
            >
              Submit for Review
            </button>
          </div>
        )}
      </Modal>

      {/* AI Planner Modal */}
      <Modal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        title={
          <span className="flex items-center text-indigo-900">
            <Sparkles className="text-indigo-600 mr-2" size={20} />
            Concierge
          </span>
        }
      >
        <div className="space-y-4">
           {!plannerResponse && (
             <>
               <p className="text-sm text-slate-600">
                 Tell me what you're looking for (e.g., "Family lunch", "Date night", "Rainy day activity") and I'll build a plan from our local directory.
               </p>
               <textarea
                 value={plannerQuery}
                 onChange={(e) => setPlannerQuery(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                 placeholder="I need ideas for..."
               />
               <button
                 onClick={handleAIPlanner}
                 disabled={isPlanning || !plannerQuery}
                 className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
               >
                 {isPlanning ? <><Loader size={18} className="animate-spin"/> Planning...</> : 'Plan My Day'}
               </button>
             </>
           )}

           {isPlanning && !plannerResponse && (
              <div className="py-8 flex flex-col items-center text-slate-400 animate-pulse">
                <Sparkles size={32} className="mb-2 text-indigo-300"/>
                <p className="text-xs">Scanning Weybridge guide...</p>
              </div>
           )}

           {plannerResponse && (
             <div className="animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                 {plannerResponse}
               </div>
               <button
                 onClick={() => setPlannerResponse('')}
                 className="w-full mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800"
               >
                 Ask for something else
               </button>
             </div>
           )}
        </div>
      </Modal>

    </div>
  );
}
