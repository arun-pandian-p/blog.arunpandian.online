import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, GripVertical, Trash2 } from 'lucide-react';
import { TextField, TextArea, EyeToggle } from '../../../components/admin/ui/FormInputs';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import SaveActionPanel from '../../../components/admin/ui/SaveActionPanel';
import SectionCard from '../../../components/admin/ui/SectionCard';
import { useSiteSettings } from '../../../components/admin/hooks/useSiteSettings';
import { usePreviewSync } from '../../../components/admin/preview/usePreviewSync';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const aboutSchema = z.object({
  sectionLabel: z.string().min(1, 'Label is required'),
  sectionTitle: z.string().min(1, 'Title is required'),
  narrative: z.string().min(1, 'Narrative is required'),
  narrativeExtra: z.string().min(1, 'Extra narrative is required'),
  profileCaption: z.string().min(1, 'Profile caption is required'),
  profileSubCaption: z.string().min(1, 'Profile sub-caption is required'),
  profileImage: z.string().optional(),
  education: z.object({
    school: z.string().min(1, 'School is required'),
    degree: z.string().min(1, 'Degree is required'),
    years: z.string().min(1, 'Years is required'),
  }),
  goals: z.object({
    now: z.string().min(1, 'Goal is required'),
    next: z.string().min(1, 'Future goal is required'),
  }),
  stats: z.array(z.object({
    value: z.string().min(1, 'Value is required'),
    label: z.string().min(1, 'Label is required')
  })),
  hiddenFields: z.array(z.string()).default([]),
});

function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div {...attributes} {...listeners} className="mt-3 cursor-grab text-slate-400 hover:text-slate-700">
        <GripVertical size={20} />
      </div>
      <div className="flex-1">
        {props.children}
      </div>
    </div>
  );
}

export default function AboutSettings() {
  const { fetchSettings, saveSettings, loading: initLoading } = useSiteSettings('about');
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const form = useForm({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      sectionLabel: '', sectionTitle: '', narrative: '', narrativeExtra: '',
      profileCaption: '', profileSubCaption: '', profileImage: '',
      education: { school: '', degree: '', years: '' },
      goals: { now: '', next: '' },
      stats: [],
      hiddenFields: []
    }
  });

  usePreviewSync(form, (v) => ({ settings: { about: v } }), '#about');

  const { fields: statsFields, append: appendStat, remove: removeStat, move: moveStat } = useFieldArray({
    control: form.control,
    name: "stats"
  });

  useEffect(() => {
    form.register('hiddenFields');
    fetchSettings().then(data => {
      if (data) {
        setInitialData(data);
        form.reset(data);
      }
    });
  }, []);

  const onSubmit = async (values) => {
    setIsSaving(true);
    // Merge back arrays like 'stack' that we aren't editing yet
    const finalData = { ...initialData, ...values };
    const success = await saveSettings(finalData);
    if (success) {
      form.reset(finalData);
    }
    setIsSaving(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = statsFields.findIndex((i) => i.id === active.id);
      const newIndex = statsFields.findIndex((i) => i.id === over.id);
      moveStat(oldIndex, newIndex);
    }
  };

  if (initLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;
  }

  const toggleVisibility = (fieldName) => {
    const currentHidden = form.getValues('hiddenFields') || [];
    if (currentHidden.includes(fieldName)) {
      form.setValue('hiddenFields', currentHidden.filter(f => f !== fieldName), { shouldDirty: true });
    } else {
      form.setValue('hiddenFields', [...currentHidden, fieldName], { shouldDirty: true });
    }
  };

  const isVisible = (fieldName) => {
    return !(form.watch('hiddenFields') || []).includes(fieldName);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8 pb-32">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">About Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure your personal narrative, education, and goals.</p>
      </div>

      <SectionCard title="Section Headers" action={<EyeToggle visible={isVisible('sectionHeaders')} onToggle={() => toggleVisibility('sectionHeaders')} label="section headers" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="Section Label" {...form.register('sectionLabel')} error={form.formState.errors.sectionLabel?.message} />
          <TextField label="Section Title" {...form.register('sectionTitle')} error={form.formState.errors.sectionTitle?.message} />
        </div>
      </SectionCard>

      <SectionCard title="The Narrative" action={<EyeToggle visible={isVisible('narrative')} onToggle={() => toggleVisibility('narrative')} label="narrative card" />}>
        <div className="space-y-6">
          <ImageUpload
            label="Profile Image"
            folder="about"
            url={form.watch('profileImage')}
            onUpload={(url) => form.setValue('profileImage', url, { shouldDirty: true })}
          />
          <TextArea label="Primary Narrative" rows={4} {...form.register('narrative')} error={form.formState.errors.narrative?.message} />
          <TextArea label="Secondary Narrative (Extra)" rows={3} {...form.register('narrativeExtra')} error={form.formState.errors.narrativeExtra?.message} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <TextField label="Profile Caption (Name)" {...form.register('profileCaption')} error={form.formState.errors.profileCaption?.message} />
            <TextField label="Profile Sub-caption (Location/Role)" {...form.register('profileSubCaption')} error={form.formState.errors.profileSubCaption?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Goals" action={<EyeToggle visible={isVisible('goals')} onToggle={() => toggleVisibility('goals')} label="goals card" />}>
        <div className="space-y-6">
          <TextArea label="Current Goal (Now)" rows={2} {...form.register('goals.now')} error={form.formState.errors.goals?.now?.message} />
          <TextArea label="Future Goal (Next)" rows={2} {...form.register('goals.next')} error={form.formState.errors.goals?.next?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Education" action={<EyeToggle visible={isVisible('education')} onToggle={() => toggleVisibility('education')} label="education card" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="School / University" className="md:col-span-2" {...form.register('education.school')} error={form.formState.errors.education?.school?.message} />
          <TextField label="Degree" {...form.register('education.degree')} error={form.formState.errors.education?.degree?.message} />
          <TextField label="Years (e.g. 2022 - 2026)" {...form.register('education.years')} error={form.formState.errors.education?.years?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Highlights / Stats" action={<div className="flex items-center gap-2">
            <EyeToggle visible={isVisible('stats')} onToggle={() => toggleVisibility('stats')} label="stats card" />
            <button type="button" onClick={() => appendStat({ value: '', label: '' })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Plus size={16} /> Add Highlight
            </button>
          </div>}>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={statsFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-3">
              {statsFields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="flex gap-4 items-start">
                    <TextField 
                      placeholder="Value (e.g. 3)" 
                      className="w-32" 
                      {...form.register(`stats.${index}.value`)} 
                      error={form.formState.errors.stats?.[index]?.value?.message} 
                    />
                    <TextField 
                      placeholder="Label (e.g. Data projects shipped)" 
                      className="flex-1" 
                      {...form.register(`stats.${index}.label`)} 
                      error={form.formState.errors.stats?.[index]?.label?.message} 
                    />
                    <button type="button" onClick={() => removeStat(index)} className="mt-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </SortableItem>
              ))}
              {statsFields.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No highlights added.</p>}
            </div>
          </SortableContext>
        </DndContext>
      </SectionCard>

      <SaveActionPanel 
        isDirty={form.formState.isDirty} 
        isSaving={isSaving} 
        onDiscard={() => form.reset()} 
        onSave={form.handleSubmit(onSubmit)} 
      />
    </form>
  );
}
