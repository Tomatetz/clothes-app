"use client";

import {
  ClothingSlot,
  starterItems,
  WardrobeItem
} from "@/lib/wardrobe";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type Outfit = Partial<Record<ClothingSlot, string>>;

type WardrobeContextValue = {
  items: WardrobeItem[];
  outfit: Outfit;
  addItem: (item: Omit<WardrobeItem, "id">) => void;
  updateItem: (item: WardrobeItem) => void;
  selectItem: (slot: ClothingSlot, itemId: string) => void;
  clearSelection: (slot: ClothingSlot) => void;
  removeItem: (itemId: string) => void;
  getItemsForSlot: (slot: ClothingSlot) => WardrobeItem[];
  getSelectedItem: (slot: ClothingSlot) => WardrobeItem | undefined;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);
const storageKey = "clothes-app-wardrobe";

function mergeStarterItems(savedItems: WardrobeItem[]) {
  const savedIds = new Set(savedItems.map((item) => item.id));
  const missingStarterItems = starterItems.filter((item) => !savedIds.has(item.id));

  return [...savedItems, ...missingStarterItems];
}

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WardrobeItem[]>(starterItems);
  const [outfit, setOutfit] = useState<Outfit>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          items?: WardrobeItem[];
          outfit?: Outfit;
        };
        setItems(
          parsed.items?.length ? mergeStarterItems(parsed.items) : starterItems
        );
        setOutfit(parsed.outfit ?? {});
      } catch {
        setItems(starterItems);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ items, outfit }));
  }, [items, loaded, outfit]);

  const value = useMemo<WardrobeContextValue>(
    () => ({
      items,
      outfit,
      addItem: (item) => {
        const newItem: WardrobeItem = {
          ...item,
          id: crypto.randomUUID()
        };
        setItems((current) => [newItem, ...current]);
      },
      updateItem: (updatedItem) => {
        setItems((current) =>
          current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        setOutfit((current) => {
          const next = { ...current };
          Object.entries(next).forEach(([slot, selectedId]) => {
            if (
              selectedId === updatedItem.id &&
              !updatedItem.slots.includes(slot as ClothingSlot)
            ) {
              delete next[slot as ClothingSlot];
            }
          });
          return next;
        });
      },
      selectItem: (slot, itemId) => {
        setOutfit((current) => ({ ...current, [slot]: itemId }));
      },
      clearSelection: (slot) => {
        setOutfit((current) => {
          const next = { ...current };
          delete next[slot];
          return next;
        });
      },
      removeItem: (itemId) => {
        setItems((current) => current.filter((item) => item.id !== itemId));
        setOutfit((current) => {
          const next = { ...current };
          Object.entries(next).forEach(([slot, selectedId]) => {
            if (selectedId === itemId) delete next[slot as ClothingSlot];
          });
          return next;
        });
      },
      getItemsForSlot: (slot) => items.filter((item) => item.slots.includes(slot)),
      getSelectedItem: (slot) =>
        items.find((item) => item.id === outfit[slot])
    }),
    [items, outfit]
  );

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used within WardrobeProvider");
  }
  return context;
}
