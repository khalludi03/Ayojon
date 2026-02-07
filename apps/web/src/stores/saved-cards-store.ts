export interface SavedCard {
  id: string;
  last4: string;
  cardType: string;
  holderName: string;
  expiryDate: string;
  savedAt: string;
}

const STORAGE_KEY = "ayojon-saved-cards";

const readSavedCards = (): SavedCard[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as SavedCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSavedCards = (cards: SavedCard[]) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const getSavedCards = (): SavedCard[] => readSavedCards();

export const addSavedCard = (
  last4: string,
  cardType: string,
  holderName: string,
  expiryDate: string
) => {
  const cards = readSavedCards();

  // Check if card already exists (by last4 and expiry)
  const existingCard = cards.find(
    (card) => card.last4 === last4 && card.expiryDate === expiryDate
  );

  if (existingCard) {
    // Card already saved, don't add duplicate
    return;
  }

  const newCard: SavedCard = {
    id: `card-${Date.now()}`,
    last4,
    cardType,
    holderName,
    expiryDate,
    savedAt: new Date().toISOString(),
  };

  writeSavedCards([newCard, ...cards]);
};

export const removeSavedCard = (cardId: string) => {
  const cards = readSavedCards();
  const updatedCards = cards.filter((card) => card.id !== cardId);
  writeSavedCards(updatedCards);
};

export const clearSavedCards = () => {
  writeSavedCards([]);
};
