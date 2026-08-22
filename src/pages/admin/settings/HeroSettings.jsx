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

const heroSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  badge: z.string().min(1, 'Badge is required'),
  headlineAccent: z.string().min(1, 'Accent is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  profileImage: z.string().optional(),
  primaryCta: z.object({
    label: z.string().min(1, 'Label is required'),
    href: z.string().min(1, 'Link is required'),
  }),
  secondaryCta: z.object({
    label: z.string().min(1, 'Label is required'),
    href: z.string().min(1, 'Link is required'),
  }),
  videoSrc: z.string().min(1, 'Video source is required'),
  videoCaption: z.string().min(1, 'Caption is required'),
  videoSubCaption: z.string().min(1, 'Sub-caption is required'),
  story: z.array(z.object({
    k: z.string().min(1, 'Letter is required'),
    label: z.string().min(1, 'Label is required')
  })),
  credentials: z.array(z.object({
    value: z.string().min(1, 'Value is required'),
    label: z.string().min(1, 'Label is required')
  })),
  gallery: z.array(z.object({
    url: z.string()
  })).default([]),
  hiddenFields: z.array(z.string()).default([]),
}).passthrough();

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

export default function HeroSettings() {
  const { fetchSettings, saveSettings, loading: initLoading } = useSiteSettings('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const form = useForm({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      name: '', role: '', badge: '', headlineAccent: '', subtitle: '', profileImage: '',
      primaryCta: { label: '', href: '' }, secondaryCta: { label: '', href: '' },
      videoSrc: '', videoCaption: '', videoSubCaption: '',
      story: [], credentials: [], gallery: [],
      hiddenFields: []
    }
  });

  usePreviewSync(form, (v) => ({ settings: { hero: v } }), '#hero');

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

  const eyeProps = (key) => ({
    siteVisible: isVisible(key),
    onToggleVisible: () => toggleVisibility(key),
  });

  const { fields: storyFields, append: appendStory, remove: removeStory, move: moveStory } = useFieldArray({
    control: form.control,
    name: "story"
  });

  const { fields: credFields, append: appendCred, remove: removeCred, move: moveCred } = useFieldArray({
    control: form.control,
    name: "credentials"
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery, move: moveGallery } = useFieldArray({
    control: form.control,
    name: "gallery"
  });

  useEffect(() => {
    form.register('hiddenFields');
    fetchSettings().then(data => {
      if (data) {
        setInitialData(data);
        let resetData = { ...data };
        if (data.hidden && typeof data.hidden === 'object') {
          const extraHiddenFields = Object.entries(data.hidden)
            .filter(([_, isHidden]) => isHidden === true)
            .map(([k]) => k);
          resetData.hiddenFields = Array.from(new Set([...(data.hiddenFields || []), ...extraHiddenFields]));
        }
        form.reset(resetData);
      }
    });
  }, []);

  const onSubmit = async (values) => {
    setIsSaving(true);
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

  const handleDragEnd = (event, type) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const items = type === 'story' ? storyFields : type === 'cred' ? credFields : galleryFields;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (type === 'story') moveStory(oldIndex, newIndex);
      else if (type === 'cred') moveCred(oldIndex, newIndex);
      else moveGallery(oldIndex, newIndex);
    }
  };

  if (initLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8 pb-32">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">Hero Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure the main landing section of your portfolio.</p>
      </div>

      <SectionCard title="General Information" description="Use the eye on each field to show or hide that element on the live site.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ImageUpload
              label="Hero Profile Image"
              folder="hero"
              url={form.watch('profileImage')}
              onUpload={(url) => form.setValue('profileImage', url, { shouldDirty: true })}
            />
          </div>
          <TextField label="Name" {...eyeProps('name')} {...form.register('name')} error={form.formState.errors.name?.message} />
          <TextField label="Role" {...eyeProps('role')} {...form.register('role')} error={form.formState.errors.role?.message} />
          <TextField label="Badge Text" className="md:col-span-2" {...eyeProps('badge')} {...form.register('badge')} error={form.formState.errors.badge?.message} />
          <TextArea label="Subtitle" rows={3} className="md:col-span-2" {...eyeProps('subtitle')} {...form.register('subtitle')} error={form.formState.errors.subtitle?.message} />
          <TextField label="Headline Accent Word" {...eyeProps('headlineAccent')} {...form.register('headlineAccent')} error={form.formState.errors.headlineAccent?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Call to Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm text-slate-700">Primary CTA</h3>
              <EyeToggle visible={isVisible('primaryCta')} onToggle={() => toggleVisibility('primaryCta')} label="Primary CTA" />
            </div>
            <TextField label="Label" {...form.register('primaryCta.label')} error={form.formState.errors.primaryCta?.label?.message} />
            <TextField label="URL / Link" {...form.register('primaryCta.href')} error={form.formState.errors.primaryCta?.href?.message} />
          </div>
          <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm text-slate-700">Secondary CTA</h3>
              <EyeToggle visible={isVisible('secondaryCta')} onToggle={() => toggleVisibility('secondaryCta')} label="Secondary CTA" />
            </div>
            <TextField label="Label" {...form.register('secondaryCta.label')} error={form.formState.errors.secondaryCta?.label?.message} />
            <TextField label="URL / Link" {...form.register('secondaryCta.href')} error={form.formState.errors.secondaryCta?.href?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Hero Media (Video)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2.5">
            <ImageUpload
              label="Hero Video or Image"
              folder="hero"
              accept="image/*,video/*"
              url={form.watch('videoSrc')}
              onUpload={(url) => form.setValue('videoSrc', url, { shouldDirty: true })}
            />
          </div>
          <TextField label="Video Caption" {...eyeProps('videoCaption')} {...form.register('videoCaption')} error={form.formState.errors.videoCaption?.message} />
          <TextField label="Video Sub-caption" {...eyeProps('videoSubCaption')} {...form.register('videoSubCaption')} error={form.formState.errors.videoSubCaption?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Hero Story Cards" action={<>
          <EyeToggle visible={isVisible('story')} onToggle={() => toggleVisibility('story')} label="story strip" />
          <button type="button" onClick={() => appendStory({ k: '', label: '' })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Plus size={16} /> Add Card
          </button></>}>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'story')}>
          <SortableContext items={storyFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {storyFields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="flex gap-4 items-start">
                    <TextField 
                      placeholder="Letter (e.g. S)" 
                      className="w-24" 
                      {...form.register(`story.${index}.k`)} 
                      error={form.formState.errors.story?.[index]?.k?.message} 
                    />
                    <TextField 
                      placeholder="Description" 
                      className="flex-1" 
                      {...form.register(`story.${index}.label`)} 
                      error={form.formState.errors.story?.[index]?.label?.message} 
                    />
                    <button type="button" onClick={() => removeStory(index)} className="mt-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </SortableItem>
              ))}
              {storyFields.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No story cards added.</p>}
            </div>
          </SortableContext>
        </DndContext>
      </SectionCard>

      <SectionCard title="Stats / Credentials" action={<>
          <EyeToggle visible={isVisible('credentials')} onToggle={() => toggleVisibility('credentials')} label="credentials strip" />
          <button type="button" onClick={() => appendCred({ value: '', label: '' })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Plus size={16} /> Add Stat
          </button></>}>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'cred')}>
          <SortableContext items={credFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-3">
              {credFields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="flex gap-4 items-start">
                    <TextField 
                      placeholder="Value (e.g. 2026)" 
                      className="w-32" 
                      {...form.register(`credentials.${index}.value`)} 
                      error={form.formState.errors.credentials?.[index]?.value?.message} 
                    />
                    <TextField 
                      placeholder="Label" 
                      className="flex-1" 
                      {...form.register(`credentials.${index}.label`)} 
                      error={form.formState.errors.credentials?.[index]?.label?.message} 
                    />
                    <button type="button" onClick={() => removeCred(index)} className="mt-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </SortableItem>
              ))}
              {credFields.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No stats added.</p>}
            </div>
          </SortableContext>
        </DndContext>
      </SectionCard>

      <SectionCard title="Hero Gallery (For Grid Layouts)" action={<>
          <EyeToggle visible={isVisible('gallery')} onToggle={() => toggleVisibility('gallery')} label="gallery section" />
          <button type="button" onClick={() => appendGallery({ url: '' })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Plus size={16} /> Add Image
          </button></>}>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'gallery')}>
          <SortableContext items={galleryFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryFields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="flex gap-4 items-start w-full relative">
                    <div className="flex-1 min-w-0">
                      <ImageUpload 
                        label={`Image ${index + 1}`}
                        folder="hero_gallery"
                        url={form.watch(`gallery.${index}.url`)}
                        onUpload={(url) => form.setValue(`gallery.${index}.url`, url, { shouldDirty: true })}
                      />
                    </div>
                    <button type="button" onClick={() => removeGallery(index)} className="absolute top-0 right-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white/90 shadow-sm border border-slate-100 m-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </SortableItem>
              ))}
              {galleryFields.length === 0 && <p className="text-sm text-slate-500 py-4 col-span-full">No gallery images added.</p>}
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
