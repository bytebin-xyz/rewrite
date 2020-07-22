export interface GeolocationData {
  host: string;
  ip: string;
  rdns: string;
  asn: "" | number;
  isp: string;
  country_name: string;
  country_code: string;
  region_name: string | null;
  region_code: string | null;
  city: string | null;
  postal_code: string | null;
  continent_name: string;
  continent_code: string;
  latitude: number;
  longitude: number;
  metro_code: number;
  timezone: string;
  datetime: string;
}

export interface GeolocationErrorResponse {
  status: "error";
  description: string;
}

export interface GeolocationSuccessResponse {
  status: "success";
  description: string;
  data: {
    geo: GeolocationData;
  };
}

export type GeolocationResponse = GeolocationErrorResponse | GeolocationSuccessResponse;
