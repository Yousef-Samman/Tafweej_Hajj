declare module '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions' {
  import { Map as MapboxMap } from 'mapbox-gl';

  export default class MapboxDirections {
    constructor(options?: {
      accessToken?: string;
      unit?: string;
      profile?: string;
      alternatives?: boolean;
      geometries?: string;
      controls?: {
        inputs?: boolean;
        instructions?: boolean;
      };
      flyTo?: boolean;
    });

    onAdd(map: MapboxMap): void;
    onRemove(map: MapboxMap): void;
  }
} 