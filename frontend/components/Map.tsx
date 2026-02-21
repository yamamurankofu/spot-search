'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';

interface Spot {
  id: number;
  name: string;
  category: string;
  lat: number;
  long: number;
  address: string;
  distance_km?: number;
}

export default function MapComponent() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [center, setCenter] = useState({ lat: 35.6812, lng: 139.7671 });
  const [radius, setRadius] = useState(5);
  const [currentAddress, setCurrentAddress] = useState('読み込み中...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpots(center.lat, center.lng, radius);
      fetchAddress(center.lat, center.lng);
    }, 500);

    return () => clearTimeout(timer);
  }, [center, radius]);

  const fetchSpots = async (lat: number, lng: number, radiusKm: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/spots/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`
      );
      const data = await response.json();
      setSpots(data);
    } catch (error) {
      console.error('Failed to fetch spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ja`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address.replace(/^[A-Z0-9+]+\s+/, '');
        setCurrentAddress(address);
      } else {
        setCurrentAddress('住所を取得できませんでした');
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
      setCurrentAddress('住所を取得できませんでした');
    }
  };

  return (
    <div className="flex h-screen">
      {/* 地図部分 */}
      <div className="w-2/3 relative">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <Map
            defaultCenter={center}
            defaultZoom={12}
            onCenterChanged={(e) => {
              const newCenter = e.detail.center;
              setCenter({ lat: newCenter.lat, lng: newCenter.lng });
            }}
          >
            {spots.map((spot) => (
              <Marker
                key={spot.id}
                position={{ lat: spot.lat, lng: spot.long }}
                title={spot.name}
              />
            ))}
          </Map>
        </APIProvider>

        {/* ローディング表示 */}
        {loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">読み込み中...</span>
            </div>
          </div>
        )}
      </div>

      {/* スポット一覧部分 */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">周辺検索</h2>
        
        {/* 現在地住所表示 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">現在の地図中心</p>
          <p className="text-sm font-medium">{currentAddress}</p>
        </div>

        {/* 半径スライダー */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            検索半径: {radius} km
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1km</span>
            <span>10km</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">
          スポット一覧 ({spots.length}件)
          {loading && <span className="text-sm text-gray-500 ml-2">更新中...</span>}
        </h3>
        
        <div className="space-y-3">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <h3 className="font-semibold">{spot.name}</h3>
              <p className="text-sm text-gray-600">{spot.category}</p>
              <p className="text-sm text-gray-500">{spot.address}</p>
              {spot.distance_km !== undefined && (
                <p className="text-xs text-blue-600 mt-1">
                  距離: {spot.distance_km.toFixed(2)} km
                </p>
              )}
            </div>
          ))}
        </div>

        {spots.length === 0 && !loading && (
          <p className="text-gray-500 text-center mt-8">
            この範囲にスポットはありません
          </p>
        )}
      </div>
    </div>
  );
}