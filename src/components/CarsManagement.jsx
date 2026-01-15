import { useState, useEffect } from 'react';
import { getCars, addCar, deleteCar } from '../utils/storage';

const CarsManagement = ({ onCarsChange }) => {
  const [cars, setCars] = useState([]);
  const [newCarName, setNewCarName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = () => {
    const data = getCars();
    setCars(data);
    if (onCarsChange) {
      onCarsChange();
    }
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    setError('');

    if (!newCarName.trim()) {
      setError('Введите название машины');
      return;
    }

    const result = addCar(newCarName);
    
    if (result === null) {
      setError('Машина с таким названием уже существует');
      return;
    }

    setNewCarName('');
    loadCars();
  };

  const handleDeleteCar = (id) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    if (window.confirm(`Вы уверены, что хотите удалить машину "${car.name}"?\n\nВнимание: все записи о заправках для этой машины также будут удалены.`)) {
      deleteCar(id);
      loadCars();
      if (onCarsChange) {
        onCarsChange();
      }
    }
  };

  if (cars.length === 0) {
    return (
      <div>
        <div className="form-container">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Управление машинами</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Добавьте машины, чтобы затем записывать расходы на заправку
          </p>
          <form onSubmit={handleAddCar}>
            <div className="form-group">
              <label>Название машины *</label>
              <input
                type="text"
                value={newCarName}
                onChange={(e) => {
                  setNewCarName(e.target.value);
                  setError('');
                }}
                placeholder="Например: Toyota Camry"
                required
              />
              {error && <p style={{ color: '#f5576c', marginTop: '5px', fontSize: '0.9rem' }}>{error}</p>}
            </div>
            <button type="submit" className="btn">
              Добавить машину
            </button>
          </form>
        </div>
        <div className="empty-state">
          <h3>Нет добавленных машин</h3>
          <p>Добавьте первую машину, чтобы начать работу</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="form-container">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Управление машинами</h2>
        <form onSubmit={handleAddCar}>
          <div className="form-group">
            <label>Название машины *</label>
            <input
              type="text"
              value={newCarName}
              onChange={(e) => {
                setNewCarName(e.target.value);
                setError('');
              }}
              placeholder="Например: Toyota Camry"
              required
            />
            {error && <p style={{ color: '#f5576c', marginTop: '5px', fontSize: '0.9rem' }}>{error}</p>}
          </div>
          <button type="submit" className="btn">
            Добавить машину
          </button>
        </form>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Список машин</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Дата добавления</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id}>
                  <td>
                    <strong style={{ color: '#667eea', fontSize: '1.1rem' }}>{car.name}</strong>
                  </td>
                  <td>
                    {new Date(car.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCar(car.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarsManagement;
