// hooks/useDynamicMetadata.ts
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseDynamicMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

export const useDynamicMetadata = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl
}: UseDynamicMetadataProps = {}) => {
  const router = useRouter();
  
  useEffect(() => {
    // Atualiza o título da página
    if (title) {
      const fullTitle = title === 'Sistema de Gerenciamento' 
        ? title 
        : `${title} | Sistema de Gerenciamento`;
      
      document.title = fullTitle;
      
      // Atualiza meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && description) {
        metaDescription.setAttribute('content', description);
      } else if (description) {
        const newMetaDescription = document.createElement('meta');
        newMetaDescription.name = 'description';
        newMetaDescription.content = description;
        document.head.appendChild(newMetaDescription);
      }
      
      // Atualiza meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords && keywords) {
        metaKeywords.setAttribute('content', keywords.join(', '));
      } else if (keywords) {
        const newMetaKeywords = document.createElement('meta');
        newMetaKeywords.name = 'keywords';
        newMetaKeywords.content = keywords.join(', ');
        document.head.appendChild(newMetaKeywords);
      }
      
      // Atualiza Open Graph
      const updateMetaProperty = (property: string, content: string) => {
        const meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) {
          meta.setAttribute('content', content);
        } else {
          const newMeta = document.createElement('meta');
          newMeta.setAttribute('property', property);
          newMeta.content = content;
          document.head.appendChild(newMeta);
        }
      };
      
      if (ogTitle) updateMetaProperty('og:title', ogTitle);
      if (ogDescription) updateMetaProperty('og:description', ogDescription);
      if (ogImage) updateMetaProperty('og:image', ogImage);
      updateMetaProperty('og:url', window.location.href);
      
      // Atualiza Twitter
      if (twitterTitle) updateMetaProperty('twitter:title', twitterTitle);
      if (twitterDescription) updateMetaProperty('twitter:description', twitterDescription);
      if (twitterImage) updateMetaProperty('twitter:image', twitterImage);
      if (twitterCard) updateMetaProperty('twitter:card', twitterCard);
      
      // Atualiza canonical URL
      if (canonicalUrl) {
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (link) {
          link.href = canonicalUrl;
        } else {
          link = document.createElement('link');
          link.rel = 'canonical';
          link.href = canonicalUrl;
          document.head.appendChild(link);
        }
      }
    }
  }, [
    title, description, keywords, ogTitle, ogDescription, ogImage, 
    twitterCard, twitterTitle, twitterDescription, twitterImage, 
    canonicalUrl, router
  ]);
};