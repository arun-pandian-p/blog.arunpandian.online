import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { useContent } from '../context/ContentProvider';

const ease = [0.16, 1, 0.3, 1];

const ContactForm = () => {
  const { settings, submitContact } = useContent();
  const contact = settings.contact || {};
  const hiddenFields = contact.hiddenFields || [];
  const isVisible = (field) => !hiddenFields.includes(field);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ submitting: false, success: null, message: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: null, message: '' });
    try {
      const result = await submitContact(formData);
      setStatus({ submitting: false, success: true, message: result.message || 'Message sent successfully!' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ submitting: false, success: false, message: err.message || 'Something went wrong. Please try again.' });
    }
  };

  const inputCls = 'w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none transition';

  return (
    <section id="contact" className="py-24 sm:py-32 bg-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            {isVisible('sectionHeaders') && (
              <>
                <span data-edit-id="contact.sectionLabel" data-edit-name="Contact · Eyebrow" data-edit-kind="text" data-edit-path="contact.sectionLabel" className="text-xs font-mono tracking-[0.25em] text-accent uppercase">{contact.sectionLabel || '05 — Contact'}</span>
                <h2 data-edit-id="contact.sectionTitle" data-edit-name="Contact · Title" data-edit-kind="heading" data-edit-path="contact.sectionTitle" className="mt-3 font-display font-extrabold text-4xl sm:text-6xl text-ink tracking-tight leading-[0.95]"
                    dangerouslySetInnerHTML={{ __html: (contact.sectionTitle || 'Get in touch').replace('\n', '<br />') }} />
                <p data-edit-id="contact.subtitle" data-edit-name="Contact · Subtitle" data-edit-kind="text" data-edit-path="contact.subtitle" className="mt-6 text-lg text-ink-soft max-w-md leading-relaxed">
                  {contact.subtitle || 'Let us build something together.'}
                </p>
              </>
            )}
            {isVisible('contactDetails') && (
              <>
                <a
                  href={`mailto:${contact.email}`}
                  data-edit-id="contact.email" data-edit-name="Contact · Email" data-edit-kind="link" data-edit-path="contact.email"
                  className="group mt-8 inline-flex items-center gap-2 font-display font-bold text-xl sm:text-2xl text-ink hover:text-accent transition-colors"
                >
                  {contact.email || 'hello@example.com'}
                  <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
                  {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, '')}`} data-edit-id="contact.phone" data-edit-name="Contact · Phone" data-edit-kind="link" data-edit-path="contact.phone" className="hover:text-ink transition-colors">{contact.phone}</a>}
                  {contact.location && <span data-edit-id="contact.location" data-edit-name="Contact · Location" data-edit-kind="text" data-edit-path="contact.location">{contact.location}</span>}
                </div>
              </>
            )}
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-[0_30px_70px_-45px_rgba(9,9,11,0.4)] space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className={inputCls} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@company.com" className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-ink mb-1.5">Subject</label>
              <input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="What's this about?" className={inputCls} />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">Message</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="4" placeholder="Tell me a little about it…" className={`${inputCls} resize-none`} />
            </div>

            {status.message && (
              <div className={`flex items-start gap-2 rounded-xl border p-3.5 text-sm ${status.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`} role="alert">
                {status.success ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}

            <MagneticButton
              as="button"
              type="submit"
              disabled={status.submitting}
              strength={0.2}
              className="w-full gap-2 rounded-xl bg-ink text-white py-3.5 text-sm font-semibold hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {status.submitting ? 'Sending…' : 'Send message'}
              <Send size={15} className={status.submitting ? 'animate-pulse' : ''} />
            </MagneticButton>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
