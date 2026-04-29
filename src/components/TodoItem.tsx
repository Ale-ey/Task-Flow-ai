import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2 } from 'lucide-react';
import { Todo, CATEGORIES } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const category = CATEGORIES.find(c => c.value === todo.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-4 bg-white p-4 rounded-2xl shadow-soft border border-slate-100 hover:border-slate-200 transition-all"
    >
      <button
        id={`toggle-${todo.id}`}
        onClick={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          todo.completed
            ? 'bg-brand-primary border-brand-primary'
            : 'border-slate-300 hover:border-brand-primary'
        }`}
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm md:text-base font-medium truncate transition-all ${
            todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'
          }`}
        >
          {todo.text}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${category?.color || 'bg-slate-400'}`} />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            {category?.label}
          </span>
        </div>
      </div>

      <button
        id={`delete-${todo.id}`}
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default TodoItem;
