import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ListChecks, LayoutGrid, LogOut, LogIn, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout } from './lib/firebase';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import TodoItem from './components/TodoItem';
import TodoForm from './components/TodoForm';
import { Todo, Category, CATEGORIES } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  // Auth Subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Create/Update user doc
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          // We only set createdAt if it doesn't exist yet by using setDoc with merge or a more complex check
          // But for simplicity, we'll just use serverTimestamp() which matches rules' request.time
          lastLogin: serverTimestamp() 
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
      }
    });
    return unsubscribe;
  }, []);

  // Firestore Snapshots Subscription
  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    const path = `users/${user.uid}/todos`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoList = snapshot.docs.map(doc => doc.data() as Todo);
      setTodos(todoList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return unsubscribe;
  }, [user]);

  const addTodo = async (text: string, category: Category) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const path = `users/${user.uid}/todos`;
    const newTodo: Todo = {
      id,
      text,
      completed: false,
      category,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, path, id), newTodo);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${path}/${id}`);
    }
  };

  const toggleTodo = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/todos/${id}`;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', id), {
        completed: !todo.completed
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/todos/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      })
      .filter(t => {
        if (activeCategory === 'all') return true;
        return t.category === activeCategory;
      });
  }, [todos, filter, activeCategory]);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
        <div className="bg-decoration" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass p-10 rounded-[3rem] shadow-soft border border-slate-200 text-center space-y-8 relative z-10"
        >
          <div className="inline-flex p-4 bg-brand-primary rounded-3xl text-white shadow-xl shadow-blue-500/30">
            <Target className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Tasked</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Experience the next generation of task management. Built for speed, designed for clarity.
            </p>
          </div>
          <button
            id="login-button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-4 px-8 rounded-2xl border-2 border-slate-100 hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm group"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Continue with Google
          </button>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure Authentication via Firebase</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 md:py-20 lg:px-8">
      <div className="bg-decoration" />
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2.5 bg-brand-primary rounded-xl text-white shadow-lg shadow-blue-500/20">
                  <Target className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasked</h1>
              </motion.div>
              <p className="text-slate-500 font-medium ml-1">Hey, {user.displayName?.split(' ')[0]}! Ready for today?</p>
            </div>
            
            <button
              id="logout-button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-slate-200/60 transition-all text-xs font-bold uppercase tracking-wider"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
          
          <div className="flex items-center gap-4 bg-white/50 p-1 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
            <div className="px-3 py-1 text-center">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Done</span>
              <span className="block text-sm font-mono font-bold text-emerald-600">{stats.completed}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="px-3 py-1 text-center">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Total</span>
              <span className="block text-sm font-mono font-bold text-slate-700">{stats.total}</span>
            </div>
            {user.photoURL && (
              <>
                <div className="w-px h-6 bg-slate-200" />
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-lg outline outline-2 outline-white shadow-sm" referrerPolicy="no-referrer" />
              </>
            )}
          </div>
        </header>

        {/* Action Section */}
        <TodoForm onAdd={addTodo} />

        {/* Filters Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-slate-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Your Tasks</h2>
            </div>
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              {(['all', 'active', 'completed'] as const).map(f => (
                <button
                  id={`filter-${f}`}
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    filter === f 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
            <button
              id="cat-filter-all"
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                id={`cat-filter-${cat.value}`}
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeCategory === cat.value
                    ? `${cat.color} text-white border-transparent`
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activeCategory === cat.value ? 'bg-white' : cat.color}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Section */}
        <div className="space-y-3 min-h-[300px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredTodos.length > 0 ? (
              filteredTodos.map(todo => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={toggleTodo} 
                  onDelete={deleteTodo} 
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <LayoutGrid className="w-8 h-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-700">No tasks found</h3>
                  <p className="text-sm text-slate-400">Change your filters or add a new task to get started.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="pt-20 pb-4 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            DESIGNED FOR PRODUCTIVITY &bull; 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

