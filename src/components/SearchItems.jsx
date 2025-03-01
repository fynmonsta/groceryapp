import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

function SearchItems({ onItemSelect, userId, databaseItems }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchItems = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchTermLower = term.toLowerCase();
      
      // Filter from databaseItems instead of querying Firestore
      const items = databaseItems.filter(item => 
        item.ItemName.toLowerCase().includes(searchTermLower)
      );

      // Remove duplicates based on ItemName, Store, and UnitPrice
      const uniqueItems = items.reduce((acc, current) => {
        const key = `${current.ItemName}-${current.Store}-${current.UnitPrice}`;
        if (!acc[key]) {
          acc[key] = current;
        }
        return acc;
      }, {});

      setSearchResults(Object.values(uniqueItems));
    } catch (error) {
      console.error('Error searching items:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchItems(searchTerm);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleItemSelect = (item) => {
    onItemSelect(item);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Add delete handler
  const handleDelete = async (e, item) => {
    e.stopPropagation(); // Prevent triggering the item selection
    try {
      await deleteDoc(doc(db, 'items', item.id));
      setSearchResults(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="search-items">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search existing items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="search-loading">Searching...</div>
      ) : (
        <div className="search-results">
          {searchResults.map((item) => (
            <div 
              key={`${item.ItemName}-${item.Store}-${item.UnitPrice}`}
              className="search-result-item"
              onClick={() => handleItemSelect(item)}
            >
              <div className="item-name">{item.ItemName}</div>
              <div className="item-details">
                <span className="store">{item.Store}</span>
                <span className="price">${item.UnitPrice.toFixed(2)}</span>
                <button 
                  className="delete-button"
                  onClick={(e) => handleDelete(e, item)}
                  title="Delete item from database"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchItems; 