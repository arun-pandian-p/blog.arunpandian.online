import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, GripVertical, Trash2 } from 'lucide-react';
import { TextField, EyeToggle } from '../../../components/admin/ui/FormInputs';
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

const skillsSchema = z.object({
  sectionLabel: z.string().min(1, 'Label is required'),
  sectionTitle: z.string().min(1, 'Title is required'),
  categories: z.array(z.object({
    title: z.string().min(1, 'Category title is required'),
    icon: z.string().min(1, 'Icon name is required'),
    items: z.string().min(1, 'At least one skill is required') // We'll edit items as a comma-separated string for simplicity
  })),
  ticker: z.string().min(1, 'Ticker items are required'),
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

export default function SkillsSettings() {
  const { fetchSettings, saveSettings, loading: initLoading } = useSiteSettings('skills');
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const form = useForm({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      sectionLabel: '', sectionTitle: '',
      categories: [],
      ticker: '',
      hiddenFields: []
    }
  });

  // Skills form edits arrays as comma-separated strings; convert back so the
  // public Skills section renders the live draft correctly.
  const toList = (val) =>
    Array.isArray(val)
      ? val
      : String(val || '').split(',').map((i) => i.trim()).filter(Boolean);
  usePreviewSync(form, (v) => ({
    settings: {
      skills: {
        ...v,
        categories: (v.categories || []).map((c) => ({ ...c, items: toList(c.items) })),
        ticker: toList(v.ticker),
      },
    },
  }), '#skills');

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

  const { fields: catFields, append: appendCat, remove: removeCat, move: moveCat } = useFieldArray({
    control: form.control,
    name: "categories"
  });

  useEffect(() => {
    form.register('hiddenFields');
    fetchSettings().then(data => {
      if (data) {
        setInitialData(data);
        form.reset({
          ...data,
          categories: data.categories?.map(c => ({ ...c, items: c.items.join(', ') })) || [],
          ticker: data.ticker?.join(', ') || ''
        });
      }
    });
  }, []);

  const onSubmit = async (values) => {
    setIsSaving(true);
    // Parse comma separated strings back to arrays
    const formattedData = {
      ...initialData,
      ...values,
      categories: values.categories.map(c => ({
        ...c,
        items: c.items.split(',').map(i => i.trim()).filter(Boolean)
      })),
      ticker: values.ticker.split(',').map(i => i.trim()).filter(Boolean)
    };
    
    const success = await saveSettings(formattedData);
    if (success) {
      form.reset(values);
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
      const oldIndex = catFields.findIndex((i) => i.id === active.id);
      const newIndex = catFields.findIndex((i) => i.id === over.id);
      moveCat(oldIndex, newIndex);
    }
  };

  if (initLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8 pb-32">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">Skills Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure your toolkit and infinite marquee ticker.</p>
      </div>

      <SectionCard title="Section Headers" action={<EyeToggle visible={isVisible('sectionHeaders')} onToggle={() => toggleVisibility('sectionHeaders')} label="section headers" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="Section Label" {...form.register('sectionLabel')} error={form.formState.errors.sectionLabel?.message} />
          <TextField label="Section Title" {...form.register('sectionTitle')} error={form.formState.errors.sectionTitle?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Skill Categories" action={<div className="flex items-center gap-2">
            <EyeToggle visible={isVisible('categories')} onToggle={() => toggleVisibility('categories')} label="skill categories" />
            <button type="button" onClick={() => appendCat({ title: '', icon: '', items: '' })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Plus size={16} /> Add Category
            </button>
          </div>}>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={catFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-4">
              {catFields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField 
                        label="Category Title"
                        placeholder="e.g. Languages & Querying" 
                        {...form.register(`categories.${index}.title`)} 
                        error={form.formState.errors.categories?.[index]?.title?.message} 
                      />
                      <TextField 
                        label="Lucide Icon Name"
                        placeholder="e.g. Database" 
                        {...form.register(`categories.${index}.icon`)} 
                        error={form.formState.errors.categories?.[index]?.icon?.message} 
                      />
                      <TextField 
                        label="Skills (Comma separated)"
                        className="md:col-span-2"
                        placeholder="SQL, Python, R" 
                        {...form.register(`categories.${index}.items`)} 
                        error={form.formState.errors.categories?.[index]?.items?.message} 
                      />
                    </div>
                    <button type="button" onClick={() => removeCat(index)} className="mt-8 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </SortableItem>
              ))}
              {catFields.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No categories added.</p>}
            </div>
          </SortableContext>
        </DndContext>
      </SectionCard>

      <SectionCard title="Ticker Items" action={<EyeToggle visible={isVisible('ticker')} onToggle={() => toggleVisibility('ticker')} label="skills ticker" />}>
        <TextField 
          label="Skills Ticker (Comma separated)" 
          placeholder="SQL, Python, React, Next.js"
          {...form.register('ticker')} 
          error={form.formState.errors.ticker?.message} 
        />
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
