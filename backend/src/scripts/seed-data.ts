import { db } from '../config/database.js';

export interface SeedBusiness {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  googlePlaceId: string;
  tags: string[];
  amenities: string[];
  openingHours: Record<string, string[]>;
  images: string[];
}

const seedBusinesses: SeedBusiness[] = [
  {
    name: "The Beauty Lounge",
    category: "Beauty & Wellness",
    subcategory: "Hair Salon",
    description: "Premium hair salon offering cuts, coloring, styling, and treatments. Our expert stylists use only the finest products to give you the look you deserve.",
    address: "123 Main Street",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4023",
    latitude: 4.0511,
    longitude: 9.7679,
    phone: "+237 678 901 234",
    email: "info@beautylounge.cm",
    website: "https://beautylounge.cm",
    rating: 4.8,
    reviewCount: 234,
    priceLevel: 3,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_1",
    tags: ["hair", "beauty", "salon", "styling", "coloring"],
    amenities: ["wifi", "parking", "accepts_cards", "wheelchair_accessible"],
    openingHours: {
      monday: ["9:00 AM - 7:00 PM"],
      tuesday: ["9:00 AM - 7:00 PM"],
      wednesday: ["9:00 AM - 7:00 PM"],
      thursday: ["9:00 AM - 8:00 PM"],
      friday: ["9:00 AM - 8:00 PM"],
      saturday: ["8:00 AM - 6:00 PM"],
      sunday: ["Closed"]
    },
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521590832169-d7fcbe755f6e?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "FitLife Gym",
    category: "Fitness & Sports",
    subcategory: "Gym",
    description: "State-of-the-art fitness center with modern equipment, personal trainers, group classes, and wellness programs. Transform your body and mind.",
    address: "456 Boulevard de la Liberté",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4024",
    latitude: 4.0483,
    longitude: 9.7042,
    phone: "+237 699 123 456",
    email: "contact@fitlifegym.cm",
    website: "https://fitlifegym.cm",
    rating: 4.6,
    reviewCount: 189,
    priceLevel: 2,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_2",
    tags: ["fitness", "gym", "workout", "personal_training", "classes"],
    amenities: ["parking", "showers", "lockers", "wifi", "smoothie_bar"],
    openingHours: {
      monday: ["6:00 AM - 10:00 PM"],
      tuesday: ["6:00 AM - 10:00 PM"],
      wednesday: ["6:00 AM - 10:00 PM"],
      thursday: ["6:00 AM - 10:00 PM"],
      friday: ["6:00 AM - 9:00 PM"],
      saturday: ["7:00 AM - 8:00 PM"],
      sunday: ["8:00 AM - 6:00 PM"]
    },
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "Le Gourmet Restaurant",
    category: "Food & Dining",
    subcategory: "Fine Dining",
    description: "Exquisite French-Cameroonian fusion cuisine in an elegant setting. Experience culinary excellence with our chef's special tasting menus.",
    address: "789 Rue Joffre",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4025",
    latitude: 4.0505,
    longitude: 9.7085,
    phone: "+237 655 789 012",
    email: "reservations@legourmet.cm",
    website: "https://legourmet.cm",
    rating: 4.9,
    reviewCount: 312,
    priceLevel: 4,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_3",
    tags: ["restaurant", "fine_dining", "french", "cameroonian", "romantic"],
    amenities: ["valet_parking", "wine_cellar", "private_rooms", "outdoor_seating"],
    openingHours: {
      monday: ["Closed"],
      tuesday: ["6:00 PM - 11:00 PM"],
      wednesday: ["6:00 PM - 11:00 PM"],
      thursday: ["6:00 PM - 11:00 PM"],
      friday: ["6:00 PM - 12:00 AM"],
      saturday: ["6:00 PM - 12:00 AM"],
      sunday: ["12:00 PM - 10:00 PM"]
    },
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "AutoPro Mechanics",
    category: "Automotive",
    subcategory: "Car Repair",
    description: "Professional automotive repair and maintenance services. Certified mechanics specializing in all makes and models with quick turnaround times.",
    address: "321 Avenue du Général de Gaulle",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4026",
    latitude: 4.0467,
    longitude: 9.7123,
    phone: "+237 677 345 678",
    email: "service@autopro.cm",
    website: "https://autopro.cm",
    rating: 4.5,
    reviewCount: 156,
    priceLevel: 2,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_4",
    tags: ["automotive", "repair", "maintenance", "oil_change", "tires"],
    amenities: ["waiting_area", "wifi", "shuttle_service", "warranty"],
    openingHours: {
      monday: ["8:00 AM - 6:00 PM"],
      tuesday: ["8:00 AM - 6:00 PM"],
      wednesday: ["8:00 AM - 6:00 PM"],
      thursday: ["8:00 AM - 6:00 PM"],
      friday: ["8:00 AM - 6:00 PM"],
      saturday: ["9:00 AM - 4:00 PM"],
      sunday: ["Closed"]
    },
    images: [
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "TechHub Electronics",
    category: "Electronics & Technology",
    subcategory: "Computer Repair",
    description: "Expert electronics repair and IT services. We fix computers, smartphones, tablets, and provide custom PC builds and network solutions.",
    address: "555 Rue Franqueville",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4027",
    latitude: 4.0528,
    longitude: 9.7156,
    phone: "+237 688 234 567",
    email: "support@techhub.cm",
    website: "https://techhub.cm",
    rating: 4.7,
    reviewCount: 203,
    priceLevel: 2,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_5",
    tags: ["electronics", "computer_repair", "smartphone", "IT_services", "custom_PC"],
    amenities: ["free_diagnostics", "data_recovery", "warranty", "pickup_delivery"],
    openingHours: {
      monday: ["9:00 AM - 7:00 PM"],
      tuesday: ["9:00 AM - 7:00 PM"],
      wednesday: ["9:00 AM - 7:00 PM"],
      thursday: ["9:00 AM - 7:00 PM"],
      friday: ["9:00 AM - 7:00 PM"],
      saturday: ["10:00 AM - 5:00 PM"],
      sunday: ["Closed"]
    },
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588590855394-a9ff2627e6a3?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "Serenity Spa & Wellness",
    category: "Beauty & Wellness",
    subcategory: "Spa",
    description: "Luxury spa offering massages, facials, body treatments, and holistic wellness therapies. Escape from the everyday and rejuvenate your senses.",
    address: "888 Akwa Boulevard",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4028",
    latitude: 4.0495,
    longitude: 9.7098,
    phone: "+237 699 876 543",
    email: "booking@serenityspa.cm",
    website: "https://serenityspa.cm",
    rating: 4.9,
    reviewCount: 278,
    priceLevel: 4,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_6",
    tags: ["spa", "massage", "wellness", "facial", "relaxation"],
    amenities: ["sauna", "steam_room", "relaxation_lounge", "aromatherapy", "couples_rooms"],
    openingHours: {
      monday: ["10:00 AM - 8:00 PM"],
      tuesday: ["10:00 AM - 8:00 PM"],
      wednesday: ["10:00 AM - 8:00 PM"],
      thursday: ["10:00 AM - 9:00 PM"],
      friday: ["10:00 AM - 9:00 PM"],
      saturday: ["9:00 AM - 9:00 PM"],
      sunday: ["11:00 AM - 7:00 PM"]
    },
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "HomeStyle Interior Design",
    category: "Home Services",
    subcategory: "Interior Design",
    description: "Transform your living space with our professional interior design services. From concept to completion, we create beautiful, functional homes.",
    address: "222 Rue Castelnau",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4029",
    latitude: 4.0540,
    longitude: 9.7045,
    phone: "+237 666 123 789",
    email: "design@homestyle.cm",
    website: "https://homestyle.cm",
    rating: 4.8,
    reviewCount: 145,
    priceLevel: 3,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_7",
    tags: ["interior_design", "home_decor", "renovation", "consultation", "furniture"],
    amenities: ["free_consultation", "3D_rendering", "project_management", "warranty"],
    openingHours: {
      monday: ["9:00 AM - 6:00 PM"],
      tuesday: ["9:00 AM - 6:00 PM"],
      wednesday: ["9:00 AM - 6:00 PM"],
      thursday: ["9:00 AM - 7:00 PM"],
      friday: ["9:00 AM - 7:00 PM"],
      saturday: ["10:00 AM - 4:00 PM"],
      sunday: ["By appointment"]
    },
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop"
    ]
  },
  {
    name: "PetCare Veterinary Clinic",
    category: "Pet Services",
    subcategory: "Veterinary",
    description: "Compassionate veterinary care for your beloved pets. Full-service clinic offering preventive care, surgery, dentistry, and emergency services.",
    address: "444 Rue de l'Hôpital",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4030",
    latitude: 4.0478,
    longitude: 9.7167,
    phone: "+237 655 432 109",
    email: "care@petcare.cm",
    website: "https://petcare.cm",
    rating: 4.9,
    reviewCount: 267,
    priceLevel: 3,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4_8",
    tags: ["veterinary", "pet_care", "surgery", "vaccination", "emergency"],
    amenities: ["parking", "play_area", "pharmacy", "grooming", "boarding"],
    openingHours: {
      monday: ["8:00 AM - 7:00 PM"],
      tuesday: ["8:00 AM - 7:00 PM"],
      wednesday: ["8:00 AM - 7:00 PM"],
      thursday: ["8:00 AM - 7:00 PM"],
      friday: ["8:00 AM - 7:00 PM"],
      saturday: ["9:00 AM - 5:00 PM"],
      sunday: ["Emergency only"]
    },
    images: [
      "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop"
    ]
  }
];

