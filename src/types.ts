/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'personal' | 'work' | 'shopping' | 'health' | 'urgent';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  userId: string;
  createdAt: any; // Using any to handle both number (local) and Timestamp (Firestore)
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'personal', label: 'Personal', color: 'bg-blue-500' },
  { value: 'work', label: 'Work', color: 'bg-indigo-500' },
  { value: 'shopping', label: 'Shopping', color: 'bg-amber-500' },
  { value: 'health', label: 'Health', color: 'bg-emerald-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-rose-500' },
];
