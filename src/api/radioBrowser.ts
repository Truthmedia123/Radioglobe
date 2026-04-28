import axios from 'axios';

const RADIO_BROWSER_API_BASE = 'https://de1.api.radio-browser.info/json';

export interface Station {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  lastcheckok: number;
  lastchecktime: string;
  lastcheckoktime: string;
  lastlocalchecktime: string;
  clicktimestamp: string;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
  geo_lat: number | null;
  geo_long: number | null;
  has_extended_info: boolean;
}

export const fetchTopStations = async (limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/topclick/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top stations', error);
    return [];
  }
};

export const searchStations = async (query: string, limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/search`, {
      params: {
        name: query,
        limit,
        hidebroken: true,
        order: 'clickcount',
        reverse: true,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search stations', error);
    return [];
  }
};

export const searchStationsByTags = async (tags: string[], limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/search`, {
      params: {
        tagList: tags.join(','),
        limit,
        hidebroken: true,
        order: 'clickcount',
        reverse: true,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search stations by tags', error);
    return [];
  }
};

export const searchStationsByLanguage = async (language: string, limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/search`, {
      params: {
        language,
        limit,
        hidebroken: true,
        order: 'clickcount',
        reverse: true,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search stations by language', error);
    return [];
  }
};

export const searchStationsByCountry = async (countrycode: string, limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/search`, {
      params: {
        countrycode,
        limit,
        hidebroken: true,
        order: 'clickcount',
        reverse: true,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search stations by country', error);
    return [];
  }
};
