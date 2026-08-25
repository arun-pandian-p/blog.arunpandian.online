import React from 'react';
import { useContent } from '../context/ContentProvider';
import logoImg from '../assets/logo.jpg';

export default function Logo({ size = 32, className = '', title }) {
  const { settings } = useContent();
  const dynamicLogo = settings?.branding?.logoUrl;

  return (
    <img
      loading="lazy"
      data-edit-id="branding.logoUrl"
      data-edit-name="Branding · Logo"
      data-edit-kind="image"
      data-edit-path="branding.logoUrl"
      src={dynamicLogo || logoImg || '/favicon.svg'}
      alt={title || "Arun Pandian Logo"}
      style={{ width: size, height: size }}
      className={`object-contain rounded-lg ${className}`}
    />
  );
}
