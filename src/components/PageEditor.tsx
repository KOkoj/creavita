'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import Quill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface PageData {
  _id?: string;
  slug: string;
  title: string;
  content: string;
  image?: string;
  metaDescription: string;
}

interface PageEditorProps {
  pageSlug?: string;
  onClose?: () => void;
}

export default function PageEditor({ pageSlug, onClose }: PageEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PageData>({
    slug: '',
    title: '',
    content: '',
    metaDescription: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  
  // Image upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'align'
  ];

  useEffect(() => {
    // If a page slug is provided, fetch that page's data
    if (pageSlug) {
      fetchPageData(pageSlug);
    }
  }, [pageSlug]);

  async function fetchPageData(slug: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages?slug=${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Create a new page with this slug
          setFormData({
            slug,
            title: '',
            content: '',
            metaDescription: '',
          });
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setFormData(data);
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Failed to load page data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save page');
      }

      // Success!
      const savedPage = await response.json();
      setFormData(savedPage);
      
      // Refresh the page list
      router.refresh();
      
      // Close the editor if a callback was provided
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Error saving page:', err);
      setError(err.message || 'Failed to save page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  function handleEditorChange(content: string) {
    setFormData(prev => ({
      ...prev,
      content
    }));
  }
  
  // Handle image upload
  async function handleImageUpload() {
    if (!uploadFile) {
      setUploadError('Please select an image file.');
      return;
    }
    
    setUploadError('');
    setIsUploading(true);
    setUploadProgress(true);
    
    const imageFormData = new FormData();
    imageFormData.append('file', uploadFile);
    imageFormData.append('title', formData.title || 'Page Image');
    imageFormData.append('description', formData.title || 'Page Image Description');
    imageFormData.append('category', 'Pages');
    
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: imageFormData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const responseData = await res.json();
      
      // Update the form data with the new image URL
      setFormData(prev => ({
        ...prev,
        image: responseData.url || (responseData.images && responseData.images[0]?.url)
      }));
      
      // Reset the file input
      setUploadFile(null);
      const fileInput = document.getElementById('page-image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      setUploadProgress(false);
    } catch (err: any) {
      console.error("Image upload error:", err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 20px',
          border: '3px solid #eaeaea',
          borderTop: '3px solid #F9A01B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Načítání...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '500' }}>
          {pageSlug ? `Upravit stránku: ${formData.title || pageSlug}` : 'Vytvořit novou stránku'}
        </h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            {previewMode ? 'Upravit' : 'Náhled'}
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Zavřít
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {previewMode ? (
        <div style={{ 
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{formData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: formData.content }} />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label 
              htmlFor="slug" 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}
            >
              URL klíč stránky*
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              disabled={!!pageSlug}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              placeholder="napr: about, contact, services"
            />
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              Jednoduchý identifikátor pro URL (např. "about" pro stránku O nás)
            </p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label 
              htmlFor="title" 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}
            >
              Název stránky*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              placeholder="Např: O nás"
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label 
              htmlFor="metaDescription" 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}
            >
              Meta popis (pro SEO)
            </label>
            <input
              type="text"
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              placeholder="Krátký popis stránky pro vyhledávače (max 160 znaků)"
              maxLength={160}
            />
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              {formData.metaDescription.length}/160 znaků
            </p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}
            >
              Obrázek stránky
            </label>
            
            {formData.image && (
              <div style={{ marginBottom: '10px' }}>
                <img 
                  src={formData.image} 
                  alt="Current page image" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '150px', 
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} 
                />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flexGrow: 1 }}>
                <input
                  id="page-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  style={{ 
                    width: '100%', 
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  Nahrajte nový obrázek pro stránku
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={isUploading || !uploadFile}
                style={{
                  padding: '10px 15px',
                  backgroundColor: isUploading ? '#ccc' : '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isUploading || !uploadFile ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isUploading ? 'Nahrávám...' : 'Nahrát obrázek'}
              </button>
            </div>
            
            {uploadError && (
              <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
                {uploadError}
              </p>
            )}
            
            {uploadProgress && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `100%`,
                    backgroundColor: '#3b82f6',
                    borderRadius: '2px',
                    animation: 'progress 1.5s ease-in-out infinite'
                  }}></div>
                </div>
                <style jsx>{`
                  @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>
              </div>
            )}
            
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              Alternativně můžete zadat URL obrázku:
            </p>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image || ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginTop: '5px'
              }}
              placeholder="URL obrázku nebo cesta k obrázku"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="content" 
              style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}
            >
              Obsah stránky*
            </label>
            
            {typeof window !== 'undefined' && (
              <ReactQuill
                value={formData.content}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                style={{
                  height: '350px',
                  marginBottom: '40px'
                }}
              />
            )}
            
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              Použijte editor pro formátování obsahu stránky.
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                backgroundColor: '#F9A01B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Ukládám...' : 'Uložit stránku'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 