import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";


export default function TabLayout() {

    return (
        <Tabs 
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#000",
            tabBarStyle: { paddingBottom: 6, height: 60 },
        }}>
            <Tabs.Screen name="index" options={{title:"Home", tabBarIcon:({color, size})=>{
                return <Ionicons  name="home" color={color} size={size}/>
            }}}/>
            <Tabs.Screen name="add" options={{title:"Add Transaction", tabBarIcon:({color, size})=>{
                return <Ionicons  name="add-circle" color={color} size={size}/>
            }}}/>
            <Tabs.Screen name="stats" options={{title:"Statistics", tabBarIcon: ({color, size})=>{
                return <Ionicons  name="stats-chart" color={color} size={size}/>
            }}}/>
            <Tabs.Screen name="settings" options={{title:"Settings", tabBarIcon:({color, size})=>{
                return <Ionicons  name="settings" color={color} size={size}/>
            }}}/>
        </Tabs>
    )
}