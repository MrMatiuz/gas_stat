import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import FuelForm from './components/FuelForm';
import ExpensesTable from './components/ExpensesTable';
import Statistics from './components/Statistics';
import CarsManagement from './components/CarsManagement';
import Auth from './components/Auth';
import { getRecords, addRecord, getCarsList } from './utils/storage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [records, setRecords] = useState([]);
  const [carsList, setCarsList] = useState([]);

  useEffect(() => {
    // Отслеживание состояния аутентификации
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        loadData(currentUser.uid);
      } else {
        setRecords([]);
        setCarsList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async (userId) => {
    try {
      const [recordsData, carsData] = await Promise.all([
        getRecords(userId),
        getCarsList(userId)
      ]);
      
      setRecords(recordsData);
      setCarsList(carsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddRecord = async (record) => {
    if (!user) return;
    
    try {
      // Получаем carId по имени машины
      const { getCars } = await import('./utils/storage');
      const cars = await getCars(user.uid);
      const car = cars.find(c => c.name === record.car);
      
      if (!car) {
        alert('Машина не найдена');
        return;
      }

      await addRecord({
        ...record,
        carId: car.id,
        car: car.name // Сохраняем имя для обратной совместимости
      }, user.uid);
      
      await loadData(user.uid);
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Ошибка при добавлении записи');
    }
  };

  const handleDeleteRecord = async () => {
    if (!user) return;
    await loadData(user.uid);
  };

  const handleCarsChange = async () => {
    if (!user) return;
    await loadData(user.uid);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1>⛽ Учет расходов на заправку</h1>
          <p>Войдите или зарегистрируйтесь, чтобы начать работу</p>
        </div>
        <div className="tab-content">
          <Auth user={user} onAuthChange={setUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>⛽ Учет расходов на заправку</h1>
        <p>Отслеживайте расходы на топливо для ваших машин</p>
        <div style={{ marginTop: '15px' }}>
          <Auth user={user} onAuthChange={setUser} />
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'cars' ? 'active' : ''}`}
          onClick={() => setActiveTab('cars')}
        >
          🚗 Управление машинами
        </button>
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📋 Таблица расходов
        </button>
        <button
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Статистика
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'cars' ? (
          <CarsManagement onCarsChange={handleCarsChange} userId={user.uid} />
        ) : activeTab === 'expenses' ? (
          <>
            <FuelForm onAdd={handleAddRecord} carsList={carsList} />
            <ExpensesTable records={records} onDelete={handleDeleteRecord} userId={user.uid} />
          </>
        ) : (
          <Statistics records={records} />
        )}
      </div>
    </div>
  );
}

export default App;
