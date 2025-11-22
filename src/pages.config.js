import Feed from './pages/Feed';
import Map from './pages/Map';
import FieldNotebook from './pages/FieldNotebook';
import Profile from './pages/Profile';
import TrendsAnalyst from './pages/TrendsAnalyst';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Feed": Feed,
    "Map": Map,
    "FieldNotebook": FieldNotebook,
    "Profile": Profile,
    "TrendsAnalyst": TrendsAnalyst,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Feed",
    Pages: PAGES,
    Layout: __Layout,
};