const seedHousingListings = [
  {
    title: "Luxury Oceanview Apartment in Bonanjo",
    description: "Stunning 3-bedroom apartment with panoramic ocean views. Modern furnishings, full kitchen, rooftop terrace, and 24/7 security. Perfect for business travelers and families.",
    propertyType: "Apartment",
    roomType: "Entire place",
    address: "15 Rue Sylvani",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4001",
    latitude: 4.0510,
    longitude: 9.7050,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2.5,
    pricePerNight: 185,
    minimumNights: 2,
    maximumNights: 30,
    cleaningFee: 50,
    securityDeposit: 200,
    isSuperhost: true,
    isGuestFavorite: true,
    isInstantBook: true,
    selfCheckIn: true,
    hostId: "host_001",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=800&auto=format&fit=crop"
    ],
    amenities: ["wifi", "kitchen", "washer", "ac", "parking", "pool", "gym", "workspace"],
    houseRules: ["No smoking", "No parties", "Check-in after 3PM", "Checkout before 11AM"],
    cancellationPolicy: "moderate"
  },
  {
    title: "Cozy Studio in Akwa District",
    description: "Perfect studio for solo travelers or couples. Located in the heart of Akwa, walking distance to restaurants, shops, and nightlife. Fully equipped kitchenette.",
    propertyType: "Apartment",
    roomType: "Entire place",
    address: "28 Boulevard de la Liberté",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4002",
    latitude: 4.0495,
    longitude: 9.7080,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    pricePerNight: 65,
    minimumNights: 1,
    maximumNights: 14,
    cleaningFee: 25,
    securityDeposit: 100,
    isSuperhost: false,
    isGuestFavorite: true,
    isInstantBook: true,
    selfCheckIn: true,
    hostId: "host_002",
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771753035-1a5b6564f3a4?w=800&auto=format&fit=crop"
    ],
    amenities: ["wifi", "kitchen", "ac", "workspace", "tv"],
    houseRules: ["No smoking", "No pets", "Quiet hours 10PM-7AM"],
    cancellationPolicy: "flexible"
  },
  {
    title: "Modern Villa with Pool in Bonapriso",
    description: "Exclusive 4-bedroom villa with private pool and garden. Ideal for families or groups. Chef's kitchen, home theater, and dedicated workspace. Gated community with security.",
    propertyType: "Villa",
    roomType: "Entire place",
    address: "7 Allée des Palmiers",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4003",
    latitude: 4.0530,
    longitude: 9.7020,
    guests: 10,
    bedrooms: 4,
    beds: 6,
    baths: 4,
    pricePerNight: 450,
    minimumNights: 3,
    maximumNights: 60,
    cleaningFee: 150,
    securityDeposit: 500,
    isSuperhost: true,
    isGuestFavorite: true,
    isInstantBook: false,
    selfCheckIn: false,
    hostId: "host_003",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"
    ],
    amenities: ["wifi", "kitchen", "washer", "dryer", "ac", "parking", "pool", "gym", "workspace", "bbq"],
    houseRules: ["No smoking inside", "No parties without approval", "Pool hours 8AM-10PM"],
    cancellationPolicy: "strict"
  },
  {
    title: "Budget-Friendly Room in Bali",
    description: "Clean and comfortable private room in a shared apartment. Great for budget-conscious travelers. Shared kitchen and bathroom. Friendly neighborhood with local markets nearby.",
    propertyType: "Apartment",
    roomType: "Private room",
    address: "42 Rue Manga Bell",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4004",
    latitude: 4.0450,
    longitude: 9.7100,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    pricePerNight: 35,
    minimumNights: 1,
    maximumNights: 30,
    cleaningFee: 15,
    securityDeposit: 50,
    isSuperhost: false,
    isGuestFavorite: false,
    isInstantBook: true,
    selfCheckIn: false,
    hostId: "host_004",
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop"
    ],
    amenities: ["wifi", "kitchen", "washing_machine"],
    houseRules: ["No smoking", "Respect shared spaces", "Quiet after 10PM"],
    cancellationPolicy: "flexible"
  },
  {
    title: "Executive Penthouse in Bonanjo",
    description: "Premium penthouse suite with city skyline views. High-end furnishings, marble bathrooms, gourmet kitchen. Building amenities include concierge, gym, and infinity pool.",
    propertyType: "Apartment",
    roomType: "Entire place",
    address: "1 Immeuble Fleuve Congo",
    city: "Douala",
    state: "Littoral",
    country: "CM",
    postalCode: "4005",
    latitude: 4.0520,
    longitude: 9.7060,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    pricePerNight: 320,
    minimumNights: 2,
    maximumNights: 21,
    cleaningFee: 100,
    securityDeposit: 400,
    isSuperhost: true,
    isGuestFavorite: true,
    isInstantBook: true,
    selfCheckIn: true,
    hostId: "host_005",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop"
    ],
    amenities: ["wifi", "kitchen", "washer", "dryer", "ac", "parking", "pool", "gym", "workspace", "doorman"],
    houseRules: ["No smoking", "No events", "Building quiet hours 10PM-8AM"],
    cancellationPolicy: "moderate"
  }
];

