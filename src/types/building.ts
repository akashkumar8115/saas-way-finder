export interface Floor {
  floor_id: string;
  label: string;
  order: number;
  imageUrl: string;
  building_id: string;
  datetime: number;
  status: string;
}

export interface Building {
  building_id: string;
  name: string;
  address: string;
  description: string;
  floors: Floor[];
  created_by: string;
  datetime: number;
  status: string;
}

export interface NewFloorData {
  label: string;
  order: number;
  imageUrl: string;
}


