/**
 * @format
 */
import { Buffer } from "buffer";
global.Buffer = Buffer;

// Polyfill untuk window.location (diperlukan oleh paho-mqtt)
declare var window: any;
if (typeof window === "undefined") {
  global.window = {} as any;
}
if (!window.location) {
  window.location = { protocol: "file:" } as any;
}

import React from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/HomeTest";
import SummaryChart from "./components/Main/Chart/Chart";
import ReadSoil from "./components/Main/ReadSoil/ReadSoil";
import Ionicons from "react-native-vector-icons/Ionicons";

Ionicons.loadFont();

type TabConfigType = {
  name: string;
  component: React.ComponentType<any>;
  focusedIcon: string;
  unfocusedIcon: string;
  iconComponent: React.ComponentType<{ name: string; size: number; color: string }>;
};

const tabConfig: TabConfigType[] = [
  {
    name: "Home",
    component: Home,
    focusedIcon: "home",
    unfocusedIcon: "home-outline",
    iconComponent: Ionicons as React.ComponentType<{ name: string; size: number; color: string }>,
  },
  {
    name: "ReadSoil",
    component: ReadSoil,
    focusedIcon: "leaf",
    unfocusedIcon: "leaf-outline",
    iconComponent: Ionicons as React.ComponentType<{ name: string; size: number; color: string }>,
  },
  {
    name: "SummaryChart",
    component: SummaryChart,
    focusedIcon: "stats-chart",
    unfocusedIcon: "stats-chart-outline",
    iconComponent: Ionicons as React.ComponentType<{ name: string; size: number; color: string }>,
  },
];


const TabNav = createBottomTabNavigator();

const screenOptions = ({
  route,
}: {
  route: any;
}): BottomTabNavigationOptions => ({
  tabBarIcon: ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => {
    const routeConfig = tabConfig.find((config) => config.name === route.name);
    if (!routeConfig) return null;
    const iconName = focused ? routeConfig.focusedIcon : routeConfig.unfocusedIcon;
    const IconComponent = routeConfig.iconComponent as React.ComponentType<{
      name: string;
      size: number;
      color: string;
    }>;
    return <IconComponent name={iconName} size={size} color={color} />;
  },
  headerShown: false,
  tabBarActiveTintColor: "#0163d2",
  tabBarInactiveTintColor: "gray",
  tabBarLabelStyle: {
    fontSize: 14,
    paddingBottom: 5,
    fontWeight: "600",
  },
  tabBarStyle: {
    height: 80,
    paddingTop: 5,
  },
});

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <TabNav.Navigator screenOptions={screenOptions}>
        {tabConfig.map((routeConfig) => (
          <TabNav.Screen
            key={routeConfig.name}
            name={routeConfig.name}
            component={routeConfig.component}
          />
        ))}
      </TabNav.Navigator>
    </NavigationContainer>
  );
};

export default App;
