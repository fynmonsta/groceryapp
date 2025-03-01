import { useState, useEffect } from 'react'
import './App.css'
import AddItemPage from './components/AddItemPage'
import Auth from './components/Auth'
import { auth, db } from './config/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { 
  collection,
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  getDocs
} from 'firebase/firestore'
import SearchItems from './components/SearchItems'

function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('groceryList');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [databaseItems, setDatabaseItems] = useState([]);
  const [image, setImage] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        itemsList.push({ 
          id: doc.id, 
          ...data
        });
      });
      
      setDatabaseItems(itemsList);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(items));
  }, [items]);

  const totalPrice = items
    .filter(item => item.checked)
    .reduce((sum, item) => sum + (item.UnitPrice * parseInt(item.Qty || "1")), 0);

  const toggleItem = async (item) => {
    setItems(prevItems => 
      prevItems.map(i => 
        i.id === item.id 
          ? { ...i, checked: !i.checked }
          : i
      )
    );
  };

  const adjustQuantity = async (item, change) => {
    const newQuantity = parseInt(item.Qty || "1") + change;
    if (newQuantity > 0) {
      setItems(prevItems => 
        prevItems.map(i => 
          i.id === item.id 
            ? { ...i, Qty: newQuantity.toString() }
            : i
        )
      );
    } else {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    }
  };

  const addNewItem = async (newItem) => {
    try {
      const itemsRef = collection(db, 'items');
      
      const q = query(itemsRef, 
        where("ItemName", "==", newItem.ItemName),
        where("Store", "==", newItem.Store),
        where("UnitPrice", "==", newItem.UnitPrice)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const itemToAdd = {
          ItemName: newItem.ItemName,
          Store: newItem.Store,
          UnitPrice: newItem.UnitPrice,
          userId: user.uid,
          createdAt: new Date()
        };
        
        await addDoc(itemsRef, itemToAdd);
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const resetList = async () => {
    try {
      const promises = items.map(item => {
        const itemRef = doc(db, 'items', item.id);
        return updateDoc(itemRef, { checked: false });
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error resetting list: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('groceryList');
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleExistingItemSelect = (selectedItem) => {
    const existingItem = items.find(item => 
      item.ItemName === selectedItem.ItemName &&
      item.Store === selectedItem.Store &&
      item.UnitPrice === selectedItem.UnitPrice
    );

    if (existingItem) {
      adjustQuantity(existingItem, 1);
    } else {
      setItems(prevItems => [...prevItems, {
        ...selectedItem,
        Qty: "1",
        checked: false
      }]);
    }
  };

  const resetGroceryList = () => {
    setItems([]);
    localStorage.removeItem('groceryList');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="shopping-list">
      {!user ? (
        <Auth />
      ) : (
        <>
          <header>
            <div className="header-content">
              <h1>Grocery List</h1>
              <p className={`total ${totalPrice > 200 ? 'over-limit' : 'under-limit'}`}>
                Total: ${totalPrice.toFixed(2)}
              </p>
              <button 
                onClick={handleSignOut}
                className="header-signout"
              >
                Sign Out
              </button>
            </div>
          </header>

          <SearchItems 
            onItemSelect={handleExistingItemSelect}
            userId={user.uid}
            databaseItems={databaseItems}
          />

          <div className="items-list">
            {items.length === 0 ? (
              <p className="empty-list">No items in your list. Add some items!</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item)}
                  />
                  <div className="item-details">
                    <div className="item-info">
                      <span className="item-name">{item.ItemName}</span>
                      <span className="item-store">{item.Store}</span>
                      <span className="item-price">
                        ${item.UnitPrice.toFixed(2)} each
                        {item.Qty > 1 && ` (Total: $${(item.UnitPrice * parseInt(item.Qty)).toFixed(2)})`}
                      </span>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => adjustQuantity(item, -1)}
                        className="quantity-button"
                      >
                        -
                      </button>
                      <span className="quantity">{item.Qty}</span>
                      <button 
                        onClick={() => adjustQuantity(item, 1)}
                        className="quantity-button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <button 
              className="reset-list-button"
              onClick={resetGroceryList}
              title="Clear grocery list"
            >
              Reset List
            </button>
          )}

          {image && <img src={image} alt="Uploaded" className="uploaded-image" />}

          <div className="controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="camera-input"
            />
            <button onClick={resetList} className="reset-button">
              Reset List
            </button>
          </div>

          <button 
            className="add-button"
            onClick={() => setShowAddItem(true)}
            title="Add new item to database"
          />

          {showAddItem && (
            <AddItemPage
              onAdd={addNewItem}
              onClose={() => setShowAddItem(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
