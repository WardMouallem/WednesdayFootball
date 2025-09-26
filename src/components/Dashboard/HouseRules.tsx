import React, { useState } from 'react';
import { Edit3, Save, X, MapPin, Users, DollarSign, Clock, Trophy, Globe, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const modernHouseRules = `الموقع للتسجيل:
https://wednesdayleague.netlify.app/
after you sign up, you need to be approved by an Admin in order to be able to log in.
الملعب:
Waze:
מועדון ספורט כרמל חיפה
https://waze.com/ul/hsvbfedkeh
Google maps:
https://maps.app.goo.gl/kmWCuhixiHf7bREC6
اهم شغله تعالوا عالوقت!
دافعين عالملعب ف خلونا نستغله، لانه هيك هيك بيروح كم دقيقة عالحימום بالبداية.
-----------------------------------------------------
قوانين اللعب:
* ٦ ضد ٦
* اللعبة لمدة ٧ دقايق وبتخلص لما فريق يجيب هدفين.
* بحالة تعادل, اختصارًا للوقت:
* - اذا اول لعبة، بنادل ١ ضد ١
- - اذا مش اول لعبة، الفريق "القديم" بطلع
* ال out بنلعب بالاجر
* اذا لاعب برجع الطابة للشوعر عن قصد، ممنوع الشوعر يمسكها بإيده.
* שוער بقلطش خط النص وبجبش جول خلف خط النص، باقي اللعيبة مسموح
* طابة الي بتدقر بالشبكة الي فوق الملعب بتنحسب out للفريق الخصم
* الهدف ننبسط ونحرك شوي، بلاش كسح وعنف زايد، بلا مَنيَكة من الاخر.
-----------------------------------------------------
قائمة اللعيبة:
* قائمة التسجيل بتم افتتاحها يوم الاحد، فقط من قِبَل admin, بشكل عام يوم الأحد ما بين ال 12:00-13:00.
* اي لاعب بده يسجل بعد ال ١٨ الأوائل، بدخل بالاحتياط. الاحتياط موجود عشان يستبدل اي لاعب رح يلغي من ال ١٨ الاوائل.
* مرات منوصل ٢٤ لاعب مسجل، وبيوم اللعبة منكون ١٦، ف دايمًا في أمل لكل واحد بسجل انه يلعب، تترددوش تزيدوا حالكو اذا بنفسكو.
* بعد اكمال اول ١٨ لاعب، منبلش التأكيدات النهائية, التأكيدات تشمل الاحتياط.
* قائمة كاملة مع تأكيدات لازم تكون جاهزة لحد الساعه ١٢:٠٠ من نفس يوم اللعبة.
* اي شخص مش مأكد لحد هذاك الوقت، ممكن يتم إستبداله بلاعب من الاحتياط.
* بعد إكمال القائمة المأكدة، حدا من ال admins رح يشارك تقسيم عشوائي للفرق، مع الاخذ بعين الاعتبار اللاعيبة الي منعرف انهن top ما يكونوش مع بعض، عشان يكون اللعب عادل وممتع قدر الامكان.
-----------------------------------------------------
الدفع: 
* كل لاعب بدفع 35₪.
* الدفع مفضل عن طريق ال paybox هون:
https://link.payboxapp.com/DEwehas1qibptxDEA
او ممكن عن طريق الbit. النقدي هو حل أخير وفش كيف نرجّعلكو باقي بهاي الحالة.
* منبلش دفع بعد إكمال قائمة اللاعيبة المأكدة.
* برضو بعد كل لعبة بنبعث المبلغ النهائي مع الlink، يرجى اتمام الدفع اسرع ما يمكن`;

const parseRulesContent = (content: string) => {
  const sections = content.split('-----------------------------------------------------');
  
  return [
    {
      id: 'registration',
      title: 'التسجيل والموقع',
      titleEn: 'Registration & Location',
      icon: Globe,
      color: 'blue',
      content: sections[0]?.trim() || ''
    },
    {
      id: 'gameplay',
      title: 'قوانين اللعب',
      titleEn: 'Game Rules',
      icon: Trophy,
      color: 'green',
      content: sections[1]?.trim() || ''
    },
    {
      id: 'players',
      title: 'قائمة اللعيبة',
      titleEn: 'Player List',
      icon: Users,
      color: 'purple',
      content: sections[2]?.trim() || ''
    },
    {
      id: 'payment',
      title: 'الدفع',
      titleEn: 'Payment',
      icon: DollarSign,
      color: 'orange',
      content: sections[3]?.trim() || ''
    }
  ];
};

export function HouseRules() {
  const { currentUser, appData, updateAppData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRules, setEditedRules] = useState(appData.houseRules || modernHouseRules);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSave = () => {
    updateAppData({ houseRules: editedRules });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRules(appData.houseRules || modernHouseRules);
    setIsEditing(false);
  };

  const sections = parseRulesContent(isEditing ? editedRules : (appData.houseRules || modernHouseRules));
  
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-700',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100',
        button: 'bg-green-600 hover:bg-green-700'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-700',
        icon: 'text-purple-600 dark:text-purple-400',
        title: 'text-purple-900 dark:text-purple-100',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-700',
        icon: 'text-orange-600 dark:text-orange-400',
        title: 'text-orange-900 dark:text-orange-100',
        button: 'bg-orange-600 hover:bg-orange-700'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">House Rules</h2>
            <p className="text-gray-600 dark:text-gray-400">قوانين البيت - Wednesday Football League</p>
          </div>
          
          {currentUser?.isAdmin && (
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={editedRules}
            onChange={(e) => setEditedRules(e.target.value)}
            className="w-full h-[600px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
            dir="auto"
            placeholder="Enter house rules in Markdown format..."
          />
        ) : (
          <div className="space-y-6">
            {sections.map((section, index) => {
              const colors = getColorClasses(section.color);
              const isExpanded = expandedSection === section.id;
              const Icon = section.icon;
              
              return (
                <div
                  key={section.id}
                  className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 hover:shadow-lg`}
                >
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    className="w-full p-6 text-left hover:bg-opacity-80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-md`}>
                          <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${colors.title} mb-1`} dir="rtl">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {section.titleEn}
                          </p>
                        </div>
                      </div>
                      <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner">
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-lg" dir="auto">
                          {renderTextWithLinks(section.content)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}