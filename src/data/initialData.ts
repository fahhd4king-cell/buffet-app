import { Category, MenuItem, Order, StaffMember, BuffetLocation, AttendanceRecord, CustomizationGroup } from '../types';
import tortillaWrapImg from '../assets/images/tortilla_wrap_sandwich_1785052973895.jpg';
import karakTeaImg from '../assets/images/karak_tea_glass_1785052989874.jpg';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'hot-drinks', name: 'مشروبات ساخنة', icon: 'Teacup' },
  { id: 'cold-drinks', name: 'بطاطس', icon: 'Utensils' },
  { id: 'sandwiches', name: 'سندويشات وتورتيلا', icon: 'UtensilsCrossed' },
  { id: 'fresh-juices', name: 'عصائر طازجة', icon: 'Citrus' },
];

export const INITIAL_OPTION_GROUPS: CustomizationGroup[] = [
  {
    id: 'g_sugar',
    name: 'درجة السكر',
    selectionType: 'single',
    isRequired: true,
    status: 'active',
    options: [
      { id: 'opt_s1', name: 'بدون سكر', price: 0, isAvailable: true },
      { id: 'opt_s2', name: 'نصف سكر', price: 0, isAvailable: true },
      { id: 'opt_s3', name: 'مضبوط', price: 0, isAvailable: true },
      { id: 'opt_s4', name: 'زيادة سكر', price: 0, isAvailable: true },
    ],
  },
  {
    id: 'g_herbs',
    name: 'الإضافات العطرية والنعناع',
    selectionType: 'multiple',
    isRequired: false,
    maxSelections: 3,
    status: 'active',
    options: [
      { id: 'opt_h1', name: 'نعناع طازج', price: 0, isAvailable: true },
      { id: 'opt_h2', name: 'حبق', price: 0, isAvailable: true },
      { id: 'opt_h3', name: 'زنجبيل', price: 0, isAvailable: true },
      { id: 'opt_h4', name: 'ليمون', price: 0, isAvailable: true },
      { id: 'opt_h5', name: 'هيل', price: 1, isAvailable: true },
      { id: 'opt_h6', name: 'ميرمية', price: 0, isAvailable: true },
    ],
  },
  {
    id: 'g_sandwiches',
    name: 'إضافات وصوصات الساندوتشات',
    selectionType: 'multiple',
    isRequired: false,
    maxSelections: 5,
    status: 'active',
    options: [
      { id: 'opt_sw1', name: 'شطة', price: 0, isAvailable: true },
      { id: 'opt_sw2', name: 'كاتشب', price: 0, isAvailable: true },
      { id: 'opt_sw3', name: 'مايونيز', price: 0, isAvailable: true },
      { id: 'opt_sw4', name: 'جبن إضافي', price: 2, isAvailable: true },
      { id: 'opt_sw5', name: 'صوص ثوم', price: 0, isAvailable: true },
      { id: 'opt_sw6', name: 'مخلل', price: 0, isAvailable: true },
      { id: 'opt_sw7', name: 'خس', price: 0, isAvailable: true },
      { id: 'opt_sw8', name: 'طماطم', price: 0, isAvailable: true },
    ],
  },
  {
    id: 'g_milk',
    name: 'نوع الحليب والمكونات',
    selectionType: 'single',
    isRequired: false,
    status: 'active',
    options: [
      { id: 'opt_m1', name: 'حليب كامل الدسم', price: 0, isAvailable: true },
      { id: 'opt_m2', name: 'حليب قليل الدسم', price: 0, isAvailable: true },
      { id: 'opt_m3', name: 'حليب خالي من اللاكتوز', price: 2, isAvailable: true },
    ],
  },
  {
    id: 'g_juices',
    name: 'إضافات العصائر الطازجة',
    selectionType: 'multiple',
    isRequired: false,
    maxSelections: 2,
    status: 'active',
    options: [
      { id: 'opt_j1', name: 'بدون سكر مضاف', price: 0, isAvailable: true },
      { id: 'opt_j2', name: 'زيادة ثلج', price: 0, isAvailable: true },
      { id: 'opt_j3', name: 'قطع فواكه طازجة', price: 3, isAvailable: true },
      { id: 'opt_j4', name: 'عسل سدر أصلي', price: 2, isAvailable: true },
    ],
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'شاي أحمر خادر',
    description: 'شاي أسود ملكي خادر ومخدر على أصوله بالنعناع أو الحبق حسب رغبتك',
    price: 3,
    category: 'hot-drinks',
    image: karakTeaImg,
    isAvailable: true,
    popularScore: 320,
    customizationGroupIds: ['g_sugar', 'g_herbs'],
  },
  {
    id: 'm2',
    name: 'شاي كرك عدني',
    description: 'كرك معطر بالهيل والزعفران والمسمار والحليب الهيلثي الخاثر',
    price: 5,
    category: 'hot-drinks',
    image: karakTeaImg,
    isAvailable: true,
    popularScore: 285,
    customizationGroupIds: ['g_sugar', 'g_herbs'],
  },
  {
    id: 'm3',
    name: 'قهوة سعودية بالهيل والزعفران',
    description: 'قهوة عربية شقراء متبلة بالهيل والزعفران الأصلي تقدم مع تمر خلاص',
    price: 6,
    category: 'hot-drinks',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    popularScore: 410,
    customizationGroupIds: ['g_sugar'],
  },
  {
    id: 'm4',
    name: 'بطاطس مقرمشة ذهبية',
    description: 'بطاطس مقلية طازجة ومقرمشة مع البهارات الخاصة والصوص',
    price: 8,
    category: 'cold-drinks',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    popularScore: 390,
    customizationGroupIds: ['g_sandwiches'],
  },
  {
    id: 'm5',
    name: 'سندويش تورتيلا دجاج / حلومي',
    description: 'خبز تورتيلا طازج محشو بالدجاج المحمر أو الحلومي المقرمش والصوصات الخاصة',
    price: 12,
    category: 'sandwiches',
    image: tortillaWrapImg,
    isAvailable: true,
    popularScore: 450,
    customizationGroupIds: ['g_sandwiches'],
  },
  {
    id: 'm6',
    name: 'سندويش بيض بالجبن والشطة',
    description: 'بيض مخفوق طازج مع جبن شيدر وقطرات من الشطة الكريستال',
    price: 7,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    popularScore: 350,
    customizationGroupIds: ['g_sandwiches'],
  },
  {
    id: 'm7',
    name: 'عصير برتقال طازج 100%',
    description: 'معصور طازج فور الطلب بدون إضافة سكر أو ماء',
    price: 10,
    category: 'fresh-juices',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    popularScore: 160,
    customizationGroupIds: ['g_juices'],
  },
  {
    id: 'm8',
    name: 'عصير ليمون بالنعناع المنعش',
    description: 'ليمون طازج مع أوراق النعناع وثلج مجروش يجدد طاقة يومك',
    price: 9,
    category: 'fresh-juices',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    popularScore: 230,
    customizationGroupIds: ['g_juices'],
  },
  {
    id: 'm9',
    name: 'كرواسون زبدة / جبنة',
    description: 'كرواسون هشش وطازج يومياً من المخبز',
    price: 8,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    popularScore: 180,
    customizationGroupIds: ['g_sandwiches'],
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's1',
    name: 'أبو أحمد',
    username: 'abu_ahmed',
    password: '123',
    role: 'مشرف البوفيه',
    phone: '0501234567',
    status: 'active',
    shift: 'الوردية الصباحية'
  },
  {
    id: 's2',
    name: 'سليمان العلي',
    username: 'sulaiman',
    password: '123',
    role: 'موظف بوفيه',
    phone: '0559876543',
    status: 'active',
    shift: 'الوردية الصباحية'
  },
  {
    id: 's3',
    name: 'خالد المطيري',
    username: 'khaled',
    password: '123',
    role: 'موظف بوفيه',
    phone: '0543210987',
    status: 'active',
    shift: 'الوردية الصباحية'
  }
];

