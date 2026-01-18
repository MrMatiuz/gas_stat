import { deleteRecord } from '../utils/storage';

const ExpensesTable = ({ records, onDelete, userId }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await deleteRecord(id, userId);
        onDelete();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Ошибка при удалении записи');
      }
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
    const carName = record.car || 'Неизвестная машина';
    if (!acc[carName]) {
      acc[carName] = [];
    }
    acc[carName].push(record);
    return acc;
  }, {});

  // Сортировка записей по дате (новые сверху)
  Object.keys(groupedByCar).forEach(car => {
    groupedByCar[car].sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    });
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
                  const recordDate = record.date?.toDate ? record.date.toDate() : new Date(record.date);
                  
                  return (
                    <tr key={record.id}>
                      <td>{recordDate.toLocaleDateString('ru-RU')}</td>
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
