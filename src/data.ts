/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dish, TranslationDict, Language } from './types';

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'starter-1',
    name: {
      en: 'Truffle Parmesan Fries',
      es: 'Papas Fritas con Trufa y Parmesano',
      ja: 'トリュフ香るパルメザンポテト',
      fr: 'Frites à la Truffe et au Parmesan'
    },
    description: {
      en: 'Crispy thick-cut skin-on fries tossed in pure white truffle oil, grated aged parmesan cheese, and fresh cut mountain parsley.',
      es: 'Papas fritas crujientes de corte grueso, aderezadas con aceite de trufa blanca pura, queso parmesano rallado y perejil fresco de montaña.',
      ja: '厳選されたホワイトトリュフオイル、削りたての熟成パルメザンチーズ、新鮮なパセリをまぶした極上ポテト。',
      fr: 'Frites croustillantes à la truffe blanche, parmesan vieilli râpé et persil frais.'
    },
    price: 9.50,
    category: 'starters',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    allergens: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      spicy: false,
      nuts: false
    }
  },
  {
    id: 'starter-2',
    name: {
      en: 'Heirloom Tomato Bruschetta',
      es: 'Bruschetta de Tomate de Herencia',
      ja: 'エアルームトマトのブルスケッタ',
      fr: 'Bruschetta de Tomates Anciennes'
    },
    description: {
      en: 'Grilled sourdough rubbed with garlic, topped with marinated heirloom cherry tomatoes, aged balsamic reduction, and fresh sweet basil.',
      es: 'Pan de masa madre tostado frotado con ajo, cubierto con tomates cherry marinados, reducción de balsámico envejecido y albahaca fresca.',
      ja: '香ばしいにんにく風味の自家製サワードウに、マリネしたエアルームチェリートマト、有機バルサミコ、バジルをのせて。',
      fr: 'Pain de campagne grillé à l\'ail, tomates cerises marinées, réduction de vinaigre balsamique et basilic frais.'
    },
    price: 11.00,
    category: 'starters',
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    allergens: {
      vegetarian: true,
      vegan: true,
      glutenFree: false,
      spicy: false,
      nuts: false
    }
  },
  {
    id: 'main-1',
    name: {
      en: 'Artisanal Wagyu Burger',
      es: 'Hamburguesa de Wagyu Artesanal',
      ja: '極上和牛バーガー',
      fr: 'Burger Wagyu Artisanal'
    },
    description: {
      en: 'Flame-grilled Grade A Wagyu beef patty on a toasted brioche bun, house special smoked aioli, vintage cheddar cheese, and caramelized red onions.',
      es: 'Hamburgesa de carne Wagyu de grado A cocinada a la parrilla, queso cheddar maduro, alioli ahumado especial de la casa y cebolla caramelizada.',
      ja: '強火でジューシーに焼き上げた極上和牛パティに、自家製燻製アイオリ、まろやかなヴィンテージチェダーとキャラメルオニオン。',
      fr: 'Steak de bœuf Wagyu grillé, cheddar vintage fondant, aïoli fumé maison et oignons caramélisés sur pain brioché.'
    },
    price: 18.50,
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    allergens: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      spicy: false,
      nuts: false
    },
    customization: {
      options: [
        {
          id: 'opt-bacon',
          name: { en: 'Add Crispy Bacon', es: 'Añadir Tocino Crujiente', ja: 'カリカリベーコン追加', fr: 'Ajouter Bacon Croustillant' },
          price: 2.50
        },
        {
          id: 'opt-cheese',
          name: { en: 'Extra Aged Cheddar', es: 'Queso Cheddar Extra', ja: 'チェダーチーズ追加', fr: 'Supplément Cheddar' },
          price: 1.50
        },
        {
          id: 'opt-egg',
          name: { en: 'Add Sunny Side Up Egg', es: 'Añadir Huevo Estrellado', ja: '目玉焼きのせ', fr: 'Ajouter un Œuf au Plat' },
          price: 2.00
        }
      ]
    }
  },
  {
    id: 'main-2',
    name: {
      en: 'Spicy Tonkotsu Ramen',
      es: 'Ramen Tonkotsu Picante',
      ja: '旨辛旨味とんこつラーメン',
      fr: 'Ramen Tonkotsu Épicé'
    },
    description: {
      en: '24-hour slow simmered broth served with bouncy handmade wheat noodles, tender rolled chashu pork belly, soft-boiled ajitama egg, and chili oil.',
      es: 'Caldo cocido a fuego lento durante 24 horas, fideos artesanales, panceta de cerdo chashu, huevo ajitama perfectamente marinado y aceite picante.',
      ja: '24時間じっくり煮込んだ特製濃厚とんこつスープに、特製中細ちぢれ麺、自家製チャーシュー、味付きとろとろ半熟卵と香り高い特製辣油。',
      fr: 'Bouillon mijoté 24 heures, nouilles fraîches maison, porc chashu fondant, œuf ajitama marinés et huile de piment rouge.'
    },
    price: 16.00,
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    allergens: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      spicy: true,
      nuts: false
    },
    customization: {
      hasSpiceLevel: true,
      options: [
        {
          id: 'opt-chashu',
          name: { en: 'Extra Chashu Pork', es: 'Cerdo Chashu Extra', ja: 'チャーシュー増し', fr: 'Supplément Porc Chashu' },
          price: 3.00
        },
        {
          id: 'opt-ajitama',
          name: { en: 'Extra Soft-Boiled Egg', es: 'Huevo Ajitama Extra', ja: '味玉追加', fr: 'Supplément Œuf Ajitama' },
          price: 1.50
        }
      ]
    }
  },
  {
    id: 'dessert-1',
    name: {
      en: 'Liquid Chocolate Lava Cake',
      es: 'Pastel de Volcán de Chocolate',
      ja: 'とろけるショコラフォンダン',
      fr: 'Fondant au Chocolat Coeur Coulant'
    },
    description: {
      en: 'Warm, rich dark chocolate cake with a molten center of decadent Belgian chocolate, accompanied by vanilla bean gelato and fresh raspberries.',
      es: 'Pastel de chocolate semi-oscuro tibio con centro líquido de chocolate belga, acompañado de gelato de vainilla madagascar y frambuesas frescas.',
      ja: '温かいダークチョコ生地の中からとろりと溢れ出る濃厚なベルギー産生チョコ。最高級バニラジェラートと甘酸っぱいラズベリーを添えて。',
      fr: 'Gâteau tiède au chocolat noir au cœur coulant de chocolat belge, servi avec un gelato à la gousse de vanille et des framboises fraîches.'
    },
    price: 8.50,
    category: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    allergens: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      spicy: false,
      nuts: false
    }
  },
  {
    id: 'drink-1',
    name: {
      en: 'Smoked Rosemary Grapefruit Tonic',
      es: 'Grapefruit Tonic con Romero Ahumado',
      ja: 'スモークローズマリーのグレフルトニック',
      fr: 'Tonic Pamplemousse au Romarin Fumé'
    },
    description: {
      en: 'Fresh squeezed ruby grapefruit juice, craft botanical tonic water, premium artisan ice, garnished with a caramelized, hand-torched rosemary sprig.',
      es: 'Jugo de toronja fresca exprimida, agua tónica botánica artesanal y una rama de romero caramelizada al soplete de cocina.',
      ja: '搾りたてのルビーグレープフルーツに、植物香る手絞りトニック。軽く炙ったローズマリーがエレガントに香る極上の微炭酸ドリンク。',
      fr: 'Jus de pamplemousse pressé, tonic botanique artisanal, glaçons premium et branche de romarin caramélisée au chalumeau.'
    },
    price: 6.50,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
    allergens: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      spicy: false,
      nuts: false
    }
  }
];

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    appName: 'Modern Bistro Menu',
    scanPrompt: 'Scan Table QR Code',
    scanInstructions: 'Direct your phone camera to the flyer on your table or select a table below to browse, order, and summon service.',
    table: 'Table',
    tableSelect: 'Change Table / Simulation',
    categories: {
      starters: 'Delectable Starters',
      mains: 'Signature Mains',
      desserts: 'Artisanal Desserts',
      drinks: 'Designer Drinks'
    },
    addToCart: 'Add to Table Order',
    cart: 'Your Order Basket',
    emptyCart: 'Your basket is empty. Scan menus to add dishes.',
    total: 'Estimated Total',
    placeOrder: 'Send Order to Kitchen',
    orderSent: 'Sent to Kitchen!',
    orderSentDesc: 'Your order has been transmitted directly. The chef is preparing your dishes.',
    soldOut: 'Sold Out',
    unavailable: 'Currently Unavailable',
    spiceLevel: 'Choose Spiciness',
    spiceLevels: {
      mild: 'Mild - Gentle infusion',
      medium: 'Medium - True warmth',
      hot: 'Hot - High impact',
      'extra-hot': 'Extra Hot - Scorching heat'
    },
    options: 'Enhance Your Dish',
    specialInstructions: 'Chef Notes / Special Requests',
    instructionsPlaceholder: 'Allergy requirements, skip ice, dressing on the side, etc...',
    backToMenu: 'Back to Menu',
    orderHistory: 'Active Table Orders',
    orderStatus: 'Kitchen Status',
    orderStatuses: {
      pending: 'Order Received',
      preparing: 'Preparing in Kitchen',
      served: 'Dishes Served',
      completed: 'Completed & Paid',
      cancelled: 'Cancelled'
    },
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten-Free',
    spicy: 'Spicy Hot',
    nuts: 'Contains Nuts',
    filters: 'Dietary Preferences',
    all: 'Show All Dishes',
    popularDishes: 'Chef\'s Highlights',
    currencySymbol: '$',
    confirmTableTitle: 'Verify Table Number',
    confirmTableDesc: 'To link this smartphone ordering session with your physical table, please verify or enter your table number.',
    confirmTableButton: 'Unlock Dining Menu',
    enterTablePlaceholder: 'Table number (e.g., 3)',
    adminPanel: 'Kitchen & Menu Manager',
    customerPanel: 'Customer View (Tableside)'
  },
  es: {
    appName: 'Bistró Moderno',
    scanPrompt: 'Escanear QR de Mesa',
    scanInstructions: 'Apunte la cámara a la mesa o seleccione abajo para explorar platos, ordenar y pedir servicio.',
    table: 'Mesa',
    tableSelect: 'Cambiar Mesa / Simulación',
    categories: {
      starters: 'Entradas Deliciosas',
      mains: 'Platos Principales de Autor',
      desserts: 'Postres Artesanales',
      drinks: 'Bebidas de Autor'
    },
    addToCart: 'Añadir al Pedido de la Mesa',
    cart: 'Canasta de Pedido',
    emptyCart: 'Su canasta está vacía. Añada elementos del menú.',
    total: 'Total Estimado',
    placeOrder: 'Enviar Pedido a Cocina',
    orderSent: '¡Enviado a Cocina!',
    orderSentDesc: 'Su orden se ha transmitido correctamente. El chef está preparando su comida.',
    soldOut: 'Agotado',
    unavailable: 'No Disponible Temporalmente',
    spiceLevel: 'Seleccione Nivel de Picante',
    spiceLevels: {
      mild: 'Suave - Ligero toque',
      medium: 'Medio - Calor verdadero',
      hot: 'Picante - Gran impacto',
      'extra-hot': 'Extra Picante - Fuego extremo'
    },
    options: 'Personalice su Plato',
    specialInstructions: 'Notas para el Chef / Peticiones Especiales',
    instructionsPlaceholder: 'Requisitos de alergias, sin hielo, aderezo al lado...',
    backToMenu: 'Volver al Menú',
    orderHistory: 'Pedidos Activos en Mesa',
    orderStatus: 'Estado de su Orden',
    orderStatuses: {
      pending: 'Pedido Recibido',
      preparing: 'En Preparación',
      served: 'Platos Servidos',
      completed: 'Completado y Pagado',
      cancelled: 'Cancelado'
    },
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    glutenFree: 'Sin Gluten',
    spicy: 'Picante',
    nuts: 'Contiene Nueces',
    filters: 'Preferencias Alimentarias',
    all: 'Mostrar Todo',
    popularDishes: 'Recomendaciones del Chef',
    currencySymbol: '$',
    confirmTableTitle: 'Verificar Número de Mesa',
    confirmTableDesc: 'Para vincular esta sesión de pedido móvil con su mesa física, verifique o ingrese su número de mesa.',
    confirmTableButton: 'Desbloquear el Menú',
    enterTablePlaceholder: 'Número de mesa (ej., 3)',
    adminPanel: 'Administrador de Cocina y Menú',
    customerPanel: 'Vista de Cliente (Mesa)'
  },
  ja: {
    appName: 'モダン ビストロ メニュー',
    scanPrompt: 'QRコードで注文する',
    scanInstructions: 'お席のQRコードを読み取るか、スマートフォンでテーブル番号を選択して極上料理をご注文ください。',
    table: 'テーブル',
    tableSelect: 'テーブル番号変更／シミュレーション',
    categories: {
      starters: '絶品前菜',
      mains: '自慢のメイン料理',
      desserts: '自家製デザート',
      drinks: 'デザイナー ドリンク'
    },
    addToCart: 'カートに追加する',
    cart: 'ご注文カート',
    emptyCart: 'カートは空です。お好みの料理を追加してください。',
    total: 'お会計予定額',
    placeOrder: '厨房へ注文を送信する',
    orderSent: '注文を送信しました！',
    orderSentDesc: '厨房へ即座に送信されました。シェフが自慢の腕を振るって調理しております。',
    soldOut: '完売',
    unavailable: '本日休止中',
    spiceLevel: '辛さをお選びください',
    spiceLevels: {
      mild: 'マイルド - ひかえめ',
      medium: 'ミディアム - 標準の旨辛',
      hot: 'ホット - 刺激的',
      'extra-hot': '激辛 - 燃える炎'
    },
    options: 'カスタマイズトッピング',
    specialInstructions: 'シェフへのご要望・アレルギー要望',
    instructionsPlaceholder: 'アレルギーがある食材、氷なし、ドレッシング別添えなど...',
    backToMenu: 'メニューに戻る',
    orderHistory: 'ご注文状況',
    orderStatus: '調理ステータス',
    orderStatuses: {
      pending: '注文受領',
      preparing: '調理中',
      served: '配膳済み',
      completed: '会計完了',
      cancelled: 'キャンセル'
    },
    vegetarian: 'ベジタリアン対応',
    vegan: 'ヴィーガン対応',
    glutenFree: 'グルテンフリー',
    spicy: '辛いマーク',
    nuts: 'ナッツ類含む',
    filters: '食事の制限・こだわり',
    all: 'すべてのメニュー',
    popularDishes: 'シェフのおすすめ品',
    currencySymbol: '¥', // We will convert values dynamically or keep same units
    confirmTableTitle: 'テーブル番号の確認',
    confirmTableDesc: 'スマートフォンの注文セッションをご着席のテーブルに連携するため、テーブル番号を確認または直接入力してください。',
    confirmTableButton: '注文メニューを開く',
    enterTablePlaceholder: 'テーブル番号（例: 3）',
    adminPanel: 'キッチン＆メニュー総合管理',
    customerPanel: '客席モバイル端末表示'
  },
  fr: {
    appName: 'Modern Bistro',
    scanPrompt: 'Scanner le QR Code de Table',
    scanInstructions: 'Orientez l\'appareil vers le code de votre table ou choisissez-la ci-dessous pour commander et appeler le service.',
    table: 'Table',
    tableSelect: 'Modifier Table / Simulation',
    categories: {
      starters: 'Hors-d\'œuvres Délicieux',
      mains: 'Plat de Résistance Signature',
      desserts: 'Desserts Fins',
      drinks: 'Boissons Créations'
    },
    addToCart: 'Ajouter à la Commande',
    cart: 'Panier de Table',
    emptyCart: 'Votre panier est vide. Scannez le code pour ajouter.',
    total: 'Montant Estimé',
    placeOrder: 'Lancer en Cuisine',
    orderSent: 'Transmis en Cuisine !',
    orderSentDesc: 'Votre commande a été envoyée directement. Le chef commence la préparation.',
    soldOut: 'Épuisé',
    unavailable: 'Momentanément Indisponible',
    spiceLevel: 'Dosage du Piment',
    spiceLevels: {
      mild: 'Doux - Léger sillage',
      medium: 'Moyen - Réelle présence',
      hot: 'Épicé - Grande intensité',
      'extra-hot': 'Très Épicé - Chaleur volcanique'
    },
    options: 'Modifier Votre Plat',
    specialInstructions: 'Remarques Chef / Exemptions',
    instructionsPlaceholder: 'Contraintes d\'allergies, sans glaçon, sauce à part...',
    backToMenu: 'Retour au Menu',
    orderHistory: 'Commandes Table Actives',
    orderStatus: 'Suivi de la Préparation',
    orderStatuses: {
      pending: 'Reçu en Cuisine',
      preparing: 'En Cours de Cuisson',
      served: 'Plats Servis',
      completed: 'Terminé & Réglé',
      cancelled: 'Annulé'
    },
    vegetarian: 'Végétarien',
    vegan: 'Végétalien',
    glutenFree: 'Sans Gluten',
    spicy: 'Relevé',
    nuts: 'Contient des Fruits à Coque',
    filters: 'Préférences Alimentaires',
    all: 'Toutes les Créations',
    popularDishes: 'Incontournables du Chef',
    currencySymbol: '€',
    confirmTableTitle: 'Valider le Numéro de Table',
    confirmTableDesc: 'Pour lier cette session de commande mobile avec votre table physique, veuillez valider ou saisir votre numéro de table.',
    confirmTableButton: 'Accéder à la Carte',
    enterTablePlaceholder: 'Numéro de table (ex., 3)',
    adminPanel: 'Gestion Menu & Commandes Cuisine',
    customerPanel: 'Interface Mobile Client'
  }
};

export const AVAILABLE_TABLES = [
  { id: '1', name: 'Table 1 - Patio Sun' },
  { id: '2', name: 'Table 2 - Garden View' },
  { id: '3', name: 'Table 3 - Cozy Corner' },
  { id: '4', name: 'Table 4 - Bar Side' },
  { id: '5', name: 'Table 5 - Window Allee' },
  { id: '6', name: 'Table 6 - Chef Booth' }
];
