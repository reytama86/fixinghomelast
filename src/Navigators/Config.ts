import Login from "@Containers/Auth/Login";
import DetailBlock from "@Containers/DetailBlock";
import ChartScreen from "@Containers/Tab/ChartScreen";
import HomeScreen from "@Containers/Tab/HomeScreen";
import PortableSensorScreen from "@Containers/Tab/PortableSensorScreen";
import RouteName from "src/Constants/RouteName.constants";

interface IScreen {
    name: string;
    component: React.ComponentType<any>;
    options: any;
}

export const UnauthorizedScreens: IScreen[] = [
    {
        name: RouteName.LoginNavigation,
        component: Login,
        options: {
            headerShown: false,
        },
    }
]

export const AuthorizedScreens: IScreen[] = [
    {
        name: RouteName.DetailBlockNavigation,
        component: DetailBlock,
        options: {
            headerShown: false,
        },
    },
    {
        name: RouteName.ListBlockScreenNavigation,
        component: PortableSensorScreen,
        options: {
            headerShown: false,
        },
    },
    {
        name: RouteName.ChartScreenNavigation,
        component: ChartScreen,
        options: {
            headerShown: false,
        },
    },
]

export const TabScreens: IScreen[] = [
  {
    name: RouteName.HomeScreenNavigation,
    component: HomeScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: RouteName.PortableSensorScreenNavigation,
    component: PortableSensorScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: RouteName.ChartScreenNavigation,
    component: ChartScreen,
    options: {
      headerShown: false,
    },
  },
];