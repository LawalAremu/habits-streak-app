import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Habit, HabitCategory, ScheduleType, CATEGORY_CONFIG, HABIT_ICONS, HABIT_TEMPLATES } from '@/types/habit';
import HabitIcon from './IconPicker';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'order'>) => void;
  editHabit?: Habit | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AddEditHabitModal: React.FC<AddEditHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editHabit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [icon, setIcon] = useState('Target');
  const [schedule, setSchedule] = useState<ScheduleType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setCategory(editHabit.category);
      setIcon(editHabit.icon);
      setSchedule(editHabit.schedule);
      setCustomDays(editHabit.customDays || [1, 2, 3, 4, 5]);
      setReminderEnabled(editHabit.reminderEnabled);
      setReminderTime(editHabit.reminderTime || '08:00');
    } else {
      setName('');
      setCategory('health');
      setIcon('Target');
      setSchedule('daily');
      setCustomDays([1, 2, 3, 4, 5]);
      setReminderEnabled(false);
      setReminderTime('08:00');
    }
    setError('');
    setShowTemplates(false);
    setShowIconPicker(false);
  }, [editHabit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }
    onSave({
      name: name.trim(),
      category,
      color: CATEGORY_CONFIG[category].color,
      icon,
      schedule,
      customDays: schedule === 'custom' ? customDays : undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      archived: false,
    });
    onClose();
  };

  const handleTemplateSelect = (template: typeof HABIT_TEMPLATES[0]) => {
    setName(template.name);
    setCategory(template.category);
    setIcon(template.icon);
    setSchedule(template.schedule);
    setShowTemplates(false);
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Templates Toggle */}
          {!editHabit && (
            <div>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Choose from templates
              </button>
              {showTemplates && (
                <div className="mt-3 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {HABIT_TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${CATEGORY_CONFIG[template.category].color}15`, color: CATEGORY_CONFIG[template.category].color }}
                      >
                        <HabitIcon name={template.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{template.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Habit Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g., Drink 8 glasses of water"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
            {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    category === cat
                      ? 'border-current shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={category === cat ? { borderColor: CATEGORY_CONFIG[cat].color, color: CATEGORY_CONFIG[cat].color } : {}}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: CATEGORY_CONFIG[cat].color }}
                  />
                  <span className={`text-xs font-medium ${category === cat ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                    {CATEGORY_CONFIG[cat].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors w-full"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${CATEGORY_CONFIG[category].color}15`, color: CATEGORY_CONFIG[category].color }}
              >
                <HabitIcon name={icon} className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tap to change icon</span>
            </button>
            {showIconPicker && (
              <div className="mt-2 grid grid-cols-8 gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {HABIT_ICONS.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => { setIcon(iconName); setShowIconPicker(false); }}
                    className={`p-2 rounded-lg transition-all ${
                      icon === iconName
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <HabitIcon name={iconName} className="w-5 h-5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Schedule
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['daily', 'weekdays', 'weekends', 'custom'] as ScheduleType[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSchedule(s)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    schedule === s
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {schedule === 'custom' && (
              <div className="mt-3 flex gap-2">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(idx)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      customDays.includes(idx)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Daily Reminder
              </label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {reminderEnabled && (
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all"
            >
              {editHabit ? 'Update' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditHabitModal;
