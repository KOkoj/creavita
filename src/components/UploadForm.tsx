import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file) {
      setError('Please select an image file');
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Nahrát obrázek</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Soubor obrázku
          </label>
          <input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Název
          </label>
          <input
            id="title"
            type="text"
            name="title"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Popis
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Kategorie
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Vyberte kategorii</option>
            <option value="Nature">Příroda</option>
            <option value="Architecture">Architektura</option>
            <option value="People">Lidé</option>
            <option value="Art">Umění</option>
            <option value="Other">Ostatní</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 px-4 rounded text-white ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isUploading ? 'Nahrávání...' : 'Nahrát obrázek'}
        </button>
      </form>
    </div>
  );
} 