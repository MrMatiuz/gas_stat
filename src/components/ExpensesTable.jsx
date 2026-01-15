import { deleteRecord, getRecords } from '../utils/storage';

const ExpensesTable = ({ records, onDelete }) => {
  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      deleteRecord(id);
      onDelete();
    }
  };

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <h3>Нет записей</h3>
        <p>Добавьте первую заправку, чтобы увидеть данные здесь</p>
      </div>
    );
  }

  // Группировка по машинам
  const groupedByCar = records.reduce((acc, record) => {
    if (!acc[record.car]) {
      acc[record.car] = [];
    }
    acc[record.car].push(record);
    return acc;
  }, {});

  // Сортировка записей по дате (новые сверху)
  Object.keys(groupedByCar).forEach(car => {
    groupedByCar[car].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return (
    <div>
      {Object.keys(groupedByCar).map(car => (
        <div key={car} style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '15px', color: '#667eea', fontSize: '1.5rem' }}>
            {car}
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Пробег (км)</th>
                  <th>Литры</th>
                  <th>Цена за литр (руб)</th>
                  <th>Общая сумма (руб)</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {groupedByCar[car].map((record) => {
                  return (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString('ru-RU')}</td>
                      <td>{record.mileage.toLocaleString('ru-RU')}</td>
                      <td>{record.liters.toFixed(2)}</td>
                      <td>{record.pricePerLiter.toFixed(2)}</td>
                      <td>{record.totalPrice.toFixed(2)}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(record.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpensesTable;
