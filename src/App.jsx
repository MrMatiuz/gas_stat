import { useState, useEffect } from 'react';
import FuelForm from './components/FuelForm';
import ExpensesTable from './components/ExpensesTable';
import Statistics from './components/Statistics';
import CarsManagement from './components/CarsManagement';
import { getRecords, addRecord, getCarsList } from './utils/storage';

function App() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [records, setRecords] = useState([]);
  const [carsList, setCarsList] = useState([]);

  useEffect(() => {
    loadRecords();
    loadCars();
  }, []);

  const loadRecords = () => {
    const data = getRecords();
    // Сортировка по дате (новые сверху)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecords(data);
  };

  const loadCars = () => {
    setCarsList(getCarsList());
  };

  const handleAddRecord = (record) => {
    addRecord(record);
    loadRecords();
  };

  const handleDeleteRecord = () => {
    loadRecords();
  };

  const handleCarsChange = () => {
    loadCars();
    loadRecords(); // Обновляем записи, так как при удалении машины могли удалиться записи
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>⛽ Учет расходов на заправку</h1>
        <p>Отслеживайте расходы на топливо для ваших машин</p>
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
          <CarsManagement onCarsChange={handleCarsChange} />
        ) : activeTab === 'expenses' ? (
          <>
            <FuelForm onAdd={handleAddRecord} carsList={carsList} />
            <ExpensesTable records={records} onDelete={handleDeleteRecord} />
          </>
        ) : (
          <Statistics records={records} />
        )}
      </div>
    </div>
  );
}

export default App;
