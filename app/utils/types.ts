// app/utils/types.ts

export type Listing = {
  id?: string; // ✅ Make this optional
  title: string;
  price: number;
  description: string;
  image: string;
  location: string;
  category: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  apartmentId?: string;
  [key: string]: any;

  // House-specific
  availableFrom?: string;

  // Car-specific
  brand?: string;
  model?: string;
  fuelType?: string;
  seats?: number;

  // Electronics-specific
  condition?: string;
  warranty?: string;
};
