import Feed from './pages/Feed';
import FieldNotebook from './pages/FieldNotebook';
import Home from './pages/Home';
import Map from './pages/Map';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import TrendsAnalyst from './pages/TrendsAnalyst';
import Upload from './pages/Upload';
import Groups from './pages/Groups';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Feed": Feed,
    "FieldNotebook": FieldNotebook,
    "Home": Home,
    "Map": Map,
    "Messages": Messages,
    "Profile": Profile,
    "TrendsAnalyst": TrendsAnalyst,
    "Upload": Upload,
    "Groups": Groups,
}

export const pagesConfig = {
    mainPage: "Feed",
    Pages: PAGES,
    Layout: __Layout,
};