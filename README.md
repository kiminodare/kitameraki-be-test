# Task Management API (Backend)

Backend service untuk Task Management App, menggunakan **Azure Functions** dan **Cosmos DB**, ditulis dengan **TypeScript**.

---

## 🚀 Getting Started

### 1️⃣ Install dependencies
Gunakan [Bun](https://bun.sh) untuk menginstall dependencies:
```bash
bun install
```

### 2️⃣ Jalankan lokal

Gunakan Azure Functions Core Tools untuk menjalankan backend:

```bash
bun start
# atau langsung gunakan
func start
```

Service akan berjalan di: **[http://localhost:7071](http://localhost:7071)**

---

## 🏗️ Build for Production

Untuk membuat build production:

```bash
bun run build
```

Deploy hasil build ke **Azure Function App**.

---

## 📦 Environment Variables

Buat file `local.settings.json` (untuk lokal) dengan struktur berikut:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_CONNECTION_STRING": "<connection-string-cosmosdb>"
  }
}
```

---

## 🛠️ Tech Stack

* **Runtime:** Azure Functions (Node.js)
* **Database:** Azure Cosmos DB
* **Validation:** Zod
* **Middleware:** Custom middleware untuk logging & error handling
* **Response Pattern:** Struktur respons statis dengan field `result` yang dinamis

---

## 📑 Response Format

Semua endpoint mengikuti format respons berikut:

```json
{
  "success": true,
  "message": "Request processed successfully",
  "result": { }
}
```

Field `result` berisi data yang berubah sesuai endpoint, sementara struktur lainnya tetap konsisten.

---

## 🔗 Useful Links

* [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
* [Azure Cosmos DB Documentation](https://learn.microsoft.com/azure/cosmos-db/)
* [Zod Documentation](https://zod.dev/)
