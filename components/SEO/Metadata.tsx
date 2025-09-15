// components/DynamicMetadata/DynamicMetadata.tsx
'use client';

import { useEffect } from 'react';
import Head from 'next/head';

interface DynamicMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

const DynamicMetadata: React.FC<DynamicMetadataProps> = ({
  title = 'Sistema de Gerenciamento',
  description = 'Sistema de gerenciamento de menus e permissões',
  keywords = ['menu', 'gerenciamento', 'permissoes', 'sistema'],
  ogTitle,
  ogDescription,
  ogImage = '/og-image.png',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl
}) => {
  // Atualiza o título da página
  useEffect(() => {
    document.title = title;
  }, [title]);

  // Gera título completo para SEO
  const fullTitle = title === 'Sistema de Gerenciamento' 
    ? title 
    : `${title} | Sistema de Gerenciamento`;

  // Valores padrão para Open Graph e Twitter
  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || description;
  const finalOgImage = ogImage;
  const finalOgUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : '');
  
  const finalTwitterTitle = twitterTitle || finalOgTitle;
  const finalTwitterDescription = twitterDescription || finalOgDescription;
  const finalTwitterImage = twitterImage || finalOgImage;

  return (
    <Head>
      {/* Metadados básicos */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={finalTwitterImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Head>
  );
};

export default DynamicMetadata;