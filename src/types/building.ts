export interface Floor {
  id: string;
  label: string;
  order: number;
  imageUrl: string;
  createdAt: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  description: string;
  floors: Floor[];
  createdAt: string;
}

export interface NewFloorData {
  label: string;
  order: number;
  imageUrl: string;
}


