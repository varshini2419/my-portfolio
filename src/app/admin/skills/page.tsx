'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  Sparkles,
  Save,
  Tag
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkillCategory, SkillItem } from '@/types';
import {
  getCmsSkills,
  addCmsSkill,
  deleteCmsSkill,
  saveCmsSkillCategory
} from '@/lib/services/cmsService';

export default function AdminSkillsPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Skill Modal
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillFeatured, setNewSkillFeatured] = useState(false);

  // New Category Modal
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsSkills();
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('cms_storage_updated', handleUpdate);
    return () => window.removeEventListener('cms_storage_updated', handleUpdate);
  }, []);

  const totalSkills = categories.reduce((acc, cat) => acc + cat.skills.length, 0);

  const handleOpenAddSkill = (catName: string) => {
    setSelectedCategory(catName);
    setNewSkillName('');
    setNewSkillDesc('');
    setNewSkillFeatured(false);
    setErrorMessage(null);
    setIsAddSkillModalOpen(true);
  };

  const handleSaveNewSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !selectedCategory) return;
    setErrorMessage(null);

    const res = await addCmsSkill(selectedCategory, {
      name: newSkillName.trim(),
      description: newSkillDesc.trim() || undefined,
      is_featured: newSkillFeatured
    });

    if (res.success) {
      setSuccessMessage(`Skill "${newSkillName.trim()}" added to ${selectedCategory}.`);
      setIsAddSkillModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (catName: string, skillName: string) => {
    setErrorMessage(null);
    const res = await deleteCmsSkill(catName, skillName);
    if (res.success) {
      setSuccessMessage(`Skill "${skillName}" removed.`);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to delete skill.');
    }
  };

  const handleToggleFeatured = async (catName: string, skill: SkillItem) => {
    const category = categories.find((c) => c.name === catName);
    if (!category) return;
    setErrorMessage(null);

    const updatedSkills = category.skills.map((s) =>
      s.name === skill.name ? { ...s, is_featured: !s.is_featured } : s
    );

    const res = await saveCmsSkillCategory({ ...category, skills: updatedSkills });
    if (res.success) {
      loadData();
    } else {
      setErrorMessage(res.error || 'Failed to update skill.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const exists = categories.some((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
    if (exists) {
      setErrorMessage('A category with this name already exists.');
      return;
    }

    setErrorMessage(null);
    const newCategory: SkillCategory = {
      name: newCategoryName.trim(),
      description: 'Custom analytical skillset category',
      skills: []
    };

    const res = await saveCmsSkillCategory(newCategory);
    if (res.success) {
      setSuccessMessage(`Category "${newCategoryName.trim()}" created.`);
      setIsAddCategoryModalOpen(false);
      setNewCategoryName('');
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to create skill category.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Skills & Technologies"
        subtitle="Manage analytical competencies, BI tools, database engines, and technical qualifications."
      />

      <main className="p-6 sm:p-8 max-w-6xl space-y-6 flex-grow">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-400/80 text-brand-700 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-brand-600 hover:text-brand-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configured Technical Skills</h3>
            <p className="text-xs text-slate-500">
              {totalSkills} active skills across {categories.length} organized categories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddCategoryModalOpen(true)}
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading skills...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="p-6 space-y-4 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-600" />
                        <span>{category.name}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{category.description}</p>
                    </div>
                    <Badge variant="slate" size="sm">{category.skills.length} skills</Badge>
                  </div>

                  <div className="space-y-2 pt-3">
                    {category.skills.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center italic">No skills registered yet.</p>
                    ) : (
                      category.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{skill.name}</span>
                            {skill.description && (
                              <span className="text-[10px] text-slate-400 hidden sm:inline">• {skill.description}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Toggle Core/Featured */}
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(category.name, skill)}
                              className={`p-1 rounded-md transition-colors ${
                                skill.is_featured
                                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                  : 'text-slate-300 hover:text-amber-500 hover:bg-slate-200/50'
                              }`}
                              title={skill.is_featured ? 'Core Skill (Featured)' : 'Click to mark as Core Skill'}
                            >
                              <Star className={`w-3.5 h-3.5 ${skill.is_featured ? 'fill-amber-500' : ''}`} />
                            </button>

                            {/* Delete Skill */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(category.name, skill.name)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-brand-600 hover:text-brand-700 hover:bg-brand-50/50"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenAddSkill(category.name)}
                  >
                    Add Skill to {category.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add Skill */}
        {isAddSkillModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Add Skill to {selectedCategory}</h4>
                <button onClick={() => setIsAddSkillModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewSkill} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Window Functions, Power BI DAX, NumPy"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Skill / Context (Optional)</label>
                  <input
                    type="text"
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    placeholder="e.g. Lead/Lag, Dense_Rank, CTEs"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newSkillFeatured}
                      onChange={(e) => setNewSkillFeatured(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Mark as Core / Highlighted Skill</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddSkillModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                    Save Skill
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Category */}
        {isAddCategoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Add New Skill Category</h4>
                <button onClick={() => setIsAddCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Cloud & Big Data Technologies"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddCategoryModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                    Create Category
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
