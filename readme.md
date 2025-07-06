# Шаблон для выполнения тестового задания

## Описание

Шаблон подготовлен для того, чтобы попробовать сократить трудоемкость выполнения тестового задания.

В шаблоне настоены контейнеры для `postgres` и приложения на `nodejs`.  
Для взаимодействия с БД используется `knex.js`.  
В контейнере `app` используется `build` для приложения на `ts`, но можно использовать и `js`.

Шаблон не является обязательным!\
Можно использовать как есть или изменять на свой вкус.

Все настройки можно найти в файлах:

- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды:

Запуск базы данных:

```bash
docker compose up -d --build postgres
```

Для выполнения миграций и сидов не из контейнера:

```bash
npm run knex:dev migrate latest
```

```bash
npm run knex:dev seed run
```

Также можно использовать и остальные команды (`migrate make <name>`,`migrate up`, `migrate down` и т.д.)

Для запуска приложения в режиме разработки:

```bash
npm run dev
```

Запуск проверки самого приложения:

```bash
docker compose up -d --build app
```

Для финальной проверки рекомендую:

```bash
docker compose down --rmi local --volumes
docker compose up --build
```

PS: С наилучшими пожеланиями!

# Настройка доступа к Google Sheets API

## 1. Создание проекта в Google Cloud Console

1.  Перейдите в [Google Cloud Console](https://console.cloud.google.com/).
2.  Создайте новый проект или выберите существующий.
3.  В верхней панели выберите ваш проект.

## 2. Включение Google Sheets API

1.  В боковом меню выберите `APIs & Services` → `Library`.
2.  Найдите `Google Sheets API`.
3.  Нажмите на него и затем нажмите `Enable`.

## 3. Создание сервисного аккаунта

1.  Перейдите в `APIs & Services` → `Credentials`.
2.  Нажмите `+ CREATE CREDENTIALS` → `Service account`.
3.  Заполните форму:
    - **Service account name**: `wb-tariffs-service` (или любое другое имя)
    - **Service account ID**: автоматически сгенерируется
    - **Description**: опционально
4.  Нажмите `CREATE AND CONTINUE`.
5.  На шаге "Grant this service account access to project" можно пропустить.
6.  Нажмите `DONE`.

## 4. Создание ключа для сервисного аккаунта

1.  В списке сервисных аккаунтов найдите созданный аккаунт.
2.  Нажмите на email аккаунта.
3.  Перейдите на вкладку `KEYS`.
4.  Нажмите `ADD KEY` → `Create new key`.
5.  Выберите `JSON` и нажмите `CREATE`.
6.  Файл с ключом автоматически скачается на ваш компьютер.

## 5. Извлечение данных из JSON файла

Откройте скачанный JSON файл. Он будет выглядеть примерно так:

```json
{
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
    "client_email": "wb-tariffs-service@your-project-id.iam.gserviceaccount.com",
    "client_id": "client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/wb-tariffs-service%40your-project-id.iam.gserviceaccount.com"
}
```

Из этого файла вам нужны:

- GOOGLE_SERVICE_ACCOUNT_EMAIL = значение поля client_email
- GOOGLE_PRIVATE_KEY = значение поля private_key

## 6. Создание Google Sheets и предоставление доступа

1. Создайте новую Google Таблицу.
2. Скопируйте ID таблицы из URL (это длинная строка между /spreadsheets/d/ и /edit).
3. Нажмите Share (Поделиться).
4. Добавьте email сервисного аккаунта (из поля client_email) с правами Editor.
5. Создайте лист с названием stocks_coefs.
