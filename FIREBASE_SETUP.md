# Настройка Firebase

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com)
2. Нажмите "Add project" (Добавить проект)
3. Введите название проекта (например: `gas-stat`)
4. Следуйте инструкциям для создания проекта

## Шаг 2: Создание веб-приложения

1. В Firebase Console выберите ваш проект
2. Нажмите на иконку веб-приложения (`</>`) или "Add app" > "Web"
3. Зарегистрируйте приложение (можно оставить название по умолчанию)
4. **Скопируйте конфигурацию Firebase** - она понадобится в следующем шаге

## Шаг 3: Настройка Authentication

1. В боковом меню выберите "Authentication"
2. Нажмите "Get started"
3. Перейдите на вкладку "Sign-in method"
4. Включите "Email/Password" метод входа
5. Нажмите "Save"

## Шаг 4: Настройка Firestore Database

1. В боковом меню выберите "Firestore Database"
2. Нажмите "Create database"
3. Выберите режим:
   - **Start in test mode** (для начала работы)
   - Или **Start in production mode** (для продакшена)
4. Выберите регион (ближайший к вам)
5. Нажмите "Enable"

### Создание правил безопасности (важно!)

После создания базы данных, перейдите на вкладку "Rules" и замените правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для машин
    match /cars/{carId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Правила для записей о заправках
    match /fuel_records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Нажмите "Publish" для сохранения правил.

## Шаг 5: Настройка переменных окружения

1. Создайте файл `.env` в корне проекта (рядом с `package.json`)
2. Добавьте следующие переменные с вашими значениями из Firebase:

```env
VITE_FIREBASE_API_KEY=ваш_api_key
VITE_FIREBASE_AUTH_DOMAIN=ваш_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ваш_project_id
VITE_FIREBASE_STORAGE_BUCKET=ваш_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ваш_sender_id
VITE_FIREBASE_APP_ID=ваш_app_id
```

**Где найти эти значения:**
- Откройте Firebase Console > Project Settings > Your apps
- Найдите секцию "SDK setup and configuration"
- Скопируйте значения из объекта `firebaseConfig`

## Шаг 6: Запуск приложения

1. Убедитесь, что файл `.env` создан и заполнен
2. Перезапустите dev-сервер:
   ```bash
   npm run dev
   ```

## Структура базы данных

Приложение автоматически создаст следующие коллекции:

### `cars` (машины)
```javascript
{
  id: "auto-generated-id",
  name: "Toyota Camry",
  userId: "user-id",
  createdAt: Timestamp
}
```

### `fuel_records` (записи о заправках)
```javascript
{
  id: "auto-generated-id",
  userId: "user-id",
  carId: "car-id",
  car: "Toyota Camry", // имя машины для обратной совместимости
  date: "2024-01-15",
  mileage: 50000,
  liters: 40.5,
  pricePerLiter: 45.50,
  totalPrice: 1842.75,
  createdAt: Timestamp
}
```

## Важные замечания

- **Бесплатный план Firebase** включает:
  - 1 GB хранилища Firestore
  - 50,000 чтений/день
  - 20,000 записей/день
  - 20,000 удалений/день

- **Безопасность**: Правила Firestore гарантируют, что пользователи видят только свои данные

- **Индексы**: Firestore может потребовать создать индексы для запросов. Если увидите ошибку, следуйте ссылке в сообщении об ошибке для создания индекса.

## Устранение проблем

### Ошибка "Missing or insufficient permissions"
- Проверьте, что правила Firestore настроены правильно
- Убедитесь, что пользователь авторизован

### Ошибка "The query requires an index"
- Перейдите по ссылке в сообщении об ошибке
- Создайте индекс в Firebase Console

### Переменные окружения не работают
- Убедитесь, что файл называется `.env` (с точкой в начале)
- Перезапустите dev-сервер после создания/изменения `.env`
- Переменные должны начинаться с `VITE_` для Vite
