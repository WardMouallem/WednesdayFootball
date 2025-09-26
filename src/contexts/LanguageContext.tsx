import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.homepage': 'Homepage',
    'nav.profile': 'Profile',
    'nav.nextGame': 'Next Game List',
    'nav.stats': 'Stats',
    'nav.houseRules': 'House Rules',
    'nav.location': 'Location',
    'nav.gallery': 'Gallery',
    'nav.users': 'Registered Users',
    
    // Homepage
    'homepage.welcome': 'Welcome to the Wednesday Football Website!',
    'homepage.subtitle': 'Join our weekly football community every Wednesday at 20:30',
    'homepage.registerButton': 'Register for the next game',
    'homepage.totalGames': 'Total Games Played:',
    'homepage.whatsappText': 'To join our WhatsApp group,',
    'homepage.whatsappLink': 'click here',
    'homepage.quickActions': 'Quick Actions',
    'homepage.register': 'Register',
    'homepage.wazeNavigation': 'Waze Navigation',
    'homepage.payboxPayment': 'PayBox Payment',
    'homepage.weeklyGames': 'Weekly Games',
    'homepage.weeklyGamesDesc': 'Every Wednesday at 20:30. Register early to secure your spot!',
    'homepage.community': 'Community',
    'homepage.communityDesc': 'Join our friendly football community and make new friends.',
    'homepage.fairPlay': 'Fair Play',
    'homepage.fairPlayDesc': 'We promote fair play and sportsmanship in all our games.',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.phoneNumber': 'Phone Number',
    'auth.playerName': 'Player Name',
    'auth.signingIn': 'Signing In...',
    'auth.creatingAccount': 'Creating Account...',
    'auth.back': 'Back to welcome page',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.signOut': 'Sign Out',
    'common.admin': 'Admin',
    'common.superAdmin': 'Super Admin',
    
    // Stats
    'stats.title': 'Player Statistics',
    'stats.subtitle': 'Celebrating our top performers in the Wednesday Football League!',
    'stats.topGoalScorers': 'Top Goal Scorers',
    'stats.mostPlayingTime': 'Most Playing Time',
    'stats.totalGoals': 'Total Goals',
    'stats.totalPlaytime': 'Total Playtime',
    'stats.activePlayers': 'Active Players',
    'stats.scoredThisSeason': 'Scored this season',
    'stats.playedThisSeason': 'Played this season',
    'stats.withGameStats': 'With game stats',
    'stats.noGoalsYet': 'No goals scored yet',
    'stats.noPlaytimeYet': 'No playtime recorded yet',
    'stats.statsWillAppear': 'Stats will appear here once games are played!',
    'stats.keepPlaying': 'Keep playing, keep scoring, keep having fun!',
    'stats.statsUpdated': 'Stats are updated after each game. May the best players win!',
    
    // Profile
    'profile.title': 'Profile',
    'profile.basicInfo': 'Basic Information',
    'profile.statistics': 'Statistics',
    'profile.uploadPhoto': 'Upload Photo',
    'profile.removePhoto': 'Remove Photo',
    'profile.uploading': 'Uploading...',
    'profile.gamesPlayed': 'Games Played',
    'profile.timePlayed': 'Time Played',
    'profile.goalsScored': 'Goals Scored',
    'profile.editStats': 'Edit Stats',
    'profile.saveStats': 'Save Stats',
    'profile.attendance': 'attendance',
    'profile.attendanceRange': 'attendance range',
    
    // House Rules
    'rules.title': 'House Rules',
    'rules.subtitle': 'Wednesday Football League',
    'rules.registration': 'Registration & Location',
    'rules.gameRules': 'Game Rules',
    'rules.playerList': 'Player List',
    'rules.payment': 'Payment',
    
    // Location
    'location.title': 'Location',
    'location.googleMaps': 'Google Maps',
    'location.waze': 'Waze',
    'location.stadiumName': 'Stadium Name',
    'location.address': 'Address',
    'location.mapType': 'Map Type',
    'location.embeddedMap': 'Embedded Map',
    'location.mapImage': 'Map Image',
    'location.uploadMapImage': 'Upload Map Image',
    'location.noMapConfigured': 'No map configured yet',
    
    // Gallery
    'gallery.title': 'Gallery',
    'gallery.addMedia': 'Add Media',
    'gallery.addNewMedia': 'Add New Media',
    'gallery.fromUrl': 'From URL',
    'gallery.uploadFile': 'Upload File',
    'gallery.mediaUrl': 'Media URL (Image, Video, or YouTube)',
    'gallery.uploadFileDesc': 'Upload File (Image or Video, max 10MB)',
    'gallery.processingFile': 'Processing file...',
    'gallery.noMediaYet': 'No media uploaded yet',
    'gallery.askAdminToAdd': 'Ask an admin to add some photos and videos',
    'gallery.clickAddMedia': 'Click "Add Media" to get started',
    'gallery.photos': 'Photos',
    'gallery.videos': 'Videos',
    'gallery.deleteImage': 'Delete image',
    'gallery.deleteVideo': 'Delete video',
    
    // Users Management
    'users.title': 'Registered Users',
    'users.createAdmin': 'Create Admin',
    'users.pendingApproval': 'Pending Approval',
    'users.adminUsers': 'Admin Users',
    'users.activeUsers': 'Active Users',
    'users.blockedUsers': 'Blocked Users',
    'users.approve': 'Approve',
    'users.deny': 'Deny',
    'users.blockUser': 'block user?',
    'users.unblockUser': 'unblock user?',
    'users.removeUser': 'remove user?',
    'users.removeAdmin': 'remove admin?',
    'users.yes': 'Yes',
    'users.no': 'No',
    'users.blocked': 'Blocked',
    'users.pending': 'Pending',
    'users.createNewAdmin': 'Create New Admin',
    'users.enterUsername': 'Enter username',
    'users.enterPhoneNumber': 'Enter phone number',
    'users.enterPassword': 'Enter password',
    'users.createAdminButton': 'Create Admin',
    'users.noUsersYet': 'No users registered yet',
    'users.noAdminUsers': 'No admin users found.',
    'users.accessDenied': 'Access denied. Admin privileges required.',
    'users.superAdminRequired': 'Access denied. Super admin privileges required.',
    'users.phoneHidden': 'Phone hidden',
    'users.notSet': 'Not set',
    'users.total': 'Total',
    'users.admins': 'admins',
    'users.active': 'active',
    'users.blocked': 'blocked',
    'users.pending': 'pending',
    'users.requested': 'Requested:',
    'users.player': 'Player:',
  },
  ar: {
    // Navigation
    'nav.homepage': 'الصفحة الرئيسية',
    'nav.profile': 'الملف الشخصي',
    'nav.nextGame': 'قائمة المباراة القادمة',
    'nav.stats': 'الإحصائيات',
    'nav.houseRules': 'قوانين البيت',
    'nav.location': 'الموقع',
    'nav.gallery': 'المعرض',
    'nav.users': 'المستخدمون المسجلون',
    
    // Homepage
    'homepage.welcome': 'مرحباً بكم في موقع كرة القدم يوم الأربعاء!',
    'homepage.subtitle': 'انضموا إلى مجتمع كرة القدم الأسبوعي كل أربعاء في الساعة 20:30',
    'homepage.registerButton': 'التسجيل للمباراة القادمة',
    'homepage.totalGames': 'إجمالي المباريات المُلعبة:',
    'homepage.whatsappText': 'للانضمام إلى مجموعة الواتساب،',
    'homepage.whatsappLink': 'اضغط هنا',
    'homepage.quickActions': 'إجراءات سريعة',
    'homepage.register': 'التسجيل',
    'homepage.wazeNavigation': 'التنقل عبر Waze',
    'homepage.payboxPayment': 'الدفع عبر PayBox',
    'homepage.weeklyGames': 'المباريات الأسبوعية',
    'homepage.weeklyGamesDesc': 'كل أربعاء في الساعة 20:30. سجل مبكراً لضمان مكانك!',
    'homepage.community': 'المجتمع',
    'homepage.communityDesc': 'انضم إلى مجتمع كرة القدم الودود وكوّن صداقات جديدة.',
    'homepage.fairPlay': 'اللعب النظيف',
    'homepage.fairPlayDesc': 'نحن نشجع اللعب النظيف والروح الرياضية في جميع مبارياتنا.',
    
    // Auth
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.username': 'اسم المستخدم',
    'auth.password': 'كلمة المرور',
    'auth.phoneNumber': 'رقم الهاتف',
    'auth.playerName': 'اسم اللاعب',
    'auth.signingIn': 'جاري تسجيل الدخول...',
    'auth.creatingAccount': 'جاري إنشاء الحساب...',
    'auth.back': 'العودة إلى الصفحة الرئيسية',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.loading': 'جاري التحميل...',
    'common.signOut': 'تسجيل الخروج',
    'common.admin': 'مدير',
    'common.superAdmin': 'مدير عام',
    
    // Stats
    'stats.title': 'إحصائيات اللاعبين',
    'stats.subtitle': 'نحتفل بأفضل لاعبينا في دوري كرة القدم يوم الأربعاء!',
    'stats.topGoalScorers': 'أفضل هدافين',
    'stats.mostPlayingTime': 'أكثر وقت لعب',
    'stats.totalGoals': 'إجمالي الأهداف',
    'stats.totalPlaytime': 'إجمالي وقت اللعب',
    'stats.activePlayers': 'اللاعبون النشطون',
    'stats.scoredThisSeason': 'سُجلت هذا الموسم',
    'stats.playedThisSeason': 'لُعبت هذا الموسم',
    'stats.withGameStats': 'مع إحصائيات المباريات',
    'stats.noGoalsYet': 'لم يتم تسجيل أهداف بعد',
    'stats.noPlaytimeYet': 'لم يتم تسجيل وقت لعب بعد',
    'stats.statsWillAppear': 'ستظهر الإحصائيات هنا بمجرد لعب المباريات!',
    'stats.keepPlaying': 'استمروا في اللعب والتسجيل والاستمتاع!',
    'stats.statsUpdated': 'يتم تحديث الإحصائيات بعد كل مباراة. فليفز أفضل اللاعبين!',
    
    // Profile
    'profile.title': 'الملف الشخصي',
    'profile.basicInfo': 'المعلومات الأساسية',
    'profile.statistics': 'الإحصائيات',
    'profile.uploadPhoto': 'رفع صورة',
    'profile.removePhoto': 'إزالة الصورة',
    'profile.uploading': 'جاري الرفع...',
    'profile.gamesPlayed': 'المباريات المُلعبة',
    'profile.timePlayed': 'وقت اللعب',
    'profile.goalsScored': 'الأهداف المُسجلة',
    'profile.editStats': 'تعديل الإحصائيات',
    'profile.saveStats': 'حفظ الإحصائيات',
    'profile.attendance': 'الحضور',
    'profile.attendanceRange': 'نطاق الحضور',
    
    // House Rules
    'rules.title': 'قوانين البيت',
    'rules.subtitle': 'دوري كرة القدم يوم الأربعاء',
    'rules.registration': 'التسجيل والموقع',
    'rules.gameRules': 'قوانين اللعب',
    'rules.playerList': 'قائمة اللاعبين',
    'rules.payment': 'الدفع',
    
    // Location
    'location.title': 'الموقع',
    'location.googleMaps': 'خرائط جوجل',
    'location.waze': 'Waze',
    'location.stadiumName': 'اسم الملعب',
    'location.address': 'العنوان',
    'location.mapType': 'نوع الخريطة',
    'location.embeddedMap': 'خريطة مدمجة',
    'location.mapImage': 'صورة الخريطة',
    'location.uploadMapImage': 'رفع صورة الخريطة',
    'location.noMapConfigured': 'لم يتم تكوين خريطة بعد',
    
    // Gallery
    'gallery.title': 'المعرض',
    'gallery.addMedia': 'إضافة وسائط',
    'gallery.addNewMedia': 'إضافة وسائط جديدة',
    'gallery.fromUrl': 'من رابط',
    'gallery.uploadFile': 'رفع ملف',
    'gallery.mediaUrl': 'رابط الوسائط (صورة، فيديو، أو يوتيوب)',
    'gallery.uploadFileDesc': 'رفع ملف (صورة أو فيديو، حد أقصى 10 ميجابايت)',
    'gallery.processingFile': 'جاري معالجة الملف...',
    'gallery.noMediaYet': 'لم يتم رفع وسائط بعد',
    'gallery.askAdminToAdd': 'اطلب من المدير إضافة بعض الصور والفيديوهات',
    'gallery.clickAddMedia': 'اضغط على "إضافة وسائط" للبدء',
    'gallery.photos': 'الصور',
    'gallery.videos': 'الفيديوهات',
    'gallery.deleteImage': 'حذف الصورة',
    'gallery.deleteVideo': 'حذف الفيديو',
    
    // Users Management
    'users.title': 'المستخدمون المسجلون',
    'users.createAdmin': 'إنشاء مدير',
    'users.pendingApproval': 'في انتظار الموافقة',
    'users.adminUsers': 'المديرون',
    'users.activeUsers': 'المستخدمون النشطون',
    'users.blockedUsers': 'المستخدمون المحظورون',
    'users.approve': 'موافقة',
    'users.deny': 'رفض',
    'users.blockUser': 'حظر المستخدم؟',
    'users.unblockUser': 'إلغاء حظر المستخدم؟',
    'users.removeUser': 'إزالة المستخدم؟',
    'users.removeAdmin': 'إزالة المدير؟',
    'users.yes': 'نعم',
    'users.no': 'لا',
    'users.blocked': 'محظور',
    'users.pending': 'في الانتظار',
    'users.createNewAdmin': 'إنشاء مدير جديد',
    'users.enterUsername': 'أدخل اسم المستخدم',
    'users.enterPhoneNumber': 'أدخل رقم الهاتف',
    'users.enterPassword': 'أدخل كلمة المرور',
    'users.createAdminButton': 'إنشاء مدير',
    'users.noUsersYet': 'لم يتم تسجيل مستخدمين بعد',
    'users.noAdminUsers': 'لم يتم العثور على مديرين.',
    'users.accessDenied': 'تم رفض الوصول. مطلوب صلاحيات المدير.',
    'users.superAdminRequired': 'تم رفض الوصول. مطلوب صلاحيات المدير العام.',
    'users.phoneHidden': 'الهاتف مخفي',
    'users.notSet': 'غير محدد',
    'users.total': 'المجموع',
    'users.admins': 'مديرين',
    'users.active': 'نشط',
    'users.blocked': 'محظور',
    'users.pending': 'في الانتظار',
    'users.requested': 'طُلب في:',
    'users.player': 'اللاعب:',
  }
};

const LANGUAGE_STORAGE_KEY = 'wednesday-football-language';

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (saved as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Apply RTL/LTR direction to document
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}