# 🗑️ How to Remove Static Menu Items

The static menu items (Juices, Breakfast, Milkshake, Beverages) are stored in Firestore. Here's how to remove them:

## Method 1: Delete via Admin Panel (Easiest)

1. **Login as Admin**
   - Go to `/admin/menu`

2. **Delete Each Item:**
   - Find each item in the list
   - Click the **Delete** (Trash) button
   - Confirm deletion

3. **Items to Delete:**
   - All items in "JUICES" category
   - All items in "BREAKFAST" category  
   - All items in "MILKSHAKE" category
   - All items in "BEVERAGES" category

## Method 2: Set Items as Unavailable (Hide them)

1. **Login as Admin**
   - Go to `/admin/menu`

2. **Hide Items:**
   - Click the **Eye Off** button on each item
   - This sets `available: false`
   - Items won't show on student menu but remain in database

## Method 3: Delete via Firebase Console

1. **Go to Firebase Console**
   - https://console.firebase.google.com/
   - Select your project
   - Go to **Firestore Database**

2. **Delete Documents:**
   - Navigate to `menu` collection
   - Select each document
   - Click **Delete**

## Method 4: Bulk Delete Script (Advanced)

If you have many items, you can use this script in browser console:

```javascript
// WARNING: This will delete ALL menu items
// Only run this if you want to clear the entire menu

const deleteAllMenuItems = async () => {
  const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
  const { db } = await import('./src/firebase/config.js');
  
  const menuRef = collection(db, 'menu');
  const snapshot = await getDocs(menuRef);
  
  const deletePromises = snapshot.docs.map(docSnap => {
    return deleteDoc(doc(db, 'menu', docSnap.id));
  });
  
  await Promise.all(deletePromises);
  console.log(`Deleted ${snapshot.docs.length} menu items`);
};

// Run: deleteAllMenuItems();
```

## Method 5: Delete Specific Items by Name

If you want to delete only the static items you listed:

```javascript
// Delete specific items by name
const deleteStaticItems = async () => {
  const { collection, getDocs, query, where, deleteDoc, doc } = await import('firebase/firestore');
  const { db } = await import('./src/firebase/config.js');
  
  const staticItemNames = [
    'Watermelon Juice',
    'Orange Juice',
    'Pineapple Juice',
    'Mixed Fruit Juice',
    'Mango Juice (Maaza)',
    'Mango Juice (Slice)',
    'Poha',
    'Aloo Paratha',
    'Goan Pav Bhaji',
    'Sada Dosa',
    'Masala Dosa',
    'Idli Sambhar',
    'Banana Milkshake',
    'Chocolate Milkshake',
    'Rose Milkshake',
    'Pista Milkshake',
    'Vanilla Milkshake',
    'Oreo Milkshake',
    'Chai',
    'Cold Coffee',
    'Filter Coffee',
    'Coffee',
    'Cappuccino',
    'Green Tea'
  ];
  
  const menuRef = collection(db, 'menu');
  const snapshot = await getDocs(menuRef);
  
  const itemsToDelete = snapshot.docs.filter(docSnap => {
    const itemName = docSnap.data().name;
    return staticItemNames.includes(itemName);
  });
  
  const deletePromises = itemsToDelete.map(docSnap => {
    console.log(`Deleting: ${docSnap.data().name}`);
    return deleteDoc(doc(db, 'menu', docSnap.id));
  });
  
  await Promise.all(deletePromises);
  console.log(`Deleted ${itemsToDelete.length} static menu items`);
};

// Run: deleteStaticItems();
```

## ⚠️ Important Notes

- **Deleting items is permanent** - they cannot be recovered
- **If items are in orders**, deleting won't affect existing orders
- **Consider setting `available: false`** instead if you might need them later
- **Backup your data** before bulk deleting

## ✅ Recommended Approach

1. **Use Admin Panel** (`/admin/menu`) to delete items one by one
2. Or **set items as unavailable** if you want to keep them for reference
3. Only use bulk delete scripts if you're sure you want to remove everything

