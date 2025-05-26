'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import SharedLayout from './SharedLayout';

interface PageData {
  _id: string;
  slug: string;
  title: string;
  content: string;
  image?: string;
  metaDescription: string;
  lastUpdated: Date;
}

interface ContentPageProps {
  slug: string;
}

// Default content for pages if they don't exist in the database yet
const DEFAULT_CONTENT: Record<string, Omit<PageData, '_id'>> = {
  'about': {
    slug: 'about',
    title: 'O nás',
    content: `
      <h2>Naše příběh</h2>
      <p>CREAVITA je kreativní studio specializující se na grafický design a vizuální identitu. Naším posláním je pomáhat značkám vyjádřit svou jedinečnou osobnost prostřednictvím působivého vizuálního designu.</p>
      <p>Založeno v roce 2015, naše studio vyrostlo z malého týmu nadšenců do respektované kreativní agentury s portfoliem klientů z různých odvětví.</p>
      
      <h2>Naše přístup</h2>
      <p>Věříme, že nejlepší design vzniká z hlubokého porozumění potřebám klienta a jeho cílové skupiny. Proto každý projekt začínáme důkladnou analýzou a strategickým plánováním.</p>
      <p>Naše práce kombinuje estetickou krásu s funkčností a efektivní komunikací, což vede k výsledkům, které nejen skvěle vypadají, ale také plní své cíle.</p>
      
      <h2>Naše tým</h2>
      <p>Náš tým tvoří zkušení designéři, kreativci a projektoví manažeři, kteří přináší do každého projektu svůj jedinečný pohled a odborné znalosti.</p>
    `,
    metaDescription: 'Poznejte CREAVITA - kreativní studio specializující se na grafický design a vizuální identitu značek.',
    lastUpdated: new Date()
  },
  'events': {
    slug: 'events',
    title: 'Eventy',
    content: `
      <h2>Nadcházející události</h2>
      <p>Připravujeme pro vás řadu zajímavých akcí a workshopů. Sledujte náš kalendář a nenechte si ujít příležitost setkat se s námi osobně.</p>
      
      <div class="event-card">
        <h3>Workshop: Základy brandingu</h3>
        <p class="event-date">15. června 2023 | 10:00 - 16:00</p>
        <p>Celodenní workshop zaměřený na základní principy tvorby značky a vizuální identity. Vhodné pro začínající podnikatele a marketingové profesionály.</p>
      </div>
      
      <div class="event-card">
        <h3>Prezentace: Trendy v grafickém designu 2023</h3>
        <p class="event-date">28. července 2023 | 18:00 - 20:00</p>
        <p>Přednáška o aktuálních trendech v grafickém designu a jejich praktickém využití v komerční sféře.</p>
      </div>
      
      <h2>Minulé akce</h2>
      <p>Podívejte se na fotografie a záznamy z našich předchozích událostí.</p>
      
      <div class="event-card">
        <h3>Design Talks: Budoucnost digitálního designu</h3>
        <p class="event-date">20. března 2023</p>
        <p>Diskuzní panel s přednášejícími z předních českých kreativních agentur o směřování digitálního designu v následujících letech.</p>
      </div>
    `,
    metaDescription: 'Připojte se k nám na workshopech, přednáškách a dalších událostech zaměřených na grafický design a kreativitu.',
    lastUpdated: new Date()
  },
  'contact': {
    slug: 'contact',
    title: 'Kontakt',
    content: `
      <h2>Spojte se s námi</h2>
      <p>Máte dotaz, nebo zájem o spolupráci? Neváhejte nás kontaktovat. Rádi se s vámi setkáme a probereme možnosti spolupráce.</p>
      
      <div class="contact-info">
        <div class="contact-method">
          <h3>E-mail</h3>
          <p><a href="mailto:info@creavita.cz">info@creavita.cz</a></p>
        </div>
        
        <div class="contact-method">
          <h3>Telefon</h3>
          <p><a href="tel:+420123456789">+420 123 456 789</a></p>
        </div>
        
        <div class="contact-method">
          <h3>Adresa</h3>
          <p>Dlouhá 123<br />Praha 1, 110 00<br />Česká republika</p>
        </div>
      </div>
      
      <h2>Pracovní doba</h2>
      <p>Pondělí - Pátek: 9:00 - 17:00<br />Víkendy: Zavřeno</p>
      
      <h2>Sledujte nás</h2>
      <div class="social-links">
        <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a> | 
        <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a> | 
        <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a> | 
        <a href="#" target="_blank" rel="noopener noreferrer">Behance</a>
      </div>
    `,
    metaDescription: 'Kontaktujte CREAVITA pro konzultaci nebo spolupráci v oblasti grafického designu a vizuální identity.',
    lastUpdated: new Date()
  }
};

