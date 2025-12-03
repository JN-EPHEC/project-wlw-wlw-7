import { useAuth } from "@/Auth_context";
import { useUserProfile } from "@/hooks/User_profile";
import { useRouter } from "expo-router";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function ProfileScreen(){
    const router = useRouter();
    const {user, logoutUser} = useAuth();
    const {profile, loading} = useUserProfile();

    if(loading) return <ActivityIndicator size="large"/>; 

    return(
        <View style={{ padding: 20 }}>
      <Text>Email : {user?.email}</Text>
      <Text>Nom affiché : {profile?.displayName ?? "Non défini"}</Text>
      <Text>Username : {profile?.username ?? "Non défini"}</Text>
      <Text>Ville : {profile?.city ?? "Non défini"}</Text>
      <Text>Âge : {profile?.age ?? "Non défini"}</Text>

      <Button title="Modifier le profil" onPress={() => router.push("../Profile/Modif_prof")} />
      <Button title="Se déconnecter" color="red" onPress={logoutUser} />
    </View>
  );
}