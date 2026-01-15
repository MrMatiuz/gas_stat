import { useState, useEffect } from 'react';
import { getCarsList } from '../utils/storage';

const FuelForm = ({ onAdd, carsList = [] }) => {
  const [availableCars, setAvailableCars] = useState([]);
  
  useEffect(() => {
    const cars = getCarsList();
    setAvailableCars(cars);
  }, [carsList]);

  const [formData, setFormData] = useState({
    car: '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    totalPrice: '',
    pricePerLiter: '',
    mileage: '',
    inputMode: 'total' // 'total' or 'perLiter'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Автоматический расчет цены за литр или общей суммы
    if (name === 'totalPrice' && formData.liters && formData.inputMode === 'total') {
      const pricePerLiter = (parseFloat(value) / parseFloat(formData.liters)).toFixed(2);
      setFormData(prev => ({ ...prev, pricePerLiter: pricePerLiter || '' }));
    } else if (name === 'pricePerLiter' && formData.liters && formData.inputMode === 'perLiter') {
      const totalPrice = (parseFloat(value) * parseFloat(formData.liters)).toFixed(2);
      setFormData(prev => ({ ...prev, totalPrice: totalPrice || '' }));
    } else if (name === 'liters') {
      if (formData.inputMode === 'total' && formData.totalPrice) {
        const pricePerLiter = (parseFloat(formData.totalPrice) / parseFloat(value)).toFixed(2);
        setFormData(prev => ({ ...prev, pricePerLiter: pricePerLiter || '' }));
      } else if (formData.inputMode === 'perLiter' && formData.pricePerLiter) {
        const totalPrice = (parseFloat(formData.pricePerLiter) * parseFloat(value)).toFixed(2);
        setFormData(prev => ({ ...prev, totalPrice: totalPrice || '' }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.car || !formData.liters || !formData.mileage) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!formData.totalPrice && !formData.pricePerLiter) {
      alert('Пожалуйста, укажите цену');
      return;
    }

    const record = {
      car: formData.car.trim(),
      date: formData.date,
      liters: parseFloat(formData.liters),
      totalPrice: parseFloat(formData.totalPrice || (formData.pricePerLiter * formData.liters)),
      pricePerLiter: parseFloat(formData.pricePerLiter || (formData.totalPrice / formData.liters)),
      mileage: parseFloat(formData.mileage)
    };

    onAdd(record);

    // Сброс формы
    setFormData({
      car: formData.car, // Сохраняем машину
      date: new Date().toISOString().split('T')[0],
      liters: '',
      totalPrice: '',
      pricePerLiter: '',
      mileage: '',
      inputMode: formData.inputMode
    });
  };

  return (
    <div className="form-container">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Добавить заправку</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Машина *</label>
          {availableCars.length === 0 ? (
            <div style={{ 
              padding: '15px', 
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '8px',
              color: '#856404'
            }}>
              <strong>Внимание:</strong> Сначала добавьте машину на вкладке "Управление машинами"
            </div>
          ) : (
            <select
              name="car"
              value={formData.car}
              onChange={handleChange}
              required
            >
              <option value="">Выберите машину</option>
              {availableCars.map(car => (
                <option key={car} value={car}>{car}</option>
              ))}
            </select>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Дата *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Пробег (км) *</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Количество литров *</label>
          <input
            type="number"
            name="liters"
            value={formData.liters}
            onChange={handleChange}
            placeholder="0"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Режим ввода цены</label>
          <select
            name="inputMode"
            value={formData.inputMode}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                inputMode: e.target.value,
                totalPrice: '',
                pricePerLiter: ''
              }));
            }}
          >
            <option value="total">Общая сумма</option>
            <option value="perLiter">Цена за литр</option>
          </select>
        </div>

        <div className="form-row">
          {formData.inputMode === 'total' ? (
            <>
              <div className="form-group">
                <label>Общая сумма (руб) *</label>
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Цена за литр (руб)</label>
                <input
                  type="number"
                  name="pricePerLiter"
                  value={formData.pricePerLiter}
                  onChange={handleChange}
                  placeholder="Автоматически"
                  step="0.01"
                  readOnly
                  style={{ background: '#f0f0f0' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Цена за литр (руб) *</label>
                <input
                  type="number"
                  name="pricePerLiter"
                  value={formData.pricePerLiter}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Общая сумма (руб)</label>
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  placeholder="Автоматически"
                  step="0.01"
                  readOnly
                  style={{ background: '#f0f0f0' }}
                />
              </div>
            </>
          )}
        </div>

        <button type="submit" className="btn">
          Добавить заправку
        </button>
      </form>
    </div>
  );
};

export default FuelForm;