const seedServices = [
  // Beauty Lounge Services
  { businessName: "The Beauty Lounge", name: "Haircut & Style", description: "Professional haircut with wash and style", price: 15000, durationMinutes: 45, category: "Hair" },
  { businessName: "The Beauty Lounge", name: "Full Color Treatment", description: "Complete hair coloring with premium products", price: 45000, durationMinutes: 120, category: "Color" },
  { businessName: "The Beauty Lounge", name: "Keratin Treatment", description: "Smoothing keratin treatment for frizz-free hair", price: 85000, durationMinutes: 180, category: "Treatment" },
  { businessName: "The Beauty Lounge", name: "Bridal Styling", description: "Complete bridal hair and makeup package", price: 150000, durationMinutes: 240, category: "Bridal" },
  
  // FitLife Gym Services
  { businessName: "FitLife Gym", name: "Day Pass", description: "Full access to gym facilities for one day", price: 5000, durationMinutes: 480, category: "Membership" },
  { businessName: "FitLife Gym", name: "Personal Training Session", description: "One-on-one training with certified trainer", price: 15000, durationMinutes: 60, category: "Training" },
  { businessName: "FitLife Gym", name: "Group Fitness Class", description: "Join our energetic group workout sessions", price: 3000, durationMinutes: 45, category: "Classes" },
  { businessName: "FitLife Gym", name: "Nutrition Consultation", description: "Personalized meal plan and nutrition advice", price: 25000, durationMinutes: 60, category: "Wellness" },
  
  // Le Gourmet Services
  { businessName: "Le Gourmet Restaurant", name: "Chef's Tasting Menu", description: "7-course tasting menu with wine pairing", price: 75000, durationMinutes: 150, category: "Dining" },
  { businessName: "Le Gourmet Restaurant", name: "Private Dining Experience", description: "Exclusive private room for special occasions", price: 200000, durationMinutes: 180, category: "Events" },
  { businessName: "Le Gourmet Restaurant", name: "Wine Tasting Evening", description: "Guided wine tasting with sommelier", price: 35000, durationMinutes: 90, category: "Events" },
  
  // AutoPro Services
  { businessName: "AutoPro Mechanics", name: "Oil Change", description: "Full synthetic oil change with inspection", price: 25000, durationMinutes: 30, category: "Maintenance" },
  { businessName: "AutoPro Mechanics", name: "Brake Service", description: "Brake pad replacement and rotor resurfacing", price: 65000, durationMinutes: 90, category: "Repair" },
  { businessName: "AutoPro Mechanics", name: "Full Diagnostic", description: "Comprehensive vehicle diagnostic scan", price: 15000, durationMinutes: 45, category: "Diagnostic" },
  { businessName: "AutoPro Mechanics", name: "Tire Rotation & Balance", description: "Tire rotation with computer balancing", price: 12000, durationMinutes: 30, category: "Maintenance" },
  
  // TechHub Services
  { businessName: "TechHub Electronics", name: "Computer Repair", description: "Diagnosis and repair of computer issues", price: 20000, durationMinutes: 120, category: "Repair" },
  { businessName: "TechHub Electronics", name: "Smartphone Screen Replacement", description: "Original quality screen replacement", price: 35000, durationMinutes: 60, category: "Repair" },
  { businessName: "TechHub Electronics", name: "Data Recovery", description: "Recovery of lost data from damaged devices", price: 50000, durationMinutes: 180, category: "Services" },
  { businessName: "TechHub Electronics", name: "Custom PC Build", description: "Custom-built computer to your specifications", price: 75000, durationMinutes: 240, category: "Build" },
  
  // Serenity Spa Services
  { businessName: "Serenity Spa & Wellness", name: "Swedish Massage", description: "Relaxing full-body Swedish massage", price: 35000, durationMinutes: 60, category: "Massage" },
  { bookable: true, businessName: "Serenity Spa & Wellness", name: "Deep Tissue Massage", description: "Therapeutic deep tissue massage", price: 45000, durationMinutes: 60, category: "Massage" },
  { businessName: "Serenity Spa & Wellness", name: "Facial Treatment", description: "Premium facial with organic products", price: 30000, durationMinutes: 75, category: "Facial" },
  { businessName: "Serenity Spa & Wellness", name: "Couples Spa Package", description: "Romantic spa experience for two", price: 120000, durationMinutes: 120, category: "Packages" },
  
  // HomeStyle Services
  { businessName: "HomeStyle Interior Design", name: "Design Consultation", description: "Initial consultation and space assessment", price: 50000, durationMinutes: 90, category: "Consultation" },
  { businessName: "HomeStyle Interior Design", name: "Full Room Design", description: "Complete room design with 3D rendering", price: 150000, durationMinutes: 300, category: "Design" },
  { businessName: "HomeStyle Interior Design", name: "Home Staging", description: "Professional staging for property sale", price: 200000, durationMinutes: 480, category: "Staging" },
  
  // PetCare Services
  { businessName: "PetCare Veterinary Clinic", name: "Wellness Exam", description: "Comprehensive health checkup for pets", price: 15000, durationMinutes: 30, category: "Examination" },
  { businessName: "PetCare Veterinary Clinic", name: "Vaccination Package", description: "Complete vaccination series for puppies/kittens", price: 35000, durationMinutes: 45, category: "Preventive" },
  { businessName: "PetCare Veterinary Clinic", name: "Dental Cleaning", description: "Professional teeth cleaning under anesthesia", price: 65000, durationMinutes: 90, category: "Dental" },
  { businessName: "PetCare Veterinary Clinic", name: "Emergency Consultation", description: "Urgent care consultation", price: 40000, durationMinutes: 45, category: "Emergency" }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create a default admin user
    const adminId = 'admin_001';
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin@nexa.cm', '$2a$10$dummyhash', 'Nexa Admin', 'admin', 1);
    
    // Seed businesses
    console.log('📦 Seeding businesses...');
    const businessInsert = db.prepare(`
      INSERT OR REPLACE INTO businesses (
        id, owner_id, name, slug, description, category, subcategory,
        google_place_id, address, city, state, country, postal_code,
        latitude, longitude, phone, email, website,
        rating, review_count, price_level, is_verified, is_approved,
        trust_score, tags, opening_hours, amenities, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 75, ?, ?, ?, ?)
    `);
    
    for (const biz of seedBusinesses) {
      const businessId = `biz_${biz.googlePlaceId.split('_')[1]}`;
      
      businessInsert.run(
        businessId,
        adminId,
        biz.name,
        biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        biz.description,
        biz.category,
        biz.subcategory,
        biz.googlePlaceId,
        biz.address,
        biz.city,
        biz.state,
        biz.country,
        biz.postalCode,
        biz.latitude,
        biz.longitude,
        biz.phone,
        biz.email,
        biz.website || null,
        biz.rating,
        biz.reviewCount,
        biz.priceLevel,
        JSON.stringify(biz.tags),
        JSON.stringify(biz.openingHours),
        JSON.stringify(biz.amenities),
        JSON.stringify(biz.images)
      );
      
      console.log(`  ✅ Added: ${biz.name}`);
    }
    
    // Seed housing listings
    console.log('🏠 Seeding housing listings...');
    for (const listing of seedHousingListings) {
      const listingId = `listing_${Math.random().toString(36).substr(2, 9)}`;
      
      db.run(`
        INSERT OR REPLACE INTO housing_listings (
          id, host_id, title, description, property_type, room_type,
          address, city, state, country, postal_code,
          latitude, longitude, guests, bedrooms, beds, baths,
          price_per_night, minimum_nights, maximum_nights,
          cleaning_fee, security_deposit,
          is_superhost, is_guest_favorite, is_instant_book, self_check_in,
          images, amenities, house_rules, cancellation_policy, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        listingId,
        listing.hostId,
        listing.title,
        listing.description,
        listing.propertyType,
        listing.roomType,
        listing.address,
        listing.city,
        listing.state,
        listing.country,
        listing.postalCode,
        listing.latitude,
        listing.longitude,
        listing.guests,
        listing.bedrooms,
        listing.beds,
        listing.baths,
        listing.pricePerNight,
        listing.minimumNights,
        listing.maximumNights,
        listing.cleaningFee,
        listing.securityDeposit,
        listing.isSuperhost ? 1 : 0,
        listing.isGuestFavorite ? 1 : 0,
        listing.isInstantBook ? 1 : 0,
        listing.selfCheckIn ? 1 : 0,
        JSON.stringify(listing.images),
        JSON.stringify(listing.amenities),
        JSON.stringify(listing.houseRules),
        listing.cancellationPolicy
      ]);
      
      console.log(`  ✅ Added: ${listing.title}`);
    }
    
    // Seed services
    console.log('🔧 Seeding services...');
    for (const service of seedServices) {
      const serviceId = `svc_${Math.random().toString(36).substr(2, 9)}`;
      
      // Find the business ID
      const businessRow = db.prepare('SELECT id FROM businesses WHERE name = ?').get(service.businessName) as { id: string };
      
      if (businessRow) {
        db.run(`
          INSERT OR REPLACE INTO services (
            id, business_id, name, description, price, duration_minutes, category, is_available, requires_booking
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
        `, [
          serviceId,
          businessRow.id,
          service.name,
          service.description,
          service.price,
          service.durationMinutes,
          service.category
        ]);
        
        console.log(`  ✅ Added: ${service.name} at ${service.businessName}`);
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`   - ${seedBusinesses.length} businesses added`);
    console.log(`   - ${seedHousingListings.length} housing listings added`);
    console.log(`   - ${seedServices.length} services added`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed if this file is executed directly
if (process.argv[1]?.includes('seed-data')) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
