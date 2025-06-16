
import type { Metadata } from 'next';
import MarketDetailClientPage from './MarketDetailClientPage';
import { collection, getDocs, type DocumentData, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Market ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("categoryName", "==", "markets"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching market IDs for generateStaticParams:", error);
    return [];
  }
}

export default function MarketDetailPageServer({ params }: { params: { id: string } }) {
  return <MarketDetailClientPage params={params} itemType="market" />;
}
