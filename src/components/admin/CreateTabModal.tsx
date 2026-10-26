'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoveUp,
  MoveDown,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomFieldDefinition, CustomFieldType, CustomTabConfig } from '@/types';
import { AVAILABLE_TAB_ICONS, TabIconOption, renderTabIcon } from '@/components/admin/TabIconHelper';
import { saveCmsCustomTab } from '@/lib/services/cmsService';

interface CreateTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTabCreated: (tab: CustomTabConfig) => void;
  initialData?: CustomTabConfig | null;
}

const DEFAULT_INITIAL_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'f-title',
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Real-Time Fraud Detection System',
    order: 1,
  },
  {
    id: 'f-desc',
    key: 'description',
    label: 'Description / Summary',
    type: 'long_text',
    required: false,
    placeholder: 'Brief overview or abstract...',
    order: 2,
  },
  {
    id: 'f-date',
    key: 'date',
    label: 'Date / Year',
    type: 'date',
    required: false,
    order: 3,
  },
  {
    id: 'f-link',
    key: 'link_url',
    label: 'External Link / URL',
    type: 'url',
    required: false,
    placeholder: 'https://...',
    order: 4,
  },
];

export const CreateTabModal: React.FC<CreateTabModalProps> = ({
  isOpen,
  onClose,
  onTabCreated,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [tabName, setTabName] = useState('');
  const [singularName, setSingularName] = useState('');
  const [pluralName, setPluralName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [fields, setFields] = useState<CustomFieldDefinition[]>(DEFAULT_INITIAL_FIELDS);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTabName(initialData.name);
      setSingularName(initialData.singular_name || '');
      setPluralName(initialData.plural_name || '');
      setDescription(initialData.description || '');
      setSelectedIcon(initialData.icon || 'Folder');
      setFields(initialData.fields && initialData.fields.length > 0 ? initialData.fields : DEFAULT_INITIAL_FIELDS);
    } else {
      setTabName('');
      setSingularName('');
      setPluralName('');
      setDescription('');
      setSelectedIcon('Folder');
      setFields(DEFAULT_INITIAL_FIELDS);
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  // Auto-generate singular and plural when tab name changes if user hasn't manually entered them
  const handleTabNameChange = (val: string) => {
    setTabName(val);
    if (!isEditing) {
      if (!singularName || singularName === tabName.slice(0, -1) || singularName === tabName) {
        // Simple heuristic
        const clean = val.trim();
        if (clean.endsWith('ies')) {
          setSingularName(clean.slice(0, -3) + 'y');
        } else if (clean.endsWith('s') && !clean.endsWith('ss')) {
          setSingularName(clean.slice(0, -1));
        } else {
          setSingularName(clean);
        }
      }
      if (!pluralName || pluralName === tabName) {
        setPluralName(val.trim());
      }
    }
  };

  const handleAddField = () => {
    const newField: CustomFieldDefinition = {
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'text',
      required: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<CustomFieldDefinition>) => {
    setFields(
      fields.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...updates };
        // If label was updated and key was default/empty, auto-generate key
        if (updates.label !== undefined && (!f.key || f.key.startsWith('field_'))) {
          const autoKey = updates.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)+/g, '');
          if (autoKey) updated.key = autoKey;
        }
        return updated;
      })
    );
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) {
      setErrorMessage('Each tab must have at least one field.');
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const newArr = [...fields];
    const [moved] = newArr.splice(index, 1);
    newArr.splice(targetIdx, 0, moved);
    setFields(newArr.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = tabName.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter a name for the management tab.');
      return;
    }

    if (fields.length === 0) {
      setErrorMessage('Please configure at least one custom field.');
      return;
    }

    // Check for empty labels or duplicate keys
    const keys = new Set<string>();
    for (const f of fields) {
      if (!f.label.trim()) {
        setErrorMessage('All fields must have a non-empty label.');
        return;
      }
      const k = (f.key || f.label)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)+/g, '');
      if (keys.has(k)) {
        setErrorMessage(`Duplicate field key "${k}". Each field must have a unique identifier.`);
        return;
      }
      keys.add(k);
    }

    setIsSaving(true);
    try {
      const sanitizedFields = fields.map((f, idx) => ({
        ...f,
        label: f.label.trim(),
        key: (f.key || f.label)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)+/g, ''),
        order: idx + 1,
      }));

      const payload: Partial<CustomTabConfig> = {
        name: trimmedName,
        singular_name: singularName.trim() || trimmedName,
        plural_name: pluralName.trim() || trimmedName,
        description: description.trim(),
        icon: selectedIcon,
        fields: sanitizedFields,
      };

      if (isEditing && initialData) {
        payload.id = initialData.id;
        payload.slug = initialData.slug;
        payload.order = initialData.order;
        payload.is_archived = initialData.is_archived;
      }

      const res = await saveCmsCustomTab(payload);
      if (res.success && res.data) {
        onTabCreated(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to save management tab. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isEditing ? 'Configure Management Tab' : 'Create New Management Tab'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update fields, display names, and icon for this tab'
                  : 'Define custom portfolio records, fields, and schema'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Tab Identity & Naming</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tab Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tabName}
                onChange={(e) => handleTabNameChange(e.target.value)}
                placeholder="e.g. Case Studies, Research Papers, Client Testimonials, Hackathons"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This appears in the sidebar and navigation header.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Singular Name (Single Item)
                </label>
                <input
                  type="text"
                  value={singularName}
                  onChange={(e) => setSingularName(e.target.value)}
                  placeholder="e.g. Case Study, Paper, Testimonial"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                />
                <span className="text-[10px] text-slate-400">Used on buttons like &quot;+ Add [Singular]&quot;</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plural Name (Collection)
                </label>
                <input
                  type="text"
                  value={pluralName}
                  onChange={(e) => setPluralName(e.target.value)}
                  placeholder="e.g. Case Studies, Papers, Testimonials"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                />
                <span className="text-[10px] text-slate-400">Used in empty states like &quot;No [Plural] added yet&quot;</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Academic papers, preprints, and machine learning research articles"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              />
            </div>
          </div>

          {/* Section 2: Icon Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Select Tab Icon
              </h4>
              <span className="text-xs text-brand-600 font-medium flex items-center gap-1.5 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                {renderTabIcon(selectedIcon, 'w-3.5 h-3.5')}
                <span>Selected: {selectedIcon}</span>
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-slate-50/60 rounded-xl border border-slate-200/70 max-h-40 overflow-y-auto">
              {AVAILABLE_TAB_ICONS.map((opt: TabIconOption) => {
                const Icon = opt.icon;
                const isSelected = selectedIcon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setSelectedIcon(opt.name)}
                    title={opt.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-300'
                        : 'bg-white text-slate-600 hover:text-brand-600 hover:bg-brand-50 border border-slate-200/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] mt-1 truncate max-w-full font-medium">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Fields Builder */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Define Fields for {singularName || 'Item'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Each record in this tab will display these inputs and columns.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddField}
                className="text-xs gap-1 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field</span>
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Field #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 'down')}
                        disabled={idx === fields.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        disabled={fields.length <= 1}
                        title="Delete Field"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-20 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Field Label */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                        placeholder="e.g. Title, Publication Date, Role"
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    {/* Field Type */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(field.id, { type: e.target.value as CustomFieldType })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="text">Text (Single Line)</option>
                        <option value="long_text">Long Text / Paragraph</option>
                        <option value="number">Number / Metric</option>
                        <option value="date">Date</option>
                        <option value="url">URL / Web Link</option>
                        <option value="boolean">Yes/No (Boolean)</option>
                        <option value="select">Select Dropdown</option>
                      </select>
                    </div>

                    {/* Required Toggle */}
                    <div className="sm:col-span-3 flex items-end pb-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                          className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
                        />
                        <span className="text-[11px] font-medium">Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Options input if type === 'select' */}
                  {field.type === 'select' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Dropdown Options (comma separated)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(', ')}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  {/* Placeholder hint for text inputs */}
                  {(field.type === 'text' || field.type === 'long_text' || field.type === 'url') && (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Input Placeholder / Helper
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                        placeholder="e.g. Enter project title or paste link"
                        className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-600"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Tab...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Create Tab'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
