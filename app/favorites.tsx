import { useFavoritesStore } from '@/store/useFavoritesStore';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';

export default function FavoritesScreen() {
  const favorites = useFavoritesStore((state) => state.favorites);

  if (favorites.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D12' }}>
        <Text style={{ color: 'white', fontSize: 16 }}>Aucun favori pour le moment ❤</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D12', padding: 16 }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Image source={{ uri: item.image }} style={{ width: '100%', height: 160, borderRadius: 10 }} />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}