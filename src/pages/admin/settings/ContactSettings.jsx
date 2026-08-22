import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { TextField, TextArea, EyeToggle } from '../../../components/admin/ui/FormInputs';
import SaveActionPanel from '../../../components/admin/ui/SaveActionPanel';
import SectionCard from '../../../components/admin/ui/SectionCard';
import { useSiteSettings } from '../../../components/admin/hooks/useSiteSettings';
import { usePreviewSync } from '../../../components/admin/preview/usePreviewSync';

const contactSchema = z.object({
  sectionLabel: z.string().min(1, 'Label is required'),
  sectionTitle: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  hiddenFields: z.array(z.string()).default([]),
});

export default function ContactSettings() {
  const { fetchSettings, saveSettings, loading: initLoading } = useSiteSettings('contact');
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      sectionLabel: '', sectionTitle: '', subtitle: '',
      email: '', phone: '', location: '',
      hiddenFields: []
    }
  });

  usePreviewSync(form, (v) => ({ settings: { contact: v } }), '#contact');

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
    const finalData = { ...initialData, ...values };
    const success = await saveSettings(finalData);
    if (success) {
      form.reset(finalData);
    }
    setIsSaving(false);
  };

  if (initLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8 pb-32">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">Contact Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure your contact details and form headers.</p>
      </div>

      <SectionCard title="Section Headers" action={<EyeToggle visible={isVisible('sectionHeaders')} onToggle={() => toggleVisibility('sectionHeaders')} label="section headers" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="Section Label" {...form.register('sectionLabel')} error={form.formState.errors.sectionLabel?.message} />
          <TextField label="Section Title" {...form.register('sectionTitle')} error={form.formState.errors.sectionTitle?.message} />
          <TextArea label="Subtitle" rows={2} className="md:col-span-2" {...form.register('subtitle')} error={form.formState.errors.subtitle?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Contact Details" action={<EyeToggle visible={isVisible('contactDetails')} onToggle={() => toggleVisibility('contactDetails')} label="contact details" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="Email Address" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
          <TextField label="Phone Number" {...form.register('phone')} error={form.formState.errors.phone?.message} />
          <TextField label="Location" className="md:col-span-2" {...form.register('location')} error={form.formState.errors.location?.message} />
        </div>
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
