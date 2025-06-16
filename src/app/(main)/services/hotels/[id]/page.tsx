
import type { Metadata } from 'next';
import HotelDetailClientPage from './HotelDetailClientPage';
import { collection, getDocs, type DocumentData, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real app, fetch item data here and use it to generate metadata
  return {
    title: `Hotel ${params.id}`, // Placeholder title
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("categoryName", "==", "hotels"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching hotel IDs for generateStaticParams:", error);
    return [];
  }
}

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  return <HotelDetailClientPage params={params} itemType="hotel" />;
}
