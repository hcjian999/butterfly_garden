# 清華蝴蝶園導覽統計系統

> NTHU Butterfly Garden Guide & Statistics System

---

## 版本資訊

| 項目 | 內容 |
|------|------|
| **版本號** | v1.1.0 |
| **發布日期** | 2026-07-09 |
| **狀態** | ✅ 釋出 |
| **授權** | 私人使用 |

---

## 專案簡介

清華大學蝴蝶園的互動式導覽與生態統計系統，基於 SVG 蝴蝶花園輪廓地圖。

- 🌿 在地圖上標記植物位置，記錄名稱、學名、數量、照片
- 🥚 在植物下記錄蝴蝶卵的發現（蝶種、數量、日期、照片）
- 🐛 在植物下記錄幼蟲的觀察（蝶種、齡期、數量、日期、照片）
- 🦪 在植物下記錄蛹的狀態（蝶種、位置、預計羽化日、照片）
- 📋 側邊欄管理所有植物與附屬記錄
- 💾 資料儲存於瀏覽器 LocalStorage，支援 JSON 匯出/匯入

---

## 使用方式

### 開發者（維護版本）

```bash
npm install        # 安裝依賴
npm run dev        # 啟動開發伺服器 (http://localhost:5173)
npm run build      # 建置單檔案產出 (dist/index.html)
```

### 一般使用者（觀看）

直接雙擊 `butterfly_garden.html`，用瀏覽器開啟即可。

---

## 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 前端框架 | React | 18 |
| 語言 | TypeScript | 5 |
| 建構工具 | Vite | 5 |
| CSS 框架 | Tailwind CSS | 3 |
| 單檔案插件 | vite-plugin-singlefile | - |
| 圖片處理 | Canvas API | 原生 |
| 資料儲存 | LocalStorage | 原生 |

---

## 功能清單

### v1.0.0

- [x] SVG 蝴蝶輪廓地圖背景（含溫室、涼亭）
- [x] 地圖平移與縮放
- [x] 植物標示點（點擊地圖新增、拖曳移動）
- [x] 植物資訊管理（名稱、學名、品種、數量、日期、備註、照片）
- [x] 蝴蝶生態記錄（卵 / 幼蟲 / 蛹，附屬在植物下）
- [x] 照片上傳與前端自動壓縮
- [x] 右側側邊欄（植物列表、虛擬滾動、搜尋）
- [x] 底部篩選列（有卵 / 有幼蟲 / 有蛹）
- [x] LocalStorage 自動儲存
- [x] JSON 匯出 / 匯入（含照片）
- [x] 單檔案建置產出

### 未來規劃

- [ ] 圖表統計（蝶種分布、月份趨勢）
- [ ] 匯出 PDF 報表
- [ ] 多語系支援
- [ ] IndexedDB 升級（處理大量照片）
- [ ] PWA 離線支援

---

## 資料結構

### Plant（植物）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | string | UUID |
| x, y | number | SVG 座標 |
| name | string | 植物名稱 |
| species | string | 學名 |
| variety | string? | 品種 |
| plantDate | string? | 種植日期 |
| quantity | number | 數量 |
| photos | string[] | Base64 照片 |
| notes | string | 備註 |

### ButterflyRecord（蝴蝶生態記錄）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | string | UUID |
| plantId | string | 所屬植物 ID |
| type | 'egg' \| 'larva' \| 'pupa' | 類型 |
| species | string | 蝶種 |
| date | string | 發現日期 |
| quantity | number | 數量 |
| photos | string[] | Base64 照片 |
| instar | number? | 齡期（幼蟲） |
| expectedEmerge | string? | 預計羽化日（蛹） |
| notes | string | 備註 |

---

## 檔案結構

```
butterfly_garden/
├── butterfly_top_view.svg        # 蝴蝶花園輪廓原始檔
├── VERSION.md                     # 本文件
├── index.html                     # Vite 入口
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── assets/
    │   └── butterfly_top_view.svg
    ├── types/
    │   └── index.ts
    ├── context/
    │   └── GardenContext.tsx
    ├── hooks/
    │   ├── useMapInteraction.ts
    │   ├── useVisiblePlants.ts
    │   └── useImageCompress.ts
    ├── utils/
    │   ├── storage.ts
    │   ├── export.ts
    │   └── sampleData.ts
    └── components/
        ├── GardenMap.tsx
        ├── PlantMarker.tsx
        ├── RecordBadge.tsx
        ├── PlantDetailPanel.tsx
        ├── PlantForm.tsx
        ├── RecordForm.tsx
        ├── RecordList.tsx
        ├── PhotoGrid.tsx
        ├── PhotoViewer.tsx
        ├── Sidebar.tsx
        ├── PlantList.tsx
        ├── SearchBar.tsx
        ├── FilterBar.tsx
        └── Toolbar.tsx
```

---

## 變更記錄

| 版本 | 日期 | 變更內容 |
|------|------|---------|
| v1.0.0 | 2026-07-09 | 初始版本，完成核心功能規劃 |
| v1.1.0 | 2026-07-09 | 正式釋出：瀏覽/編輯雙模式、拖曳修正、側欄置中定位、游標優化、植物 Hover 狀態、作者資訊 |
