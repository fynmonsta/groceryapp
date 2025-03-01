import { useState, useEffect } from 'react';

function AddItemPage({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    store: '',
    price: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isStoreListOpen, setIsStoreListOpen] = useState(false);

  // Initial store list - this would later be fetched from Firebase
  const stores = [
    // Supermarkets
    "Woolworths",
    "Coles",
    "ALDI",
    "IGA",
    "Foodland",
    "Harris Farm Markets",
    // Pharmacies/Chemists
    "Chemist Warehouse",
    "Priceline Pharmacy",
    "Terry White Chemmart",
    "Amcal",
    "Guardian Pharmacy",
    "Blooms The Chemist",
    // Department Stores
    "Big W",
    "Kmart",
    "Target",
    // Specialty
    "Dan Murphy's",
    "BWS",
    "Liquorland",
    "The Reject Shop",
  ].sort();

  const filteredStores = stores.filter(store =>
    store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreSelect = (store) => {
    setFormData(prev => ({
      ...prev,
      store: store
    }));
    setSearchTerm('');
    setIsStoreListOpen(false);
  };

  const handleStoreSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFormData(prev => ({
      ...prev,
      store: e.target.value
    }));
    setIsStoreListOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newItem = {
      ItemName: formData.name,
      Store: formData.store,
      UnitPrice: parseFloat(formData.price)
    };
    console.log('Submitting new item:', newItem);
    onAdd(newItem);
    onClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.store-select-container')) {
        setIsStoreListOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="add-item-page">
      <div className="add-item-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label htmlFor="name">Item Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Milk"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="store">Store</label>
            <div className="store-select-container">
              <input
                id="store"
                type="text"
                value={formData.store}
                onChange={handleStoreSearchChange}
                onFocus={() => setIsStoreListOpen(true)}
                placeholder="Search store..."
                required
              />
              {isStoreListOpen && filteredStores.length > 0 && (
                <ul className="store-dropdown">
                  {filteredStores.map((store, index) => (
                    <li
                      key={index}
                      onClick={() => handleStoreSelect(store)}
                      className={store === formData.store ? 'selected' : ''}
                    >
                      {store}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <div className="price-input-container">
              <span className="currency-symbol">$</span>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemPage; 