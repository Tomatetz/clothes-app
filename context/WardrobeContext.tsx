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
type ItemDraft = Omit<WardrobeItem, "id">;

type WardrobeContextValue = {
  items: WardrobeItem[];
  outfit: Outfit;
  isLoading: boolean;
  error: string | null;
  addItem: (item: ItemDraft, adminPassword: string) => Promise<boolean>;
  updateItem: (item: WardrobeItem, adminPassword: string) => Promise<boolean>;
  uploadImage: (file: File, adminPassword: string) => Promise<string | null>;
  selectItem: (slot: ClothingSlot, itemId: string) => void;
  clearSelection: (slot: ClothingSlot) => void;
  removeItem: (itemId: string, adminPassword: string) => Promise<boolean>;
  getItemsForSlot: (slot: ClothingSlot) => WardrobeItem[];
  getSelectedItem: (slot: ClothingSlot) => WardrobeItem | undefined;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);
const storageKey = "clothes-app-wardrobe";

function mergeStarterItems(savedItems: WardrobeItem[]) {
  const starterById = new Map(starterItems.map((item) => [item.id, item]));
  const syncedSavedItems = savedItems.map((item) => {
    const starterItem = starterById.get(item.id);

    if (!starterItem) return item;

    return {
      ...item,
      slots: Array.from(new Set([...item.slots, ...starterItem.slots]))
    };
  });
  const savedIds = new Set(syncedSavedItems.map((item) => item.id));
  const missingStarterItems = starterItems.filter((item) => !savedIds.has(item.id));

  return [...syncedSavedItems, ...missingStarterItems];
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload as T;
}

function loadLocalWardrobe() {
  const saved = window.localStorage.getItem(storageKey);

  if (!saved) return { items: starterItems, outfit: {} };

  try {
    const parsed = JSON.parse(saved) as {
      items?: WardrobeItem[];
      outfit?: Outfit;
    };

    return {
      items: parsed.items?.length ? mergeStarterItems(parsed.items) : starterItems,
      outfit: parsed.outfit ?? {}
    };
  } catch {
    return { items: starterItems, outfit: {} };
  }
}

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WardrobeItem[]>(starterItems);
  const [outfit, setOutfit] = useState<Outfit>({});
  const [isLoading, setIsLoading] = useState(true);
  const [usesRemoteData, setUsesRemoteData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWardrobe() {
      try {
        const response = await fetch("/api/wardrobe", { cache: "no-store" });
        const payload = await parseJsonResponse<{
          items: WardrobeItem[];
          outfit: Outfit;
        }>(response);

        if (cancelled) return;

        setItems(payload.items);
        setOutfit(payload.outfit);
        setUsesRemoteData(true);
        setError(null);
      } catch (requestError) {
        if (cancelled) return;

        const localWardrobe = loadLocalWardrobe();
        setItems(localWardrobe.items);
        setOutfit(localWardrobe.outfit);
        setUsesRemoteData(false);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Using local fallback data"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWardrobe();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoading || usesRemoteData) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ items, outfit }));
  }, [isLoading, items, outfit, usesRemoteData]);

  const value = useMemo<WardrobeContextValue>(
    () => ({
      items,
      outfit,
      isLoading,
      error,
      addItem: async (item, adminPassword) => {
        if (!usesRemoteData) {
          const newItem: WardrobeItem = {
            ...item,
            id: crypto.randomUUID()
          };
          setItems((current) => [newItem, ...current]);
          return true;
        }

        try {
          const response = await fetch("/api/clothes", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-admin-password": adminPassword
            },
            body: JSON.stringify(item)
          });
          const payload = await parseJsonResponse<{ item: WardrobeItem }>(
            response
          );
          setItems((current) => [payload.item, ...current]);
          setError(null);
          return true;
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to create item"
          );
          return false;
        }
      },
      updateItem: async (updatedItem, adminPassword) => {
        if (!usesRemoteData) {
          setItems((current) =>
            current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
          );
          return true;
        }

        try {
          const response = await fetch(`/api/clothes/${updatedItem.id}`, {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              "x-admin-password": adminPassword
            },
            body: JSON.stringify(updatedItem)
          });
          const payload = await parseJsonResponse<{ item: WardrobeItem }>(
            response
          );
          setItems((current) =>
            current.map((item) => (item.id === payload.item.id ? payload.item : item))
          );
          setOutfit((current) => {
            const next = { ...current };
            Object.entries(next).forEach(([slot, selectedId]) => {
              if (
                selectedId === payload.item.id &&
                !payload.item.slots.includes(slot as ClothingSlot)
              ) {
                delete next[slot as ClothingSlot];
              }
            });
            return next;
          });
          setError(null);
          return true;
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to update item"
          );
          return false;
        }
      },
      uploadImage: async (file, adminPassword) => {
        if (!usesRemoteData) return null;

        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/uploads", {
            method: "POST",
            headers: {
              "x-admin-password": adminPassword
            },
            body: formData
          });
          const payload = await parseJsonResponse<{ imageUrl: string }>(
            response
          );
          setError(null);
          return payload.imageUrl;
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to upload image"
          );
          return null;
        }
      },
      selectItem: (slot, itemId) => {
        const slotsToClear = Object.entries(outfit)
          .filter(
            ([currentSlot, selectedId]) =>
              currentSlot !== slot && selectedId === itemId
          )
          .map(([currentSlot]) => currentSlot as ClothingSlot);

        setOutfit((current) => {
          const next = { ...current };

          Object.entries(next).forEach(([currentSlot, selectedId]) => {
            if (currentSlot !== slot && selectedId === itemId) {
              delete next[currentSlot as ClothingSlot];
            }
          });

          next[slot] = itemId;
          return next;
        });

        if (usesRemoteData) {
          Promise.all([
            ...slotsToClear.map((slotToClear) =>
              fetch("/api/outfit", {
                method: "PUT",
                headers: {
                  "content-type": "application/json"
                },
                body: JSON.stringify({
                  slot: slotToClear,
                  clothingItemId: null
                })
              })
            ),
            fetch("/api/outfit", {
              method: "PUT",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({ slot, clothingItemId: itemId })
            })
          ]).catch(() => setError("Failed to save outfit selection"));
        }
      },
      clearSelection: (slot) => {
        setOutfit((current) => {
          const next = { ...current };
          delete next[slot];
          return next;
        });

        if (usesRemoteData) {
          fetch("/api/outfit", {
            method: "PUT",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({ slot, clothingItemId: null })
          }).catch(() => setError("Failed to clear outfit selection"));
        }
      },
      removeItem: async (itemId, adminPassword) => {
        if (usesRemoteData) {
          try {
            const response = await fetch(`/api/clothes/${itemId}`, {
              method: "DELETE",
              headers: {
                "x-admin-password": adminPassword
              }
            });
            await parseJsonResponse<{ ok: true }>(response);
            setError(null);
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Failed to delete item"
            );
            return false;
          }
        }

        setItems((current) => current.filter((item) => item.id !== itemId));
        setOutfit((current) => {
          const next = { ...current };
          Object.entries(next).forEach(([slot, selectedId]) => {
            if (selectedId === itemId) delete next[slot as ClothingSlot];
          });
          return next;
        });
        return true;
      },
      getItemsForSlot: (slot) => items.filter((item) => item.slots.includes(slot)),
      getSelectedItem: (slot) =>
        items.find((item) => item.id === outfit[slot])
    }),
    [error, isLoading, items, outfit, usesRemoteData]
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
