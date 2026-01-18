import { useState, useEffect } from 'react';
import { getCars, addCar, deleteCar } from '../utils/storage';

const CarsManagement = ({ onCarsChange, userId }) => {
  const [cars, setCars] = useState([]);
  const [newCarName, setNewCarName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
    loadCars();
    }
  }, [userId]);

  const loadCars = async () => {
    if (!userId) return;
    
    try {
      const data = await getCars(userId);
    setCars(data);
    if (onCarsChange) {
      onCarsChange();
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      setError('Ошибка при загрузке машин');
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!newCarName.trim()) {
      setError('Введите название машины');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    try {
      const result = await addCar(newCarName, userId);
    
    if (result === null) {
      setError('Машина с таким названием уже существует');
        setLoading(false);
      return;
    }

    setNewCarName('');
      await loadCars();
    } catch (error) {
      console.error('Error adding car:', error);
      setError('Ошибка при добавлении машины');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    if (window.confirm(`Вы уверены, что хотите удалить машину "${car.name}"?\n\nВнимание: все записи о заправках для этой машины также будут удалены.`)) {
      try {
        await deleteCar(id, userId);
        await loadCars();
      if (onCarsChange) {
        onCarsChange();
        }
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Ошибка при удалении машины');
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
                disabled={loading}
              />
              {error && <p style={{ color: '#f5576c', marginTop: '5px', fontSize: '0.9rem' }}>{error}</p>}
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить машину'}
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
              disabled={loading}
            />
            {error && <p style={{ color: '#f5576c', marginTop: '5px', fontSize: '0.9rem' }}>{error}</p>}
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить машину'}
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
                    {car.createdAt?.toDate 
                      ? new Date(car.createdAt.toDate()).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : car.createdAt 
                        ? new Date(car.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                          })
                        : '-'}
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
