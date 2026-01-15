const STORAGE_KEY = 'gas_stat_records';
const CARS_STORAGE_KEY = 'gas_stat_cars';

// Работа с записями о заправках
export const getRecords = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const addRecord = (record) => {
  const records = getRecords();
  records.push({
    ...record,
    id: Date.now().toString(),
  });
  saveRecords(records);
  return records;
};

export const deleteRecord = (id) => {
  const records = getRecords();
  const filtered = records.filter(r => r.id !== id);
  saveRecords(filtered);
  return filtered;
};

// Работа с машинами
export const getCars = () => {
  const data = localStorage.getItem(CARS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCars = (cars) => {
  localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(cars));
};

export const addCar = (carName) => {
  const cars = getCars();
  const trimmedName = carName.trim();
  
  // Проверка на дубликаты
  if (cars.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    return null; // Машина уже существует
  }
  
  const newCar = {
    id: Date.now().toString(),
    name: trimmedName,
    createdAt: new Date().toISOString()
  };
  
  cars.push(newCar);
  saveCars(cars);
  return cars;
};

export const deleteCar = (id) => {
  const cars = getCars();
  const carToDelete = cars.find(c => c.id === id);
  
  if (!carToDelete) {
    return cars;
  }
  
  // Удаляем машину из списка
  const filtered = cars.filter(c => c.id !== id);
  saveCars(filtered);
  
  // Удаляем все записи о заправках для этой машины
  const records = getRecords();
  const filteredRecords = records.filter(r => r.car !== carToDelete.name);
  saveRecords(filteredRecords);
  
  return filtered;
};

// Получить список машин для выпадающего списка
export const getCarsList = () => {
  return getCars().map(c => c.name).sort();
};
