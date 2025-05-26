import { memo, useState, useRef, useEffect } from 'react';

interface FilterBarProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  onSearch?: (query: string) => void;
}

// Wrap the entire component in memo to prevent unnecessary re-renders
const FilterBar = memo(function FilterBar({ 
  categories, 
  active, 
  onChange,
  onSearch 
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);
  
  // Toggle mobile filter menu
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Debounced search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    
    // Set new timeout
    debouncedSearchRef.current = setTimeout(() => {
      onSearch?.(query);
    }, 300);
  };
  
  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);
  
  // Focus search field with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <nav aria-label="Gallery filters" role="navigation">
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        {/* Mobile filter toggle button - only visible on small screens */}
        <button
          onClick={toggleFilters}
          className="mobile-filter-toggle"
          aria-expanded={showFilters}
          aria-controls="filter-menu"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'} 
          {active !== 'All' && <span style={{ 
            display: 'inline-block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#0070f3',
            marginLeft: '4px'
          }}></span>}
        </button>
        
        {/* Search input */}
        <div style={{ 
          position: 'relative',
          maxWidth: '300px',
          width: '100%',
          marginLeft: 'auto'
        }}>
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search images... (Ctrl+K)"
            aria-label="Search images"
            style={{
              width: '100%',
              padding: '8px 36px 8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '14px',
              lineHeight: '20px',
              outline: 'none',
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 112, 243, 0.1)';
              e.target.style.borderColor = '#0070f3';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchQuery && (
            <button
              aria-label="Clear search"
              onClick={() => {
                setSearchQuery('');
                onSearch?.('');
                searchRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: '32px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: '#9ca3af',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Filter menu - responsive container */}
      <div 
        id="filter-menu"
        style={{ 
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          gap: 16, 
          marginBottom: 16,
          padding: '4px 0',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: '-ms-autohiding-scrollbar',
        }}
        className="filter-menu"
      >
        <button
          key="all"
          onClick={() => onChange('All')}
          aria-pressed={active === 'All'}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 8px',
            fontSize: 14,
            fontWeight: '500',
            textTransform: 'uppercase',
            borderBottom: active === 'All' ? '2px solid #111827' : '2px solid transparent',
            cursor: 'pointer',
            position: 'relative',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: active === 'All' ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            aria-pressed={active === cat}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              fontSize: 14,
              fontWeight: '500',
              textTransform: 'uppercase',
              borderBottom: active === cat ? '2px solid #111827' : '2px solid transparent',
              cursor: 'pointer',
              position: 'relative',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              opacity: active === cat ? 1 : 0.7,
              transition: 'opacity 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => onChange('Shuffle')}
          aria-label="Shuffle images"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            padding: '4px 8px',
            fontSize: 14,
            fontWeight: '500',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ marginRight: '4px' }}
          >
            <polyline points="16 3 21 3 21 8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21 16 21 21 16 21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
          Shuffle
        </button>
      </div>
      
      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-filter-toggle {
            display: flex;
          }
          .filter-menu {
            display: ${showFilters ? 'flex' : 'none'};
            flex-direction: column;
            gap: 8px;
            max-height: ${showFilters ? '300px' : '0'};
            transition: max-height 0.3s ease;
          }
          .filter-menu button {
            width: 100%;
            text-align: left;
            border-bottom: none !important;
            border-left: ${active === 'All' ? '2px solid #111827' : '2px solid transparent'};
            padding-left: 12px !important;
          }
        }
        /* Scrollbar styling */
        .filter-menu::-webkit-scrollbar {
          height: 4px;
        }
        .filter-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        .filter-menu::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </nav>
  )
});

export default FilterBar; 