export const INITIAL_BUFFET_LOCATION: BuffetLocation = {
  lat: 24.7136,
  lng: 46.6753,
  allowedRadiusMeters: 100,
  name: 'مقر البوفيه الرئيسي - المبنى الإداري'
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_1',
    staffId: 's1',
    staffName: 'أبو أحمد - مشرف البوفيه',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '07:30 ص',
    checkOutTime: '03:30 م',
    workingHours: '8 س و 00 د',
    status: 'completed',
    distanceFromBuffetMeters: 8
  },
  {
    id: 'att_2',
    staffId: 's3',
    staffName: 'خالد - مشرف البوفيه الرئيسي',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:00 ص',
    status: 'present',
    distanceFromBuffetMeters: 4
  }
];

const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

export const INITIAL_ORDERS: Order[] = [];

export const HISTORICAL_SALES_DATA = [
  { day: 'السبت', revenue: 340, orders: 38 },
  { day: 'الأحد', revenue: 520, orders: 54 },
  { day: 'الإثنين', revenue: 610, orders: 62 },
  { day: 'الثلاثاء', revenue: 480, orders: 50 },
  { day: 'الأربعاء', revenue: 730, orders: 75 },
  { day: 'الخميس', revenue: 890, orders: 92 },
  { day: 'اليوم', revenue: 410, orders: 42 },
];
