# Expert Property Finder Dashboard

## نظرة عامة
لوحة تحكم شاملة لإدارة العقارات والعقارات التجارية مع إحصائيات مفصلة وتحليلات متقدمة.

## الميزات الرئيسية

### 📊 صفحة الأداء (Performance Overview)
- **إحصائيات شاملة**: عرض جميع البيانات المهمة في بطاقات منفصلة
- **رسم بياني تفاعلي**: رسم بياني شريطي يعرض البيانات حسب نوع الجودة (Featured, Premium, Standard)
- **فلاتر متقدمة**: 
  - نوع العقار (سكني/تجاري)
  - نوع العرض (بيع/إيجار/كلاهما)
  - الموقع (دبي/أبو ظبي/جميع المواقع)
  - الفترة الزمنية (7 أيام/30 يوم/90 يوم)
  - نوع العقار (شقة/فيلا/مكتب/تجزئة)

### 🎯 البيانات المعروضة
- **Credits Spent**: إجمالي الرصيد المستخدم
- **Published Listings**: العقارات المنشورة
- **Live Listings**: العقارات النشطة
- **Impressions**: عدد مرات الظهور
- **Clicks**: عدد النقرات
- **Leads**: عدد العملاء المحتملين
- **LPL**: العملاء المحتملين لكل عقار

### 📈 أنواع الجودة
- **Featured**: عقارات مميزة (جودة عالية)
- **Premium**: عقارات عالية الجودة
- **Standard**: عقارات عادية

## التقنيات المستخدمة

### Frontend
- **React 18** مع TypeScript
- **Tailwind CSS** للتصميم
- **Recharts** للرسوم البيانية
- **Axios** للاتصال بالـ API

### Backend
- **Supabase** لقاعدة البيانات
- **Node.js** مع Express
- **TypeScript** للـ interfaces

## التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn

### التثبيت
```bash
# تثبيت التبعيات
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build
```

### متغيرات البيئة
أنشئ ملف `.env` في المجلد الجذر:
```env
VITE_BASE_URL=http://localhost:3000
```

## هيكل المشروع

```
src/
├── components/
│   ├── dashboard/          # مكونات لوحة التحكم
│   ├── ui/                # مكونات واجهة المستخدم
│   └── charts/            # مكونات الرسوم البيانية
├── context/               # React Context للدولة
├── pages/                 # صفحات التطبيق
├── services/              # خدمات API
└── types/                 # تعريفات TypeScript
```

## كيفية الاستخدام

### 1. عرض الإحصائيات
- انتقل إلى صفحة "Performance Overview"
- اختر الفلاتر المطلوبة من القوائم المنسدلة
- اضغط على أي بطاقة إحصائية لعرض الرسم البياني التفصيلي

### 2. تطبيق الفلاتر
- **نوع العقار**: اختر بين سكني أو تجاري
- **نوع العرض**: اختر بيع أو إيجار أو كلاهما
- **الموقع**: اختر موقع محدد أو جميع المواقع
- **الفترة الزمنية**: اختر الفترة المطلوبة (7، 30، أو 90 يوم)

### 3. قراءة الرسوم البيانية
- **الألوان**: 
  - 🟢 أخضر: Featured (مميز)
  - 🔵 أزرق: Premium (عالي الجودة)
  - ⚫ رمادي: Standard (عادي)
- **الأرقام**: تعرض القيم الفعلية لكل نوع

## API Endpoints

### GET /api/overview
يحصل على بيانات الأداء مع الفلاتر المطبقة.

#### Query Parameters
- `propertyType`: نوع العقار (residential/commercial/all)
- `offeringType`: نوع العرض (rent/sale/rent_and_sale)
- `location`: الموقع (all/dubai/abu_dhabi)
- `dateRange`: الفترة الزمنية (7/30/90)
- `category`: فئة العقار (all_types/apartment/villa/office/retail)

#### Response
```typescript
interface IOverview {
  number_of_days: number;
  leads: number;
  leads_featured: number;
  leads_premium: number;
  leads_standard: number;
  live_listings: number;
  live_listings_featured: number;
  live_listings_premium: number;
  live_listings_standard: number;
  published_listings: number;
  published_listings_featured: number;
  published_listings_premium: number;
  published_listings_standard: number;
  listings_clicks: number;
  listings_clicks_featured: number;
  listings_clicks_premium: number;
  listings_clicks_standard: number;
  listings_impressions: number;
  listings_impressions_featured: number;
  listings_impressions_premium: number;
  listings_impressions_standard: number;
  credits_spent: number;
  credits_spent_featured: number;
  credits_spent_premium: number;
  credits_spent_standard: number;
  lpl: number;
  lpl_featured: number;
  lpl_premium: number;
  lpl_standard: number;
  ctr: number;
}
```

## المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. أنشئ Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## الدعم

للمساعدة والدعم، يرجى التواصل مع فريق التطوير.