export default function ContentPage({ slug }: ContentPageProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPageData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/pages?slug=${slug}`);
        
        if (!response.ok) {
          // If the page doesn't exist in the database, use default content
          if (response.status === 404 && DEFAULT_CONTENT[slug]) {
            // @ts-ignore - we're adding the _id later
            const defaultContent = DEFAULT_CONTENT[slug];
            setPageData({ ...defaultContent, _id: `default-${slug}` } as PageData);
            return;
          }
          
          throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setPageData(data);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page content. Please try again later.');
        
        // Use default content as fallback if available
        if (DEFAULT_CONTENT[slug]) {
          // @ts-ignore - we're adding the _id later
          const defaultContent = DEFAULT_CONTENT[slug];
          setPageData({ ...defaultContent, _id: `default-${slug}` } as PageData);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPageData();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return (
      <SharedLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50vh',
          padding: '40px 20px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              margin: '0 auto',
              border: '3px solid #eaeaea',
              borderTop: '3px solid #F9A01B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '20px', color: '#666' }}>Načítání...</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </SharedLayout>
    );
  }

  // Error state
  if (error && !pageData) {
    return (
      <SharedLayout>
        <div style={{ 
          padding: '40px 20px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center' 
        }}>
          <h1 style={{ marginBottom: '20px' }}>Něco se pokazilo</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>{error}</p>
          <button 
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#F9A01B',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Zpět na hlavní stránku
          </button>
        </div>
      </SharedLayout>
    );
  }

  // Page not found state
  if (!pageData) {
    return (
      <SharedLayout>
        <div style={{ 
          padding: '40px 20px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center' 
        }}>
          <h1 style={{ marginBottom: '20px' }}>Stránka nenalezena</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Požadovaná stránka bohužel neexistuje.
          </p>
          <button 
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#F9A01B',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Zpět na hlavní stránku
          </button>
        </div>
      </SharedLayout>
    );
  }

  // Render page content within the shared layout
  return (
    <>
      <Head>
        <title>{pageData.title} | CREAVITA</title>
        <meta name="description" content={pageData.metaDescription} />
      </Head>
      
      <SharedLayout>
        <div style={{ 
          maxWidth: '800px', 
          margin: '40px 0',
          padding: '40px 20px'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            marginBottom: '30px',
            fontWeight: '600'
          }}>
            {pageData.title}
          </h1>
          
          {pageData.image && (
            <div style={{ 
              margin: '30px 0',
              textAlign: 'center'
            }}>
              <img 
                src={pageData.image} 
                alt={pageData.title}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
          
          <div 
            className="content"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
            style={{
              lineHeight: '1.6',
              color: '#333'
            }}
          />
          
          <style jsx>{`
            .content h2 {
              font-size: 1.8rem;
              margin-top: 40px;
              margin-bottom: 20px;
              font-weight: 500;
            }
            
            .content h3 {
              font-size: 1.4rem;
              margin-top: 30px;
              margin-bottom: 15px;
              font-weight: 500;
            }
            
            .content p {
              margin-bottom: 20px;
            }
            
            .content a {
              color: #F9A01B;
              text-decoration: none;
            }
            
            .content a:hover {
              text-decoration: underline;
            }
            
            .event-card, .contact-method {
              background-color: #f9f9f9;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            
            .event-date {
              color: #F9A01B;
              font-weight: 500;
              margin-bottom: 10px;
            }
            
            .social-links {
              margin-top: 20px;
            }
            
            .social-links a {
              margin: 0 10px;
              color: #F9A01B;
              text-decoration: none;
            }
            
            .social-links a:hover {
              text-decoration: underline;
            }
            
            @media (max-width: 768px) {
              .content h2 {
                font-size: 1.5rem;
              }
              
              .content h3 {
                font-size: 1.2rem;
              }
            }
          `}</style>
        </div>
      </SharedLayout>
    </>
  );
} 