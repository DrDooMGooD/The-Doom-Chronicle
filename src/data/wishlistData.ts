export interface WishlistItem {
  id: string;
  title: string;
  category: 'hardware' | 'comic' | 'software' | 'studio';
  price: string;
  impact: string;
  buyUrl: string;
  priority: 'high' | 'medium' | 'fulfilled';
  imageUrl?: string;
  fulfilledBy?: string;
}

export interface PaymentProtocol {
  id: string;
  name: string;
  badge: string;
  color: string;
  iconName: string;
  handle: string;
  actionUrl?: string;
  qrCodeUrl?: string;
  description: string;
  isCopyable: boolean;
}

export interface TributeConfig {
  venmoHandle: string;
  paypalUrl: string;
  cashAppHandle: string;
  buyMeACoffeeUrl: string;
  patreonUrl: string;
  btcAddress: string;
  ethAddress: string;
}

export const defaultTributeConfig: TributeConfig = {
  venmoHandle: '@DomPineda',
  paypalUrl: 'https://paypal.me/dompineda',
  cashAppHandle: '$DomPineda',
  buyMeACoffeeUrl: 'https://buymeacoffee.com/dompineda',
  patreonUrl: 'https://patreon.com/thedoomchronicle',
  btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ethAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

export const defaultWishlistItems: WishlistItem[] = [
  {
    id: 'item-1',
    title: 'Elgato Wave:3 USB Microphone & Studio Arm',
    category: 'hardware',
    price: '$149.99',
    impact: 'Ultra-clear voice reproduction for video review voiceovers, podcast critiques, and AI Doom Counsel calibration.',
    buyUrl: 'https://www.amazon.com/dp/B088HHWC47',
    priority: 'high',
    imageUrl: 'https://loremflickr.com/600/400/microphone,studio,tech'
  },
  {
    id: 'item-2',
    title: 'Elgato HD60 X 4K HDR Pass-Through Capture Card',
    category: 'hardware',
    price: '$179.99',
    impact: 'Zero-latency 4K 60fps console gameplay capture for direct video game analysis and screenshot archival.',
    buyUrl: 'https://www.amazon.com/dp/B09V18D377',
    priority: 'high',
    imageUrl: 'https://loremflickr.com/600/400/gaming,hardware,tech'
  },
  {
    id: 'item-3',
    title: 'Doctor Doom Omnibus Vol. 1 & Vol. 2 Hardcovers',
    category: 'comic',
    price: '$125.00',
    impact: 'Comprehensive lore research material for archival comparison in comic book critiques.',
    buyUrl: 'https://www.amazon.com/dp/1302931448',
    priority: 'high',
    imageUrl: 'https://loremflickr.com/600/400/comics,books,hardcover'
  },
  {
    id: 'item-4',
    title: 'LG UltraGear 27" 4K IPS Color-Calibrated Monitor',
    category: 'hardware',
    price: '$349.99',
    impact: 'Accurate color grading for video editing, graphics creation, and cinematic frame evaluation.',
    buyUrl: 'https://www.amazon.com/dp/B096N2N6NW',
    priority: 'medium',
    imageUrl: 'https://loremflickr.com/600/400/monitor,screen,tech'
  },
  {
    id: 'item-5',
    title: 'High-Bandwidth CDN & Dedicated Domain Host Vault',
    category: 'software',
    price: '$60.00 / yr',
    impact: 'Ensures instantaneous global load times for high-resolution comic panels and video assets.',
    buyUrl: 'https://www.netlify.com/',
    priority: 'medium',
    imageUrl: 'https://loremflickr.com/600/400/server,cloud,code'
  },
  {
    id: 'item-6',
    title: 'Acoustic Wall Panels & Soundproofing Rig',
    category: 'studio',
    price: '$89.00',
    impact: 'Eliminates room echo during late-night Latverian editorial recordings.',
    buyUrl: 'https://www.amazon.com/',
    priority: 'medium',
    imageUrl: 'https://loremflickr.com/600/400/studio,acoustic,sound'
  }
];
