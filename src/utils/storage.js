import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Работа с записями о заправках
export const getRecords = async (userId) => {
  if (!userId) return [];
  
  try {
    const recordsRef = collection(db, 'fuel_records');
    const q = query(
      recordsRef, 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Сортировка по дате на клиенте (чтобы избежать необходимости в индексе)
    records.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA; // новые сверху
    });
    
    return records;
  } catch (error) {
    console.error('Error getting records:', error);
    return [];
  }
};

export const addRecord = async (record, userId) => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    const recordsRef = collection(db, 'fuel_records');
    // Преобразуем date в формат, который понимает Firestore
    const recordData = {
      ...record,
      date: record.date, // Firestore автоматически преобразует строку даты
      userId,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(recordsRef, recordData);
    return { id: docRef.id, ...record };
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
};

export const deleteRecord = async (id, userId) => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    await deleteDoc(doc(db, 'fuel_records', id));
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

// Работа с машинами
export const getCars = async (userId) => {
  if (!userId) return [];
  
  try {
    const carsRef = collection(db, 'cars');
    const q = query(
      carsRef, 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const cars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Сортировка по дате создания на клиенте
    cars.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA; // новые сверху
    });
    
    return cars;
  } catch (error) {
    console.error('Error getting cars:', error);
    return [];
  }
};

export const addCar = async (carName, userId) => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    // Проверка на дубликаты
    const existingCars = await getCars(userId);
    const trimmedName = carName.trim();
    
    if (existingCars.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return null; // Машина уже существует
    }
    
    const carsRef = collection(db, 'cars');
    const docRef = await addDoc(carsRef, {
      name: trimmedName,
      userId,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, name: trimmedName, userId };
  } catch (error) {
    console.error('Error adding car:', error);
    throw error;
  }
};

export const deleteCar = async (carId, userId) => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    // Получаем машину
    const cars = await getCars(userId);
    const carToDelete = cars.find(c => c.id === carId);
    
    if (!carToDelete) {
      return false;
    }
    
    // Удаляем машину
    await deleteDoc(doc(db, 'cars', carId));
    
    // Удаляем все записи о заправках для этой машины
    const records = await getRecords(userId);
    const recordsToDelete = records.filter(r => r.carId === carId);
    
    for (const record of recordsToDelete) {
      await deleteDoc(doc(db, 'fuel_records', record.id));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

// Получить список машин для выпадающего списка
export const getCarsList = async (userId) => {
  const cars = await getCars(userId);
  return cars.map(c => c.name).sort();
};
