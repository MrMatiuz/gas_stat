import XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Функция для получения или создания машины
async function getOrCreateCar(carName, userId) {
  const carsRef = collection(db, 'cars');
  const q = query(carsRef, where('userId', '==', userId), where('name', '==', carName));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Машина уже существует
    return querySnapshot.docs[0].id;
  } else {
    // Создаем новую машину
    const docRef = await addDoc(carsRef, {
      name: carName,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
}

// Функция для парсинга даты
function parseDate(dateValue) {
  if (!dateValue) return null;
  
  // Если это уже строка в формате YYYY-MM-DD
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Если это строка в формате DD.MM.YYYY (например, "06.12.2025")
  if (typeof dateValue === 'string' && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateValue)) {
    const [day, month, year] = dateValue.split('.');
    // Форматируем в YYYY-MM-DD
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Если это строка в формате DD/MM/YYYY
  if (typeof dateValue === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
    const [day, month, year] = dateValue.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Если это число (Excel дата)
  if (typeof dateValue === 'number') {
    // Excel даты начинаются с 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // Если это объект Date
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  
  // Попытка распарсить как строку (стандартные форматы)
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

// Основная функция импорта
async function importExcel(filePath, userEmail, userPassword) {
  try {
    console.log('🔐 Вход в Firebase...');
    // Вход в Firebase
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const userId = userCredential.user.uid;
    console.log('✅ Успешный вход. User ID:', userId);

    console.log('📖 Чтение Excel файла...');
    // Чтение Excel файла
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Берем первый лист
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Найдено ${data.length} строк в Excel`);

    if (data.length === 0) {
      console.log('❌ Файл пуст');
      return;
    }

    // Показываем первую строку для проверки структуры
    console.log('\n📋 Пример первой строки данных:');
    console.log(data[0]);
    console.log('\n');

    const recordsRef = collection(db, 'fuel_records');
    let successCount = 0;
    let errorCount = 0;

    console.log('💾 Начало импорта данных...\n');

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Маппинг колонок (настройте под вашу структуру Excel)
        // Предполагаемая структура:
        // - Дата (date, Date, дата)
        // - Машина (car, машина, carName)
        // - Пробег (mileage, пробег, km)
        // - Литры (liters, литры, L)
        // - Цена за литр (pricePerLiter, цена, price) или Общая сумма (totalPrice, сумма, total)
        
        const date = parseDate(
          row['Дата'] || row['date'] || row['Date'] || row['ДАТА'] || 
          row['Дата заправки'] || row['Дата заправки']
        );
        
        const carName = row['Машина'] || row['car'] || row['Car'] || row['МАШИНА'] || 
                       row['Автомобиль'] || row['Название машины'] || row['carName'];
        
        const mileage = parseFloat(row['Пробег'] || row['mileage'] || row['Mileage'] || 
                                   row['ПРОБЕГ'] || row['Пробег (км)'] || row['km'] || 0);
        
        const liters = parseFloat(row['Литры'] || row['liters'] || row['Liters'] || 
                                 row['ЛИТРЫ'] || row['Количество литров'] || row['L'] || 0);
        
        const pricePerLiter = parseFloat(row['Цена за литр'] || row['pricePerLiter'] || 
                                        row['Price'] || row['Цена'] || row['цена'] || 0);
        
        const totalPrice = parseFloat(row['Общая сумма'] || row['totalPrice'] || 
                                     row['Total'] || row['Сумма'] || row['сумма'] || 0);

        // Валидация данных
        if (!date) {
          console.log(`⚠️  Строка ${i + 1}: пропущена (нет даты)`);
          errorCount++;
          continue;
        }

        if (!carName) {
          console.log(`⚠️  Строка ${i + 1}: пропущена (нет названия машины)`);
          errorCount++;
          continue;
        }

        if (!liters || liters <= 0) {
          console.log(`⚠️  Строка ${i + 1}: пропущена (неверное количество литров)`);
          errorCount++;
          continue;
        }

        // Вычисляем недостающие значения
        let finalPricePerLiter = pricePerLiter;
        let finalTotalPrice = totalPrice;

        if (pricePerLiter > 0 && totalPrice === 0) {
          finalTotalPrice = pricePerLiter * liters;
        } else if (totalPrice > 0 && pricePerLiter === 0) {
          finalPricePerLiter = totalPrice / liters;
        } else if (pricePerLiter === 0 && totalPrice === 0) {
          console.log(`⚠️  Строка ${i + 1}: пропущена (нет цены)`);
          errorCount++;
          continue;
        }

        // Получаем или создаем машину
        const carId = await getOrCreateCar(carName.trim(), userId);

        // Добавляем запись в Firestore
        await addDoc(recordsRef, {
          userId,
          carId,
          car: carName.trim(),
          date,
          mileage: mileage || 0,
          liters,
          pricePerLiter: finalPricePerLiter,
          totalPrice: finalTotalPrice,
          createdAt: serverTimestamp()
        });

        successCount++;
        console.log(`✅ Строка ${i + 1}/${data.length}: ${date} - ${carName} - ${liters}л`);
        
      } catch (error) {
        console.error(`❌ Ошибка в строке ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Итоги импорта:');
    console.log(`✅ Успешно импортировано: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log('\n🎉 Импорт завершен!');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Запуск скрипта
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(`
📖 Использование:
  node scripts/import-excel.js <путь_к_excel_файлу> <email> <password>

Пример:
  node scripts/import-excel.js data.xlsx user@example.com mypassword

📋 Формат Excel файла:
  Колонки должны называться (на русском или английском):
  - Дата / Date
  - Машина / Car
  - Пробег / Mileage
  - Литры / Liters
  - Цена за литр / Price (или Общая сумма / Total)
  `);
  process.exit(1);
}

const [filePath, email, password] = args;

// Проверяем существование файла
import { existsSync } from 'fs';
if (!existsSync(filePath)) {
  console.error(`❌ Файл не найден: ${filePath}`);
  process.exit(1);
}

importExcel(filePath, email, password).then(() => {
  console.log('\n✅ Скрипт завершен');
  process.exit(0);
}).catch(error => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});
