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
  Trash2,
  Camera,
  Settings,
  Train
} from 'lucide-react';
import { supabase } from './supabaseClient';
import Styleguide from './pages/Styleguide';
import NextTrain from './pages/NextTrain';

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
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getTodayDate = () => {
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]}`;
};

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

/* --- DATE UTILITY FUNCTIONS FOR EVENTS --- */
const formatEventDate = (dateString) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time parts for date comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate.getTime() === today.getTime()) return 'Today';
  if (eventDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[eventDate.getDay()]}, ${months[eventDate.getMonth()]} ${eventDate.getDate()}`;
};

const getEventGrouping = (dateString) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'past';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';

  // Calculate the start of this week (Monday)
  const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Sunday is 6 days from Monday
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(today.getDate() - daysFromMonday);
  thisWeekMonday.setHours(0, 0, 0, 0);

  // Calculate the end of this week (Sunday)
  const thisWeekSunday = new Date(thisWeekMonday);
  thisWeekSunday.setDate(thisWeekMonday.getDate() + 6);
  thisWeekSunday.setHours(23, 59, 59, 999);

  // Calculate next week's Monday and Sunday
  const nextWeekMonday = new Date(thisWeekMonday);
  nextWeekMonday.setDate(thisWeekMonday.getDate() + 7);
  const nextWeekSunday = new Date(nextWeekMonday);
  nextWeekSunday.setDate(nextWeekMonday.getDate() + 6);
  nextWeekSunday.setHours(23, 59, 59, 999);

  // Check if event is in this week (Monday to Sunday)
  if (eventDate >= thisWeekMonday && eventDate <= thisWeekSunday) {
    return 'this-week';
  }

  // Check if event is in next week (Monday to Sunday)
  if (eventDate >= nextWeekMonday && eventDate <= nextWeekSunday) {
    return 'next-week';
  }

  // Group by month for events beyond next week
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[eventDate.getMonth()]} ${eventDate.getFullYear()}`;
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
    className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${active ? 'text-brand-primary' : 'text-text-muted hover:text-text-secondary'}`}
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
      ? 'bg-brand-primary border-brand-primary text-text-inverse shadow-md'
      : 'bg-surface-card border-border-subtle text-text-secondary hover:border-brand-accent'
    }`}
  >
    {Icon && <Icon size={14} />}
    <span>{label}</span>
  </button>
);

const PlaceCard = ({ place }) => {
  // Generate category background color
  const categoryColors = {
    'Coffee': 'bg-orange-100',
    'Pub': 'bg-emerald-100',
    'Restaurant': 'bg-purple-100',
    'Kids': 'bg-sky-100',
    'Culture': 'bg-amber-100',
    'Shopping': 'bg-pink-100',
    'Services': 'bg-blue-100',
    'Other': 'bg-slate-100'
  };

  const bgColor = place.bg || categoryColors[place.category] || 'bg-slate-100';

  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {place.image_url ? (
        <div className="h-24 relative overflow-hidden">
          <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 bg-surface-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-text-primary shadow-sm">
            {place.category}
          </div>
        </div>
      ) : (
        <div className={`h-24 ${bgColor} relative flex items-center justify-center`}>
          <span className="text-text-muted/30 text-4xl font-black uppercase tracking-widest">{place.category}</span>
          <div className="absolute top-3 left-3 bg-surface-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-text-primary shadow-sm">
            {place.category}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-text-primary">{place.name}</h3>
            <div className="flex items-center text-text-secondary text-sm">
              <MapPin size={12} className="mr-1" />
              {place.area} • {place.price}
            </div>
          </div>
        </div>

        {/* Editorial Summary - The "Value Add" */}
        <div className="bg-brand-accent/20 p-3 rounded-lg mb-3 border border-brand-accent/30">
          <p className="text-sm text-text-primary italic">"{place.summary}"</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {(place.tags || []).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-surface-muted text-text-secondary rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventRow = ({ event, onClick }) => (
  <div onClick={onClick} className="flex bg-surface-card p-4 rounded-xl border border-border-subtle shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center justify-center bg-brand-accent/30 text-brand-primary rounded-lg w-16 h-16 mr-4 shrink-0 border border-brand-accent/50">
      <span className="text-xs font-bold uppercase">{event.date.split(',')[0]}</span>
      <span className="text-xl font-black">{event.date.split(' ')[1]}</span>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-text-primary">{event.title}</h3>
        <span className="text-xs font-medium bg-surface-muted text-text-secondary px-2 py-1 rounded-full">{event.type}</span>
      </div>
      <div className="flex items-center text-text-secondary text-sm mt-1 mb-2">
        <Clock size={12} className="mr-1" />
        {event.time} • {event.location}
      </div>
      <p className="text-sm text-text-secondary line-clamp-2">{event.summary}</p>
    </div>
  </div>
);

const ThreadRow = ({ thread, onClick, isAdmin, onDelete }) => (
  <div onClick={onClick} className="bg-surface-card p-4 border-b border-border-subtle last:border-0 hover:bg-surface-muted cursor-pointer transition-colors">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-brand-accent/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {thread.author_avatar ? (
            <img src={thread.author_avatar} alt={thread.author_username} className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-brand-primary" />
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <span className="font-bold text-brand-primary bg-brand-accent/20 px-1.5 py-0.5 rounded border border-brand-accent/30">{thread.board}</span>
          <span>• Posted by {thread.author_username}</span>
          <span>• {formatTimeAgo(thread.created_at)}</span>
        </div>
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
    <h3 className="font-bold text-text-primary mb-1">{thread.title}</h3>
    <p className="text-text-secondary text-sm mb-2 line-clamp-1">{thread.content}</p>
    <div className="flex items-center text-text-muted text-xs ml-10">
      <MessageSquare size={12} className="mr-1" />
      {thread.reply_count || 0} replies
    </div>
  </div>
);

const ReplyCard = ({ reply, isAdmin, onDelete }) => (
  <div className="bg-surface-card p-4 rounded-lg border border-border-subtle">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-brand-accent/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {reply.author_avatar ? (
            <img src={reply.author_avatar} alt={reply.author_username} className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-brand-primary" />
          )}
        </div>
        <div>
          <span className="font-bold text-text-primary text-sm">{reply.author_username}</span>
          <span className="text-text-muted text-xs ml-2">{formatTimeAgo(reply.created_at)}</span>
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
    <p className="text-text-primary text-sm leading-relaxed">{reply.content}</p>
  </div>
);

const ThreadDetail = ({ thread, onBack, user, userProfile, onReplySubmit, isAdmin, onDeleteReply }) => {
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
      .select(`
        *,
        author:profiles!author_id(username, avatar_url)
      `)
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const repliesWithAuthor = data.map(reply => ({
        ...reply,
        author_avatar: reply.author?.avatar_url || null
      }));
      setReplies(repliesWithAuthor);
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
        author_username: userProfile?.username || user.email.split('@')[0]
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
      <div className="sticky top-0 bg-surface-card border-b border-border-subtle p-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center text-brand-primary font-bold text-sm mb-3 hover:opacity-80 transition-all"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Forum
        </button>
        <div className="flex items-center space-x-2 text-xs text-text-muted mb-2">
          <span className="font-bold text-brand-primary bg-brand-accent/20 px-1.5 py-0.5 rounded border border-brand-accent/30">{thread.board}</span>
          <span>• Posted by {thread.author_username} • {formatTimeAgo(thread.created_at)}</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary">{thread.title}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Original Post */}
        <div className="bg-brand-accent/20 p-4 rounded-lg border border-brand-accent/30">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/50 flex items-center justify-center overflow-hidden">
              {thread.author_avatar ? (
                <img src={thread.author_avatar} alt={thread.author_username} className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-brand-primary" />
              )}
            </div>
            <div>
              <span className="font-bold text-text-primary">{thread.author_username}</span>
              <span className="text-text-muted text-xs ml-2">{formatTimeAgo(thread.created_at)}</span>
            </div>
          </div>
          <p className="text-text-primary leading-relaxed">{thread.content}</p>
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
              className="mt-2 bg-brand-primary text-text-inverse px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
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
      <div className="bg-surface-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted shrink-0">
          <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-base text-text-muted hover:text-text-primary transition-colors">
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
            className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
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
            className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
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
          className="w-full bg-brand-primary text-text-inverse font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
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

const ProfileEditModal = ({ isOpen, onClose, userProfile, onProfileUpdated }) => {
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setAvatarPreview(userProfile.avatar_url || '');
    }
  }, [userProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let avatarUrl = userProfile.avatar_url;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userProfile.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          avatar_url: avatarUrl
        })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      onProfileUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-brand-accent/30 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-brand-primary" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-brand-primary text-text-inverse p-2 rounded-full cursor-pointer hover:opacity-90 shadow-lg transition-all">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Click camera to upload (max 2MB)</p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
            placeholder="Your display name"
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
          className="w-full bg-brand-primary text-text-inverse font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </Modal>
  );
};

const EventDetailModal = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title}>
      <div className="space-y-4">
        {/* Event Image */}
        {event.image_url && (
          <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover rounded-lg" />
        )}

        {/* Date, Time, Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Date</div>
            <div className="text-sm text-slate-800">{formatEventDate(event.event_date)}</div>
          </div>
          {event.start_time && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Time</div>
              <div className="text-sm text-slate-800">
                {event.start_time.slice(0, 5)}{event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ''}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-3 rounded-lg">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Location</div>
          <div className="text-sm text-slate-800">{event.location}</div>
        </div>

        {/* Type Badge */}
        <div>
          <span className="inline-block bg-brand-accent/20 text-brand-primary px-3 py-1 rounded-full text-xs font-bold border border-brand-accent/30">
            {event.type}
          </span>
        </div>

        {/* Description */}
        <div>
          <div className="text-xs font-bold text-text-primary uppercase mb-2">About This Event</div>
          <p className="text-sm text-text-primary leading-relaxed">
            {event.description || event.summary}
          </p>
        </div>

        {/* Organizer */}
        {event.organizer_name && (
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Organized By</div>
            <div className="text-sm text-slate-800">{event.organizer_name}</div>
          </div>
        )}

        {/* Website */}
        {event.website_url && (
          <a
            href={event.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-brand-primary text-text-inverse text-center font-bold py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Visit Website
          </a>
        )}
      </div>
    </Modal>
  );
};

/* --- MAIN APP --- */

export default function App() {
  // Hidden styleguide route
  const isStyleguide =
    typeof window !== 'undefined' &&
    window.location.pathname.endsWith('/styleguide');
  if (isStyleguide) return <Styleguide />;

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
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // Forum state
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadBoard, setNewThreadBoard] = useState('Town Talk');

  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('Community');
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventOrganizerName, setEventOrganizerName] = useState('');
  const [eventWebsiteUrl, setEventWebsiteUrl] = useState('');
  const [eventImageFile, setEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState('');

  // Places state
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState('Coffee');
  const [placeArea, setPlaceArea] = useState('');
  const [placePrice, setPlacePrice] = useState('£');
  const [placeSummary, setPlaceSummary] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [placeHours, setPlaceHours] = useState('');
  const [placePhone, setPlacePhone] = useState('');
  const [placeWebsite, setPlaceWebsite] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeTags, setPlaceTags] = useState('');
  const [placeImageFile, setPlaceImageFile] = useState(null);
  const [placeImagePreview, setPlaceImagePreview] = useState('');

  // AI State
  const [plannerQuery, setPlannerQuery] = useState('');
  const [plannerResponse, setPlannerResponse] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);

  const [submitDetails, setSubmitDetails] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // Filter Logic
  const approvedPlaces = places.filter(p => p.status === 'approved');
  const filteredPlaces = selectedCategory === 'All'
    ? approvedPlaces
    : approvedPlaces.filter(p => p.category === selectedCategory || (p.tags && p.tags.includes(selectedCategory)));

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

  // Load events
  const loadEvents = async () => {
    setLoadingEvents(true);
    const { data, error} = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoadingEvents(false);
  };

  // Submit event
  const handleSubmitEvent = async () => {
    if (!user || !eventTitle.trim() || !eventDate || !eventLocation.trim() || !eventSummary.trim()) {
      alert('Please fill in all required fields (title, date, location, summary)');
      return;
    }

    setIsPolishing(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (eventImageFile) {
        const fileExt = eventImageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, eventImageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert event
      const { error } = await supabase
        .from('events')
        .insert([{
          title: eventTitle.trim(),
          event_date: eventDate,
          start_time: eventStartTime || null,
          end_time: eventEndTime || null,
          location: eventLocation.trim(),
          type: eventType,
          summary: eventSummary.trim(),
          description: eventDescription.trim() || null,
          organizer_name: eventOrganizerName.trim() || null,
          website_url: eventWebsiteUrl.trim() || null,
          image_url: imageUrl,
          submitter_id: user.id,
          status: 'pending'
        }]);

      if (error) throw error;

      // Reset form
      setEventTitle('');
      setEventDate('');
      setEventStartTime('');
      setEventEndTime('');
      setEventLocation('');
      setEventType('Community');
      setEventSummary('');
      setEventDescription('');
      setEventOrganizerName('');
      setEventWebsiteUrl('');
      setEventImageFile(null);
      setEventImagePreview('');
      setIsSubmitOpen(false);

      alert('Thanks! Your event will be reviewed within 24 hours.');
      await loadEvents();
    } catch (err) {
      alert('Error submitting event: ' + err.message);
    } finally {
      setIsPolishing(false);
    }
  };

  // Admin approve event
  const handleApproveEvent = async (eventId) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('events')
      .update({ status: 'approved' })
      .eq('id', eventId);

    if (!error) {
      await loadEvents();
    }
  };

  // Admin delete event
  const handleDeleteEvent = async (eventId) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (!error) {
      await loadEvents();
    }
  };

  // Load places
  const loadPlaces = async () => {
    setLoadingPlaces(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlaces(data);
    }
    setLoadingPlaces(false);
  };

  // Submit place
  const handleSubmitPlace = async () => {
    if (!user || !placeName.trim() || !placeCategory || !placeArea.trim() || !placeSummary.trim()) {
      alert('Please fill in all required fields (name, category, area, summary)');
      return;
    }

    setIsPolishing(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (placeImageFile) {
        const fileExt = placeImageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('place-images')
          .upload(fileName, placeImageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Parse tags from comma-separated string
      const tagsArray = placeTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Insert place
      const { error } = await supabase
        .from('places')
        .insert([{
          name: placeName.trim(),
          category: placeCategory,
          area: placeArea.trim(),
          price: placePrice,
          summary: placeSummary.trim(),
          description: placeDescription.trim() || null,
          hours: placeHours.trim() || null,
          phone: placePhone.trim() || null,
          website: placeWebsite.trim() || null,
          address: placeAddress.trim() || null,
          tags: tagsArray,
          image_url: imageUrl,
          submitter_id: user.id,
          status: 'pending'
        }]);

      if (error) throw error;

      // Reset form
      setPlaceName('');
      setPlaceCategory('Coffee');
      setPlaceArea('');
      setPlacePrice('£');
      setPlaceSummary('');
      setPlaceDescription('');
      setPlaceHours('');
      setPlacePhone('');
      setPlaceWebsite('');
      setPlaceAddress('');
      setPlaceTags('');
      setPlaceImageFile(null);
      setPlaceImagePreview('');
      setIsSubmitOpen(false);

      alert('Thanks! Your place will be reviewed within 24 hours.');
      await loadPlaces();
    } catch (err) {
      alert('Error submitting place: ' + err.message);
    } finally {
      setIsPolishing(false);
    }
  };

  // Admin approve place
  const handleApprovePlace = async (placeId) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('places')
      .update({ status: 'approved' })
      .eq('id', placeId);

    if (!error) {
      await loadPlaces();
    }
  };

  // Admin delete place
  const handleDeletePlace = async (placeId) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this place?')) return;

    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', placeId);

    if (!error) {
      await loadPlaces();
    }
  };

  // Admin toggle featured
  const handleToggleFeatured = async (placeId, currentFeatured) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('places')
      .update({ featured: !currentFeatured })
      .eq('id', placeId);

    if (!error) {
      await loadPlaces();
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

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  // Load places
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        reply_count:forum_replies(count),
        author:profiles!author_id(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const threadsWithCount = data.map(thread => ({
        ...thread,
        reply_count: thread.reply_count?.[0]?.count || 0,
        author_avatar: thread.author?.avatar_url || null
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
        author_username: userProfile?.username || user.email.split('@')[0]
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
          <div className="space-y-6 pb-32 animate-in fade-in duration-300">
            {/* Hero - Daily Edition */}
            <div className="bg-brand-primary text-text-inverse p-6 rounded-2xl shadow-lg mx-4 mt-4 relative overflow-hidden hero-texture">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/70 rounded-full translate-x-10 -translate-y-10 opacity-50"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-primary/50 rounded-full -translate-x-10 translate-y-10 opacity-30"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="ByTheWey" className="w-14 h-14 bg-white/10 rounded-xl p-1.5 backdrop-blur shrink-0" />
                  <div className="flex-1">
                    <p className="text-text-inverse/70 text-xs font-medium uppercase tracking-wide mb-1">{getTodayDate()}</p>
                    <h1 className="text-2xl font-bold leading-tight">{getGreeting()}, Weybridge.</h1>
                    <p className="text-text-inverse/80 text-sm mt-1">Today's picks and what's on soon.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's on soon */}
            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">What's on soon</h2>
                  <p className="text-text-muted text-xs mt-0.5">Upcoming events in Weybridge</p>
                </div>
                <button onClick={() => setActiveTab('events')} className="text-xs font-bold text-brand-primary hover:opacity-80 transition-opacity">View all →</button>
              </div>

              <div className="space-y-3">
                {(() => {
                  // Get upcoming approved events
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const upcomingEvents = events
                    .filter(e => e.status === 'approved' && new Date(e.event_date) >= today)
                    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                    .slice(0, 3);

                  if (upcomingEvents.length === 0) {
                    return (
                      <div className="bg-surface-card border border-border-subtle rounded-xl p-6 text-center">
                        <Calendar className="mx-auto mb-3 text-text-muted opacity-40" size={32} />
                        <p className="text-text-secondary text-sm mb-3">No upcoming events yet</p>
                        <button
                          onClick={() => {
                            setActiveTab('events');
                            setIsSubmitOpen(true);
                            setSubmissionType('event');
                          }}
                          className="text-xs font-medium text-brand-primary hover:opacity-80 transition-opacity"
                        >
                          Add an event
                        </button>
                      </div>
                    );
                  }

                  return upcomingEvents.map(evt => (
                    <EventRow
                      key={evt.id}
                      event={{
                        ...evt,
                        date: formatEventDate(evt.event_date),
                        time: evt.start_time ? (evt.end_time ? `${evt.start_time.slice(0,5)} - ${evt.end_time.slice(0,5)}` : evt.start_time.slice(0,5)) : ''
                      }}
                      onClick={() => {
                        setSelectedEvent(evt);
                      }}
                    />
                  ));
                })()}
              </div>
            </div>

            {/* Editor's Picks */}
            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Editor's Picks</h2>
                  <p className="text-text-muted text-xs mt-0.5">Hand-selected local favorites</p>
                </div>
                <button onClick={() => setActiveTab('guide')} className="text-xs font-bold text-brand-primary hover:opacity-80 transition-opacity">Open guide →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {(() => {
                  // Show featured places, or fallback to first 2 approved if no featured
                  const featuredPlaces = approvedPlaces.filter(p => p.featured);
                  const displayPlaces = featuredPlaces.length > 0
                    ? featuredPlaces.slice(0, 2)
                    : approvedPlaces.slice(0, 2);

                  if (displayPlaces.length === 0) {
                    return (
                      <div className="col-span-full bg-surface-card border border-border-subtle rounded-xl p-6 text-center">
                        <ThumbsUp className="mx-auto mb-3 text-text-muted opacity-40" size={32} />
                        <p className="text-text-secondary text-sm mb-3">No editor's picks yet</p>
                        <button
                          onClick={() => {
                            setActiveTab('guide');
                            setIsSubmitOpen(true);
                            setSubmissionType('place');
                          }}
                          className="text-xs font-medium text-brand-primary hover:opacity-80 transition-opacity"
                        >
                          Add a place
                        </button>
                      </div>
                    );
                  }

                  return displayPlaces.map(place => {
                    const categoryColors = {
                      'Coffee': 'bg-orange-100',
                      'Pub': 'bg-emerald-100',
                      'Restaurant': 'bg-purple-100',
                      'Kids': 'bg-sky-100',
                      'Culture': 'bg-amber-100',
                      'Shopping': 'bg-pink-100',
                      'Services': 'bg-blue-100',
                      'Other': 'bg-slate-100'
                    };
                    const bgColor = categoryColors[place.category] || 'bg-slate-100';

                    return (
                      <div key={place.id} className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {place.image_url ? (
                          <div className="h-24 relative overflow-hidden">
                            <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-surface-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-text-primary shadow-sm">
                              {place.category}
                            </div>
                            <div className="absolute top-3 right-3 bg-brand-primary text-text-inverse px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                              Editor's pick
                            </div>
                          </div>
                        ) : (
                          <div className={`h-24 ${bgColor} relative flex items-center justify-center`}>
                            <span className="text-text-muted/30 text-4xl font-black uppercase tracking-widest">{place.category}</span>
                            <div className="absolute top-3 left-3 bg-surface-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-text-primary shadow-sm">
                              {place.category}
                            </div>
                            <div className="absolute top-3 right-3 bg-brand-primary text-text-inverse px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                              Editor's pick
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-text-primary">{place.name}</h3>
                              <div className="flex items-center text-text-secondary text-sm">
                                <MapPin size={12} className="mr-1" />
                                {place.area} • {place.price}
                              </div>
                            </div>
                          </div>

                          {/* Editorial Summary */}
                          <div className="bg-brand-accent/20 p-3 rounded-lg mb-3 border border-brand-accent/30">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Why we like it</p>
                            <p className="text-sm text-text-primary italic">"{place.summary}"</p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {(place.tags || []).map(tag => (
                              <span key={tag} className="text-xs px-2 py-1 bg-surface-muted text-text-secondary border border-border-subtle rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* AI Concierge - Minor */}
            <div className="px-4">
              <button
                onClick={() => setIsPlannerOpen(true)}
                className="w-full bg-surface-card border border-border-subtle p-4 rounded-xl flex items-center justify-between group hover:bg-surface-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                    <Sparkles className="text-brand-primary" size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-text-primary text-sm font-medium">Need ideas? Ask the concierge</p>
                    <p className="text-text-muted text-xs">Get personalized recommendations</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-brand-primary px-3 py-1.5 bg-brand-accent/10 rounded-lg group-hover:bg-brand-accent/20 transition-colors">
                  Ask
                </div>
              </button>
            </div>
          </div>
        );

      case 'guide':
        const pendingPlaces = places.filter(p => p.status === 'pending');

        return (
          <div className="pb-32 animate-in slide-in-from-right-4 duration-300">
            <div className="sticky top-0 bg-surface-base/95 backdrop-blur z-10 p-4 border-b border-border-subtle shadow-sm">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Find coffee, pubs, plumbers..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring shadow-sm"
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

            {/* Admin: Pending Places */}
            {isAdmin && pendingPlaces.length > 0 && (
              <div className="px-4 pt-4 mb-4">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 ml-1 flex items-center">
                  <Shield size={14} className="mr-1" />
                  Pending Approval ({pendingPlaces.length})
                  <div className="h-px bg-amber-200 flex-1 ml-3"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPlaces.map(place => (
                    <div key={place.id} className="relative">
                      <PlaceCard place={place} />
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprovePlace(place.id);
                          }}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlace(place.id);
                          }}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingPlaces ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Loader className="animate-spin mx-auto mb-2" size={32} />
                  <p className="text-sm">Loading places...</p>
                </div>
              ) : filteredPlaces.length > 0 ? (
                filteredPlaces.map(place => (
                  <div key={place.id} className="relative">
                    <PlaceCard place={place} />
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFeatured(place.id, place.featured);
                        }}
                        className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold transition-colors shadow-md z-10 ${
                          place.featured
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={place.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {place.featured ? '★ Featured' : '☆ Feature'}
                      </button>
                    )}
                  </div>
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
        // Group events by date
        const approvedEvents = events.filter(e => e.status === 'approved');
        const pendingEvents = events.filter(e => e.status === 'pending');

        const groupedEvents = {};

        approvedEvents.forEach(event => {
          const group = getEventGrouping(event.event_date);
          if (!groupedEvents[group]) {
            groupedEvents[group] = [];
          }
          groupedEvents[group].push(event);
        });

        // Define ordering for groups
        const groupOrder = ['today', 'tomorrow', 'this-week', 'next-week'];
        const sortedGroupKeys = Object.keys(groupedEvents).sort((a, b) => {
          const aIndex = groupOrder.indexOf(a);
          const bIndex = groupOrder.indexOf(b);

          // If both are in the predefined order, sort by index
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          // If only a is in predefined order, it comes first
          if (aIndex !== -1) return -1;
          // If only b is in predefined order, it comes first
          if (bIndex !== -1) return 1;
          // If both are months or 'past', sort chronologically
          if (a === 'past') return 1;
          if (b === 'past') return -1;
          // Both are month names, sort by parsing the date
          const aDate = new Date(a);
          const bDate = new Date(b);
          return aDate - bDate;
        });

        // Map group keys to display titles
        const groupTitles = {
          'today': 'Today',
          'tomorrow': 'Tomorrow',
          'this-week': 'This Week',
          'next-week': 'Next Week',
          'past': 'Past Events'
        };

        return (
          <div className="pb-32 p-4 animate-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">What's On</h1>
                <p className="text-slate-500 text-sm">Curated events in Weybridge.</p>
              </div>
              <button
                onClick={() => setShowPastEvents(!showPastEvents)}
                className="flex items-center text-xs font-bold text-brand-primary bg-brand-accent/20 px-3 py-1.5 rounded-full hover:bg-brand-accent/30"
              >
                {showPastEvents ? 'Hide Past' : 'Show Past'}
              </button>
            </div>

            {/* Admin: Pending Events */}
            {isAdmin && pendingEvents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 ml-1 flex items-center">
                  <Shield size={14} className="mr-1" />
                  Pending Approval ({pendingEvents.length})
                  <div className="h-px bg-amber-200 flex-1 ml-3"></div>
                </h3>
                <div className="space-y-3">
                  {pendingEvents.map(evt => (
                    <div key={evt.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <EventRow
                        event={{
                          ...evt,
                          date: formatEventDate(evt.event_date),
                          time: evt.start_time ? (evt.end_time ? `${evt.start_time.slice(0,5)} - ${evt.end_time.slice(0,5)}` : evt.start_time.slice(0,5)) : ''
                        }}
                        onClick={() => setSelectedEvent(evt)}
                      />
                      <div className="flex gap-2 mt-3 pt-3 border-t border-amber-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveEvent(evt.id);
                          }}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(evt.id);
                          }}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loadingEvents ? (
              <div className="text-center py-12 text-slate-400">
                <Loader className="animate-spin mx-auto mb-2" size={32} />
                <p className="text-sm">Loading events...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedGroupKeys.map(groupKey => {
                  const groupEvents = groupedEvents[groupKey];
                  if (!groupEvents || groupEvents.length === 0) return null;
                  if (groupKey === 'past' && !showPastEvents) return null;

                  // Use predefined title or the month name itself
                  const displayTitle = groupTitles[groupKey] || groupKey;

                  return (
                    <div key={groupKey}>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center">
                        {displayTitle}
                        <div className="h-px bg-slate-200 flex-1 ml-3"></div>
                      </h3>
                      {groupEvents.map(evt => (
                        <EventRow
                          key={evt.id}
                          event={{
                            ...evt,
                            date: formatEventDate(evt.event_date),
                            time: evt.start_time ? (evt.end_time ? `${evt.start_time.slice(0,5)} - ${evt.end_time.slice(0,5)}` : evt.start_time.slice(0,5)) : ''
                          }}
                          onClick={() => setSelectedEvent(evt)}
                        />
                      ))}
                    </div>
                  );
                })}
                {approvedEvents.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="mx-auto mb-2" size={32} />
                    <p className="text-sm">No events scheduled yet.</p>
                  </div>
                )}
              </div>
            )}
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
            userProfile={userProfile}
            onReplySubmit={() => loadThreads()}
            isAdmin={isAdmin}
            onDeleteReply={handleDeleteReply}
          />;
        }

        return (
          <div className="pb-32 animate-in slide-in-from-right-4 duration-300">
             <div className="p-4 bg-surface-card border-b border-border-subtle">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-text-primary">Community</h1>
                  <p className="text-text-secondary text-sm">Ask locals, get answers. Moderated daily.</p>
                </div>
                {user ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsProfileEditOpen(true)}
                      className="flex items-center gap-1 text-xs text-brand-primary hover:opacity-80 border border-brand-accent/30 px-2 py-1 rounded hover:bg-brand-accent/10"
                    >
                      <Settings size={12} />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2 py-1 rounded"
                    >
                      <LogOut size={12} />
                      Sign Out
                    </button>
                  </div>
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
                <span className="text-xs bg-surface-muted text-text-secondary px-3 py-1.5 rounded-full font-bold whitespace-nowrap">All Boards</span>
                <span className="text-xs text-text-muted border border-border-subtle px-3 py-1.5 rounded-full font-medium hover:bg-surface-muted cursor-pointer whitespace-nowrap">Recs</span>
                <span className="text-xs text-text-muted border border-border-subtle px-3 py-1.5 rounded-full font-medium hover:bg-surface-muted cursor-pointer whitespace-nowrap">What's On</span>
                <span className="text-xs text-text-muted border border-border-subtle px-3 py-1.5 rounded-full font-medium hover:bg-surface-muted cursor-pointer whitespace-nowrap">Town Talk</span>
              </div>
            </div>

            <div className="bg-surface-base">
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
      case 'next-train':
        return <NextTrain />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-surface-base text-text-primary md:shadow-2xl overflow-hidden font-sans md:border-x border-border-subtle relative">

      {/* Top Header (only for non-home pages to keep home clean) */}
      {activeTab !== 'home' && activeTab !== 'guide' && activeTab !== 'forum' && (
        <div className="bg-surface-card border-b border-border-subtle p-4 sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ByTheWey" className="w-8 h-8" />
            <span className="font-bold text-brand-primary tracking-tight">bythewey<span className="text-brand-accent">.com</span></span>
          </div>
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
        className="absolute bottom-24 right-4 bg-brand-primary hover:opacity-90 text-text-inverse rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 z-20"
        aria-label="Add new"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full z-20">
        <nav className="bg-surface-card border-t border-border-subtle flex items-center justify-around px-2 pt-2 pb-3">
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
          <NavItem
            icon={Train}
            label="Next Train"
            active={activeTab === 'next-train'}
            onClick={() => setActiveTab('next-train')}
          />
        </nav>
        {/* Extra padding for Safari URL bar + safe area for home indicator */}
        <div className="bg-surface-card pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}></div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => loadThreads()}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={() => loadUserProfile(user.id)}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
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
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
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
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                placeholder="What's your question?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Details</label>
              <textarea
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted h-24 focus:outline-none focus:ring-2 focus:ring-focus-ring resize-none"
                placeholder="Provide more context..."
              />
            </div>
            <button
              onClick={handleCreateThread}
              disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
              className="w-full bg-brand-primary text-text-inverse font-bold py-3.5 rounded-xl hover:opacity-90 shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Thread
            </button>
          </div>
        ) : submissionType === 'event' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
              Thanks for contributing! All event submissions are reviewed by admins before going live.
            </p>

            {/* Event Image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Image (Optional)</label>
              <div className="flex items-center gap-3">
                {eventImagePreview && (
                  <img src={eventImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                )}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Camera size={16} />
                  {eventImagePreview ? 'Change Image' : 'Add Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image must be less than 5MB');
                          return;
                        }
                        setEventImageFile(file);
                        setEventImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Event Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                placeholder="e.g. Weybridge Farmers Market"
                required
              />
            </div>

            {/* Date and Times */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time (Optional)</label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>
            </div>

            {/* Location and Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location *</label>
                <input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="Monument Green"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                >
                  <option>Market</option>
                  <option>Music</option>
                  <option>Kids</option>
                  <option>Sports</option>
                  <option>Community</option>
                  <option>Arts</option>
                  <option>Food & Drink</option>
                  <option>Charity</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Summary * (for calendar view)</label>
              <textarea
                value={eventSummary}
                onChange={(e) => setEventSummary(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted h-16 focus:outline-none focus:ring-2 focus:ring-focus-ring resize-none"
                placeholder="Brief description (e.g. Fresh produce, artisan bread, and local crafts)"
                required
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Description (Optional)</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted h-20 focus:outline-none focus:ring-2 focus:ring-focus-ring resize-none"
                placeholder="Additional details, parking info, ticket prices, etc."
              />
            </div>

            {/* Organizer and Website */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organizer (Optional)</label>
                <input
                  value={eventOrganizerName}
                  onChange={(e) => setEventOrganizerName(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="Organization name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Website (Optional)</label>
                <input
                  type="url"
                  value={eventWebsiteUrl}
                  onChange={(e) => setEventWebsiteUrl(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="https://..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmitEvent}
              disabled={isPolishing || !eventTitle.trim() || !eventDate || !eventLocation.trim() || !eventSummary.trim()}
              className="w-full bg-brand-primary text-text-inverse font-bold py-3.5 rounded-xl hover:opacity-90 shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPolishing && <Loader size={18} className="animate-spin" />}
              {isPolishing ? 'Submitting...' : 'Submit Event for Review'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
              Thanks for contributing! All place submissions are reviewed by admins before going live.
            </p>

            {/* Place Image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Place Image (Optional)</label>
              <div className="flex items-center gap-3">
                {placeImagePreview && (
                  <img src={placeImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                )}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Camera size={16} />
                  {placeImagePreview ? 'Change Image' : 'Add Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image must be less than 5MB');
                          return;
                        }
                        setPlaceImageFile(file);
                        setPlaceImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Place Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Place Name *</label>
              <input
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                placeholder="e.g. The Minnow"
                required
              />
            </div>

            {/* Category, Area, Price */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={placeCategory}
                  onChange={(e) => setPlaceCategory(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                >
                  <option>Coffee</option>
                  <option>Pub</option>
                  <option>Restaurant</option>
                  <option>Kids</option>
                  <option>Culture</option>
                  <option>Shopping</option>
                  <option>Services</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Area *</label>
                <input
                  value={placeArea}
                  onChange={(e) => setPlaceArea(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="Town Centre"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price</label>
                <select
                  value={placePrice}
                  onChange={(e) => setPlacePrice(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                >
                  <option>£</option>
                  <option>££</option>
                  <option>£££</option>
                  <option>££££</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Summary * (Why you recommend it)</label>
              <textarea
                value={placeSummary}
                onChange={(e) => setPlaceSummary(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted h-16 focus:outline-none focus:ring-2 focus:ring-focus-ring resize-none"
                placeholder="e.g. Best independent coffee in town. Staff are incredibly friendly..."
                required
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Description (Optional)</label>
              <textarea
                value={placeDescription}
                onChange={(e) => setPlaceDescription(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted h-20 focus:outline-none focus:ring-2 focus:ring-focus-ring resize-none"
                placeholder="Additional details, tips, what to order, etc."
              />
            </div>

            {/* Hours and Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hours (Optional)</label>
                <input
                  value={placeHours}
                  onChange={(e) => setPlaceHours(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="e.g. 7am - 5pm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone (Optional)</label>
                <input
                  value={placePhone}
                  onChange={(e) => setPlacePhone(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="01932 123456"
                />
              </div>
            </div>

            {/* Website and Address */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Website (Optional)</label>
                <input
                  type="url"
                  value={placeWebsite}
                  onChange={(e) => setPlaceWebsite(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address (Optional)</label>
                <input
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="123 High Street"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (Optional, comma-separated)</label>
              <input
                value={placeTags}
                onChange={(e) => setPlaceTags(e.target.value)}
                className="w-full bg-surface-card border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
                placeholder="e.g. Laptop Friendly, Pastries, Good Coffee"
              />
            </div>

            <button
              onClick={handleSubmitPlace}
              disabled={isPolishing || !placeName.trim() || !placeCategory || !placeArea.trim() || !placeSummary.trim()}
              className="w-full bg-brand-primary text-text-inverse font-bold py-3.5 rounded-xl hover:opacity-90 shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPolishing && <Loader size={18} className="animate-spin" />}
              {isPolishing ? 'Submitting...' : 'Submit Place for Review'}
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
                 className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted h-24 focus:outline-none focus:ring-2 focus:ring-focus-ring transition-all resize-none"
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
