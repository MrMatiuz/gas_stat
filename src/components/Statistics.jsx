const Statistics = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <h3>Нет данных для статистики</h3>
        <p>Добавьте записи о заправках, чтобы увидеть статистику</p>
      </div>
    );
  }

  // Общая статистика
  const totalLiters = records.reduce((sum, r) => sum + (r.liters || 0), 0);
  const totalPrice = records.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const avgPricePerLiter = totalLiters > 0 ? totalPrice / totalLiters : 0;

  // Статистика по машинам
  const statsByCar = records.reduce((acc, record) => {
    const carName = record.car || 'Неизвестная машина';
    if (!acc[carName]) {
      acc[carName] = {
        liters: 0,
        totalPrice: 0,
        records: [],
        minMileage: Infinity,
        maxMileage: 0
      };
    }
    acc[carName].liters += record.liters || 0;
    acc[carName].totalPrice += record.totalPrice || 0;
    acc[carName].records.push(record);
    acc[carName].minMileage = Math.min(acc[carName].minMileage, record.mileage || 0);
    acc[carName].maxMileage = Math.max(acc[carName].maxMileage, record.mileage || 0);
    return acc;
  }, {});

  // Расчет среднего расхода для каждой машины
  Object.keys(statsByCar).forEach(car => {
    const carStats = statsByCar[car];
    const totalDistance = carStats.maxMileage - carStats.minMileage;
    carStats.avgConsumption = totalDistance > 0 
      ? (carStats.liters / totalDistance) * 100 
      : 0;
    carStats.avgPricePerLiter = carStats.liters > 0 
      ? carStats.totalPrice / carStats.liters 
      : 0;
  });

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Всего заправок</h3>
          <div className="value">{records.length}</div>
        </div>
        <div className="stat-card">
          <h3>Всего литров</h3>
          <div className="value">{totalLiters.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <h3>Всего потрачено</h3>
          <div className="value">{totalPrice.toFixed(2)} ₽</div>
        </div>
        <div className="stat-card">
          <h3>Средняя цена за литр</h3>
          <div className="value">{avgPricePerLiter.toFixed(2)} ₽</div>
        </div>
      </div>

      <div className="stats-by-car">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Статистика по машинам</h2>
        {Object.keys(statsByCar).map(car => {
          const carStats = statsByCar[car];
          return (
            <div key={car} className="car-stats">
              <h3>{car}</h3>
              <div className="stats-row">
                <div className="stat-item">
                  <label>Количество заправок</label>
                  <div className="value">{carStats.records.length}</div>
                </div>
                <div className="stat-item">
                  <label>Всего литров</label>
                  <div className="value">{carStats.liters.toFixed(2)} л</div>
                </div>
                <div className="stat-item">
                  <label>Всего потрачено</label>
                  <div className="value">{carStats.totalPrice.toFixed(2)} ₽</div>
                </div>
                <div className="stat-item">
                  <label>Средняя цена за литр</label>
                  <div className="value">{carStats.avgPricePerLiter.toFixed(2)} ₽</div>
                </div>
                <div className="stat-item">
                  <label>Пробег</label>
                  <div className="value">
                    {carStats.minMileage !== Infinity 
                      ? `${carStats.minMileage.toLocaleString('ru-RU')} - ${carStats.maxMileage.toLocaleString('ru-RU')} км`
                      : '-'
                    }
                  </div>
                </div>
                <div className="stat-item">
                  <label>Средний расход</label>
                  <div className="value">
                    {carStats.avgConsumption > 0 
                      ? `${carStats.avgConsumption.toFixed(2)} л/100км`
                      : '-'
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
