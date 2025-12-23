import RouteName from "./RouteName.constants";

export type RootStackParamList = {
    [RouteName.LoginNavigation]: undefined;
    [RouteName.HomeScreenNavigation]: undefined;
    [RouteName.PortableSensorScreenNavigation]: undefined;
    [RouteName.ChartScreenNavigation]: undefined;
    [RouteName.DetailBlockNavigation]: {
        id: string;
    };
    [RouteName.HomeScreenNavigation]: undefined;
    [RouteName.ListBlockScreenNavigation]: undefined;
    [RouteName.ListPortableScreenNavigation]: undefined;
}