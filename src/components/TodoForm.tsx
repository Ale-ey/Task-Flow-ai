import { useState, FormEvent } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, CATEGORIES } from '../types';

interface TodoFormProps {
  onAdd: (text: string, category: Category) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, category);
    setText('');
    setIsExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-20">
      <div 
        className={`bg-white rounded-3xl shadow-soft border border-slate-100 transition-all duration-300 ${
          isExpanded ? 'p-6 ring-2 ring-brand-primary/10' : 'p-2'
        }`}
      >
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
              <Plus className="w-5 h-5" />
            </div>
          )}
          <input
            id="todo-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 font-medium py-3 px-2"
          />
          {isExpanded && (
            <button
              id="add-button"
              type="submit"
              disabled={!text.trim()}
              className="p-3 bg-brand-primary text-white rounded-2xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-slate-100 mt-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 ml-1">
                  Select Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      id={`cat-${cat.value}`}
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                        category === cat.value
                          ? `${cat.color} text-white shadow-lg shadow-${cat.color.split('-')[1]}-500/20`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${category === cat.value ? 'bg-white' : cat.color}`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isExpanded && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </form>
  );
}
