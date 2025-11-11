import Feed from './pages/Feed';
import Upload from './pages/Upload';
import Map from './pages/Map';
import FieldNotebook from './pages/FieldNotebook';
import Profile from './pages/Profile';
import TrendsAnalyst from './pages/TrendsAnalyst';
import Layout from './Layout.jsx';


export const PAGES = {
    "Feed": Feed,
    "Upload": Upload,
    "Map": Map,
    "FieldNotebook": FieldNotebook,
    "Profile": Profile,
    "TrendsAnalyst": TrendsAnalyst,
}

export const pagesConfig = {
    mainPage: "Feed",
    Pages: PAGES,
    Layout: Layout,
};