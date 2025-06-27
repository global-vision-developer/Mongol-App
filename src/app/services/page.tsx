
import { collection, getDocs, limit, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RecommendedItem, ItemType } from "@/types";
import { ServicesPageClient } from './ServicesPageClient';

// Firestore-ийн "entries" collection-д хадгалагдсан категорийн нэрийг (жишээ нь, "hotels")
// апп дотор ашиглагдах ганц тооны төрөл рүү (жишээ нь, "hotel") хөрвүүлэх функц.
const mapCategoryToSingularItemType = (categoryName?: string): ItemType => {
  const lowerCategoryName = categoryName?.toLowerCase();
  switch (lowerCategoryName) {
    case 'hotels': return 'hotel';
    case 'translators': return 'translator';
    case 'markets': return 'market';
    case 'factories': return 'factory';
    case 'hospitals': return 'hospital';
    case 'embassies': return 'embassy';
    case 'wechat': return 'wechat';
    default: return (lowerCategoryName || 'service') as ItemType;
  }
};

// Ангилал бүрээр Firestore-оос өгөгдөл татах ерөнхий функц.
const fetchEntriesByCategory = async (
  categoryNameFilter: string,
  count: number,
): Promise<RecommendedItem[]> => {
  const entriesRef = collection(db, "entries");
  // Ангиллын нэрээр шүүж, тооны хязгаар тавих query үүсгэх
  const queryConstraints = [
    where("categoryName", "==", categoryNameFilter),
    limit(count)
  ];
  
  const firestoreQuery: FirestoreQueryType<DocumentData> = query(entriesRef, ...queryConstraints);
  
  const snapshot = await getDocs(firestoreQuery);
  // Татагдсан document бүрийг апп-д ашиглах RecommendedItem төрөл рүү хөрвүүлэх
  return snapshot.docs.map(doc => {
    const entryData = doc.data();
    const nestedData = entryData.data || {};
    const categoryNameFromDoc = entryData.categoryName;
    
    const rawImageUrl = nestedData['cover-image'];
    let finalImageUrl: string | undefined = undefined;
    if (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
      finalImageUrl = rawImageUrl.trim();
    }

    return { 
      id: doc.id, 
      name: nestedData.name || null, 
      imageUrl: finalImageUrl,
      description: nestedData.description || '',
      location: nestedData.city || undefined, 
      city: nestedData.city || undefined,
      rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : (nestedData.unelgee === null ? undefined : nestedData.unelgee),
      price: nestedData.price === undefined ? null : nestedData.price, 
      itemType: mapCategoryToSingularItemType(categoryNameFromDoc),
      dataAiHint: nestedData.dataAiHint || `${categoryNameFromDoc || 'item'} item`,
      ...(categoryNameFromDoc === 'translators' && {
        nationality: nestedData.nationality,
        speakingLevel: nestedData.speakingLevel,
        writingLevel: nestedData.writingLevel,
        dailyRate: nestedData.dailyRate,
        currentCityInChina: nestedData.currentCityInChina,
      }),
      rooms: nestedData.uruunuud || [],
      showcaseItems: nestedData.delgerengui || [],
    } as RecommendedItem;
  });
};

// Нүүр хуудсыг харуулах Server Component.
export default async function HomePage() {
  // Бүх ангиллын мэдээллийг зэрэг татах (Promise.all ашиглан)
  const [
    translatorsData, hotelsData, marketsData, factoriesData,
    hospitalsData, embassiesData, wechatData,
  ] = await Promise.all([
    fetchEntriesByCategory("translators", 20), 
    fetchEntriesByCategory("hotels", 20),
    fetchEntriesByCategory("markets", 20),
    fetchEntriesByCategory("factories", 20),
    fetchEntriesByCategory("hospitals", 20),
    fetchEntriesByCategory("embassies", 20),
    fetchEntriesByCategory("wechat", 20),
  ]);
  
  // Client талын компонент руу дамжуулах өгөгдлийг бэлтгэх
  const initialData = {
    allTranslators: translatorsData,
    allHotels: hotelsData,
    allWeChatItems: wechatData,
    allMarkets: marketsData,
    allFactories: factoriesData,
    allHospitals: hospitalsData,
    allEmbassies: embassiesData,
  };

  // Татагдсан өгөгдлийг Client Component руу дамжуулан рендер хийх
  return <ServicesPageClient initialData={initialData} />;
}
